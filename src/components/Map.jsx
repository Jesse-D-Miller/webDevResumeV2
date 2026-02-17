import { useEffect, useMemo, useRef, useState } from "react";
import "./Map.css";
import resumeData from "../data/resume.json";

const MAP_WIDTH = 677;
const MAP_HEIGHT = 500;

function Map() {
  const scrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ atStart: true, atEnd: false });
  const [activeNodeId, setActiveNodeId] = useState(null);

  const mapNodes = useMemo(
    () => [
      ...resumeData.mapNodes.education,
      ...resumeData.mapNodes.career,
      ...resumeData.mapNodes.skills,
    ],
    []
  );

  const handleScrollBy = (amount) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };



  const updateScrollState = () => {
    const node = scrollRef.current;
    if (!node) return;
    const maxScroll = node.scrollWidth - node.clientWidth;
    setScrollState({
      atStart: node.scrollLeft <= 0,
      atEnd: node.scrollLeft >= maxScroll - 1,
    });
  };

  const handleImageLoad = () => {
    requestAnimationFrame(updateScrollState);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, []);

  return (
    <div className="map-wrap">
      <button
        className={
          scrollState.atStart
            ? "scroll-control scroll-control--left scroll-control--disabled"
            : "scroll-control scroll-control--left"
        }
        type="button"
        onClick={() => handleScrollBy(-360)}
        aria-label="Scroll map left"
      >
        ◀
      </button>
      <div
        className="map"
        ref={scrollRef}
        onScroll={updateScrollState}
        role="region"
        aria-label="Resume map"
        tabIndex={0}
      >
        <div className="map-canvas">
          <img
            className="map-image"
            src={new URL("../assets/resumeMap.png", import.meta.url).href}
            alt="Resume map"
            onLoad={handleImageLoad}
          />
          {mapNodes.map((node) => {
            const label = node.institution || node.vocation || node.achievement;
            const isActive = activeNodeId === node.id;

            return (
              <button
                key={node.id}
                className={`map-node map-node--${node.color} node-${node.id}`}
                type="button"
                aria-label={label}
                onPointerDown={(event) => {
                  if (event.pointerType === "touch") {
                    event.preventDefault();
                    setActiveNodeId(isActive ? null : node.id);
                  }
                }}
                onMouseEnter={() => setActiveNodeId(node.id)}
                onMouseLeave={() => setActiveNodeId(null)}
                onFocus={() => setActiveNodeId(node.id)}
                onBlur={() => setActiveNodeId(null)}
              >
                {isActive && (
                  <span className="node-tooltip">
                    <strong>{label}</strong>
                    <span>{node.intel}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <button
        className={
          scrollState.atEnd
            ? "scroll-control scroll-control--right scroll-control--disabled"
            : "scroll-control scroll-control--right"
        }
        type="button"
        onClick={() => handleScrollBy(360)}
        aria-label="Scroll map right"
      >
        ▶
      </button>
    </div>
  );
}

export default Map;