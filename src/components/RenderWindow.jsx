import Stats from "../components/Stats";
import Summary from "../components/Summary";
import About from "../components/About";
import Experience from "../components/Experience";
import Map from "../components/Map";
import ProgrammingLevels from "../components/ProgrammingLevels";
import Projects from "../components/Projects";

import "./RenderWindow.css";

function RenderWindow({ activePage }) {
  return (
    <div className="render-window">
      {activePage === "Summary" && <Summary />}
      {activePage === "About" && <About />}
      {activePage === "Experience" && <Experience />}
      {activePage === "Map" && <Map />}
      {activePage === "ProgrammingLevels" && <ProgrammingLevels />}
      {activePage === "Projects" && <Projects />}
      {activePage === "Stats" && <Stats />}
    </div>
  );
}

export default RenderWindow;
