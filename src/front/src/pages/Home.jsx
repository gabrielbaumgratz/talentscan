import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Reveal, Words, Counter, useMedia, ease } from "../components/ui";
import { getUser } from "../lib";
import "./Home.css";

/* ---------- hero: a folha do currículo, com a leitura marcada ---------- */

const GROUPS = [
  {
    id: "resumo", y: 124, h: 44, tone: "bad", tag: "Reescrever",
    note: "Serve para qualquer pessoa. Diga o que fez e com qual ferramenta.",
    lines: [[54, 140, 214], [54, 152, 196], [54, 164, 140]]
  },
  {
    id: "exp", y: 206, h: 62, tone: "good", tag: "Manter",
    note: "Verbo, ferramenta e resultado medido. É isso que se procura.",
    lines: [[54, 224, 214], [54, 236, 204], [54, 248, 170], [54, 260, 196]]
  },
  {
    id: "skills", y: 312, h: 40, tone: "warn", tag: "Ajustar",
    note: "Tire Word e Internet. Dê nível a SQL e Python.",
    lines: [[54, 330, 176], [54, 342, 104]]
  }
];

const TONE = { bad: "var(--bad)", good: "var(--good)", warn: "var(--warn)" };

function Sheet({ wide }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState("exp");
  const vbW = wide ? 640 : 330;

  const draw = (delay) => ({
    initial: reduce ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.1, delay, ease }
  });

  return (
    <figure className="sheet" data-wide={wide}>
      <figcaption className="mono sheet-cap">
        <span><b className="tick">FIG. 01</b> · curriculo_ana.pdf</span>
        <span>1 pág · exemplo</span>
      </figcaption>

      <div className="sheet-box">
        <svg viewBox={`0 0 ${vbW} 470`} role="img"
          aria-label="Desenho de uma folha de currículo com três trechos marcados: um para reescrever, um para manter e um para ajustar">
          {/* páginas empilhadas ao fundo */}
          <rect x="50" y="10" width="270" height="410" fill="none" stroke="var(--line-strong)" strokeDasharray="4 5" />
          <rect x="40" y="20" width="270" height="410" fill="none" stroke="var(--line)" strokeDasharray="4 5" />

          <Motion.rect x="30" y="30" width="270" height="410" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5"
            {...draw(0.1)} />

          {/* cabeçalho do currículo */}
          <Motion.rect x="54" y="56" width="140" height="14" fill="var(--ink)" initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }} style={{ transformOrigin: "54px 63px" }} transition={{ duration: .7, delay: .5, ease }} />
          <rect x="54" y="78" width="96" height="6" fill="var(--muted)" opacity=".6" />
          <rect x="54" y="92" width="150" height="5" fill="var(--muted)" opacity=".35" />

          {[["resumo", 112, 64], ["exp", 194, 96], ["skills", 300, 76], ["form", 372, 84]].map(([k, y, w]) => (
            <rect key={k} x="54" y={y} width={w} height="6" fill="var(--ink)" opacity=".9" />
          ))}

          {GROUPS.map((g, gi) => {
            const on = active === g.id;
            return (
              <g key={g.id} tabIndex={0} role="button" aria-label={`${g.tag}: ${g.note}`}
                onMouseEnter={() => setActive(g.id)} onFocus={() => setActive(g.id)} onClick={() => setActive(g.id)}
                style={{ cursor: "pointer", outline: "none" }}>
                {g.lines.map(([x, y, w], i) => (
                  <Motion.rect key={i} x={x} y={y} width={w} height="6" fill="var(--muted)"
                    initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1, opacity: on ? 0.95 : 0.4 }}
                    style={{ transformOrigin: `${x}px ${y + 3}px` }}
                    transition={{ duration: .6, delay: .7 + gi * .25 + i * .06, ease }} />
                ))}
                <Motion.rect x="44" y={g.y} width="242" height={g.h} fill="none" stroke={TONE[g.tone]} strokeWidth="1.5"
                  strokeDasharray={on ? "0" : "5 4"} initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1, opacity: on ? 1 : 0.55 }} transition={{ duration: .8, delay: 1.1 + gi * .3, ease }} />
                <rect x="44" y={g.y} width="242" height={g.h} fill={TONE[g.tone]} opacity={on ? 0.1 : 0} style={{ transition: "opacity .3s" }} />

                {wide && (
                  <Motion.path d={`M286 ${g.y + g.h / 2} H360`} stroke={TONE[g.tone]} strokeWidth="1.5" fill="none"
                    initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1, opacity: on ? 1 : 0.5 }}
                    transition={{ duration: .6, delay: 1.5 + gi * .3, ease }} />
                )}
                {wide && <circle cx="286" cy={g.y + g.h / 2} r="3.5" fill={TONE[g.tone]} />}
              </g>
            );
          })}

          <rect x="54" y="390" width="190" height="6" fill="var(--muted)" opacity=".4" />
          <rect x="54" y="402" width="130" height="6" fill="var(--muted)" opacity=".4" />

          {/* marcas de canto */}
          {[[16, 16, 1, 1], [wide ? 624 : 314, 16, -1, 1], [16, 454, 1, -1], [wide ? 624 : 314, 454, -1, -1]].map(([x, y, sx, sy], i) => (
            <path key={i} d={`M${x} ${y + 14 * sy} V${y} H${x + 14 * sx}`} fill="none" stroke="var(--line-strong)" strokeWidth="1" />
          ))}
        </svg>

        {wide && (
          <div className="sheet-notes">
            {GROUPS.map((g, gi) => (
              <Motion.button key={g.id} type="button" className={`note ${active === g.id ? "on" : ""}`}
                style={{ top: `${((g.y + g.h / 2) / 470) * 100}%`, "--tone": TONE[g.tone] }}
                onMouseEnter={() => setActive(g.id)} onFocus={() => setActive(g.id)}
                initial={reduce ? false : { opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: .6, delay: 1.7 + gi * .3, ease }}>
                <span className="mono">{g.tag}</span>
                <span className="note-text">{g.note}</span>
              </Motion.button>
            ))}

            <Motion.div className="readout" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 2.4, duration: .8 }}>
              <span className="mono">Nota geral</span>
              <strong><Counter to={72} duration={1.8} /><small>/100</small></strong>
            </Motion.div>
          </div>
        )}
      </div>

      {!wide && (
        <ul className="notes-list">
          {GROUPS.map((g) => (
            <li key={g.id} style={{ "--tone": TONE[g.tone] }}>
              <span className="mono">{g.tag}</span> {g.note}
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}

/* ---------- como funciona: passos com painel fixo ---------- */

const STEPS = [
  { title: "Envie o arquivo", text: "PDF ou DOCX. O texto é extraído e a análise fica salva na sua conta." },
  { title: "A IA lê o texto", text: "Ela avalia clareza, experiência, palavras-chave e organização e dá uma nota de 0 a 100." },
  { title: "Veja a nota e os pontos", text: "Você recebe os pontos fortes, os pontos fracos e sugestões de melhoria." },
  { title: "Reescreva os trechos fracos", text: "No criador de currículo, a IA reescreve cada trecho mantendo o que você escreveu. Você escolhe o que fica." }
];

function Scene({ step }) {
  const reduce = useReducedMotion();
  const ring = 2 * Math.PI * 62;

  if (step === 0) {
    return (
      <div className="scene">
        <Motion.div className="drop" initial={reduce ? false : { opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}>
          <span className="mono">Solte o arquivo aqui</span>
          <Motion.div className="file-chip" initial={reduce ? false : { y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: .25, duration: .7, ease }}>
            <b>curriculo_ana.pdf</b><span className="mono">84 KB · PDF</span>
          </Motion.div>
        </Motion.div>
        <div className="fake-btn mono">Analisar →</div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="scene">
        <div className="scan">
          {[88, 70, 94, 54, 80, 62, 90, 48].map((w, i) => (
            <Motion.i key={i} style={{ width: `${w}%` }} initial={reduce ? false : { opacity: .2 }}
              animate={{ opacity: [0.2, 1, 0.45] }} transition={{ duration: 1.6, delay: i * .18, repeat: Infinity, repeatDelay: .6 }} />
          ))}
          {!reduce && (
            <Motion.div className="scan-line" animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }} />
          )}
        </div>
        <p className="mono scene-cap">Lendo · clareza · experiência · palavras-chave</p>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="scene scene-row">
        <svg viewBox="0 0 150 150" className="ring" aria-label="Nota 72 de 100" role="img">
          <circle cx="75" cy="75" r="62" fill="none" stroke="var(--line)" strokeWidth="8" />
          <Motion.circle cx="75" cy="75" r="62" fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="butt"
            strokeDasharray={ring} initial={reduce ? false : { strokeDashoffset: ring }}
            animate={{ strokeDashoffset: ring * (1 - 0.72) }} transition={{ duration: 1.4, ease }}
            transform="rotate(-90 75 75)" />
          <text x="75" y="88" textAnchor="middle" className="ring-n">72</text>
        </svg>
        <ul className="res-list">
          {[["Forte", "Resultado medido no estágio", "good"], ["Fraco", "Resumo genérico", "bad"], ["Sugestão", "Cortar Word e Internet", "warn"]].map(([k, t, tone], i) => (
            <Motion.li key={k} style={{ "--tone": TONE[tone] }} initial={reduce ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }} transition={{ delay: .4 + i * .15, duration: .6, ease }}>
              <span className="mono">{k}</span>{t}
            </Motion.li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="scene">
      <p className="mono scene-cap">Antes</p>
      <p className="before">Fiz relatórios para a equipe.</p>
      <p className="mono scene-cap">Depois</p>
      <Motion.p className="after" initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 1.6, ease, delay: .3 }}>
        Automatizei o relatório semanal de vendas em Python e economizei 3 h por semana.
      </Motion.p>
    </div>
  );
}

function Process() {
  const [step, setStep] = useState(0);
  const refs = useRef([]);
  const stacked = useMedia("(max-width: 1000px)");

  useEffect(() => {
    if (stacked) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setStep(Number(e.target.dataset.step))),
      { rootMargin: "-42% 0px -42% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [stacked]);

  return (
    <section className="process" id="como-funciona" aria-labelledby="proc-h">
      <div className="process-steps">
        <Reveal><p className="mono sec-label"><span className="tick">02</span> Passo a passo</p></Reveal>
        <Reveal as="h2" id="proc-h" className="sec-title">Como a análise acontece</Reveal>

        {STEPS.map((s, i) => (
          <button key={s.title} type="button" data-step={i} ref={(el) => (refs.current[i] = el)}
            className={`step ${step === i ? "on" : ""}`} onClick={() => setStep(i)} aria-pressed={step === i}>
            <span className="mono step-n">0{i + 1}</span>
            <span className="step-body">
              <span className="step-title">{s.title}</span>
              <span className="step-text">{s.text}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="process-stage">
        <div className="stage-frame" data-ui>
          <span className="mono stage-label"><b className="tick">FIG. 02</b> · 0{step + 1} / 04</span>
          <AnimatePresence mode="wait">
            <Motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: .35, ease }} className="stage-inner">
              <Scene step={step} />
            </Motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ---------- recursos: tabela com painel que reage ao hover ---------- */

const FEATURES = [
  { n: "01", title: "Nota e diagnóstico", kind: "Análise · PDF e DOCX", to: "/dashboard", year: "Dashboard",
    text: "Envie um currículo e receba nota, pontos fortes, pontos fracos e sugestões. Tudo fica no histórico." },
  { n: "02", title: "Compatibilidade com vaga", kind: "Vagas · IA", to: "/classificacao-compatibilidade", year: "Vagas",
    text: "Cole uma vaga ou peça para a IA gerar uma por área e nível. O site mostra o que combina e o que falta." },
  { n: "03", title: "Criador de currículo", kind: "Editor · PDF", to: "/criador-cv", year: "Editor",
    text: "Preencha o currículo por seções, peça à IA para melhorar cada texto e imprima em PDF." },
  { n: "04", title: "Progresso", kind: "Histórico · Gráfico", to: "/progress", year: "Evolução",
    text: "Cada análise vira um ponto no gráfico, para você ver se a nota subiu entre uma versão e outra." }
];

function FeatureDemo({ i }) {
  const reduce = useReducedMotion();
  const pts = [[10, 92], [70, 74], [130, 52], [190, 22]];

  if (i === 0) {
    return (
      <div className="demo demo-score">
        <strong><Counter to={72} duration={1} /></strong>
        <ul>
          <li><span className="mono tick">2 fortes</span> Resultado medido</li>
          <li><span className="mono" style={{ color: "var(--bad)" }}>2 fracos</span> Resumo genérico</li>
          <li><span className="mono" style={{ color: "var(--warn)" }}>2 sugestões</span> Cortar skills vazias</li>
        </ul>
      </div>
    );
  }
  if (i === 1) {
    return (
      <div className="demo demo-match">
        <p className="mono">Vaga: analista de dados júnior</p>
        <div className="chips">
          {["SQL", "Power BI", "Python", "Excel avançado"].map((c, k) => (
            <Motion.span key={c} className={k === 3 ? "chip off" : "chip"} initial={reduce ? false : { opacity: 0, scale: .8 }}
              animate={{ opacity: 1, scale: 1 }} transition={{ delay: k * .1, duration: .4, ease }}>{c}</Motion.span>
          ))}
        </div>
        <div className="bar"><Motion.span initial={reduce ? false : { width: 0 }} animate={{ width: "75%" }} transition={{ duration: 1, ease }} /></div>
        <p className="mono">3 de 4 requisitos cobertos</p>
      </div>
    );
  }
  if (i === 2) {
    return (
      <div className="demo demo-rewrite">
        <s>Fiz relatórios.</s>
        <Motion.b initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.2, ease }}>Automatizei o relatório semanal de vendas em Python.</Motion.b>
      </div>
    );
  }
  return (
    <div className="demo">
      <svg viewBox="0 0 200 110" className="mini-line" role="img" aria-label="Linha de nota subindo em quatro envios">
        <Motion.polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2.5"
          initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease }} />
        {pts.map(([x, y], k) => (
          <Motion.circle key={x} cx={x} cy={y} r="4.5" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2"
            initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 + k * .3 }} />
        ))}
      </svg>
    </div>
  );
}

function Features() {
  const [i, setI] = useState(0);

  return (
    <section className="features" id="recursos" aria-labelledby="feat-h">
      <Reveal><p className="mono sec-label"><span className="tick">03</span> Telas</p></Reveal>
      <div className="features-head">
        <Reveal as="h2" id="feat-h" className="sec-title">O que você encontra no site</Reveal>
      </div>

      <div className="features-grid">
        <div className="ftable">
          <div className="fhead mono"><span>No.</span><span>Recurso</span><span>Tipo</span><span>Tela</span></div>
          {FEATURES.map((f, k) => (
            <Reveal key={f.n} delay={k * 0.06}>
              <Link to={f.to} className={`frow ${i === k ? "on" : ""}`} onMouseEnter={() => setI(k)} onFocus={() => setI(k)}>
                <span className="mono tick">{f.n}</span>
                <span className="frow-main"><strong>{f.title}</strong><span>{f.text}</span></span>
                <span className="mono frow-kind">{f.kind}</span>
                <span className="mono frow-to">{f.year} <i className="arr">→</i></span>
              </Link>
            </Reveal>
          ))}
        </div>

        <aside className="fpanel" data-ui aria-live="polite">
          <span className="mono"><b className="tick">{FEATURES[i].n}</b> · {FEATURES[i].title}</span>
          <AnimatePresence mode="wait">
            <Motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: .3, ease }} className="fpanel-body">
              <FeatureDemo i={i} />
            </Motion.div>
          </AnimatePresence>
          <span className="mono fpanel-foot">Exemplo ilustrativo</span>
        </aside>
      </div>
    </section>
  );
}

const TICKER = ["Clareza", "Experiência", "Palavras-chave", "Organização", "Compatibilidade com a vaga", "Reescrita de textos", "Histórico"];

function Home() {
  const user = getUser();
  const cta = user ? "/dashboard" : "/register";
  const wide = useMedia("(min-width: 1000px)");

  return (
    <>
      <Navbar />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <Motion.p className="mono hero-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .1, duration: .8 }}>
              <span className="tick">—</span> Análise de currículo
            </Motion.p>
            <Words text="Descubra o que o recrutador vê." accent={[5]} className="hero-h" delay={0.2} />
            <Motion.p className="hero-sub" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .9, duration: .8, ease }}>
              Envie o PDF ou DOCX. A IA aponta o que cortar, o que melhorar e se o currículo combina com a vaga.
            </Motion.p>
            <Motion.div className="hero-cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: .8, ease }}>
              <Link to={cta} className="btn btn-accent">Analisar meu currículo <i className="arr">→</i></Link>
              <a href="#como-funciona" className="btn btn-line">Ver como funciona</a>
            </Motion.div>
          </div>

          <div className="hero-fig" data-ui>
            <Sheet wide={wide} />
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="mono">{t}<i>/</i></span>
            ))}
          </div>
        </div>

        <Process />
        <Features />


        <section className="close" aria-labelledby="close-h">
          <Reveal><p className="mono sec-label"><span className="tick">04</span> Comece</p></Reveal>
          <Words as="h2" text="Analise seu currículo agora." accent={[3]} className="close-h" />
          <Reveal delay={.15} className="close-actions">
            <Link to={cta} className="btn btn-accent">Enviar currículo <i className="arr">→</i></Link>
            <p className="muted">Trabalho acadêmico da PUC Minas, alinhado à ODS 8.</p>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;
