import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import "./Resume.css";
import resumeData from "../data/resume.json";
import expandedExperience from "../data/expandedExperience.json";

function Resume() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    // Resume route always uses base theme for print/readability consistency.
    document.documentElement.dataset.theme = "";
  }, []);
  const getProjectNumber = (id) => {
    const match = String(id ?? "").match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : 0;
  };

  // Resume view is intentionally concise, so only the top 3 projects are shown.
  const topProjects = [...resumeData.projects]
    .sort((a, b) => getProjectNumber(b.id) - getProjectNumber(a.id))
    .slice(0, 3);

  const technicalSkills = resumeData.skills.filter(
    (skill) => skill.category !== "Soft Skills"
  );
  const softSkills = resumeData.skills.filter(
    (skill) => skill.category === "Soft Skills"
  );

  // Group by category once so render stays simple and semantic.
  const groupedTechnical = technicalSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill.name);
    return acc;
  }, {});

  const handleOpenPdf = () => {
    window.open(
      resumeData.meta.links.resumePdf,
      "_blank",
      "noopener,noreferrer"
    );
    setIsMenuOpen(false);
  };

  const handleExit = () => {
    setIsMenuOpen(false);
    navigate("/explorer");
  };


  return (
    <div className="resume-page">
      <div className={`resume-actions ${isMenuOpen ? "is-open" : ""}`}>
        <button
          className="resume-actions-toggle"
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-controls="resume-actions-drawer"
        >
          <span className="resume-actions-icon" aria-hidden="true" />
          <span className="resume-actions-label">Menu</span>
        </button>
        <div
          id="resume-actions-drawer"
          className="resume-actions-drawer"
          role="menu"
        >
          <button className="resume-pdf" type="button" onClick={handleOpenPdf} role="menuitem">
            Resume PDF
          </button>
          <button className="resume-exit" type="button" onClick={handleExit} role="menuitem">
            Return to Explorer
          </button>
        </div>
      </div>

      <div className="resume-front">
        <div className="resume-layout">

          {/* LEFT COLUMN */}
          <aside className="resume-left-col">
            <div className="resume-photo-wrapper">
              <div className="resume-photo">
                <img src="/resumeHeadshot.png" alt="Jesse Miller" className="resume-photo-img" />
              </div>
            </div>

            <div className="resume-left-section">
              <h3>Contact</h3>
              <ul className="resume-left-links">
                <li>
                  <MdLocationOn className="contact-icon" aria-hidden="true" />
                  <span>{resumeData.meta.location}</span>
                </li>
                <li>
                  <MdEmail className="contact-icon" aria-hidden="true" />
                  <a href={`mailto:${resumeData.meta.links.email}`}>
                    {resumeData.meta.links.email}
                  </a>
                </li>
                <li>
                  <FaGithub className="contact-icon" aria-hidden="true" />
                  <a href={resumeData.meta.links.github} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </li>
                <li>
                  <FaLinkedin className="contact-icon" aria-hidden="true" />
                  <a href={resumeData.meta.links.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            <div className="resume-left-section">
              <h3>Tech Skills</h3>
              {Object.entries(groupedTechnical).map(([category, skills]) => (
                <div key={category} className="resume-left-skill-group">
                  <span className="resume-left-skill-category">{category}</span>
                  <p>{skills.join(", ")}</p>
                </div>
              ))}
            </div>

            <div className="resume-left-section">
              <h3>Soft Skills</h3>
              <p>{softSkills.map((s) => s.name).join(", ")}</p>
            </div>

            <div className="resume-left-section">
              <h3>Hobbies</h3>
              <p>{resumeData.hobbies.map((h) => h.name).join(", ")}</p>
            </div>
          </aside>

          {/* RIGHT COLUMN */}
          <main className="resume-right-col">
            <header className="resume-right-header">
              <h1>{resumeData.meta.name}</h1>
              <p className="resume-right-title">{resumeData.meta.title}</p>
            </header>

            <section className="resume-right-section">
              <h3>Summary</h3>
              <p>{resumeData.summary}</p>
            </section>

            <section className="resume-right-section">
              <h3>Projects</h3>
              {topProjects.map((project) => {
                const liveUrl = project.links?.live;
                const codeUrl = project.links?.code;
                const projectUrl = liveUrl || codeUrl;
                const projectLabel = liveUrl ? "LIVE" : "CODE";
                return (
                  <div key={project.id} className="project-item">
                    <h4>
                      {project.title} — {project.subtitle}
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
                );
              })}
            </section>

            <section className="resume-right-section">
              <h3>Experience</h3>
              {expandedExperience.experience.map((job) => (
                <div key={job.id} className="experience-item">
                  <h4>{job.company} — {job.role}</h4>
                  <p className="company-period">{job.period}</p>
                  <ul>
                    {job.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <section className="resume-right-section">
              <h3>Education</h3>
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="education-item">
                  <h4>{edu.school}</h4>
                  <p className="program-period">{edu.program} | {edu.period}</p>
                  <ul>
                    {edu.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          </main>

        </div>
      </div>
    </div>
  );
}

export default Resume;