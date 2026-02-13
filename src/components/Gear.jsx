import "./Gear.css";
import gear from "../data/gear.json";

function Gear() {
  return (
    <div className="gear">
      <ul className="gear-list">
        {gear.items.map((item) => (
          <li key={item.id} className="gear-item">
            <span className="gear-img">{item.img}</span>
            <span className="gear-name">{item.name}</span>
            <span className="gear-level">lvl {item.level}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Gear;
