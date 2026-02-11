import { useNavigate } from "react-router-dom";
import "./Welcome.css";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome">
      <h1 className="welcome__title">Welcome to my React App!</h1>
      <p className="welcome__text">This is the welcome page.</p>
      <div className="welcome__actions">
        <button
          className="welcome__button"
          onClick={() => navigate("/resume")}
        >
          Go to Resume
        </button>
        <button
          className="welcome__button"
          onClick={() => navigate("/explorer")}
        >
          Go to Explorer
        </button>
      </div>
    </div>
  );
}

export default Welcome;
