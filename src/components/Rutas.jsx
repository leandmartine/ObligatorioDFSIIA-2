import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "../App.jsx";

const Rutas = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="dashboard" element={<App />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Rutas;
