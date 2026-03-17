import Stats from "../components/Stats";
import Summary from "../components/Summary";
import About from "../components/About";
import Experience from "../components/Experience";
import Map from "../components/Map";
import ProgrammingLevels from "../components/ProgrammingLevels";
import Projects from "../components/Projects";

import "./RenderWindow.css";

function RenderWindow({
  activePage,
  buildStates,
  startBuild,
  onLanguagesReady,
  onLanguageStatsReady,
  languageStatsReady,
  languageStatsState,
  setLanguageStatsState,
  githubStatsState,
  setGithubStatsState,
}) {
  return (
    <div className="render-window">
      <div className="render-window-body">
        <div className="render-window-content">
          {/* Keyed remount clears transient UI state when switching pages. */}
          <div key={activePage} className="render-window-panel">
            {activePage === "Summary" && <Summary />}
            {activePage === "About" && <About />}
            {activePage === "Experience" && (
              <Experience buildStates={buildStates} startBuild={startBuild} />
            )}
            {activePage === "ProgrammingLevels" && (
              <ProgrammingLevels
                buildStates={buildStates}
                startBuild={startBuild}
                onLanguagesReady={onLanguagesReady}
                onLanguageStatsReady={onLanguageStatsReady}
                languageStatsState={languageStatsState}
                setLanguageStatsState={setLanguageStatsState}
              />
            )}
            {activePage === "Map" && <Map />}
            {activePage === "Projects" && (
              <Projects buildStates={buildStates} startBuild={startBuild} />
            )}
            {activePage === "Stats" && (
              <Stats
                languageStatsReady={languageStatsReady}
                githubStatsState={githubStatsState}
                setGithubStatsState={setGithubStatsState}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RenderWindow;
