import { useEffect, useRef, useState } from "react";
import "./Map.css";

function Map() {
  const scrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ atStart: true, atEnd: false });

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
        <img
          className="map-image"
          src={new URL("../assets/resumeMap.png", import.meta.url).href}
          alt="Resume map"
          onLoad={handleImageLoad}
        />
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