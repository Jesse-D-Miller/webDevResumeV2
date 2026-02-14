import "./About.css";
import data from "../data/resume.json";

function About() {
  return (
    <div className="about">
      <div className="about-card">
        <h1 className="about-title">Hobbies</h1>
        <div className="about-hobbies">
          {data.hobbies.map((hobby) => (
            <button key={hobby} type="button" className="about-hobby">
              {hobby}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;