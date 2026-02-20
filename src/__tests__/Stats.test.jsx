import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useState, useContext } from "react";
import Stats from "../components/Stats";
import { XPContext, XPProvider } from "../contexts/XPContext";
import { fetchRecruiterStats } from "../services/githubApi";

vi.mock("../services/githubApi", () => ({
  fetchRecruiterStats: vi.fn(),
}));

const sampleStats = {
  totalRepos: 12,
  totalRepoSizeKb: 20480,
  activeRepos: [
    { name: "star-map", pushedAt: "2024-11-11T12:00:00.000Z" },
  ],
  recentPrimaryLanguage: "JavaScript",
  languageDiversity: 1.23,
  totalCommits: 456,
  top6Bytes: 123456,
  latestPush: "2024-11-10T15:00:00.000Z",
  updatedAt: "2024-11-11T12:30:00.000Z",
  eventSummary: {
    peakDay: { label: "Mon" },
    peakHour: { label: "14:00" },
  },
  languageStats: {
    languages: [{ name: "JavaScript", bytes: 1200, percent: 60 }],
  },
};

const XPDisplay = () => {
  const { xp } = useContext(XPContext);
  return <span data-testid="xp-total">{xp}</span>;
};

const StatsHarness = ({ languageStatsReady, initialState }) => {
  const [state, setState] = useState(initialState);
  return (
    <XPProvider>
      <XPDisplay />
      <Stats
        languageStatsReady={languageStatsReady}
        githubStatsState={state}
        setGithubStatsState={setState}
      />
    </XPProvider>
  );
};

describe("Stats", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv("VITE_GITHUB_TOKEN", "test-token");
    fetchRecruiterStats.mockResolvedValue(sampleStats);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("shows the locked gate when API access is unavailable", () => {
    render(
      <StatsHarness
        languageStatsReady={false}
        initialState={{
          status: "idle",
          stats: null,
          error: "",
          isEnhanced: false,
        }}
      />
    );

    expect(
      screen.getByText(/install api first to unlock github stats/i)
    ).toBeInTheDocument();
  });

  it("shows the enhance button when stats are ready", async () => {
    render(
      <StatsHarness
        languageStatsReady={true}
        initialState={{
          status: "ready",
          stats: sampleStats,
          error: "",
          isEnhanced: false,
        }}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /enhance api/i })
      ).toBeInTheDocument();
    });
  });

  it("unlocks stats without a token when language stats are ready", async () => {
    vi.stubEnv("VITE_GITHUB_TOKEN", "");

    render(
      <StatsHarness
        languageStatsReady={true}
        initialState={{
          status: "ready",
          stats: sampleStats,
          error: "",
          isEnhanced: false,
        }}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /enhance api/i })
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText(/install api first to unlock github stats/i)
    ).not.toBeInTheDocument();
  });

  it("shows error state when the API call fails", async () => {
    fetchRecruiterStats.mockRejectedValueOnce(new Error("Boom"));

    render(
      <StatsHarness
        languageStatsReady={true}
        initialState={{
          status: "loading",
          stats: null,
          error: "",
          isEnhanced: false,
        }}
      />
    );

    expect(await screen.findByText("Boom")).toBeInTheDocument();
  });

  it("grants XP and shows the stats grid after enhancing", async () => {
    const user = userEvent.setup();
    render(
      <StatsHarness
        languageStatsReady={true}
        initialState={{
          status: "ready",
          stats: sampleStats,
          error: "",
          isEnhanced: false,
        }}
      />
    );

    const enhanceButton = await screen.findByRole("button", {
      name: /enhance api/i,
    });
    await user.click(enhanceButton);

    expect(screen.getByTestId("xp-total")).toHaveTextContent("28");
    expect(screen.getByText("Public repos")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("star-map")).toBeInTheDocument();
  });

  it("refreshes stats when already enhanced", async () => {
    const user = userEvent.setup();

    render(
      <StatsHarness
        languageStatsReady={true}
        initialState={{
          status: "ready",
          stats: sampleStats,
          error: "",
          isEnhanced: true,
        }}
      />
    );

    await waitFor(() => {
      expect(fetchRecruiterStats).toHaveBeenCalled();
    });

    fetchRecruiterStats.mockClear();
    const refreshButton = screen.getByRole("button", {
      name: /refresh stats/i,
    });
    await user.click(refreshButton);

    expect(fetchRecruiterStats).toHaveBeenCalledWith(
      expect.objectContaining({ ttlMs: 0 })
    );
  });
});
