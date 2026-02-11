import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome to my React App!</h1>
      <p>This is the welcome page.</p>
      <button onClick={() => navigate("/resume")}>Go to Resume</button>
      <button onClick={() => navigate("/explorer")}>Go to Explorer</button>
    </div>
  );
}

export default Welcome;
