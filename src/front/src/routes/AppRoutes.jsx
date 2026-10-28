import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Progress from "../pages/Progress";
import ClassificacaoCompatibilidade from "../pages/ClassificacaoCompatibilidade";
import Profile from "../pages/Profile";
import Historico from "../pages/Historico";
import CriadorCurriculo from "../pages/CriadorCurriculo"; // Import novo

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/classificacao-compatibilidade" element={<ClassificacaoCompatibilidade />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/criador-cv" element={<CriadorCurriculo />} /> {/* Rota nova */}
      </Routes>
    </Router>
  );
}

export default AppRoutes;