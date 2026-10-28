import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion as Motion, useScroll, useSpring } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import Swal from "sweetalert2";
import { getUser, alertTheme, getTheme, setTheme } from "../lib";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const [theme, setThemeState] = useState(getTheme);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  };

  const handleLogout = async () => {
    const result = await Swal.fire(alertTheme({
      title: "Sair da conta?",
      text: "Você será desconectado desta sessão.",
      showCancelButton: true,
      confirmButtonText: "Sair",
      cancelButtonText: "Cancelar"
    }));

    if (!result.isConfirmed) return;

    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="navbar-wrap no-print">
      <nav className="navbar" aria-label="Principal">
        <Link to="/" className="logo" aria-label="TalentScan, início">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <rect x="1" y="1" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M9 9h14v3.5h-5.2V24h-3.6V12.5H9z" fill="var(--accent-text)" />
          </svg>
          <span>TalentScan</span>
          <small className="mono">Currículo · IA</small>
        </Link>

        <div className="nav-links">
          {!user ? (
            <>
              <NavLink to="/" end>Início</NavLink>
              <NavLink to="/login">Entrar</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/historico">Histórico</NavLink>
              <NavLink to="/progress">Progresso</NavLink>
              <NavLink to="/classificacao-compatibilidade">Vagas</NavLink>
              <NavLink to="/criador-cv">Criar currículo</NavLink>
              <NavLink to="/profile">Perfil</NavLink>
            </>
          )}

          <button type="button" className="theme-btn" onClick={toggleTheme}
            aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!user ? (
            <Link to="/register" className="nav-cta">Criar conta</Link>
          ) : (
            <>
              <Link to="/dashboard" className="nav-cta">Analisar currículo</Link>
              <button type="button" onClick={handleLogout}>Sair</button>
            </>
          )}
        </div>
      </nav>
      <Motion.div className="scroll-bar" style={{ scaleX: progress }} />
    </header>
  );
}

export default Navbar;
