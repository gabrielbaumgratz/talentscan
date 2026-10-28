import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Counter, Words } from "../components/ui";
import API_URL from "../services/api";
import { readJson } from "../services/http";
import { getUser } from "../lib";
import "./Progress.css";

function evolucao(data) {
  if (data.length < 2) return "Envie mais uma versão para ver a evolução.";
  const delta = data[data.length - 1].nota - data[0].nota;
  if (delta > 0) return `Subiu ${delta} ponto${delta > 1 ? "s" : ""} desde o primeiro envio.`;
  if (delta < 0) return `Caiu ${-delta} ponto${delta < -1 ? "s" : ""} desde o primeiro envio.`;
  return "Mesma nota do primeiro envio.";
}

function Progress() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(getUser()?._id));
  const [error, setError] = useState("");
  const user = getUser();

  useEffect(() => {
    if (!user?._id) return;

    fetch(`${API_URL}/api/progress/${user._id}`)
      .then((res) => readJson(res, "Erro ao buscar progresso"))
      .then((json) =>
        setData(
          [...json]
            .sort((x, y) => new Date(x.data) - new Date(y.data))
            .filter((item) => item?.analise?.nota > 0)
            .map((item, index) => ({
              nota: item.analise.nota,
              nome: item.nomeArquivo || "Currículo",
              date: item.data
                ? new Date(item.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                : `Análise ${index + 1}`
            }))
        )
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?._id]);

  const total = data.length;
  const media = total ? data.reduce((acc, item) => acc + item.nota, 0) / total : 0;
  const melhor = total ? Math.max(...data.map((d) => d.nota)) : 0;

  return (
    <>
      <Navbar />

      <main>
        <header className="page-title">
          <Words text="Seu progresso" />
          {total > 0 && <p>{evolucao(data)}</p>}
        </header>

        <div className="page-body">
          {!user && <p>Entre na sua conta para ver o progresso. <Link to="/login">Entrar</Link></p>}
          {user && loading && <p>Carregando...</p>}
          {error && <p role="alert" style={{ color: "var(--bad)" }}>{error}</p>}

          {user && !loading && !error && total === 0 && (
            <div className="panel empty">
              <h2>Nada por aqui ainda</h2>
              <p>Cada currículo analisado vira um ponto neste gráfico.</p>
              <Link to="/dashboard" className="btn btn-accent">Analisar um currículo</Link>
            </div>
          )}

          {total > 0 && (
            <>
              <div className="figures">
                <div className="figure fig-accent">
                  <strong><Counter to={melhor} /></strong>
                  <span>melhor nota</span>
                </div>
                <div className="figure">
                  <strong><Counter to={Math.round(media)} /></strong>
                  <span>média</span>
                </div>
                <div className="figure fig-dark">
                  <strong><Counter to={total} /></strong>
                  <span>{total === 1 ? "análise" : "análises"}</span>
                </div>
              </div>

              <div className="chart-box" role="img" aria-label={`Notas ao longo do tempo, de ${data[0].nota} a ${data[total - 1].nota}`}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={data} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="var(--line-strong)" tick={{ fill: "var(--muted)", fontSize: 13 }} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="var(--line-strong)" tick={{ fill: "var(--muted)", fontSize: 13 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--line-strong)", borderRadius: 4, color: "var(--ink)" }}
                      labelStyle={{ color: "var(--muted)" }}
                      itemStyle={{ color: "var(--accent-text)", fontWeight: 600 }}
                    />
                    <Line type="monotone" dataKey="nota" name="Nota" stroke="var(--accent)" strokeWidth={3}
                      dot={{ r: 5, fill: "var(--bg)", stroke: "var(--accent)", strokeWidth: 2 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <section className="history" aria-labelledby="hist-h">
                <h2 id="hist-h">Envios</h2>
                <ul>
                  {[...data].reverse().map((item, i) => (
                    <li key={i}>
                      <span className="file-name">{item.nome}</span>
                      <small>{item.date}</small>
                      <strong>{item.nota}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Progress;
