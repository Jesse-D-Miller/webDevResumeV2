import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RenderWindow from "../components/RenderWindow";

const mockSummary = vi.fn(() => <div>Summary Mock</div>);
const mockAbout = vi.fn(() => <div>About Mock</div>);
const mockExperience = vi.fn(() => <div>Experience Mock</div>);
const mockMap = vi.fn(() => <div>Map Mock</div>);
const mockProgrammingLevels = vi.fn(() => <div>Levels Mock</div>);
const mockProjects = vi.fn(() => <div>Projects Mock</div>);
const mockStats = vi.fn(() => <div>Stats Mock</div>);

vi.mock("../components/Summary", () => ({
  default: (props) => mockSummary(props),
}));
vi.mock("../components/About", () => ({
  default: (props) => mockAbout(props),
}));
vi.mock("../components/Experience", () => ({
  default: (props) => mockExperience(props),
}));
vi.mock("../components/Map", () => ({
  default: (props) => mockMap(props),
}));
vi.mock("../components/ProgrammingLevels", () => ({
  default: (props) => mockProgrammingLevels(props),
}));
vi.mock("../components/Projects", () => ({
  default: (props) => mockProjects(props),
}));
vi.mock("../components/Stats", () => ({
  default: (props) => mockStats(props),
}));

const baseProps = {
  buildStates: { "project-1": "built" },
  startBuild: vi.fn(),
  onLanguagesReady: vi.fn(),
  onLanguageStatsReady: vi.fn(),
  languageStatsReady: true,
  languageStatsState: { isApiInstalled: false },
  setLanguageStatsState: vi.fn(),
  githubStatsState: { status: "idle", stats: null, error: "", isEnhanced: false },
  setGithubStatsState: vi.fn(),
};

describe("RenderWindow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Summary by default", () => {
    render(<RenderWindow activePage="Summary" {...baseProps} />);
    expect(screen.getByText("Summary Mock")).toBeInTheDocument();
  });

  it("renders Projects and passes build props", () => {
    render(<RenderWindow activePage="Projects" {...baseProps} />);
    expect(screen.getByText("Projects Mock")).toBeInTheDocument();
    expect(mockProjects).toHaveBeenCalledWith(
      expect.objectContaining({
        buildStates: baseProps.buildStates,
        startBuild: baseProps.startBuild,
      })
    );
  });

  it("renders Experience and passes build props", () => {
    render(<RenderWindow activePage="Experience" {...baseProps} />);
    expect(screen.getByText("Experience Mock")).toBeInTheDocument();
    expect(mockExperience).toHaveBeenCalledWith(
      expect.objectContaining({
        buildStates: baseProps.buildStates,
        startBuild: baseProps.startBuild,
      })
    );
  });

  it("renders ProgrammingLevels and passes API props", () => {
    render(<RenderWindow activePage="ProgrammingLevels" {...baseProps} />);
    expect(screen.getByText("Levels Mock")).toBeInTheDocument();
    expect(mockProgrammingLevels).toHaveBeenCalledWith(
      expect.objectContaining({
        onLanguagesReady: baseProps.onLanguagesReady,
        onLanguageStatsReady: baseProps.onLanguageStatsReady,
        languageStatsState: baseProps.languageStatsState,
        setLanguageStatsState: baseProps.setLanguageStatsState,
      })
    );
  });

  it("renders Map and About correctly", () => {
    render(<RenderWindow activePage="Map" {...baseProps} />);
    expect(screen.getByText("Map Mock")).toBeInTheDocument();

    render(<RenderWindow activePage="About" {...baseProps} />);
    expect(screen.getByText("About Mock")).toBeInTheDocument();
  });

  it("renders Stats and passes stats props", () => {
    render(<RenderWindow activePage="Stats" {...baseProps} />);
    expect(screen.getByText("Stats Mock")).toBeInTheDocument();
    expect(mockStats).toHaveBeenCalledWith(
      expect.objectContaining({
        languageStatsReady: baseProps.languageStatsReady,
        githubStatsState: baseProps.githubStatsState,
        setGithubStatsState: baseProps.setGithubStatsState,
      })
    );
  });
});
