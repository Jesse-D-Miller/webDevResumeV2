import { useEffect, useRef, useState } from "react";
import "./Experience.css";
import experienceData from "../data/expandedExperience.json";
import { useXP } from "../hooks/useXP";

const BUILD_MS = 2400;

function Experience({ buildStates, startBuild }) {
  const [progressById, setProgressById] = useState({});
  const [scrollState, setScrollState] = useState({ atStart: true, atEnd: false });
  const startTimesRef = useRef({});
  const awardedRef = useRef(new Set());
  const { grantXp, hasClicked } = useXP();
  const experienceIds = useRef(
    new Set(experienceData.experience.map((item) => item.id))
  );
  const scrollRef = useRef(null);

  const buildXpByExperienceId = useRef({
    "experience-1": 27,
    "experience-2": 27,
    "experience-3": 27,
  });

  useEffect(() => {
    // XP is awarded only once when an item first reaches "built".
    Object.entries(buildStates).forEach(([experienceId, state]) => {
      if (!experienceIds.current.has(experienceId)) {
        return;
      }

      if (state !== "built") {
        return;
      }

      const xpId = `experience-build-${experienceId}`;
      if (awardedRef.current.has(xpId) || hasClicked(xpId)) {
        return;
      }

      awardedRef.current.add(xpId);

      const amount = buildXpByExperienceId.current[experienceId] ?? 1;
      const experience = experienceData.experience.find(
        (item) => item.id === experienceId,
      );
      const title = experience?.role ?? "Experience";
      grantXp(xpId, amount, `Built ${title}`);
    });
  }, [buildStates, grantXp, hasClicked]);

  useEffect(() => {
    // Progress percentages are UI-only and derived from elapsed wall-clock time.
    const buildingIds = Object.entries(buildStates)
      .filter(([, state]) => state === "building")
      .map(([id]) => id);

    if (!buildingIds.length) {
      return;
    }

    const now = Date.now();
    buildingIds.forEach((id) => {
      if (!startTimesRef.current[id]) {
        startTimesRef.current[id] = now;
      }
    });

    const intervalId = window.setInterval(() => {
      const tick = Date.now();

      setProgressById((prev) => {
        let changed = false;
        const next = { ...prev };

        buildingIds.forEach((id) => {
          const start = startTimesRef.current[id] ?? tick;
          const percent = Math.min(
            100,
            Math.round(((tick - start) / BUILD_MS) * 100),
          );

          if (next[id] !== percent) {
            next[id] = percent;
            changed = true;
          }
        });

        return changed ? next : prev;
      });
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [buildStates]);

  const updateScrollState = () => {
    // Scroll buttons are enabled/disabled from this derived boundary state.
    const node = scrollRef.current;
    if (!node) return;
    const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth);
    const epsilon = 2;
    setScrollState({
      atStart: maxScroll === 0 || node.scrollLeft <= epsilon,
      atEnd: maxScroll === 0 || node.scrollLeft >= maxScroll - epsilon,
    });
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, []);

  useEffect(() => {
    setProgressById((prev) => {
      let changed = false;
      const next = { ...prev };

      Object.entries(buildStates).forEach(([id, state]) => {
        if (state !== "building" && next[id] !== undefined) {
          delete next[id];
          delete startTimesRef.current[id];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [buildStates]);

  const handleScrollBy = (amount) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    window.requestAnimationFrame(updateScrollState);
  };

  return (
    <div className="experience-wrap">
      <button
        className={
          scrollState.atStart
            ? "scroll-control scroll-control--left scroll-control--disabled"
            : "scroll-control scroll-control--left"
        }
        type="button"
        onClick={() => handleScrollBy(-360)}
        aria-label="Scroll experience left"
      >
        ◀
      </button>
      <div
        className="experience"
        ref={scrollRef}
        onScroll={updateScrollState}
        role="region"
        aria-label="Experience"
        tabIndex={0}
      >
        {experienceData.experience.map((experience) => {
          const state = buildStates[experience.id];

          return (
            <article
              key={experience.id}
              className="experience-item"
              aria-label={`Experience: ${experience.role}`}
              aria-busy={state === "building"}
            >
              {state === "unbuilt" && (
                <button
                  className="experience-unbuilt"
                  onClick={() => startBuild(experience.id)}
                >
                  <h3>CLICK TO BUILD EXPERIENCE</h3>
                  <p>{experience.role}</p>
                </button>
              )}

              {state === "building" && (
                <button className="experience-building" disabled>
                  <h3>Building...</h3>
                  <p>{progressById[experience.id] ?? 0}%</p>
                </button>
              )}

              {state === "built" && (
                <>
                  <span className="experience-period experience-period--top">
                    {experience.period}
                  </span>
                  <h2 className="experience-title">{experience.role}</h2>
                  <h3 className="experience-subtitle">{experience.company}</h3>
                  <div className="experience-skills">
                    {experience.skills.map((item) => (
                      <span key={item} className="experience-skill-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                  <ul className="experience-bullets">
                    {experience.bullets.map((bullet) => (
                      <li key={bullet} className="experience-bullet">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          );
        })}
      </div>
      <button
        className={
          scrollState.atEnd
            ? "scroll-control scroll-control--right scroll-control--disabled"
            : "scroll-control scroll-control--right"
        }
        type="button"
        onClick={() => handleScrollBy(360)}
        aria-label="Scroll experience right"
      >
        ▶
      </button>
    </div>
  );
}

export default Experience;
