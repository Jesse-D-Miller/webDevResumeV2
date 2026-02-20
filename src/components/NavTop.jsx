import "./NavTop.css";
import data from "../data/resume.json";

function NavTop() {
  const { meta } = data;
  const { links } = meta;

  return (
    <header className="nav-top">
      <div className="nav-top-name">
        <h1 className="nav-top-title">{meta.name}</h1>
        <p className="nav-top-location">{meta.location}</p>
      </div>
      <div className="nav-top-availability">
        <span className="nav-top-job-title">{meta.title}</span>
        <span className="nav-top-availability-status">{meta.availability}</span>
      </div>
      <address className="nav-top-contact">
        <ul className="nav-top-contact-list">
          <li>
            <a
              href={`mailto:${links.email}`}
              className="nav-top-contact-link"
            >
              Email
            </a>
          </li>
          <li>
            <a
              href={links.github}
              className="nav-top-contact-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href={links.linkedin}
              className="nav-top-contact-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href={links.resumePdf}
              className="nav-top-contact-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Resume PDF
            </a>
          </li>
        </ul>
      </address>
    </header>
  );
}

export default NavTop;
