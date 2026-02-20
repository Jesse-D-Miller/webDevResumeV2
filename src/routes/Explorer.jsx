import "./Explorer.css";
import NavSide from "../components/NavSide";
import RenderWindow from "../components/RenderWindow";
import SkillsPills from "../components/SkillsPills";
import Gear from "../components/Gear";
import NavTop from "../components/NavTop";
import PixelHero from "../components/PixelHero";
import data from "../data/resume.json";
import experienceData from "../data/expandedExperience.json";

import { useState, useEffect } from "react";

const STORAGE_KEY = "project-build-states";
const THEME_KEY = "theme";
const THEMES = ["default", "alt", "retro", "zelda", "mario", "cyber"];
const BUILD_MS = 2400;

function Explorer() {
  const [activePage, setActivePage] = useState("Summary");
  const [theme, setTheme] = useState("default");
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
  const [buildStates, setBuildStates] = useState(() => {
    return Object.fromEntries([
      ...data.projects.map((project) => [project.id, "unbuilt"]),
      ...experienceData.experience.map((item) => [item.id, "unbuilt"]),
      ...data.education.map((edu) => [edu.id, "unbuilt"]),
    ]);
  });

  //build a Set of skill names from projects + experience + education that are "built"
  const activeSkills = new Set(
    Object.entries(buildStates)
      .filter(([, state]) => state === "built")
      .flatMap(([entryId]) => {
        const project = data.projects.find((p) => p.id === entryId);
        if (project) {
          return project?.skillsDetailed?.map((skill) => skill.name) || [];
        }

        const experience = experienceData.experience.find(
          (item) => item.id === entryId,
        );
        if (experience) {
          return experience?.skills || [];
        }

        const education = data.education.find((edu) => edu.id === entryId);
        return education?.skills || [];
      }),
  );

  const githubLanguageSet = new Set(githubLanguages);

  // Load build states from localStorage on initial render
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
    const storedTheme = window.localStorage.getItem(THEME_KEY) || "default";
    const nextTheme = THEMES.includes(storedTheme) ? storedTheme : "default";
    document.documentElement.dataset.theme =
      nextTheme === "default" ? "" : nextTheme;
    setTheme(nextTheme);
  }, []);

  // Save build states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildStates));
  }, [buildStates]);

  const startBuild = (projectId) => {
    setBuildStates((prev) => {
      if (prev[projectId] !== "unbuilt") return prev; // Prevent rebuilding if already building/built
      return { ...prev, [projectId]: "building" };
    });

    setTimeout(() => {
      setBuildStates((prev) => {
        if (prev[projectId] !== "building") return prev; // Ensure we're still building before marking as built
        return { ...prev, [projectId]: "built" };
      });
    }, BUILD_MS);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const currentIndex = THEMES.indexOf(prev);
      const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
      window.localStorage.setItem(THEME_KEY, nextTheme);
      document.documentElement.dataset.theme =
        nextTheme === "default" ? "" : nextTheme;
      return nextTheme;
    });
  };

  return (
    <div className="explorer">
      <div className="explorer-navside">
        <NavSide
          activePage={activePage}
          setActivePage={setActivePage}
          theme={theme}
          themeIndex={Math.max(0, THEMES.indexOf(theme)) + 1}
          themeTotal={THEMES.length}
          onToggleTheme={handleToggleTheme}
        />
      </div>
      <div className="explorer-main">
        <NavTop />
        <div className="explorer-character">
          <PixelHero />
          <Gear />
          <SkillsPills
            activeSkills={activeSkills}
            highlightedSkills={githubLanguageSet}
          />
        </div>
        <RenderWindow
          activePage={activePage}
          buildStates={buildStates}
          startBuild={startBuild}
          onLanguagesReady={setGithubLanguages}
          onLanguageStatsReady={setLanguageStatsReady}
          languageStatsReady={languageStatsReady}
          languageStatsState={languageStatsState}
          setLanguageStatsState={setLanguageStatsState}
          githubStatsState={githubStatsState}
          setGithubStatsState={setGithubStatsState}
        />
      </div>
    </div>
  );
}

export default Explorer;
