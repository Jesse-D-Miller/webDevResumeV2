import "./App.css";
import { useEffect, useMemo, useState } from "react";
import Welcome from "./routes/Welcome";
import Resume from "./routes/Resume";
import Explorer from "./routes/Explorer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { XPProvider } from "./contexts/XPContext";
import data from "./data/resume.json";
import experienceData from "./data/expandedExperience.json";

const STORAGE_KEY = "project-build-states";
const XP_BAR_STORAGE_KEY = "xp-bar-state";

function App() {
  const [activePage, setActivePage] = useState("Summary");
  const [xpBarState, setXpBarState] = useState(() => {
    try {
      const stored = localStorage.getItem(XP_BAR_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      if (
        typeof parsed?.displayLevel === "number" &&
        typeof parsed?.displayXpIntoLevel === "number"
      ) {
        return {
          displayLevel: parsed.displayLevel,
          displayXpIntoLevel: parsed.displayXpIntoLevel,
        };
      }
    } catch {
      // Ignore storage errors and fall back to defaults.
    }

    return {
      displayLevel: 1,
      displayXpIntoLevel: 0,
    };
  });
  const [githubLanguages, setGithubLanguages] = useState([]);
  const [languageStatsReady, setLanguageStatsReady] = useState(false);
  const [languageStatsState, setLanguageStatsState] = useState({
    isApiInstalled: false,
    statsStatus: "idle",
    statsError: "",
    languageStats: null,
  });
  const [githubStatsState, setGithubStatsState] = useState({
    status: "idle",
    stats: null,
    error: "",
    isEnhanced: false,
  });
  const explorerEducation = useMemo(() => {
    return (data.education || []).filter(
      (edu) => edu.showInExplorer !== false
    );
  }, []);
  const [buildStates, setBuildStates] = useState(() => {
    return Object.fromEntries([
      ...data.projects.map((project) => [project.id, "unbuilt"]),
      ...experienceData.experience.map((item) => [item.id, "unbuilt"]),
      ...explorerEducation.map((edu) => [edu.id, "unbuilt"]),
    ]);
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);

    setBuildStates((prev) => ({
      ...prev,
      ...parsed,
    }));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildStates));
  }, [buildStates]);

  useEffect(() => {
    localStorage.setItem(XP_BAR_STORAGE_KEY, JSON.stringify(xpBarState));
  }, [xpBarState]);

  return (
    <XPProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/resume" element={<Resume />} />
          <Route
            path="/explorer"
            element={
              <Explorer
                activePage={activePage}
                setActivePage={setActivePage}
                xpBarState={xpBarState}
                setXpBarState={setXpBarState}
                githubLanguages={githubLanguages}
                setGithubLanguages={setGithubLanguages}
                languageStatsReady={languageStatsReady}
                setLanguageStatsReady={setLanguageStatsReady}
                languageStatsState={languageStatsState}
                setLanguageStatsState={setLanguageStatsState}
                githubStatsState={githubStatsState}
                setGithubStatsState={setGithubStatsState}
                buildStates={buildStates}
                setBuildStates={setBuildStates}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </XPProvider>
  );
}

export default App;
