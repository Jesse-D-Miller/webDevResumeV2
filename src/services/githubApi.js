const CACHE_PREFIX = "githubLanguageStats";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PER_PAGE = 100;
const DEFAULT_CONCURRENCY = 6;

const getCacheKey = (username) => `${CACHE_PREFIX}:${username}`;

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

const fetchAllRepos = async ({ username, token, perPage }) => {
  const headers = buildHeaders(token);
  let page = 1;
  let hasMore = true;
  let repos = [];

  while (hasMore) {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`,
      { headers }
    );
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
  ttlMs = DEFAULT_TTL_MS,
  perPage = DEFAULT_PER_PAGE,
  concurrency = DEFAULT_CONCURRENCY,
}) => {
  if (!username) {
    throw new Error("GitHub username is required");
  }

  const cacheKey = getCacheKey(username);
  const cached = readCache(cacheKey);
  if (isFresh(cached, ttlMs)) {
    return cached.data;
  }

  const repos = await fetchAllRepos({ username, token, perPage });
  const filteredRepos = includeForks ? repos : repos.filter((repo) => !repo.fork);

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
