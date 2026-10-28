import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Report from "../components/Report";
import { Reveal } from "../components/ui";
import { buscarCurriculos } from "../services/compatibilidadeService";
import { getUser } from "../lib";
import { Words } from "../components/ui";
import "./Historico.css";

const FAIXAS = {
  todas: () => true,
  alta: (n) => n >= 75,
  media: (n) => n >= 50 && n < 75,
  baixa: (n) => n < 50
};

const formatarData = (iso) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "";

function Historico() {
  const user = getUser();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(Boolean(user?._id));
  const [error, setError] = useState("");
  const [busca, setBusca] = useState("");
  const [faixa, setFaixa] = useState("todas");
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    buscarCurriculos(user._id)
      .then((lista) => setItens(Array.isArray(lista) ? lista : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user?._id]);

  const filtrados = useMemo(
    () =>
      itens.filter(
        (i) =>
          i.nomeArquivo?.toLowerCase().includes(busca.trim().toLowerCase()) &&
          FAIXAS[faixa](i.analise?.nota ?? 0)
      ),
    [itens, busca, faixa]
  );

  return (
    <>
      <Navbar />

      <main>
        <header className="page-title">
          <Words text="Histórico" />
          <p>Todos os currículos que você já analisou.</p>
        </header>

        <div className="page-body">
          {!user && <p>Entre na sua conta para ver o histórico. <Link to="/login">Entrar</Link></p>}
          {user && loading && <p>Carregando...</p>}
          {error && <p role="alert" style={{ color: "var(--bad)" }}>{error}</p>}

          {user && !loading && !error && itens.length === 0 && (
            <div className="panel hist-empty">
              <h2>Nenhuma análise ainda</h2>
              <p>Envie um currículo e ele aparece aqui com a nota e as sugestões.</p>
              <Link to="/dashboard" className="btn btn-accent">Analisar um currículo</Link>
            </div>
          )}

          {itens.length > 0 && (
            <>
              <div className="hist-filters">
                <div className="field">
                  <label htmlFor="busca">Buscar por nome do arquivo</label>
                  <input id="busca" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="faixa">Nota</label>
                  <select id="faixa" value={faixa} onChange={(e) => setFaixa(e.target.value)}>
                    <option value="todas">Todas</option>
                    <option value="alta">75 ou mais</option>
                    <option value="media">50 a 74</option>
                    <option value="baixa">Abaixo de 50</option>
                  </select>
                </div>
              </div>

              <ul className="hist-list">
                {filtrados.map((item, idx) => {
                  const nota = item.analise?.nota ?? 0;
                  const open = aberto === item._id;
                  return (
                    <Reveal as="li" key={item._id} className={open ? "open" : ""} delay={Math.min(idx, 8) * 0.05} y={18}>
                      <button
                        type="button"
                        className="hist-row"
                        aria-expanded={open}
                        onClick={() => setAberto(open ? null : item._id)}
                      >
                        <span className="hist-name">{item.nomeArquivo}</span>
                        <span className="hist-date">{formatarData(item.data)}</span>
                        <strong className="hist-score">{nota}</strong>
                      </button>
                      {open && <div className="hist-report"><Report analise={item.analise} /></div>}
                    </Reveal>
                  );
                })}
                {filtrados.length === 0 && <li className="muted hist-none">Nenhum resultado para esse filtro.</li>}
              </ul>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Historico;
