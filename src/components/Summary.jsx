import "./Summary.css";
import data from "../data/resume.json";

function Summary() {
  // Summary stays intentionally presentational; all content comes from data source.
  return (
    <div className="summary">
      <h1 className="summary-title">Character Summary</h1>
      <p className="summary-text">{data.summary}</p>
    </div>
  );
}

export default Summary;