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

import { useMemo, useState, useEffect } from "react";
import { useXP } from "../hooks/useXP";
import levelThresholds from "../data/levelThresholds";

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
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProjectsCompact, setIsProjectsCompact] = useState(false);
  const { clickedIds, xp } = useXP();
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
  const displayLevel = useMemo(() => {
    const cumulative = levelThresholds.reduce((acc, threshold) => {
      const lastValue = acc.length > 0 ? acc[acc.length - 1] : 0;
      acc.push(lastValue + threshold);
      return acc;
    }, []);
    const maxTotal = cumulative[cumulative.length - 1] || 0;
    const safeXp = Math.min(xp, maxTotal);
    const index = cumulative.findIndex((threshold) => safeXp < threshold);
    return index === -1 ? 99 : index + 1;
  }, [xp]);
  const hideHero =
    isProjectsCompact &&
    [
      "Projects",
      "Experience",
      "ProgrammingLevels",
      "Map",
      "Stats",
      "About",
    ].includes(activePage);
  const progressSections = useMemo(() => {
    const explorerEducationNodes = (data.mapNodes?.education || []).filter(
      (node) => node.showInExplorer !== false
    );
    const mapNodes = [
      ...explorerEducationNodes,
      ...(data.mapNodes?.career || []),
      ...(data.mapNodes?.skills || []),
    ];

    const countCompleted = (ids) =>
      ids.reduce((count, id) => count + (clickedIds.has(id) ? 1 : 0), 0);

    const projectIds = [...visibleProjectIds].map(
      (projectId) => `project-build-${projectId}`
    );
    const experienceIds = experienceData.experience.map(
      (experience) => `experience-build-${experience.id}`
    );
    const levelIds = [
      ...explorerEducation.map((edu) => `education-build-${edu.id}`),
      "github-api-install",
    ];
    const mapIds = mapNodes.map((node) => `map-node-${node.id}`);
    const statsIds = ["stats-enhance-api"];
    const aboutIds = (data.hobbies || []).map(
      (hobby) => `hobby-open-${hobby.name}`
    );

    return [
      { label: "Projects", ids: projectIds },
      { label: "Experience", ids: experienceIds },
      { label: "Levels", ids: levelIds },
      { label: "Map", ids: mapIds },
      { label: "Stats", ids: statsIds },
      { label: "About", ids: aboutIds },
    ].map((section) => ({
      ...section,
      completed: countCompleted(section.ids),
      total: section.ids.length,
    }));
  }, [clickedIds]);

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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    const handleChange = (event) => {
      setIsProjectsCompact(event.matches);
    };

    setIsProjectsCompact(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
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

  const handleToggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  const handleCloseNav = () => {
    setIsNavOpen(false);
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

  const { links } = data.meta;

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
          onItemSelect={handleCloseNav}
        />
      </div>
      <div className="explorer-main">
        <div className="explorer-navtop">
          <NavTop onToggleNav={handleToggleNav} isNavOpen={isNavOpen} />
          <div
            id="explorer-nav-drawer"
            className={`explorer-navside-drawer ${isNavOpen ? "is-open" : ""}`}
          >
            <NavSide
              activePage={activePage}
              setActivePage={setActivePage}
              theme={theme}
              themeIndex={Math.max(0, THEMES.indexOf(theme)) + 1}
              themeTotal={THEMES.length}
              onToggleTheme={handleToggleTheme}
              onResetApp={handleResetApp}
              onItemSelect={handleCloseNav}
            />
            <div className="nav-drawer-contacts">
              <ul className="nav-drawer-contact-list">
                <li>
                  <a
                    href={`mailto:${links.email}`}
                    className="nav-drawer-contact-link"
                  >
                    Email
                  </a>
                </li>
                <li>
                  <a
                    href={links.github}
                    className="nav-drawer-contact-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href={links.linkedin}
                    className="nav-drawer-contact-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href={links.resumePdf}
                    className="nav-drawer-contact-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Resume PDF
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="explorer-character">
          {!hideHero && (
            <PixelHero xpBarState={xpBarState} setXpBarState={setXpBarState} />
          )}
          {hideHero && (
            <div className="hero-level-pill" role="status">
              <span className="hero-level-pill-text">
                lvl {displayLevel}
              </span>
              <div className="hero-progress hero-progress--pill">
                {progressSections.map((section) => (
                  <div key={section.label} className="hero-progress-row">
                    <span
                      className="hero-progress-label"
                      data-short={
                        section.label === "Projects"
                          ? "Proj."
                          : section.label === "Experience"
                            ? "Exp."
                            : section.label === "Levels"
                              ? "Lvls"
                              : section.label
                      }
                      data-full={section.label}
                    >
                      {section.label}
                    </span>
                    <span className="hero-progress-value">
                      {section.completed}/{section.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!hideHero && <Gear />}
          {!(
            isProjectsCompact &&
            (activePage === "Map" ||
              activePage === "Stats" ||
              activePage === "About")
          ) && (
            <SkillsPills
              activeSkills={activeSkills}
              highlightedSkills={githubLanguageSet}
            />
          )}
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
