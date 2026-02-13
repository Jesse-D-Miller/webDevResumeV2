import "./Gear.css";
import { useMemo } from "react";
import gear from "../data/gear.json";
import levelThresholds from "../data/levelThresholds";
import { useXP } from "../hooks/useXP";

function Gear() {
  const { xp } = useXP();
  const cumulativeThresholds = useMemo(() => {
    return levelThresholds.reduce((acc, threshold) => {
      const lastValue = acc.length > 0 ? acc[acc.length - 1] : 0;
      acc.push(lastValue + threshold);
      return acc;
    }, []);
  }, []);

  const currentLevel = useMemo(() => {
    const index = cumulativeThresholds.findIndex(
      (threshold) => xp < threshold
    );
    return index === -1 ? 99 : index + 1;
  }, [cumulativeThresholds, xp]);

  return (
    <div className="gear">
      <ul className="gear-list">
        {gear.items.map((item) => (
          <li
            key={item.id}
            className={`gear-item${
              currentLevel < item.level ? " gear-item--locked" : ""
            }`}
          >
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
