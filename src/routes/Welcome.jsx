import { useNavigate } from "react-router-dom";
import "./Welcome.css";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome">
      <h1 className="welcome-title">Welcome to my React App!</h1>
      <p className="welcome-text">This is the welcome page.</p>
      <div className="welcome-actions">
        <button
          className="welcome-button"
          onClick={() => navigate("/resume")}
        >
          Go to Resume
        </button>
        <button
          className="welcome-button"
          onClick={() => navigate("/explorer")}
        >
          Go to Explorer
        </button>
      </div>
    </div>
  );
}

export default Welcome;
