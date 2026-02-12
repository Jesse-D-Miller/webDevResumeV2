import "./NavTop.css";
import data from "../data/resume.json";

function NavTop() {
  const { meta } = data;
  const { links } = meta;

  return (
    <header className="navtop">
      <div className="navtop__name">
        <h1 className="navtop__title">{meta.name}</h1>
        <p className="navtop__location">{meta.location}</p>
      </div>
      <div className="navtop__availability">
        <span className="navtop__job-title">{meta.title}</span>
        <span className="navtop__availability-status">{meta.availability}</span>
      </div>
      <address className="navtop__contact">
        <ul className="navtop__contact-list">
          <li>
            <a
              href={`mailto:${links.email}`}
              className="navtop__contact-link"
            >
              Email
            </a>
          </li>
          <li>
            <a
              href={links.github}
              className="navtop__contact-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href={links.linkedin}
              className="navtop__contact-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </li>
        </ul>
      </address>
    </header>
  );
}

export default NavTop;
