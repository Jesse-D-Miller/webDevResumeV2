import { useEffect, useMemo, useState } from "react";
import "./Stats.css";
import data from "../data/resume.json";
import { fetchRecruiterStats } from "../services/githubApi";

const formatNumber = (value) =>
  value === null || value === undefined ? "--" : value.toLocaleString();

const PST_TIMEZONE = "America/Los_Angeles";

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PST_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const formatPercent = (value) =>
  value === null || value === undefined ? "--" : `${value}%`;

const formatDays = (value) =>
  value === null || value === undefined ? "--" : `${value.toFixed(1)} days`;

const formatRepoSize = (value) => {
  if (value === null || value === undefined) return "--";
  const megabytes = value / 1024;
  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toFixed(2)} GB`;
  }
  return `${megabytes.toFixed(1)} MB`;
};

function StatCard({ title, value, subtitle, children, wide = false, tall = false }) {
  return (
    <article
      className={`stats-card${wide ? " stats-card--wide" : ""}${
        tall ? " stats-card--tall" : ""
      }`}
    >
      <h3 className="stats-card-title">{title}</h3>
      {value !== undefined && <div className="stats-card-value">{value}</div>}
      {subtitle && <div className="stats-card-subtitle">{subtitle}</div>}
      {children}
    </article>
  );
}

function Stats() {
  const [status, setStatus] = useState("idle");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const githubUsername = useMemo(() => {
    const url = data.meta?.links?.github || "";
    const match = url.match(/github\.com\/([^/]+)/i);
    return match ? match[1] : "";
  }, []);
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN || null;

  const loadStats = async ({ ttlMs } = {}) => {
    if (!githubUsername || typeof fetch !== "function") {
      return;
    }

    try {
      setStatus("loading");
      const result = await fetchRecruiterStats({
        username: githubUsername,
        token: githubToken,
           includePrivate: Boolean(githubToken),
        eventsPages: 3,
        ttlMs,
      });
      setStats(result);
      setStatus("ready");
    } catch (loadError) {
      setError(loadError?.message || "Failed to load GitHub stats");
      setStatus("error");
    }
  };

  useEffect(() => {
    let isActive = true;
    const guardedLoad = async () => {
      await loadStats();
      if (!isActive) {
        return;
      }
    };

    guardedLoad();
    return () => {
      isActive = false;
    };
  }, [githubUsername, githubToken]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const eventSummary = stats?.eventSummary;
  const languageStats = stats?.languageStats;
  const updatedAtMs = stats?.updatedAt ? new Date(stats.updatedAt).getTime() : null;
  const elapsedMs = updatedAtMs ? Math.max(0, now - updatedAtMs) : null;
  const elapsedMinutes = elapsedMs !== null ? Math.floor(elapsedMs / 60000) : null;
  const elapsedHours = elapsedMs !== null ? Math.floor(elapsedMinutes / 60) : null;
  const elapsedDays = elapsedMs !== null ? Math.floor(elapsedHours / 24) : null;
  const elapsedLabel = (() => {
    if (elapsedMinutes === null) return "--";
    if (elapsedMinutes < 1) return "just now";
    if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;
    if (elapsedHours < 24) return `${elapsedHours} hr ago`;
    return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
  })();
  const lastPushMs = stats?.latestPush ? new Date(stats.latestPush).getTime() : null;
  const lastPushElapsedMs = lastPushMs ? Math.max(0, now - lastPushMs) : null;
  const lastPushMinutes =
    lastPushElapsedMs !== null ? Math.floor(lastPushElapsedMs / 60000) : null;
  const lastPushHours =
    lastPushElapsedMs !== null ? Math.floor(lastPushMinutes / 60) : null;
  const lastPushDays =
    lastPushElapsedMs !== null ? Math.floor(lastPushHours / 24) : null;
  const lastPushLabel = (() => {
    if (lastPushMinutes === null) return "--";
    if (lastPushMinutes < 1) return "just now";
    if (lastPushMinutes < 60) return `${lastPushMinutes} min ago`;
    if (lastPushHours < 24) return `${lastPushHours} hr ago`;
    return `${lastPushDays} day${lastPushDays === 1 ? "" : "s"} ago`;
  })();

  return (
    <section className="stats">
      <header className="stats-header">
        <div>
          <h1 className="stats-title">GitHub Recruiter Stats Grid</h1>
          <p className="stats-subtitle">
            Aggregated from public GitHub data. Event-based metrics use the latest
            {` ${eventSummary?.sampleSize ?? 0}`} public events (pulling up to 300).
          </p>
        </div>
        <div className="stats-meta">
          <div className="stats-meta-row">
            <span className="stats-meta-label">Last updated:</span>
            <span className="stats-meta-value">{elapsedLabel}</span>
            <button
              className="stats-refresh"
              type="button"
              onClick={() => loadStats({ ttlMs: 0 })}
            >
              Refresh stats
            </button>
          </div>
        </div>
      </header>

      {status === "loading" && (
        <div className="stats-status">Loading GitHub stats...</div>
      )}
      {status === "error" && (
        <div className="stats-status stats-status--error">{error}</div>
      )}

      {status === "ready" && stats && (
        <div className="stats-grid">
          <StatCard title="Public repos" value={formatNumber(stats.totalRepos)} />
          <StatCard
            title="Total repo size"
            value={formatRepoSize(stats.totalRepoSizeKb)}
            subtitle="Sum of public repos"
          />
          <StatCard
            title="Total commits"
            value={formatNumber(stats.totalCommits)}
            subtitle="All-time across public repos"
          />
          <StatCard title="Recent activity" tall>
            <ul className="stats-list">
              {(stats.activeRepos || []).length ? (
                stats.activeRepos.map((repo) => (
                  <li key={repo.name} className="stats-list-item">
                    <span>{repo.name}</span>
                    <span className="stats-list-date">
                      {formatDate(repo.pushedAt)}
                    </span>
                  </li>
                ))
              ) : (
                <li>--</li>
              )}
            </ul>
          </StatCard>
          <StatCard
            title="Recent push"
            value={lastPushLabel}
            subtitle={formatDate(stats?.latestPush)}
          />
          <StatCard
            title="Top language"
            value={languageStats?.languages?.[0]?.name || "--"}
          />
          <StatCard
            title="Language diversity"
            value={stats.languageDiversity ? stats.languageDiversity.toFixed(2) : "--"}
            subtitle="Shannon index"
          />
          <StatCard
            title="Top 6 language bytes"
            value={formatNumber(stats.top6Bytes)}
          />
          <StatCard
            title="Recent primary language"
            value={stats.recentPrimaryLanguage || "--"}
            subtitle="From latest pushes"
          />
          <StatCard
            title="Peak activity day"
            value={eventSummary?.peakDay?.label || "--"}
            subtitle="PST"
          />
          <StatCard
            title="Peak activity hour"
            value={eventSummary?.peakHour?.label || "--"}
            subtitle="PST"
          />
        </div>
      )}
    </section>
  );
}

export default Stats;