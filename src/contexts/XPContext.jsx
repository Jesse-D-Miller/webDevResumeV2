import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import resumeData from "../data/resume.json";
import experienceData from "../data/expandedExperience.json";

export const XPContext = createContext();

const BASE_INTERACTION_XP = 27;
const STATS_INTERACTION_XP = 28;
const STORAGE_KEY = "xp-state";

const getInitialXpState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        xp: 0,
        clickedIds: new Set(),
        heroMessage: "",
      };
    }

    const parsed = JSON.parse(stored);
    return {
      xp: typeof parsed?.xp === "number" ? parsed.xp : 0,
      clickedIds: new Set(
        Array.isArray(parsed?.clickedIds) ? parsed.clickedIds : []
      ),
      heroMessage: typeof parsed?.heroMessage === "string" ? parsed.heroMessage : "",
    };
  } catch {
    return {
      xp: 0,
      clickedIds: new Set(),
      heroMessage: "",
    };
  }
};

export function XPProvider({ children }) {
  const initialXpState = useMemo(() => getInitialXpState(), []);
  const [xp, setXp] = useState(initialXpState.xp);
  const [clickedIds, setClickedIds] = useState(initialXpState.clickedIds);
  const clickedIdsRef = useRef(new Set());
  const [heroMessage, setHeroMessage] = useState(initialXpState.heroMessage);
  const maxXp = 1000;
  const explorerEducation = useMemo(() => {
    return (resumeData.education || []).filter(
      (edu) => edu.showInExplorer !== false
    );
  }, []);
  const mapNodes = useMemo(() => {
    return [
      ...(resumeData.mapNodes?.education || []).filter(
        (node) => node.showInExplorer !== false
      ),
      ...(resumeData.mapNodes?.career || []),
      ...(resumeData.mapNodes?.skills || []),
    ];
  }, []);

  const projectBuildEntries = useMemo(() => {
    return resumeData.projects.map((project) => [
      `project-build-${project.id}`,
      BASE_INTERACTION_XP,
    ]);
  }, []);

  const experienceBuildEntries = useMemo(() => {
    return experienceData.experience.map((experience) => [
      `experience-build-${experience.id}`,
      BASE_INTERACTION_XP,
    ]);
  }, []);

  const educationBuildEntries = useMemo(() => {
    return explorerEducation.map((edu) => [
      `education-build-${edu.id}`,
      BASE_INTERACTION_XP,
    ]);
  }, [explorerEducation]);

  const mapNodeEntries = useMemo(() => {
    return mapNodes.map((node) => [
      `map-node-${node.id}`,
      BASE_INTERACTION_XP,
    ]);
  }, [mapNodes]);

  const hobbyEntries = useMemo(() => {
    return (resumeData.hobbies || []).map((hobby) => [
      `hobby-open-${hobby.name}`,
      BASE_INTERACTION_XP,
    ]);
  }, []);

  const xpClickValues = useMemo(() => {
    return new Map([
      ["github-api-install", BASE_INTERACTION_XP],
      ["stats-enhance-api", STATS_INTERACTION_XP],
      ...projectBuildEntries,
      ...experienceBuildEntries,
      ...educationBuildEntries,
      ...mapNodeEntries,
      ...hobbyEntries,
    ]);
  }, [
    educationBuildEntries,
    experienceBuildEntries,
    hobbyEntries,
    mapNodeEntries,
    projectBuildEntries,
  ]);

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

  useEffect(() => {
    clickedIdsRef.current = clickedIds;
  }, [clickedIds]);

  useEffect(() => {
    const payload = {
      xp,
      clickedIds: Array.from(clickedIds),
      heroMessage,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [xp, clickedIds, heroMessage]);

  const grantXp = useCallback((id, amount = 1, message = "") => {
    setClickedIds((prev) => {
      if (prev.has(id) || clickedIdsRef.current.has(id)) {
        return prev;
      }

      setXp((xpPrev) => xpPrev + amount);
      if (message) {
        setHeroMessage(message);
      }

      const next = new Set(prev);
      next.add(id);
      clickedIdsRef.current = next;
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
