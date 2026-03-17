import "./PixelHero.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useXP } from "../hooks/useXP";
import levelThresholds from "../data/levelThresholds";
import resumeData from "../data/resume.json";
import experienceData from "../data/expandedExperience.json";

function PixelHero({ xpBarState, setXpBarState }) {
  const { xp, clickedIds } = useXP();
  const [displayLevel, setDisplayLevel] = useState(
    xpBarState?.displayLevel ?? 1
  );
  const [displayXpIntoLevel, setDisplayXpIntoLevel] = useState(
    xpBarState?.displayXpIntoLevel ?? 0
  );
  const [isLevelFlash, setIsLevelFlash] = useState(false);
  const [isBarResetting, setIsBarResetting] = useState(false);
  const timeoutsRef = useRef([]);
  const displayRef = useRef({ level: 1, xpIntoLevel: 0 });
  const fillDurationMs = 400;
  const flashDurationMs = 300;
  const resetDelayMs = 120;

  const cumulativeThresholds = useMemo(() => {
    // Convert incremental level costs into cumulative XP checkpoints.
    return levelThresholds.reduce((acc, threshold) => {
      const lastValue = acc.length > 0 ? acc[acc.length - 1] : 0;
      acc.push(lastValue + threshold);
      return acc;
    }, []);
  }, []);

  const progressSections = useMemo(() => {
    const explorerEducation = resumeData.education.filter(
      (edu) => edu.showInExplorer !== false
    );
    const explorerEducationNodes = (resumeData.mapNodes?.education || []).filter(
      (node) => node.showInExplorer !== false
    );
    const mapNodes = [
      ...explorerEducationNodes,
      ...(resumeData.mapNodes?.career || []),
      ...(resumeData.mapNodes?.skills || []),
    ];

    const countCompleted = (ids) =>
      ids.reduce((count, id) => count + (clickedIds.has(id) ? 1 : 0), 0);

    const projectIds = resumeData.projects.map(
      (project) => `project-build-${project.id}`
    );
    const experienceIds = experienceData.experience.map(
      (experience) => `experience-build-${experience.id}`
    );
    const levelIds = [
      ...explorerEducation.map((edu) => `education-build-${edu.id}`),
      "github-api-install",
    ];
    const mapIds = mapNodes.map((node) => `map-node-${node.id}`);
    const statsIds = ["stats-enhance-api"];
    const aboutIds = (resumeData.hobbies || []).map(
      (hobby) => `hobby-open-${hobby.name}`
    );

    return [
      { label: "Projects", ids: projectIds },
      { label: "Experience", ids: experienceIds },
      { label: "Levels", ids: levelIds },
      { label: "Map", ids: mapIds },
      { label: "Stats", ids: statsIds },
      { label: "About", ids: aboutIds },
    ].map((section) => ({
      ...section,
      completed: countCompleted(section.ids),
      total: section.ids.length,
    }));
  }, [clickedIds]);

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
    // Persist display state separately so bar animation can resume after refresh.
    if (typeof setXpBarState !== "function") {
      return;
    }

    setXpBarState({
      displayLevel,
      displayXpIntoLevel,
    });
  }, [displayLevel, displayXpIntoLevel, setXpBarState]);

  useEffect(() => {
    // Clear queued animations before scheduling a new XP transition sequence.
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
      // Full-level sequence: fill bar -> flash level-up -> reset next level.
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

    const targetLevel = getLevelFromXp(safeTargetXp);
    if (targetLevel - displayRef.current.level > 1) {
      const currentLevel = displayRef.current.level;
      const currentXp = displayRef.current.xpIntoLevel;
      const currentThresholds = getThresholdsForLevel(currentLevel);
      const currentXpForLevel = Math.max(
        1,
        currentThresholds.nextThreshold - currentThresholds.prevThreshold
      );
      const { prevThreshold, nextThreshold } = getThresholdsForLevel(
        targetLevel
      );
      const xpIntoTargetLevel = Math.max(0, safeTargetXp - prevThreshold);
      const targetXpForLevel = Math.max(1, nextThreshold - prevThreshold);
      const clampedXp = Math.min(xpIntoTargetLevel, targetXpForLevel);

      setDisplayLevel(currentLevel);
      setDisplayXpIntoLevel(Math.min(currentXp, currentXpForLevel));

      const fillCurrentTimeoutId = window.setTimeout(() => {
        setDisplayXpIntoLevel(currentXpForLevel);
      }, 0);
      timeoutsRef.current.push(fillCurrentTimeoutId);

      const flashStartTimeoutId = window.setTimeout(() => {
        setIsLevelFlash(true);
      }, fillDurationMs);
      timeoutsRef.current.push(flashStartTimeoutId);

      const flashEndTimeoutId = window.setTimeout(() => {
        setIsLevelFlash(false);
        setIsBarResetting(true);
        setDisplayLevel(targetLevel);
        setDisplayXpIntoLevel(0);

        const resetTimeoutId = window.setTimeout(() => {
          setIsBarResetting(false);
          setDisplayXpIntoLevel(clampedXp);
        }, resetDelayMs);
        timeoutsRef.current.push(resetTimeoutId);
      }, fillDurationMs + flashDurationMs);
      timeoutsRef.current.push(flashEndTimeoutId);
      return;
    }

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
  const isMaxLevel = displayLevel >= 99;

  return (
    <div className="pixel-hero-card">
      <div className="pixel-hero-header">
        <div
          className={
            isMaxLevel
              ? `level-bar level-bar--max${isLevelFlash ? " level-bar--flash" : ""}`
              : `level-bar${isLevelFlash ? " level-bar--flash" : ""}`
          }
          role="progressbar"
          aria-label="Level progress"
          aria-valuemin={0}
          aria-valuemax={xpForLevel}
          aria-valuenow={isMaxLevel ? xpForLevel : xpIntoLevel}
          style={{ "--xp-units": xpForLevel }}
        >
          <span
            className={
              isMaxLevel
                ? "level-bar-fill level-bar-fill--max"
                : "level-bar-fill"
            }
            style={{
              width: isMaxLevel ? "100%" : `${xpProgress}%`,
              transition: isBarResetting ? "none" : undefined,
            }}
          />
          <span className="level-bar-text">
            {isMaxLevel ? "MAX" : `lvl ${displayLevel}`}
          </span>
        </div>
      </div>
      <div className="pixel-hero-body">
        <div className="hero-sprite" aria-hidden="true" />
      </div>
      <div className="hero-progress" aria-label="Section progress">
        {progressSections.map((section) => (
          <div key={section.label} className="hero-progress-row">
            <span
              className="hero-progress-label"
              data-short={
                section.label === "Projects"
                  ? "Proj."
                  : section.label === "Experience"
                    ? "Exp."
                    : section.label === "Levels"
                      ? "Lvls"
                      : section.label
              }
              data-full={section.label}
            >
              {section.label}
            </span>
            <span className="hero-progress-value">
              {section.completed}/{section.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PixelHero;
