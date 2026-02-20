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

const THEME_KEY = "theme";
const THEMES = ["default", "light", "alt", "zelda", "cyber"];
const BUILD_MS = 2400;
const explorerEducation = data.education.filter(
  (edu) => edu.showInExplorer !== false
);

function Explorer({
  activePage,
  setActivePage,
  xpBarState,
  setXpBarState,
  githubLanguages,
  setGithubLanguages,
  languageStatsReady,
  setLanguageStatsReady,
  languageStatsState,
  setLanguageStatsState,
  githubStatsState,
  setGithubStatsState,
  buildStates,
  setBuildStates,
}) {
  const [theme, setTheme] = useState("default");

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

  const githubLanguageSet = new Set(githubLanguages);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY) || "default";
    const nextTheme = THEMES.includes(storedTheme) ? storedTheme : "default";
    document.documentElement.dataset.theme =
      nextTheme === "default" ? "" : nextTheme;
    setTheme(nextTheme);
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
