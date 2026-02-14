import Stats from "../components/Stats";
import Summary from "../components/Summary";
import About from "../components/About";
import Experience from "../components/Experience";
import Map from "../components/Map";
import ProgrammingLevels from "../components/ProgrammingLevels";
import Projects from "../components/Projects";

import "./RenderWindow.css";
import data from "../data/resume.json";

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
  const links = data?.meta?.links || {};
  const contactLinks = [
    links.email
      ? { label: "Email", href: `mailto:${links.email}` }
      : null,
    links.github ? { label: "GitHub", href: links.github } : null,
    links.linkedin ? { label: "LinkedIn", href: links.linkedin } : null,
  ].filter(Boolean);

  return (
    <div className="render-window">
      <div className="render-window-body">
        <div className="render-window-content">
          {activePage === "Summary" && <Summary />}
          {activePage === "About" && <About />}
          {activePage === "Experience" && <Experience buildStates={buildStates} startBuild={startBuild} />}
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
          {activePage === "Projects" && <Projects buildStates={buildStates} startBuild={startBuild} />}
          {activePage === "Stats" && (
            <Stats
              languageStatsReady={languageStatsReady}
              githubStatsState={githubStatsState}
              setGithubStatsState={setGithubStatsState}
            />
          )}
        </div>
        {activePage === "About" && (
          <aside className="render-window-rail">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                className="render-window-link"
                href={link.href}
                target={link.label === "Email" ? undefined : "_blank"}
                rel={link.label === "Email" ? undefined : "noreferrer"}
              >
                {link.label}
              </a>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}

export default RenderWindow;
