import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  analisarClassificacao,
  analisarCompatibilidade,
  buscarClassificacoes,
  buscarCurriculos,
  gerarVaga
} from "../services/compatibilidadeService";
import { getUser, alertTheme } from "../lib";
import { Words } from "../components/ui";
import "./ClassificacaoCompatibilidade.css";

const areas = [
  "Desenvolvimento Front-end",
  "Desenvolvimento Back-end",
  "Desenvolvimento Full Stack",
  "Análise de Dados",
  "Ciência de Dados",
  "UX/UI Design",
  "Suporte Técnico",
  "Infraestrutura",
  "Segurança da Informação",
  "Gestão de Projetos",
  "Recursos Humanos",
  "Administração",
  "Marketing",
  "Vendas"
];

const niveis = ["Estágio", "Júnior", "Pleno", "Sênior"];

function Lista({ titulo, itens, tipo }) {
  return (
    <section className={`cc-card ${tipo || ""}`}>
      <h3>{titulo}</h3>
      {itens?.length ? (
        <ul>{itens.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>
      ) : (
        <p className="muted">Nada identificado.</p>
      )}
    </section>
  );
}

function Campo({ id, label, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

function ClassificacaoCompatibilidade() {
  const [curriculos, setCurriculos] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  const [curriculoId, setCurriculoId] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [classificacao, setClassificacao] = useState(null);
  const [vaga, setVaga] = useState(null);
  const [compatibilidade, setCompatibilidade] = useState(null);
  const [modoVaga, setModoVaga] = useState("gerada");
  const [loadingClassificacao, setLoadingClassificacao] = useState(false);
  const [loadingVaga, setLoadingVaga] = useState(false);
  const [loadingCompatibilidade, setLoadingCompatibilidade] = useState(false);
  const [vagaGeradaForm, setVagaGeradaForm] = useState({ area: "Desenvolvimento Front-end", nivel: "Júnior" });
  const [vagaPersonalizada, setVagaPersonalizada] = useState({
    titulo: "",
    descricao: "",
    requisitos: "",
    responsabilidades: "",
    tecnologias: "",
    nivel: ""
  });

  const user = useMemo(() => getUser(), []);

  useEffect(() => {
    if (!user?._id) return;

    Promise.all([buscarCurriculos(user._id), buscarClassificacoes(user._id)])
      .then(([hc, hcl]) => {
        setCurriculos(Array.isArray(hc) ? hc : []);
        setClassificacoes(Array.isArray(hcl) ? hcl : []);
      })
      .catch((erro) => console.error(erro));
  }, [user?._id]);

  const pontuacao = classificacao?.pontuacaoGeral || 0;
  const porcentagem = compatibilidade?.porcentagemCompatibilidade || 0;

  const aviso = (title, text) => Swal.fire(alertTheme({ icon: "warning", title, text }));
  const falha = (erro, padrao) => Swal.fire(alertTheme({ icon: "error", title: "Algo falhou", text: erro.message || padrao }));

  async function handleClassificar() {
    if (!curriculoId && !arquivo) {
      return aviso("Falta o currículo", "Escolha um currículo do histórico ou envie um arquivo.");
    }

    const formData = new FormData();
    formData.append("userId", user._id);
    if (curriculoId) formData.append("curriculoId", curriculoId);
    if (arquivo) formData.append("curriculo", arquivo);

    try {
      setLoadingClassificacao(true);
      setCompatibilidade(null);

      const data = await analisarClassificacao(formData);
      setClassificacao(data.classificacao);

      const historico = await buscarClassificacoes(user._id);
      setClassificacoes(Array.isArray(historico) ? historico : []);
    } catch (erro) {
      falha(erro, "Não foi possível classificar o currículo.");
    } finally {
      setLoadingClassificacao(false);
    }
  }

  async function handleGerarVaga() {
    try {
      setLoadingVaga(true);
      const data = await gerarVaga({ userId: user._id, area: vagaGeradaForm.area, nivel: vagaGeradaForm.nivel });
      setVaga(data.vaga);
      setModoVaga("gerada");
    } catch (erro) {
      falha(erro, "Não foi possível gerar a vaga.");
    } finally {
      setLoadingVaga(false);
    }
  }

  async function handleCompatibilidade() {
    if (!classificacao?._id) {
      return aviso("Classifique primeiro", "Analise o currículo antes de comparar com uma vaga.");
    }
    if (modoVaga === "gerada" && !vaga?._id) {
      return aviso("Falta a vaga", "Gere uma vaga ou use a opção de vaga real.");
    }
    if (modoVaga === "personalizada" && !vagaPersonalizada.descricao.trim()) {
      return aviso("Falta a vaga", "Cole a descrição completa da vaga.");
    }

    try {
      setLoadingCompatibilidade(true);
      const data = await analisarCompatibilidade({
        userId: user._id,
        classificacaoId: classificacao._id,
        vagaId: modoVaga === "gerada" ? vaga?._id : undefined,
        vagaPersonalizada: modoVaga === "personalizada" ? vagaPersonalizada : undefined
      });
      setCompatibilidade(data.compatibilidade);
    } catch (erro) {
      falha(erro, "Não foi possível analisar a compatibilidade.");
    } finally {
      setLoadingCompatibilidade(false);
    }
  }

  const setVP = (campo) => (e) => setVagaPersonalizada({ ...vagaPersonalizada, [campo]: e.target.value });

  if (!user) {
    return (
      <>
        <Navbar />
        <main>
          <header className="page-title">
            <Words text="Entre para comparar com vagas" />
            <p>A classificação e as vagas ficam salvas na sua conta.</p>
            <p style={{ marginTop: 24 }}><Link to="/login" className="btn">Entrar</Link></p>
          </header>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main>
        <header className="page-title">
          <Words text="Seu perfil contra uma vaga" />
          <p>Primeiro a IA classifica seu currículo. Depois compara com a vaga que você escolher.</p>
        </header>

        <div className="page-body cc-flow">
          <section className="cc-step" aria-labelledby="s1">
            <h2 id="s1">1. Classificar o currículo</h2>
            <div className="cc-cols">
              <div className="panel cc-form">
                <Campo id="hist" label="Currículo do histórico">
                  <select id="hist" value={curriculoId} onChange={(e) => { setCurriculoId(e.target.value); setArquivo(null); }}>
                    <option value="">Selecionar</option>
                    {curriculos.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.nomeArquivo} · {item.analise?.nota ?? 0}/100
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo id="novo" label="Ou enviar um novo (PDF ou DOCX)">
                  <input id="novo" type="file" accept=".pdf,.docx"
                    onChange={(e) => { setArquivo(e.target.files[0] || null); setCurriculoId(""); }} />
                </Campo>
                <button type="button" className="btn" onClick={handleClassificar} disabled={loadingClassificacao}>
                  {loadingClassificacao ? "Classificando..." : "Classificar"}
                </button>
              </div>

              <div className="cc-recent">
                <h3>Classificações recentes</h3>
                {classificacoes.length === 0 && <p className="muted">Nenhuma ainda.</p>}
                {classificacoes.slice(0, 5).map((item) => (
                  <button key={item._id} type="button" onClick={() => setClassificacao(item)}>
                    <span>
                      <strong>{item.areaPrincipal}</strong>
                      <small>{item.nomeArquivo || "Currículo"}</small>
                    </span>
                    <b>{item.pontuacaoGeral}</b>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {classificacao && (
            <section className="cc-result" aria-labelledby="r1">
              <div className="cc-head">
                <div className="cc-big accent"><strong>{pontuacao}</strong><span>/100</span></div>
                <div>
                  <h2 id="r1">{classificacao.areaPrincipal}</h2>
                  <p className="cc-level">{classificacao.nivelProfissional} · {classificacao.nomeArquivo || "Currículo"}</p>
                  <p>{classificacao.resumoProfissional}</p>
                </div>
              </div>
              <div className="cc-grid">
                <Lista titulo="Tecnologias" itens={classificacao.tecnologiasPrincipais} />
                <Lista titulo="Hard skills" itens={classificacao.hardSkills} />
                <Lista titulo="Soft skills" itens={classificacao.softSkills} />
                <Lista titulo="Pontos fortes" itens={classificacao.pontosFortes} tipo="good" />
                <Lista titulo="Pontos fracos" itens={classificacao.pontosFracos} tipo="bad" />
                <Lista titulo="Sugestões" itens={classificacao.sugestoesMelhoria} />
              </div>
            </section>
          )}

          <section className="cc-step" aria-labelledby="s2">
            <h2 id="s2">2. Escolher a vaga</h2>

            <div className="cc-tabs" role="group" aria-label="Origem da vaga">
              <button type="button" aria-pressed={modoVaga === "gerada"} onClick={() => setModoVaga("gerada")}>Gerar com IA</button>
              <button type="button" aria-pressed={modoVaga === "personalizada"} onClick={() => setModoVaga("personalizada")}>Colar uma vaga real</button>
            </div>

            {modoVaga === "gerada" ? (
              <div className="panel cc-form">
                <div className="cc-two">
                  <Campo id="area" label="Área">
                    <select id="area" value={vagaGeradaForm.area} onChange={(e) => setVagaGeradaForm({ ...vagaGeradaForm, area: e.target.value })}>
                      {areas.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </Campo>
                  <Campo id="nivel" label="Nível">
                    <select id="nivel" value={vagaGeradaForm.nivel} onChange={(e) => setVagaGeradaForm({ ...vagaGeradaForm, nivel: e.target.value })}>
                      {niveis.map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </Campo>
                </div>
                <button type="button" className="btn btn-quiet" onClick={handleGerarVaga} disabled={loadingVaga}>
                  {loadingVaga ? "Gerando..." : "Gerar vaga"}
                </button>
              </div>
            ) : (
              <div className="panel cc-form">
                <Campo id="vt" label="Título da vaga"><input id="vt" value={vagaPersonalizada.titulo} onChange={setVP("titulo")} /></Campo>
                <Campo id="vd" label="Descrição completa"><textarea id="vd" rows="6" value={vagaPersonalizada.descricao} onChange={setVP("descricao")} /></Campo>
                <div className="cc-two">
                  <Campo id="vr" label="Requisitos"><textarea id="vr" rows="4" value={vagaPersonalizada.requisitos} onChange={setVP("requisitos")} /></Campo>
                  <Campo id="vres" label="Responsabilidades"><textarea id="vres" rows="4" value={vagaPersonalizada.responsabilidades} onChange={setVP("responsabilidades")} /></Campo>
                  <Campo id="vtec" label="Tecnologias"><textarea id="vtec" rows="4" value={vagaPersonalizada.tecnologias} onChange={setVP("tecnologias")} /></Campo>
                  <Campo id="vn" label="Nível da vaga"><input id="vn" value={vagaPersonalizada.nivel} onChange={setVP("nivel")} /></Campo>
                </div>
              </div>
            )}

            {modoVaga === "gerada" && vaga && (
              <div className="cc-job">
                <h3>{vaga.titulo}</h3>
                <p>{vaga.descricao}</p>
                <div className="cc-grid">
                  <Lista titulo="Responsabilidades" itens={vaga.responsabilidades} />
                  <Lista titulo="Requisitos obrigatórios" itens={vaga.requisitosObrigatorios} />
                  <Lista titulo="Desejáveis" itens={vaga.requisitosDesejaveis} />
                  <Lista titulo="Tecnologias" itens={vaga.tecnologias} />
                </div>
              </div>
            )}

            <button type="button" className="btn btn-accent cc-go" onClick={handleCompatibilidade} disabled={loadingCompatibilidade}>
              {loadingCompatibilidade ? "Comparando..." : "Comparar currículo e vaga"}
            </button>
          </section>

          {compatibilidade && (
            <section className="cc-result" aria-labelledby="r2">
              <div className="cc-head">
                <div className="cc-big dark"><strong>{porcentagem}</strong><span>%</span></div>
                <div>
                  <h2 id="r2">Compatibilidade</h2>
                  <p>{compatibilidade.justificativaNota}</p>
                  <div className="bar cc-bar" aria-hidden="true"><span style={{ width: `${porcentagem}%` }} /></div>
                </div>
              </div>
              <div className="cc-grid">
                <Lista titulo="Bate com a vaga" itens={compatibilidade.pontosCompativeis} tipo="good" />
                <Lista titulo="Falta" itens={compatibilidade.pontosAusentes} tipo="bad" />
                <Lista titulo="Parcialmente" itens={compatibilidade.pontosParcialmenteCompativeis} />
                <section className="cc-card cc-wide">
                  <h3>Recomendação final</h3>
                  <p>{compatibilidade.recomendacaoFinal}</p>
                </section>
                <Lista titulo="Ajustes no currículo" itens={compatibilidade.sugestoesMelhoria} />
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ClassificacaoCompatibilidade;
