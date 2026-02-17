import "./Map.css";

function Map() {
  return (
    <div className="map">
      <img
        className="map-image"
        src={new URL("../assets/resumeMap.png", import.meta.url).href}
        alt="Resume map"
      />
    </div>
  );
}

export default Map;