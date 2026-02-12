import "./Explorer.css";
import NavSide from "../components/NavSide";
import RenderWindow from "../components/RenderWindow";
import SkillsPills from "../components/SkillsPills";
import Gear from "../components/Gear";
import NavTop from "../components/NavTop";
import PixelHero from "../components/PixelHero";

function Explorer() {
  return (
    <div className="explorer">
      <div className="explorer-navside">
        <NavSide />
      </div>
      <div className="explorer-main">
        <NavTop />
        <div className="explorer-character">
          <PixelHero />
          <Gear />
          <SkillsPills />
        </div>
        <RenderWindow />
      </div>
    </div>
  );
}

export default Explorer;
