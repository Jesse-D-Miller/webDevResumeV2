import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Resume.css";
import resumeData from "../data/resume.json";

function Resume() {
  const navigate = useNavigate();
  useEffect(() => {
    document.documentElement.dataset.theme = "";
  }, []);
  const getProjectNumber = (id) => {
    const match = String(id ?? "").match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : 0;
  };

  const topProjects = [...resumeData.projects]
    .sort((a, b) => getProjectNumber(b.id) - getProjectNumber(a.id))
    .slice(0, 3);

  const technicalSkills = resumeData.skills.filter(
    (skill) => skill.category !== "Soft Skills"
  );
  const softSkills = resumeData.skills.filter(
    (skill) => skill.category === "Soft Skills"
  );

  const groupedTechnical = technicalSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill.name);
    return acc;
  }, {});


  return (
    <div className="resume-page">
      <button
        className="resume-pdf"
        type="button"
        onClick={() =>
          window.open(
            resumeData.meta.links.resumePdf,
            "_blank",
            "noopener,noreferrer"
          )
        }
      >
        Resume PDF
      </button>
      <button
        className="resume-exit"
        type="button"
        onClick={() => navigate("/explorer")}
      >
        Return to Explorer
      </button>
      <div className="resume-front">
        <header className="resume-header">
          <h1>{resumeData.meta.name}</h1>
          <p className="contact-info">
            {resumeData.meta.location} | {resumeData.meta.title} |{" "}
            <a href={`mailto:${resumeData.meta.links.email}`}>
              Email
            </a>
            {" | "}
            <a href={resumeData.meta.links.github}>
              GitHub
            </a>
            {" | "}
            <a href={resumeData.meta.links.linkedin}>
              LinkedIn
            </a>
          </p>
        </header>

        <div className="resume-columns">
          <section className="resume-left">
            <div className="box-2">
              <h3>Summary</h3>
              <p>{resumeData.summary}</p>
            </div>

            {topProjects.map((project, index) => {
              const liveUrl = project.links?.live;
              const codeUrl = project.links?.code;
              const projectUrl = liveUrl || codeUrl;
              const projectLabel = liveUrl ? "LIVE" : "CODE";

              return (
                <div key={project.id} className={`box-${index + 3}`}>
                  {index === 0 && <h3>Projects</h3>}
                  <div className="project-item">
                    <h4>
                      {project.title} - {project.subtitle}
                      {projectUrl && (
                        <>
                          {" ("}
                          <a
                            className="project-link"
                            href={projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {projectLabel}
                          </a>
                          {")"}
                        </>
                      )}
                    </h4>
                    <p className="tech-stack">{project.stack.join(", ")}</p>
                    <ul>
                      {project.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}

            {resumeData.experience.map((job, index) => (
              <div key={job.id} className={`box-${index + 6}`}>
                {index === 0 && <h3>Experience</h3>}
                <div className="experience-item">
                  <h4>{job.company} | {job.role}</h4>
                  <p className="company-period">
                    {job.period}
                  </p>
                  <ul>
                    {job.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div className="box-8">
              <h3>Education</h3>
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="education-item">
                  <h4>{edu.school}</h4>
                  <p className="program-period">
                    {edu.program} | {edu.period}
                  </p>
                  <ul>
                    {edu.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <aside className="resume-right">
            <div className="box-9 technical-skills-section">
              <h3>Technical Skills</h3>
              {Object.entries(groupedTechnical).map(([category, skills]) => (
                <div key={category}>
                  <h4>{category}</h4>
                  <p>{skills.join(", ")}</p>
                </div>
              ))}
            </div>

            <div className="mobile-sub-grid-inner">
              <div className="box-10 soft-skills-section">
                <h3>Soft Skills</h3>
                <p>{softSkills.map((skill) => skill.name).join(", ")}</p>
              </div>

              <div className="box-11 hobbies-section">
                <h3>Hobbies</h3>
                <p>{resumeData.hobbies.map((hobby) => hobby.name).join(", ")}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Resume;