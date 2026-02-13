import "./PixelHero.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useXP } from "../hooks/useXP";
import levelThresholds from "../data/levelThresholds";
import heroSprite1 from "../assets/pixelHeroLevel1.png";

function PixelHero() {
  const { xp } = useXP();
  const [displayLevel, setDisplayLevel] = useState(1);
  const [displayXpIntoLevel, setDisplayXpIntoLevel] = useState(0);
  const [isLevelFlash, setIsLevelFlash] = useState(false);
  const [isBarResetting, setIsBarResetting] = useState(false);
  const timeoutsRef = useRef([]);
  const displayRef = useRef({ level: 1, xpIntoLevel: 0 });
  const fillDurationMs = 400;
  const flashDurationMs = 300;
  const resetDelayMs = 120;

  const cumulativeThresholds = useMemo(() => {
    return levelThresholds.reduce((acc, threshold) => {
      const lastValue = acc.length > 0 ? acc[acc.length - 1] : 0;
      acc.push(lastValue + threshold);
      return acc;
    }, []);
  }, []);

  const getLevelFromXp = (value) => {
    const index = cumulativeThresholds.findIndex(
      (threshold) => value < threshold
    );
    return index === -1 ? 99 : index + 1;
  };

  const getThresholdsForLevel = (level) => {
    const prevThreshold = level <= 1 ? 0 : cumulativeThresholds[level - 2];
    const nextThreshold =
      level >= 99 ? prevThreshold : cumulativeThresholds[level - 1];
    return { prevThreshold, nextThreshold };
  };

  const totalMax = cumulativeThresholds[cumulativeThresholds.length - 1] || 0;
  const safeTargetXp = Math.min(xp, totalMax);

  useEffect(() => {
    displayRef.current = {
      level: displayLevel,
      xpIntoLevel: displayXpIntoLevel,
    };
  }, [displayLevel, displayXpIntoLevel]);

  useEffect(() => {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutsRef.current = [];

    const currentTotal = (() => {
      const { prevThreshold } = getThresholdsForLevel(displayRef.current.level);
      return prevThreshold + displayRef.current.xpIntoLevel;
    })();

    if (safeTargetXp <= currentTotal) {
      const targetLevel = getLevelFromXp(safeTargetXp);
      const { prevThreshold, nextThreshold } = getThresholdsForLevel(
        targetLevel
      );
      const xpIntoLevel = Math.max(0, safeTargetXp - prevThreshold);
      setDisplayLevel(targetLevel);
      setDisplayXpIntoLevel(
        Math.min(xpIntoLevel, nextThreshold - prevThreshold)
      );
      return;
    }

    const scheduleFullLevel = (level, startXp) => {
      const { prevThreshold, nextThreshold } = getThresholdsForLevel(level);
      const xpForLevel = Math.max(1, nextThreshold - prevThreshold);
      const clampedStart = Math.min(startXp, xpForLevel);

      setDisplayLevel(level);
      setDisplayXpIntoLevel(clampedStart);

      const fillTimeoutId = window.setTimeout(() => {
        setDisplayXpIntoLevel(xpForLevel);
      }, 0);
      timeoutsRef.current.push(fillTimeoutId);

      const flashStartTimeoutId = window.setTimeout(() => {
        setIsLevelFlash(true);
      }, fillDurationMs);
      timeoutsRef.current.push(flashStartTimeoutId);

      const flashEndTimeoutId = window.setTimeout(() => {
        setIsLevelFlash(false);

        const nextLevel = Math.min(99, level + 1);
        setIsBarResetting(true);
        setDisplayLevel(nextLevel);
        setDisplayXpIntoLevel(0);

        const resetTimeoutId = window.setTimeout(() => {
          setIsBarResetting(false);
          advance(nextLevel, 0);
        }, resetDelayMs);
        timeoutsRef.current.push(resetTimeoutId);
      }, fillDurationMs + flashDurationMs);
      timeoutsRef.current.push(flashEndTimeoutId);
    };

    const advance = (level, startXp) => {
      const { prevThreshold, nextThreshold } = getThresholdsForLevel(level);
      const xpForLevel = Math.max(1, nextThreshold - prevThreshold);
      const remainingXp = Math.max(0, safeTargetXp - prevThreshold);

      if (level >= 99 || remainingXp < xpForLevel) {
        setDisplayLevel(level);
        setDisplayXpIntoLevel(Math.min(remainingXp, xpForLevel));
        return;
      }

      scheduleFullLevel(level, startXp);
    };

    advance(displayRef.current.level, displayRef.current.xpIntoLevel);

    return () => {
      timeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId)
      );
      timeoutsRef.current = [];
    };
  }, [safeTargetXp]);

  const { prevThreshold, nextThreshold } = getThresholdsForLevel(displayLevel);
  const xpIntoLevel = Math.min(
    displayXpIntoLevel,
    nextThreshold - prevThreshold
  );
  const xpForLevel = Math.max(1, nextThreshold - prevThreshold);
  const xpProgress = Math.min(
    100,
    Math.round((xpIntoLevel / xpForLevel) * 100)
  );

  return (
    <div className="pixel-hero-card">
      <div className="pixel-hero-header">
        <div
          className="xp-bar"
          role="progressbar"
          aria-label="XP progress"
          aria-valuemin={0}
          aria-valuemax={xpForLevel}
          aria-valuenow={xpIntoLevel}
          style={{ "--xp-units": xpForLevel }}
        >
          <span
            className="xp-bar-fill"
            style={{
              width: `${xpProgress}%`,
              transition: isBarResetting ? "none" : undefined,
            }}
          />
          <span className="xp-bar-text">
            {xpIntoLevel}/{xpForLevel} XP
          </span>
        </div>
        <span className={`hero-level${isLevelFlash ? " hero-level--flash" : ""}`}>
          lvl {displayLevel}
        </span>
      </div>
      <div className="pixel-hero-body">
        <div className="hero-sprite" aria-hidden="true" />
      </div>
    </div>
  );
}

export default PixelHero;
