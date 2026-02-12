import "./SkillsPills.css";

function SkillsPills() {
  return (
    <div className="skillspills">
      <h1 className="skillspills__title">SKILLS</h1>
      <div className="skillspills__pills">
        <span className="skillspills__pill">JavaScript</span>
        <span className="skillspills__pill">React</span>
        <span className="skillspills__pill">CSS</span>
        <span className="skillspills__pill">HTML</span>
        <span className="skillspills__pill">Node.js</span>
        <span className="skillspills__pill">Express</span>
        <span className="skillspills__pill">MongoDB</span>
      </div>
    </div>
  );
}

export default SkillsPills;