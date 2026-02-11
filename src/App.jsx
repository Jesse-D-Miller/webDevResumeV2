import "./App.css";
import Welcome from "./routes/Welcome";
import Resume from "./routes/Resume";
import Explorer from "./routes/Explorer";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/explorer" element={<Explorer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
