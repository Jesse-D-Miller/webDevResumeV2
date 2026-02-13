import "./Explorer.css";
import NavSide from "../components/NavSide";
import RenderWindow from "../components/RenderWindow";
import SkillsPills from "../components/SkillsPills";
import Gear from "../components/Gear";
import NavTop from "../components/NavTop";
import PixelHero from "../components/PixelHero";
import data from "../data/resume.json";

import { useState, useEffect } from "react";

const STORAGE_KEY = "project-build-states";
const BUILD_MS = 2400;

function Explorer() {
  const [activePage, setActivePage] = useState("Summary");
  const [buildStates, setBuildStates] = useState(() => {
    return Object.fromEntries(
      data.projects.map((project) => [project.id, "unbuilt"]),
    );
  });

  //build a Set of skill names from projects that are "built"
  const activeSkills = new Set(
    Object.entries(buildStates)
      .filter(([, state]) => state === "built")
      .flatMap(([projectId]) => {
        const project = data.projects.find((p) => p.id === projectId);
        return project?.skillsDetailed?.map((skill) => skill.name) || [];
      }),
  );

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

  return (
    <div className="explorer">
      <div className="explorer-navside">
        <NavSide activePage={activePage} setActivePage={setActivePage} />
      </div>
      <div className="explorer-main">
        <NavTop />
        <div className="explorer-character">
          <PixelHero />
          <Gear />
          <SkillsPills activeSkills={activeSkills} />
        </div>
        <RenderWindow
          activePage={activePage}
          buildStates={buildStates}
          startBuild={startBuild}
        />
      </div>
    </div>
  );
}

export default Explorer;
