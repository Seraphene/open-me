import { Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import StoryPage from "./pages/StoryPage";

function RouterApp() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/open" element={<App />} />
      <Route path="/story" element={<StoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RouterApp;
