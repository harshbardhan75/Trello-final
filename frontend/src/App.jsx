import { Routes, Route, Navigate } from "react-router-dom";
import BoardsHome from "./pages/BoardsHome.jsx";
import BoardPage from "./pages/BoardPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BoardsHome />} />
      <Route path="/board/:boardId" element={<BoardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
