import { useEffect, useMemo, useRef, useState } from "react";
import data from "../data/resume.json";
import "./ProgrammingLevels.css";
import { useXP } from "../hooks/useXP";
import { fetchLanguageStats } from "../services/githubApi";

const BUILD_MS = 2400;

function ProgrammingLevels({ buildStates, startBuild }) {
  const [progressById, setProgressById] = useState({});
  const [languageStats, setLanguageStats] = useState(null);
  const [statsStatus, setStatsStatus] = useState("idle");
  const [statsError, setStatsError] = useState("");
  const [isApiInstalled, setIsApiInstalled] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);
  const [displayPercents, setDisplayPercents] = useState({});
  const startTimesRef = useRef({});
  const awardedRef = useRef(new Set());
  const { grantXp, hasClicked } = useXP();
  const educationIds = useRef(new Set(data.education.map((edu) => edu.id)));
  const buildXpByEducationId = useRef(
    Object.fromEntries(data.education.map((edu) => [edu.id, 15]))
  );
  const githubUsername = useMemo(() => {
    const url = data.meta?.links?.github || "";
    const match = url.match(/github\.com\/([^/]+)/i);
    return match ? match[1] : "";
  }, []);


  const primaryEducationId = data.education[0]?.id;
  const isEducationBuilt = Boolean(
    primaryEducationId && buildStates?.[primaryEducationId] === "built"
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
    if (!githubUsername || typeof fetch !== "function") {
      return;
    }

    let isActive = true;
    const loadStats = async () => {
      try {
        setStatsStatus("loading");
        const result = await fetchLanguageStats({ username: githubUsername });
        if (!isActive) return;
        setLanguageStats(result);
        setStatsStatus("ready");
      } catch (error) {
        if (!isActive) return;
        setStatsError(error?.message || "Failed to load GitHub stats");
        setStatsStatus("error");
      }
    };

    loadStats();
    return () => {
      isActive = false;
    };
  }, [githubUsername]);

  useEffect(() => {
    if (!isEducationBuilt) {
      setIsApiInstalled(false);
    }
  }, [isEducationBuilt]);

  useEffect(() => {
    const canAnimate = isEducationBuilt && isApiInstalled && statsStatus === "ready";
    setAnimateBars(canAnimate);
  }, [isEducationBuilt, isApiInstalled, statsStatus]);

  useEffect(() => {
    if (!languageStats || !animateBars) {
      setDisplayPercents({});
      return;
    }

    const topLanguages = languageStats.languages.slice(0, 6);
    const totalBytes = languageStats.totalBytes || 1;
    const targetPercents = Object.fromEntries(
      topLanguages.map((lang) => [
        lang.name,
        Math.min(100, Math.ceil((lang.bytes / totalBytes) * 100)),
      ])
    );

    let frameId;
    let start;
    const duration = 3000;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);

      setDisplayPercents(() => {
        const next = {};
        topLanguages.forEach((lang) => {
          const target = targetPercents[lang.name] ?? 0;
          next[lang.name] = Math.max(0, Math.round(target * eased));
        });
        return next;
      });

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [languageStats, animateBars]);

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
      <article className="programming-levels-item programming-levels-item--stats">
        <h2 className="programming-levels-education">
          GitHub Language Data
          <span className="programming-levels-title-note">
            Total bytes across top 6 languages
          </span>
        </h2>
        <div className="programming-levels-stats">
          {!isEducationBuilt && (
            <div className="programming-levels-locked-message">
              Attend Lighthouse Labs to learn about APIs
            </div>
          )}
          {isEducationBuilt && !isApiInstalled && (
            <button
              className="programming-levels-install programming-levels-install--ready"
              type="button"
              onClick={() => setIsApiInstalled(true)}
            >
              Install API
            </button>
          )}
          {statsStatus === "loading" && (
            <p className="programming-levels-status">Loading stats...</p>
          )}
          {statsStatus === "error" && (
            <p className="programming-levels-status programming-levels-status--error">
              {statsError}
            </p>
          )}
          {statsStatus === "ready" && languageStats && isApiInstalled && (
            <ul className="programming-levels-language-list">
              {(() => {
                const topLanguages = languageStats.languages.slice(0, 6);
                const maxBytes = topLanguages[0]?.bytes || 1;
                const totalBytes = languageStats.totalBytes || 1;

                return topLanguages.map((lang) => {
                  const ratio = lang.bytes / maxBytes;
                  const fillPercent = Math.min(100, Math.ceil(ratio * 100));
                  const sharePercent = Math.min(
                    100,
                    Math.ceil((lang.bytes / totalBytes) * 100)
                  );
                  const displayPercent = animateBars
                    ? displayPercents[lang.name] ?? 0
                    : sharePercent;

                  return (
                    <li
                      key={lang.name}
                      className="programming-levels-language-item"
                      style={{ "--lang-percent": animateBars ? fillPercent : 0 }}
                    >
                      <span className="programming-levels-language-name">
                        {lang.name}
                        <span className="programming-levels-language-bytes">
                          ({lang.bytes.toLocaleString()} bytes)
                        </span>
                      </span>
                      <span className="programming-levels-language-percent">
                        {displayPercent}%
                      </span>
                    </li>
                  );
                });
              })()}
            </ul>
          )}
        </div>
      </article>
    </div>
  );
}

export default ProgrammingLevels;