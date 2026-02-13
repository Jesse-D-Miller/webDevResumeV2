import { useEffect, useRef, useState } from "react";
import data from "../data/resume.json";
import "./Projects.css";
import { useXP } from "../hooks/useXP";

const BUILD_MS = 2400;

function Projects({ buildStates, startBuild }) {
  const [progressById, setProgressById] = useState({});
  const startTimesRef = useRef({});
  const awardedRef = useRef(new Set());
  const { grantXp, hasClicked } = useXP();

  const buildXpByProjectId = useRef({
    "project-1": 3,
    "project-2": 2,
    "project-3": 1,
    "project-4": 5,
    "project-5": 4,
    "project-6": 5,
  });

  useEffect(() => {
    Object.entries(buildStates).forEach(([projectId, state]) => {
      if (state !== "built") {
        return;
      }

      const xpId = `project-build-${projectId}`;
      if (awardedRef.current.has(xpId) || hasClicked(xpId)) {
        return;
      }

      awardedRef.current.add(xpId);

      const amount = buildXpByProjectId.current[projectId] ?? 1;
      const project = data.projects.find((item) => item.id === projectId);
      const title = project?.title ?? "Project";
      grantXp(xpId, amount, `Built ${title}`);
    });
  }, [buildStates, grantXp, hasClicked]);

  useEffect(() => {
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
    <div className="projects">
      {data.projects.map((project) => {
        const state = buildStates[project.id];

        return (
          <article
            key={project.id}
            className="project"
            aria-label={`Project: ${project.title}`}
            aria-busy={state === "building"}
          >
            {state === "unbuilt" && (
              <button
                className="project-unbuilt"
                onClick={() => startBuild(project.id)}
              >
                <h3>CLICK TO BUILD PROJECT</h3>
                <p>{project.title}</p>
              </button>
            )}

            {state === "building" && (
              <button className="project-building" disabled>
                <h3>Building...</h3>
                <p>{progressById[project.id] ?? 0}%</p>
              </button>
            )}

            {state === "built" && (
              <>
                <h2 className="project-title">{project.title}</h2>
                <h3 className="project-subtitle">{project.subtitle}</h3>
                <div className="project-stack">
                  {project.stack.map((item) => (
                    <span key={item} className="project-stack-pill">
                      {item}
                    </span>
                  ))}
                </div>
                <ul className="project-highlights">
                  {project.highlights.map((highlight) => (
                    <li key={highlight} className="project-highlight">
                      {highlight}
                    </li>
                  ))}
                </ul>
                <div className="project-links">
                  {[
                    { key: "live", label: "Live" },
                    { key: "code", label: "Code" },
                    { key: "video", label: "Video" },
                  ].map(({ key, label }) => {
                    const href = project.links?.[key] || "";
                    if (!href) {
                      return (
                        <span
                          key={key}
                          className="project-link project-link--disabled"
                        >
                          {label}
                        </span>
                      );
                    }

                    return (
                      <a
                        key={key}
                        href={href}
                        className="project-link project-link--active"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {label}
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default Projects;
