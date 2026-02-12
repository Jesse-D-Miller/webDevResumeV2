import { useNavigate } from "react-router-dom";

function Resume() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>My Resume</h1>
      <button onClick={() => navigate("/explorer")}>Go to Explore</button>
    </div>
  );
}

export default Resume;