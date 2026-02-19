import "./Gear.css";
import { useEffect, useMemo, useRef } from "react";
import gear from "../data/gear.json";
import levelThresholds from "../data/levelThresholds";
import { useXP } from "../hooks/useXP";

function Gear() {
  const { xp } = useXP();
  const listRef = useRef(null);
  const itemRefs = useRef(new window.Map());
  const prevLevelRef = useRef(0);
  const iconMap = import.meta.glob("../assets/gearIcons/*.png", {
    eager: true,
    import: "default",
  });
  const resolveGearIcon = (filename) => {
    if (!filename) return "";
    if (filename.startsWith("http")) {
      return filename;
    }
    const baseName = filename.split("/").pop();
    const key = `../assets/gearIcons/${baseName}`;
    return iconMap[key] || "";
  };
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

  useEffect(() => {
    const prevLevel = prevLevelRef.current;
    if (currentLevel <= prevLevel) {
      prevLevelRef.current = currentLevel;
      return;
    }

    const lockedIndex = gear.items.findIndex(
      (item) => currentLevel < item.level
    );
    if (lockedIndex === -1) {
      prevLevelRef.current = currentLevel;
      return;
    }

    const targetIndex = Math.min(lockedIndex + 1, gear.items.length - 1);
    const targetId = gear.items[targetIndex]?.id;
    const targetEl = targetId ? itemRefs.current.get(targetId) : null;

    if (targetEl && listRef.current) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "end" });
    }

    prevLevelRef.current = currentLevel;
  }, [currentLevel]);

  return (
    <div className="gear" ref={listRef}>
      <ul className="gear-list">
        {gear.items.map((item) => (
          <li
            key={item.id}
            className={`gear-item${
              currentLevel < item.level ? " gear-item--locked" : ""
            }`}
            ref={(element) => {
              if (element) {
                itemRefs.current.set(item.id, element);
              } else {
                itemRefs.current.delete(item.id);
              }
            }}
          >
            <img
              className="gear-img"
              src={resolveGearIcon(item.img)}
              alt={`${item.name} icon`}
              width={32}
              height={32}
              loading="lazy"
            />
            <span className="gear-name">{item.name}</span>
            <span className="gear-level">lvl {item.level}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Gear;
