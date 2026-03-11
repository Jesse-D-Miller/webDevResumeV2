import "./NavSide.css";
import { useNavigate } from "react-router-dom";

function NavSide({
  activePage,
  setActivePage,
  themeIndex,
  themeTotal,
  onToggleTheme,
  onResetApp,
  onItemSelect,
}) {
  const navigate = useNavigate();
  const handleSelectPage = (page) => {
    setActivePage(page);
    if (typeof onItemSelect === "function") {
      onItemSelect();
    }
  };

  const handleResume = () => {
    navigate("/resume");
    if (typeof onItemSelect === "function") {
      onItemSelect();
    }
  };

  return (
    <nav className="nav-side">
      <ul className="nav-side-list">
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => handleSelectPage("Summary")}>Summary</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => handleSelectPage("Projects")}>Projects</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => handleSelectPage("Experience")}>Experience</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => handleSelectPage("ProgrammingLevels")}>Levels</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => handleSelectPage("Map")}>Map</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => handleSelectPage("Stats")}>Statistics</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title" onClick={() => handleSelectPage("About")}>About</button>
        </li>
        <li className="nav-side-spacer" aria-hidden="true" />
        <li className="nav-side-item nav-side-item--utility">
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
            className="nav-side-title nav-side-title--reset"
            onClick={onResetApp}
            type="button"
          >
            Reset
          </button>
        </li>
        <li className="nav-side-item nav-side-item--resume">
          <button className="nav-side-title" onClick={handleResume}>
            Resume
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default NavSide;
