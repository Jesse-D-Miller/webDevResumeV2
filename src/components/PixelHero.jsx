import "./PixelHero.css";

function PixelHero() {
  return (
    <div className="pixel-hero-card">
      <div className="pixel-hero-header">
        <span className="xp-bar">XP Bar</span>
        <span className="hero-level">lvl 1</span>
      </div>
      <div className="pixel-hero-body">
        Hero
      </div>
    </div>
  );
}

export default PixelHero;