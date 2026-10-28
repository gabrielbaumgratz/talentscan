import { motion as Motion } from "framer-motion";
import Swal from "sweetalert2";
import { Counter, ease } from "./ui";
import { alertTheme } from "../lib";
import "./Report.css";

const veredito = (nota) =>
  nota >= 75 ? "Competitivo. Faltam ajustes finos."
  : nota >= 50 ? "Boa base, com trechos a cortar."
  : "Precisa de revisão antes de enviar.";

const Lista = ({ titulo, itens, vazio, className, i = 0 }) => (
  <Motion.section className={`rep-list ${className}`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.15 + i * 0.1, ease }}>
    <h3>{titulo}</h3>
    <ul>
      {itens?.length > 0 ? itens.map((item, i) => <li key={i}>{item}</li>) : <li className="muted">{vazio}</li>}
    </ul>
  </Motion.section>
);

export default function Report({ analise, nome, onReset }) {
  const nota = analise?.nota ?? 0;

  const copiar = async () => {
    const bloco = (t, l = []) => `${t}\n${l.map((i) => `- ${i}`).join("\n")}`;
    const texto = [
      `Nota: ${nota}/100`,
      bloco("Pontos fortes", analise?.pontosFortes),
      bloco("Pontos fracos", analise?.pontosFracos),
      bloco("Sugestões", analise?.sugestoes)
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(texto);
      Swal.fire(alertTheme({ icon: "success", title: "Copiado", timer: 1500, showConfirmButton: false }));
    } catch {
      Swal.fire(alertTheme({ icon: "error", title: "Não foi possível copiar" }));
    }
  };

  return (
    <article className="report" id="relatorio-pdf">
      <header className="rep-head">
        <div className="rep-score" aria-label={`Nota ${nota} de 100`}>
          <strong><Counter to={nota} /></strong>
          <span>/100</span>
        </div>
        <div className="rep-verdict">
          {nome && <p className="muted">{nome}</p>}
          <h2>{veredito(nota)}</h2>
          <div className="bar" aria-hidden="true"><span style={{ width: `${nota}%` }} /></div>
        </div>
        <div className="rep-actions no-print">
          <button type="button" className="btn btn-quiet" onClick={copiar}>Copiar</button>
          <button type="button" className="btn btn-quiet" onClick={() => window.print()}>Imprimir</button>
          {onReset && <button type="button" className="btn" onClick={onReset}>Analisar outro</button>}
        </div>
      </header>

      <div className="rep-grid">
        <Lista titulo="O que funciona" itens={analise?.pontosFortes} vazio="Nenhum ponto forte apontado." className="good" i={0} />
        <Lista titulo="O que pesa contra" itens={analise?.pontosFracos} vazio="Nenhum ponto fraco apontado." className="bad" i={1} />
        <Lista titulo="Como corrigir" itens={analise?.sugestoes} vazio="Nenhuma sugestão." className="todo" i={2} />
      </div>
    </article>
  );
}
