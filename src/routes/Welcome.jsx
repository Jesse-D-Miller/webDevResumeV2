import { useNavigate } from "react-router-dom";
import "./Welcome.css";
import resumeData from "../data/resume.json";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome">
      <div className="welcome-top">
        <h1 className="welcome-title">{resumeData.meta.name}</h1>
        <div className="welcome-meta">
          <span className="welcome-role">{resumeData.meta.title}</span>
          <span className="welcome-dot">•</span>
          <span className="welcome-location">{resumeData.meta.location}</span>
          <span className="welcome-dot">•</span>
          <span className="welcome-availability">
            {resumeData.meta.availability}
          </span>
        </div>
      </div>
      <div className="welcome-body">
        <p className="welcome-text">
          Start here. If you want the facts fast, open the Resume for a clean,
          one-page snapshot. If you want the full story, enter the Explorer to
          browse interactive projects, XP progress, and stats at your own pace.
        </p>
        <div className="welcome-links">
          <a href={`mailto:${resumeData.meta.links.email}`}>Email</a>
          <a href={resumeData.meta.links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={resumeData.meta.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={resumeData.meta.links.resumePdf} target="_blank" rel="noreferrer">
            Resume PDF
          </a>
        </div>
        <div className="welcome-actions">
        <button
          className="welcome-card welcome-card--resume"
          onClick={() => navigate("/resume")}
          type="button"
        >
          <span className="welcome-card-title">Resume</span>
          <span className="welcome-card-text">
            The fast read: one-page layout, polished and print-ready.
          </span>
          <span className="welcome-card-cta">Open Resume</span>
        </button>
        <button
          className="welcome-card welcome-card--explorer"
          onClick={() => navigate("/explorer")}
          type="button"
        >
          <span className="welcome-card-title">Explorer</span>
          <span className="welcome-card-text">
            The full experience: interactive projects, XP, map, and stats.
          </span>
          <span className="welcome-card-cta">Enter Explorer</span>
        </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
