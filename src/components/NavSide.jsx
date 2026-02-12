import "./NavSide.css";
import { useNavigate } from "react-router-dom";

function NavSide() {
const navigate = useNavigate();

  return (
    <nav className="nav-side">
      <ul className="nav-side-list">
        <li className="nav-side-item">
          <button className="nav-side-title">Summary</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title">Projects</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title">Experience</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title">Map</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title">Levels</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title">Statistics</button>
        </li>
        <li className="nav-side-item">
          <button className="nav-side-title">About</button>
        </li>
        <li className="nav-side-item nav-side-item--resume">
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
