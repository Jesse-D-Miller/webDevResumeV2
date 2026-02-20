import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { fetchLanguageStats, fetchRecruiterStats } from "../services/githubApi";

const createResponse = ({ ok = true, jsonData = {}, headers = {} }) => {
  return {
    ok,
    json: vi.fn().mockResolvedValue(jsonData),
    headers: {
      get: (key) => headers[key] ?? null,
    },
  };
};

describe("githubApi", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-11-12T12:00:00.000Z"));
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it("fetchLanguageStats caches results", async () => {
    const repos = [
      { fork: false, languages_url: "https://api.github.com/lang/1" },
    ];
    const languages = { JavaScript: 100, CSS: 50 };

    global.fetch.mockImplementation((url) => {
      const href =
        typeof url === "string" ? url : url?.url || url?.href || String(url);
      if (href.startsWith("https://api.github.com/users/dev/repos")) {
        return Promise.resolve(createResponse({ jsonData: repos }));
      }
      if (href === "https://api.github.com/lang/1") {
        return Promise.resolve(createResponse({ jsonData: languages }));
      }
      return Promise.reject(new Error(`Unexpected fetch: ${href}`));
    });

    const result = await fetchLanguageStats({ username: "dev" });
    expect(result.totalRepos).toBe(1);

    global.fetch.mockClear();
    const cached = await fetchLanguageStats({ username: "dev" });
    expect(cached.totalRepos).toBe(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetchRecruiterStats aggregates repo stats", async () => {
    const profile = { login: "dev" };
    const repos = [
      {
        name: "alpha",
        fork: false,
        private: false,
        languages_url: "https://api.github.com/lang/1",
        stargazers_count: 2,
        forks_count: 1,
        watchers_count: 3,
        size: 1024,
        open_issues_count: 1,
        has_releases: true,
        pushed_at: "2024-11-10T12:00:00.000Z",
        owner: { login: "dev" },
      },
    ];
    const events = [];

    global.fetch.mockImplementation((url) => {
      const href =
        typeof url === "string" ? url : url?.url || url?.href || String(url);
      if (href === "https://api.github.com/users/dev") {
        return Promise.resolve(createResponse({ jsonData: profile }));
      }
      if (href.startsWith("https://api.github.com/users/dev/repos")) {
        return Promise.resolve(createResponse({ jsonData: repos }));
      }
      if (href.startsWith("https://api.github.com/users/dev/events/public")) {
        return Promise.resolve(createResponse({ jsonData: events }));
      }
      if (
        href ===
        "https://api.github.com/repos/dev/alpha/commits?per_page=1"
      ) {
        return Promise.resolve(
          createResponse({
            jsonData: [],
            headers: {
              link: '<https://api.github.com/?page=2>; rel="last"',
            },
          })
        );
      }
      if (href === "https://api.github.com/lang/1") {
        return Promise.resolve(
          createResponse({ jsonData: { JavaScript: 300 } })
        );
      }
      return Promise.reject(new Error(`Unexpected fetch: ${href}`));
    });

    const result = await fetchRecruiterStats({ username: "dev" });

    expect(result.username).toBe("dev");
    expect(result.totalRepos).toBe(1);
    expect(result.totalStars).toBe(2);
    expect(result.totalForks).toBe(1);
    expect(result.totalWatchers).toBe(3);
    expect(result.totalRepoSizeKb).toBe(1024);
    expect(result.activeRepos[0].name).toBe("alpha");
    expect(result.topImpactRepos[0].name).toBe("alpha");
    expect(result.languageStats.languages[0].name).toBe("JavaScript");
  });

  it("returns cached recruiter stats when fresh", async () => {
    const cacheKey = "githubRecruiterStats:dev";
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ data: { username: "dev" }, timestamp: Date.now() })
    );

    const result = await fetchRecruiterStats({ username: "dev", ttlMs: 60000 });

    expect(result.username).toBe("dev");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
