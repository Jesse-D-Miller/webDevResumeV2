import "./NavSide.css";
import { useNavigate } from "react-router-dom";

function NavSide() {
const navigate = useNavigate();

  return (
    <nav className="navside">
      <ul className="navside__list">
        <li className="navside__item">
          <button className="navside__title">Summary</button>
        </li>
        <li className="navside__item">
          <button className="navside__title">Projects</button>
        </li>
        <li className="navside__item">
          <button className="navside__title">Experience</button>
        </li>
        <li className="navside__item">
          <button className="navside__title">Map</button>
        </li>
        <li className="navside__item">
          <button className="navside__title">Levels</button>
        </li>
        <li className="navside__item">
          <button className="navside__title">Statistics</button>
        </li>
        <li className="navside__item">
          <button className="navside__title">About</button>
        </li>
        <li className="navside__item navside__item--resume">
          <button className="navside__title" onClick={() => navigate("/resume")}>Resume</button>
        </li>
      </ul>
    </nav>
  );
}

export default NavSide;
