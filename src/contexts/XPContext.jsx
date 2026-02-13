import { createContext, useCallback, useMemo, useState } from "react";
import resumeData from "../data/resume.json";

export const XPContext = createContext();

const getProjectNumber = (id) => {
  const match = String(id ?? "").match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
};

export function XPProvider({ children }) {
  const [xp, setXp] = useState(0);
  const [clickedIds, setClickedIds] = useState(new Set());
  const [heroMessage, setHeroMessage] = useState("");
  const maxXp = 12;
  const topProjects = useMemo(() => {
    return [...resumeData.projects]
      .sort((a, b) => getProjectNumber(b.id) - getProjectNumber(a.id))
      .slice(0, 3);
  }, []);

  const projectLinkEntries = useMemo(() => {
    return topProjects.flatMap((project) => {
      const links = project?.links ?? {};
      const entries = [];
      if (links.live) entries.push([`project-link-${project.id}-live`, 1]);
      if (links.code) entries.push([`project-link-${project.id}-code`, 1]);
      if (links.video) entries.push([`project-link-${project.id}-video`, 1]);
      return entries;
    });
  }, [topProjects]);

  const xpClickValues = useMemo(() => {
    return new Map([
      ["experience-tabs", 1],
      ...topProjects
        .slice(1)
        .map((project) => [`project-tab-${project.id}`, 1]),
      ["soft-skill-click", 1],
      ["soft-skill-final-click", 1],
      ["github-stats-link", 1],
      ["hobby-click", 1],
      ["hobby-final-click", 1],
      ["linkedin-link", 1],
      ["github-link", 1],
      ["holo-map-green-complete", 1],
      ["holo-map-red-complete", 1],
      ["holo-map-yellow-complete", 1],
      ["technical-skills-section", 1],
      ["battery-click", 1],
      ["power-click", 1],
      ...projectLinkEntries,
    ]);
  }, [projectLinkEntries, topProjects]);

  const maxXpPoints = useMemo(() => {
    return Array.from(xpClickValues.values()).reduce(
      (total, value) => total + value,
      0
    );
  }, [xpClickValues]);

  const completedXpPoints = useMemo(() => {
    return Array.from(clickedIds).reduce(
      (total, id) => total + (xpClickValues.get(id) || 0),
      0
    );
  }, [clickedIds, xpClickValues]);

  const grantXp = useCallback((id, amount = 1, message = "") => {
    setClickedIds((prev) => {
      if (prev.has(id)) {
        return prev;
      }

      setXp((xpPrev) => xpPrev + amount);
      if (message) {
        setHeroMessage(message);
      }

      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const hasClicked = useCallback((id) => clickedIds.has(id), [clickedIds]);

  const value = useMemo(
    () => ({
      xp,
      maxXp,
      maxXpPoints,
      completedXpPoints,
      clickedIds,
      heroMessage,
      grantXp,
      hasClicked,
      setHeroMessage,
    }),
    [
      xp,
      maxXp,
      maxXpPoints,
      completedXpPoints,
      clickedIds,
      heroMessage,
      grantXp,
      hasClicked,
    ]
  );

  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
}
