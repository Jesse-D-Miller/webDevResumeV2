import "./NavSide.css";
import { useNavigate } from "react-router-dom";

function NavSide({ activePage, setActivePage, themeIndex, themeTotal, onToggleTheme }) {
const navigate = useNavigate();

  return (
    <nav className="nav-side">
      <ul className="nav-side-list">
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => setActivePage("Summary")}>Summary</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => setActivePage("Projects")}>Projects</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => setActivePage("Experience")}>Experience</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => setActivePage("ProgrammingLevels")}>Levels</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => setActivePage("Map")}>Map</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => setActivePage("Stats")}>Statistics</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => setActivePage("About")}>About</button>
        </li>
        <li className="nav-side-item nav-side-item--resume">
          <button
            className="nav-side-title nav-side-title--mode"
            onClick={onToggleTheme}
            type="button"
          >
            Mode: {themeIndex}/{themeTotal}
          </button>
        </li>
        <li className="nav-side-item">
          <button
            className="nav-side-title"
            onClick={() => navigate("/resume")}
          >
            Resume
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default NavSide;
