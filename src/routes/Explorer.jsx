import "./Explorer.css";
import NavSide from "../components/NavSide";
import RenderWindow from "../components/RenderWindow";
import SkillsPills from "../components/SkillsPills";
import Gear from "../components/Gear";
import NavTop from "../components/NavTop";
import PixelHero from "../components/PixelHero";
import data from "../data/resume.json";
import experienceData from "../data/expandedExperience.json";
import mapImage from "../assets/resumeMap.png";
import { reloadPage } from "../utils/reloadPage";

import { useState, useEffect } from "react";

const STORAGE_KEY = "project-build-states";
const XP_STATE_KEY = "xp-state";
const XP_BAR_STORAGE_KEY = "xp-bar-state";
const THEME_KEY = "theme";
const THEMES = ["default", "light", "alt", "zelda", "cyber"];
const BUILD_MS = 2400;
const explorerEducation = data.education.filter(
  (edu) => edu.showInExplorer !== false
);
const getProjectNumericId = (project) =>
  Number(String(project.id || "").replace(/\D/g, "")) || 0;

function Explorer({
  activePage: activePageProp,
  setActivePage: setActivePageProp,
  xpBarState: xpBarStateProp,
  setXpBarState: setXpBarStateProp,
  githubLanguages: githubLanguagesProp,
  setGithubLanguages: setGithubLanguagesProp,
  languageStatsReady: languageStatsReadyProp,
  setLanguageStatsReady: setLanguageStatsReadyProp,
  languageStatsState: languageStatsStateProp,
  setLanguageStatsState: setLanguageStatsStateProp,
  githubStatsState: githubStatsStateProp,
  setGithubStatsState: setGithubStatsStateProp,
  buildStates: buildStatesProp,
  setBuildStates: setBuildStatesProp,
}) {
  const [activePageState, setActivePageState] = useState("Summary");
  const [xpBarStateState, setXpBarStateState] = useState({
    displayLevel: 1,
    displayXpIntoLevel: 0,
  });
  const [githubLanguagesState, setGithubLanguagesState] = useState([]);
  const [languageStatsReadyState, setLanguageStatsReadyState] = useState(false);
  const [languageStatsStateState, setLanguageStatsStateState] = useState({
    isApiInstalled: false,
    statsStatus: "idle",
    statsError: "",
    languageStats: null,
  });
  const [githubStatsStateState, setGithubStatsStateState] = useState({
    status: "idle",
    stats: null,
    error: "",
    isEnhanced: false,
  });
  const [buildStatesState, setBuildStatesState] = useState(() => {
    return Object.fromEntries([
      ...data.projects.map((project) => [project.id, "unbuilt"]),
      ...experienceData.experience.map((item) => [item.id, "unbuilt"]),
      ...explorerEducation.map((edu) => [edu.id, "unbuilt"]),
    ]);
  });
  const [theme, setTheme] = useState("default");
  const isBuildStateControlled = buildStatesProp !== undefined;
  const activePage = activePageProp ?? activePageState;
  const setActivePage = setActivePageProp ?? setActivePageState;
  const xpBarState = xpBarStateProp ?? xpBarStateState;
  const setXpBarState = setXpBarStateProp ?? setXpBarStateState;
  const githubLanguages = githubLanguagesProp ?? githubLanguagesState;
  const setGithubLanguages =
    setGithubLanguagesProp ?? setGithubLanguagesState;
  const languageStatsReady =
    languageStatsReadyProp ?? languageStatsReadyState;
  const setLanguageStatsReady =
    setLanguageStatsReadyProp ?? setLanguageStatsReadyState;
  const languageStatsState =
    languageStatsStateProp ?? languageStatsStateState;
  const setLanguageStatsState =
    setLanguageStatsStateProp ?? setLanguageStatsStateState;
  const githubStatsState = githubStatsStateProp ?? githubStatsStateState;
  const setGithubStatsState =
    setGithubStatsStateProp ?? setGithubStatsStateState;
  const buildStates = buildStatesProp ?? buildStatesState;
  const setBuildStates = setBuildStatesProp ?? setBuildStatesState;

  const lighthouseLabsId = explorerEducation.find(
    (edu) => edu.school === "Lighthouse Labs"
  )?.id;
  const visibleProjectIds = new Set(
    [...data.projects]
      .sort((a, b) => getProjectNumericId(b) - getProjectNumericId(a))
      .slice(0, 6)
      .map((project) => project.id)
  );

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

        const education = explorerEducation.find((edu) => edu.id === entryId);
        return education?.skills || [];
      }),
  );

  if (lighthouseLabsId && buildStates[lighthouseLabsId] === "built") {
    data.projects
      .filter((project) => !visibleProjectIds.has(project.id))
      .forEach((project) => {
        (project.skillsDetailed || []).forEach((skill) => {
          activeSkills.add(skill.name);
        });
      });
  }

  const githubLanguageSet = new Set(githubLanguages);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY) || "default";
    const nextTheme = THEMES.includes(storedTheme) ? storedTheme : "default";
    document.documentElement.dataset.theme =
      nextTheme === "default" ? "" : nextTheme;
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    if (isBuildStateControlled) {
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);

    setBuildStates((prev) => ({
      ...prev,
      ...parsed,
    }));
  }, [isBuildStateControlled, setBuildStates]);

  useEffect(() => {
    if (isBuildStateControlled) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildStates));
  }, [buildStates, isBuildStateControlled]);

  useEffect(() => {
    const image = new Image();
    image.src = mapImage;
  }, []);

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

  const handleResetApp = () => {
    const shouldReset = window.confirm(
      "Reset local progress and theme? This cannot be undone."
    );
    if (!shouldReset) {
      return;
    }

    [STORAGE_KEY, XP_STATE_KEY, XP_BAR_STORAGE_KEY, THEME_KEY].forEach(
      (key) => {
        window.localStorage.removeItem(key);
      }
    );
    document.documentElement.dataset.theme = "";
    reloadPage();
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
          onResetApp={handleResetApp}
        />
      </div>
      <div className="explorer-main">
        <NavTop />
        <div className="explorer-character">
          <PixelHero xpBarState={xpBarState} setXpBarState={setXpBarState} />
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
