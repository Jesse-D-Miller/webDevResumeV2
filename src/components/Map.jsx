import { useEffect, useMemo, useRef, useState } from "react";
import "./Map.css";
import resumeData from "../data/resume.json";
import { useXP } from "../hooks/useXP";

const MAP_WIDTH = 677;
const MAP_HEIGHT = 500;

function Map() {
  const scrollRef = useRef(null);
  const mapCanvasRef = useRef(null);
  const nodeRefs = useRef(new window.Map());
  const [scrollState, setScrollState] = useState({ atStart: true, atEnd: false });
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [tooltipAbove, setTooltipAbove] = useState(false);
  const [litNodeIds, setLitNodeIds] = useState(() => new Set());
  const { grantXp, hasClicked } = useXP();

  const mapNodes = useMemo(
    () => [
      ...resumeData.mapNodes.education.filter(
        (node) => node.showInExplorer !== false
      ),
      ...resumeData.mapNodes.career,
      ...resumeData.mapNodes.skills,
    ],
    []
  );

  useEffect(() => {
    // Seed lit nodes from persisted XP history.
    setLitNodeIds(
      new Set(
        mapNodes.filter((node) => hasClicked(`map-node-${node.id}`)).map((node) => node.id)
      )
    );
  }, [hasClicked, mapNodes]);

  const handleScrollBy = (amount) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const activateNode = (node) => {
    // Tooltip flips above/below cursor area to avoid clipping near map edges.
    const nodeElement = nodeRefs.current.get(node.id);
    const canvasElement = mapCanvasRef.current;
    if (nodeElement && canvasElement) {
      const nodeRect = nodeElement.getBoundingClientRect();
      const canvasRect = canvasElement.getBoundingClientRect();
      const nodeCenterY = nodeRect.top + nodeRect.height / 2;
      const canvasMidY = canvasRect.top + canvasRect.height / 2;
      setTooltipAbove(nodeCenterY >= canvasMidY);
    }

    setActiveNodeId(node.id);
    const xpId = `map-node-${node.id}`;
    if (!hasClicked(xpId)) {
      grantXp(xpId, 27);
    }
    setLitNodeIds((prev) => {
      if (prev.has(node.id)) return prev;
      const next = new Set(prev);
      next.add(node.id);
      return next;
    });
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
        <div className="map-canvas" ref={mapCanvasRef}>
          <img
            className="map-image"
            src={new URL("../assets/resumeMap.png", import.meta.url).href}
            alt="Resume map"
            onLoad={handleImageLoad}
          />
          {mapNodes.map((node) => {
            const label = node.institution || node.vocation || node.achievement;
            const isActive = activeNodeId === node.id;
            const isLit = litNodeIds.has(node.id) || hasClicked(`map-node-${node.id}`);

            return (
              <button
                key={node.id}
                className={`map-node map-node--${node.color} node-${node.id} ${
                  isLit ? "map-node--lit" : "map-node--dim"
                }`}
                ref={(element) => {
                  if (element) {
                    nodeRefs.current.set(node.id, element);
                  } else {
                    nodeRefs.current.delete(node.id);
                  }
                }}
                type="button"
                aria-label={label}
                onPointerDown={(event) => {
                  if (event.pointerType === "touch") {
                    event.preventDefault();
                    activateNode(node);
                  }
                }}
                onMouseEnter={() => activateNode(node)}
                onMouseLeave={() => setActiveNodeId(null)}
                onFocus={() => activateNode(node)}
                onBlur={() => setActiveNodeId(null)}
              >
                {isActive && (
                  <span
                    className={`node-tooltip ${
                      tooltipAbove ? "node-tooltip--above" : "node-tooltip--below"
                    }`}
                  >
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