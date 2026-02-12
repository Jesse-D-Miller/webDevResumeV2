import data from "../data/resume.json";
import "./Projects.css";

function Projects() {
  return (
    <div className="projects">
      {data.projects.map((project) => (
        <div key={project.id} className="project">
          <h2 className="project-title">{project.title}</h2>
          <h3 className="project-subtitle">{project.subtitle}</h3>
          <div className="project-stack">
            {project.stack.map((item) => (
              <span key={item} className="project-stack-pill">
                {item}
              </span>
            ))}
          </div>
          <ul className="project-highlights">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="project-highlight">
                {highlight}
              </li>
            ))}
          </ul>
          <div className="project-links">
            {[
              { key: "live", label: "Live" },
              { key: "code", label: "Code" },
              { key: "video", label: "Video" },
            ].map(({ key, label }) => {
              const href = project.links?.[key] || "";
              if (!href) {
                return (
                  <span key={key} className="project-link project-link--disabled">
                    {label}
                  </span>
                );
              }

              return (
                <a
                  key={key}
                  href={href}
                  className="project-link project-link--active"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Projects;