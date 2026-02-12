import "./Explorer.css";
import NavSide from "../components/NavSide";
import RenderWindow from "../components/RenderWindow";
import SkillsPills from "../components/SkillsPills";
import Gear from "../components/Gear";
import NavTop from "../components/NavTop";
import PixelHero from "../components/PixelHero";

import { useState } from "react";

function Explorer() {
  const [activePage, setActivePage] = useState("Summary");

  return (
    <div className="explorer">
      <div className="explorer-navside">
        <NavSide activePage={activePage} setActivePage={setActivePage} />
      </div>
      <div className="explorer-main">
        <NavTop />
        <div className="explorer-character">
          <PixelHero />
          <Gear />
          <SkillsPills />
        </div>
        <RenderWindow activePage={activePage} />
      </div>
    </div>
  );
}

export default Explorer;
