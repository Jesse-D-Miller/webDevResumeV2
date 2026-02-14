const CACHE_PREFIX = "githubLanguageStats";
const STATS_CACHE_PREFIX = "githubRecruiterStats";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PER_PAGE = 100;
const DEFAULT_CONCURRENCY = 6;
const DEFAULT_EVENTS_PER_PAGE = 100;
const DEFAULT_EVENTS_PAGES = 3;

const getCacheKey = (username) => `${CACHE_PREFIX}:${username}`;
const getStatsCacheKey = (username) => `${STATS_CACHE_PREFIX}:${username}`;

const readCache = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeCache = (key, data) => {
  localStorage.setItem(
    key,
    JSON.stringify({ data, timestamp: Date.now() })
  );
};

const isFresh = (entry, ttlMs) => {
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttlMs;
};

const buildHeaders = (token) => {
  return token
    ? {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      }
    : { Accept: "application/vnd.github+json" };
};

const fetchUserProfile = async ({ username, token }) => {
  const headers = buildHeaders(token);
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }
  return response.json();
};

const fetchUserEvents = async ({ username, token, perPage, maxPages }) => {
  const headers = buildHeaders(token);
  let page = 1;
  let hasMore = true;
  let events = [];

  while (hasMore && page <= maxPages) {
    const response = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=${perPage}&page=${page}`,
      { headers }
    );
    if (!response.ok) {
      return events;
    }
    const data = await response.json();
    events = events.concat(data);
    hasMore = data.length === perPage;
    page += 1;
  }

  return events;
};

const fetchAllRepos = async ({ username, token, perPage, includePrivate }) => {
  const headers = buildHeaders(token);
  let page = 1;
  let hasMore = true;
  let repos = [];
  const usePrivateEndpoint = Boolean(token && includePrivate);

  while (hasMore) {
    const url = usePrivateEndpoint
      ? `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&visibility=all&affiliation=owner,collaborator,organization_member`
      : `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error("Failed to fetch repositories");
    }
    const data = await response.json();
    repos = repos.concat(data);
    hasMore = data.length === perPage;
    page += 1;
  }

  return repos;
};

const fetchRepoLanguages = async ({ repo, token }) => {
  const headers = buildHeaders(token);
  const response = await fetch(repo.languages_url, { headers });
  if (!response.ok) {
    return null;
  }
  return response.json();
};

const parseLastPage = (linkHeader) => {
  if (!linkHeader) return null;
  const parts = linkHeader.split(",");
  const lastPart = parts.find((part) => part.includes('rel="last"'));
  if (!lastPart) return null;
  const match = lastPart.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return match ? Number(match[1]) : null;
};

const fetchRepoCommitCount = async ({ repo, token }) => {
  const headers = buildHeaders(token);
  const response = await fetch(
    `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?per_page=1`,
    { headers }
  );
  if (!response.ok) {
    return 0;
  }
  const linkHeader = response.headers.get("link");
  const lastPage = parseLastPage(linkHeader);
  if (lastPage) {
    return lastPage;
  }
  const data = await response.json();
  return Array.isArray(data) ? data.length : 0;
};

const withConcurrency = async (items, limit, handler) => {
  const results = [];
  let index = 0;

  const workers = Array.from({ length: limit }).map(async () => {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await handler(items[currentIndex]);
    }
  });

  await Promise.all(workers);
  return results;
};

const summarizeLanguages = (languageTotals) => {
  const totalBytes = Object.values(languageTotals).reduce(
    (sum, value) => sum + value,
    0
  );

  const languages = Object.entries(languageTotals)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: totalBytes ? Math.round((bytes / totalBytes) * 100) : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes);

  return { totalBytes, languages };
};

export const fetchLanguageStats = async ({
  username,
  token = null,
  includeForks = false,
  includePrivate = false,
  ttlMs = DEFAULT_TTL_MS,
  perPage = DEFAULT_PER_PAGE,
  concurrency = DEFAULT_CONCURRENCY,
  repos = null,
}) => {
  if (!username) {
    throw new Error("GitHub username is required");
  }

  const cacheKey = getCacheKey(username);
  const cached = readCache(cacheKey);
  if (isFresh(cached, ttlMs)) {
    return cached.data;
  }

  const repoList =
    repos || (await fetchAllRepos({ username, token, perPage, includePrivate }));
  const filteredRepos = includeForks
    ? repoList
    : repoList.filter((repo) => !repo.fork);

  const languageTotals = {};
  const languageResults = await withConcurrency(
    filteredRepos,
    concurrency,
    (repo) => fetchRepoLanguages({ repo, token })
  );

  languageResults.forEach((langData) => {
    if (!langData) return;
    Object.entries(langData).forEach(([language, bytes]) => {
      languageTotals[language] = (languageTotals[language] || 0) + bytes;
    });
  });

  const summary = summarizeLanguages(languageTotals);
  const result = {
    ...summary,
    totalRepos: filteredRepos.length,
    updatedAt: new Date().toISOString(),
  };

  writeCache(cacheKey, result);
  return result;
};

const buildWeekKey = (date) => {
  const temp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((temp - yearStart) / 86400000 + 1) / 7);
  return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

const summarizeEvents = (events) => {
  const stats = {
    commitsPushed: 0,
    pushEventsCount: 0,
    prsOpened: 0,
    prsMerged: 0,
    mergeTimes: [],
    issuesOpened: 0,
    reviewsSubmitted: 0,
    activityByDay: {},
    activityByHour: {},
    commitsByWeek: {},
  };

  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
  });
  const hourFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    hour12: false,
  });

  events.forEach((event) => {
    if (!event?.created_at) {
      return;
    }

    const createdAt = new Date(event.created_at);
    const dayLabel = dayFormatter.format(createdAt);
    const hourLabel = `${hourFormatter.format(createdAt)}:00`;

    stats.activityByDay[dayLabel] = (stats.activityByDay[dayLabel] || 0) + 1;
    stats.activityByHour[hourLabel] = (stats.activityByHour[hourLabel] || 0) + 1;

    if (event.type === "PushEvent") {
      const commitCount = event.payload?.size || 0;
      stats.pushEventsCount += 1;
      stats.commitsPushed += commitCount;
      const weekKey = buildWeekKey(createdAt);
      stats.commitsByWeek[weekKey] =
        (stats.commitsByWeek[weekKey] || 0) + commitCount;
    }

    if (event.type === "PullRequestEvent") {
      const action = event.payload?.action;
      if (action === "opened") {
        stats.prsOpened += 1;
      }
      if (action === "closed" && event.payload?.pull_request?.merged) {
        stats.prsMerged += 1;
        const created = event.payload?.pull_request?.created_at;
        const merged = event.payload?.pull_request?.merged_at;
        if (created && merged) {
          const delta = new Date(merged) - new Date(created);
          if (delta > 0) {
            stats.mergeTimes.push(delta / 86400000);
          }
        }
      }
    }

    if (event.type === "IssuesEvent" && event.payload?.action === "opened") {
      stats.issuesOpened += 1;
    }

    if (event.type === "PullRequestReviewEvent") {
      stats.reviewsSubmitted += 1;
    }
  });

  const pickPeak = (record) => {
    let topKey = null;
    let topValue = 0;
    Object.entries(record).forEach(([key, value]) => {
      if (value > topValue) {
        topValue = value;
        topKey = key;
      }
    });
    return { label: topKey, count: topValue };
  };

  const weeklyValues = Object.values(stats.commitsByWeek);
  const weeklyAverage =
    weeklyValues.length > 0
      ? weeklyValues.reduce((sum, value) => sum + value, 0) / weeklyValues.length
      : null;
  const weeklyVariance =
    weeklyAverage !== null
      ? weeklyValues.reduce((sum, value) => sum + Math.pow(value - weeklyAverage, 2), 0) /
        weeklyValues.length
      : null;
  const weeklyStdev = weeklyVariance !== null ? Math.sqrt(weeklyVariance) : null;
  const consistencyScore =
    weeklyAverage !== null && weeklyAverage > 0
      ? Math.max(0, 1 - weeklyStdev / weeklyAverage)
      : null;

  const consistencyLabel =
    consistencyScore === null
      ? null
      : consistencyScore >= 0.7
        ? "High"
        : consistencyScore >= 0.4
          ? "Medium"
          : "Low";

  return {
    commitsPushed: stats.commitsPushed,
    pushEventsCount: stats.pushEventsCount,
    prsOpened: stats.prsOpened,
    prsMerged: stats.prsMerged,
    mergeTimes: stats.mergeTimes,
    issuesOpened: stats.issuesOpened,
    reviewsSubmitted: stats.reviewsSubmitted,
    peakDay: pickPeak(stats.activityByDay),
    peakHour: pickPeak(stats.activityByHour),
    weeklyAverage,
    consistencyLabel,
    sampleSize: events.length,
  };
};

const calculateLanguageDiversity = (languageStats) => {
  if (!languageStats?.languages?.length || !languageStats.totalBytes) {
    return 0;
  }

  const total = languageStats.totalBytes || 1;
  return languageStats.languages.reduce((sum, lang) => {
    const proportion = lang.bytes / total;
    if (!proportion) return sum;
    return sum - proportion * Math.log2(proportion);
  }, 0);
};

const getRecentPrimaryLanguage = (repos) => {
  const recentRepos = repos
    .filter((repo) => repo.language)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 8);

  if (!recentRepos.length) {
    return null;
  }

  const tally = {};
  recentRepos.forEach((repo) => {
    tally[repo.language] = (tally[repo.language] || 0) + 1;
  });

  return Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
};

const buildImpactRepos = (repos) => {
  const now = Date.now();

  return repos
    .map((repo) => {
      const lastPush = repo.pushed_at ? new Date(repo.pushed_at).getTime() : 0;
      const daysSincePush = lastPush ? (now - lastPush) / 86400000 : 9999;
      const recencyBonus = daysSincePush <= 90 ? 5 : daysSincePush <= 180 ? 2 : 0;
      const score =
        repo.stargazers_count * 2 +
        repo.forks_count +
        repo.watchers_count +
        recencyBonus;

      return {
        name: repo.name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

export const fetchRecruiterStats = async ({
  username,
  token = null,
  includeForks = false,
  includePrivate = false,
  ttlMs = DEFAULT_TTL_MS,
  perPage = DEFAULT_PER_PAGE,
  concurrency = DEFAULT_CONCURRENCY,
  eventsPerPage = DEFAULT_EVENTS_PER_PAGE,
  eventsPages = DEFAULT_EVENTS_PAGES,
}) => {
  if (!username) {
    throw new Error("GitHub username is required");
  }

  const cacheKey = getStatsCacheKey(username);
  const cached = readCache(cacheKey);
  if (isFresh(cached, ttlMs)) {
    return cached.data;
  }

  const [user, repos, events] = await Promise.all([
    fetchUserProfile({ username, token }),
    fetchAllRepos({ username, token, perPage, includePrivate }),
    fetchUserEvents({
      username,
      token,
      perPage: eventsPerPage,
      maxPages: eventsPages,
    }),
  ]);

  const nonForkRepos = includeForks ? repos : repos.filter((repo) => !repo.fork);
  const publicRepos = nonForkRepos.filter((repo) => !repo.private);
  const reposForCommits = (includePrivate ? repos : publicRepos).filter(
    (repo) => !repo.fork
  );
  const languageStats = await fetchLanguageStats({
    username,
    token,
    includeForks,
    includePrivate: false,
    ttlMs,
    perPage,
    concurrency,
    repos: publicRepos,
  });

  const totalStars = publicRepos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );
  const totalForks = publicRepos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalWatchers = publicRepos.reduce(
    (sum, repo) => sum + repo.watchers_count,
    0
  );
  const totalRepoSizeKb = publicRepos.reduce(
    (sum, repo) => sum + (repo.size || 0),
    0
  );
  const commitCounts = await withConcurrency(
    reposForCommits,
    Math.min(DEFAULT_CONCURRENCY, 4),
    (repo) => fetchRepoCommitCount({ repo, token })
  );
  const totalCommits = commitCounts.reduce((sum, value) => sum + value, 0);
  const openIssues = publicRepos.reduce(
    (sum, repo) => sum + repo.open_issues_count,
    0
  );
  const mostStarredRepo = publicRepos
    .slice()
    .sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
  const latestPush = publicRepos
    .map((repo) => repo.pushed_at)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0];
  const activeRepos = publicRepos
    .filter((repo) => repo.pushed_at)
    .slice()
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      pushedAt: repo.pushed_at,
    }));
  const activeRepos90d = publicRepos.filter((repo) => {
    if (!repo.pushed_at) return false;
    return Date.now() - new Date(repo.pushed_at).getTime() <= 90 * 86400000;
  }).length;
  const reposWithReleases = publicRepos.filter((repo) => repo.has_releases)
    .length;

  const languageDiversity = calculateLanguageDiversity(languageStats);
  const top6Bytes = languageStats.languages
    .slice(0, 6)
    .reduce((sum, lang) => sum + lang.bytes, 0);
  const recentPrimaryLanguage = getRecentPrimaryLanguage(publicRepos);
  const topImpactRepos = buildImpactRepos(publicRepos);
  const eventSummary = summarizeEvents(events);
  const mergeRate = eventSummary.prsOpened
    ? Math.round((eventSummary.prsMerged / eventSummary.prsOpened) * 100)
    : null;
  const avgMergeDays = eventSummary.mergeTimes.length
    ? eventSummary.mergeTimes.reduce((sum, value) => sum + value, 0) /
      eventSummary.mergeTimes.length
    : null;

  const result = {
    username: user.login,
    totalRepos: publicRepos.length,
    totalStars,
    totalForks,
    totalWatchers,
    totalRepoSizeKb,
    totalCommits,
    openIssues,
    mostStarredRepo: mostStarredRepo
      ? { name: mostStarredRepo.name, stars: mostStarredRepo.stargazers_count }
      : null,
    latestPush,
    activeRepos,
    activeRepos90d,
    reposWithReleases,
    languageStats,
    languageDiversity,
    top6Bytes,
    recentPrimaryLanguage,
    topImpactRepos,
    eventSummary: {
      ...eventSummary,
      mergeRate,
      avgMergeDays,
    },
    updatedAt: new Date().toISOString(),
  };

  writeCache(cacheKey, result);
  return result;
};
