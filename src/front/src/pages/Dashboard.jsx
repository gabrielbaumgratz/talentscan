import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Report from "../components/Report";
import API_URL from "../services/api";
import { readJson } from "../services/http";
import { getUser, alertTheme } from "../lib";
import { Words } from "../components/ui";
import "./Dashboard.css";

const ETAPAS = ["Lendo o arquivo", "Avaliando clareza e experiência", "Procurando palavras-chave", "Calculando a nota"];

function Dashboard() {
  const user = getUser();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [analise, setAnalise] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState(0);

  useEffect(() => {
    if (!loading) return undefined;
    setEtapa(0);
    const id = setInterval(() => setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1)), 2500);
    return () => clearInterval(id);
  }, [loading]);

  const aceitar = (f) => {
    if (!f) return;
    if (!/\.(pdf|docx)$/i.test(f.name)) {
      Swal.fire(alertTheme({ icon: "warning", title: "Formato não aceito", text: "Envie um arquivo PDF ou DOCX." }));
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    aceitar(e.dataTransfer.files[0]);
  };

  const reset = () => { setAnalise(null); setFile(null); };

  const handleUpload = async () => {
    if (!file) {
      return Swal.fire(alertTheme({ icon: "warning", title: "Nenhum arquivo", text: "Escolha um PDF ou DOCX primeiro." }));
    }

    const fd = new FormData();
    fd.append("curriculo", file);
    fd.append("userId", user._id);

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/upload`, { method: "POST", body: fd });
      const data = await readJson(res, "Não foi possível analisar o currículo");
      setAnalise(data.analise);
    } catch (erro) {
      Swal.fire(alertTheme({ icon: "error", title: "A análise falhou", text: erro.message }));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <main>
          <header className="page-title">
            <Words text="Entre para analisar" />
            <p>As análises ficam salvas na sua conta, então o envio precisa de login.</p>
            <div className="dash-cta">
              <Link to="/login" className="btn">Entrar</Link>
              <Link to="/register" className="btn btn-accent">Criar conta</Link>
            </div>
          </header>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="no-print"><Navbar /></div>

      <main>
        {!analise && !loading && (
          <>
            <header className="page-title">
              <Words text="Envie seu currículo" />
              <p>PDF ou DOCX. A leitura leva alguns segundos.</p>
            </header>

            <div className="page-body">
              <div
                className={`dropzone ${dragActive ? "dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <input ref={inputRef} type="file" accept=".pdf,.docx" hidden
                  onChange={(e) => aceitar(e.target.files[0])} />

                <p className="drop-file">{file ? file.name : "Arraste o arquivo para cá"}</p>

                <div className="drop-actions">
                  <button type="button" className="btn btn-quiet" onClick={() => inputRef.current.click()}>
                    {file ? "Trocar arquivo" : "Escolher arquivo"}
                  </button>
                  <button type="button" className="btn btn-accent" onClick={handleUpload} disabled={!file}>
                    Analisar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {loading && (
          <section className="scanning" aria-live="polite">
            <Words text="Lendo seu currículo" />
            <ol>
              {ETAPAS.map((t, i) => (
                <li key={t} className={i < etapa ? "done" : i === etapa ? "now" : ""}>{t}</li>
              ))}
            </ol>
          </section>
        )}

        {analise && !loading && (
          <div className="page-body result">
            <Report analise={analise} nome={file?.name} onReset={reset} />
          </div>
        )}
      </main>

      <div className="no-print"><Footer /></div>
    </>
  );
}

export default Dashboard;
