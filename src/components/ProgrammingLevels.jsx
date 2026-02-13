import { useEffect, useRef, useState } from "react";
import data from "../data/resume.json";
import "./ProgrammingLevels.css";
import { useXP } from "../hooks/useXP";

const BUILD_MS = 2400;

function ProgrammingLevels({ buildStates, startBuild }) {
  const [progressById, setProgressById] = useState({});
  const startTimesRef = useRef({});
  const awardedRef = useRef(new Set());
  const { grantXp, hasClicked } = useXP();
  const educationIds = useRef(new Set(data.education.map((edu) => edu.id)));
  const buildXpByEducationId = useRef(
    Object.fromEntries(data.education.map((edu) => [edu.id, 7]))
  );

  useEffect(() => {
    if (!buildStates) {
      return;
    }

    Object.entries(buildStates).forEach(([educationId, state]) => {
      if (!educationIds.current.has(educationId)) {
        return;
      }

      if (state !== "built") {
        return;
      }

      const xpId = `education-build-${educationId}`;
      if (awardedRef.current.has(xpId) || hasClicked(xpId)) {
        return;
      }

      awardedRef.current.add(xpId);

      const amount = buildXpByEducationId.current[educationId] ?? 7;
      const education = data.education.find((item) => item.id === educationId);
      const title = education?.school ?? "Education";
      grantXp(xpId, amount, `Built ${title}`);
    });
  }, [buildStates, grantXp, hasClicked]);

  useEffect(() => {
    if (!buildStates) {
      return;
    }

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
            Math.round(((tick - start) / BUILD_MS) * 100)
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

  useEffect(() => {
    if (!buildStates) {
      return;
    }

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

  return (
    <div className="programming-levels">
      {data.education.map((edu) => {
        const state = buildStates?.[edu.id] ?? "unbuilt";

        return (
          <article
            key={edu.id}
            className="programming-levels-item"
            aria-label={`Education: ${edu.school}`}
            aria-busy={state === "building"}
          >
            {state === "unbuilt" && (
              <button
                className="programming-levels-unbuilt"
                onClick={() => startBuild(edu.id)}
              >
                <h3>CLICK TO ENROLL</h3>
                <p>{edu.school}</p>
              </button>
            )}

            {state === "building" && (
              <button className="programming-levels-building" disabled>
                <h3>Studying...</h3>
                <p>{progressById[edu.id] ?? 0}%</p>
              </button>
            )}

            {state === "built" && (
              <>
                <span className="programming-levels-period programming-levels-period--top">
                  {edu.period}
                </span>
                <h2 className="programming-levels-education">{edu.school}</h2>
                <h3 className="programming-levels-program">{edu.program}</h3>
                <div className="programming-levels-skills">
                  {edu.skills.map((skill) => (
                    <span key={skill} className="programming-levels-skill-pill">
                      {skill}
                    </span>
                  ))}
                </div>
                <ul className="programming-levels-details">
                  {edu.details.map((detail, index) => (
                    <li key={index} className="programming-levels-detail">
                      {detail}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default ProgrammingLevels;