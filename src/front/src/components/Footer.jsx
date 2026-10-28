import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-big" aria-hidden="true">TalentScan</div>
      <div className="footer-row mono">
        <span>Análise de currículo com IA</span>
        <nav aria-label="Rodapé">
          <Link to="/">Início</Link>
          <Link to="/dashboard">Analisar</Link>
          <Link to="/criador-cv">Criar currículo</Link>
        </nav>
        <span>PUC Minas · ODS 8 · 2026</span>
      </div>
    </footer>
  );
}

export default Footer;
