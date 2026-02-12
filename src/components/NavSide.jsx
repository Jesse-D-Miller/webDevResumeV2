import "./NavSide.css";

function NavSide() {
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
      </ul>
    </nav>
  );
}

export default NavSide;
