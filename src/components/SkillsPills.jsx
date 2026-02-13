import "./SkillsPills.css";
import data from "../data/resume.json";

function SkillsPills({ activeSkills = new Set() }) {
  const skillsByName = new Map(
    data.skills.map((skill) => [skill.name, skill])
  );

  data.projects.forEach((project) => {
    (project.skillsDetailed || []).forEach((skill) => {
      if (!skillsByName.has(skill.name)) {
        skillsByName.set(skill.name, skill);
      }
    });
  });

  const skills = Array.from(skillsByName.values()).sort((a, b) => {
    const aSoft = a.category === "Soft Skills";
    const bSoft = b.category === "Soft Skills";
    if (aSoft === bSoft) {
      return a.name.localeCompare(b.name);
    }
    return aSoft ? 1 : -1;
  });

  return (
    <div className="skills-pills">
      <h1 className="skills-pills-title">SKILLS</h1>
      <div className="skills-pills-list">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className={`skills-pills-pill ${
              activeSkills.has(skill.name)
                ? `skills-pills-pill--active ${
                    skill.category === "Soft Skills"
                      ? "skills-pills-pill--soft"
                      : "skills-pills-pill--tech"
                  }`
                : ""
            }`}
          >
            {skill.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillsPills;