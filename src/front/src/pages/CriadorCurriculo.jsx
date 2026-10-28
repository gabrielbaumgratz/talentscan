import { useState } from "react";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import { aprimorarTextoComIA } from "../services/cvService";
import { alertTheme } from "../lib";
import { Words } from "../components/ui";
import "./CriadorCurriculo.css";


function CriadorCurriculo() {
  // Estado
  const [cvData, setCvData] = useState({
    pessoais: { nome: "", email: "", telefone: "", linkedin: "" },
    resumo: "",
    experiencias: [],
    formacao: [],
    habilidades: [],
    idiomas: []
  });

  // Pessoais
  const handlePessoaisChange = (e) => {
    setCvData({
      ...cvData,
      pessoais: { ...cvData.pessoais, [e.target.name]: e.target.value }
    });
  };

  // IA
  const aprimorarTexto = async (texto, contexto, onUpdate) => {
    if (!texto.trim()) {
      return Swal.fire(alertTheme({ icon: "warning", title: "Campo vazio", text: "Escreva o texto antes de pedir o aprimoramento." }));
    }

    Swal.fire(alertTheme({ title: "Aprimorando o texto...", allowOutsideClick: false, showConfirmButton: false, didOpen: () => Swal.showLoading() }));

    try {
      const aprimorado = await aprimorarTextoComIA(texto, contexto);
      Swal.close();
      onUpdate(aprimorado);
    } catch {
      Swal.fire(alertTheme({ icon: "error", title: "A IA não respondeu", text: "Tente de novo em instantes." }));
    }
  };

  // Funções Genéricas para Arrays
  const add = (campo, itemVazio) => setCvData({ ...cvData, [campo]: [...cvData[campo], itemVazio] });
  const update = (campo, index, chave, valor) => {
    const lista = cvData[campo].map((item, i) => (i === index ? { ...item, [chave]: valor } : item));
    setCvData({ ...cvData, [campo]: lista });
  };
  const remove = (campo, index) => setCvData({ ...cvData, [campo]: cvData[campo].filter((_, i) => i !== index) });

  // Print
  const imprimir = () => window.print();

  return (
    <div className="cv-page-wrapper">
      <div className="no-print">
        <Navbar />
      </div>

      <div className="cv-creator-container">
        <div className="cv-form-section no-print">
          <Words text="Criar currículo" />
          <p>Preencha ao lado e veja o documento se montar.</p>

          <section className="form-group">
            <h3>Dados Pessoais</h3>
            <input type="text" name="nome" placeholder="Nome completo" aria-label="Nome completo" value={cvData.pessoais.nome} onChange={handlePessoaisChange} />
            <input type="email" name="email" placeholder="Email" aria-label="Email" value={cvData.pessoais.email} onChange={handlePessoaisChange} />
            <input type="text" name="telefone" placeholder="Telefone" value={cvData.pessoais.telefone} onChange={handlePessoaisChange} />
            <input type="text" name="linkedin" placeholder="LinkedIn (URL)" value={cvData.pessoais.linkedin} onChange={handlePessoaisChange} />
          </section>

          <section className="form-group">
            <h3>Resumo Profissional</h3>
            <textarea
              placeholder="Fale um pouco sobre você..."
              value={cvData.resumo}
              onChange={(e) => setCvData({ ...cvData, resumo: e.target.value })}
              rows="4"
            />
            <button type="button" className="btn-ai" onClick={() => aprimorarTexto(cvData.resumo, "Resumo Profissional", (novoTexto) => setCvData({ ...cvData, resumo: novoTexto }))}>
              Aprimorar com IA
            </button>
          </section>

          <section className="form-group">
            <h3>Experiência Profissional</h3>
            {cvData.experiencias.map((exp, index) => (
              <div key={index} className="dynamic-entry">
                <input type="text" placeholder="Cargo" value={exp.cargo} onChange={(e) => update("experiencias", index, "cargo", e.target.value)} />
                <input type="text" placeholder="Empresa" value={exp.empresa} onChange={(e) => update("experiencias", index, "empresa", e.target.value)} />
                <input type="text" placeholder="Período" value={exp.periodo} onChange={(e) => update("experiencias", index, "periodo", e.target.value)} />
                <textarea placeholder="Descrição" value={exp.descricao} onChange={(e) => update("experiencias", index, "descricao", e.target.value)} rows="3" />
                <div className="entry-actions">
                  <button type="button" className="btn-ai" onClick={() => aprimorarTexto(exp.descricao, "Cargo: " + exp.cargo, (novoTexto) => update("experiencias", index, "descricao", novoTexto))}>
                    Aprimorar Descrição
                  </button>
                  <button type="button" className="btn-remove" onClick={() => remove("experiencias", index)}>Remover</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn-add" onClick={() => add("experiencias", { cargo: "", empresa: "", periodo: "", descricao: "" })}>+ Experiência</button>
          </section>

          <section className="form-group">
            <h3>Formação</h3>
            {cvData.formacao.map((form, index) => (
              <div key={index} className="dynamic-entry">
                <input type="text" placeholder="Curso" value={form.curso} onChange={(e) => update("formacao", index, "curso", e.target.value)} />
                <input type="text" placeholder="Instituição" value={form.instituicao} onChange={(e) => update("formacao", index, "instituicao", e.target.value)} />
                <input type="text" placeholder="Período" value={form.periodo} onChange={(e) => update("formacao", index, "periodo", e.target.value)} />
                <button type="button" className="btn-remove" onClick={() => remove("formacao", index)}>Remover</button>
              </div>
            ))}
            <button type="button" className="btn-add" onClick={() => add("formacao", { curso: "", instituicao: "", periodo: "" })}>+ Formação</button>
          </section>

          <section className="form-group">
            <h3>Habilidades</h3>
            {cvData.habilidades.map((hab, index) => (
              <div key={index} className="dynamic-entry row">
                <input type="text" placeholder="Habilidade" value={hab.nome} onChange={(e) => update("habilidades", index, "nome", e.target.value)} />
                <select value={hab.nivel} onChange={(e) => update("habilidades", index, "nivel", e.target.value)}>
                  <option value="Básico">Básico</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
                <button type="button" className="btn-remove" onClick={() => remove("habilidades", index)}>Remover</button>
              </div>
            ))}
            <button type="button" className="btn-add" onClick={() => add("habilidades", { nome: "", nivel: "Básico" })}>+ Habilidade</button>
          </section>

          <section className="form-group">
            <h3>Idiomas</h3>
            {cvData.idiomas.map((idioma, index) => (
              <div key={index} className="dynamic-entry row">
                <input type="text" placeholder="Idioma" value={idioma.idioma} onChange={(e) => update("idiomas", index, "idioma", e.target.value)} />
                <select value={idioma.nivel} onChange={(e) => update("idiomas", index, "nivel", e.target.value)}>
                  <option value="A1">A1 - Iniciante</option>
                  <option value="A2">A2 - Básico</option>
                  <option value="B1">B1 - Intermediário</option>
                  <option value="B2">B2 - Independente</option>
                  <option value="C1">C1 - Avançado</option>
                  <option value="C2">C2 - Fluente/Nativo</option>
                </select>
                <button type="button" className="btn-remove" onClick={() => remove("idiomas", index)}>Remover</button>
              </div>
            ))}
            <button type="button" className="btn-add" onClick={() => add("idiomas", { idioma: "", nivel: "A1" })}>+ Idioma</button>
          </section>

          <button type="button" className="btn btn-accent btn-print" onClick={imprimir}>Imprimir / Salvar PDF</button>
        </div>

        <div className="cv-preview-section">
          <div className="cv-document">
            <header className="cv-header">
              <h1 className="cv-name">{cvData.pessoais.nome || "Seu Nome Completo"}</h1>
              <div className="cv-contact">
                {cvData.pessoais.email && <span>{cvData.pessoais.email}</span>}
                {cvData.pessoais.telefone && <span> | {cvData.pessoais.telefone}</span>}
                {cvData.pessoais.linkedin && <span> | {cvData.pessoais.linkedin}</span>}
              </div>
            </header>

            <div className="cv-body">
              {cvData.resumo && (
                <div className="cv-section">
                  <h3 className="cv-section-title">Resumo Profissional</h3>
                  <p className="cv-section-content">{cvData.resumo}</p>
                </div>
              )}

              {cvData.experiencias.length > 0 && (
                <div className="cv-section">
                  <h3 className="cv-section-title">Experiência Profissional</h3>
                  {cvData.experiencias.map((exp, i) => (
                    <div key={i} className="cv-item">
                      <div className="cv-item-header">
                        <strong>{exp.cargo || "Cargo"}</strong>
                        <span>{exp.periodo}</span>
                      </div>
                      <div className="cv-item-subtitle">{exp.empresa}</div>
                      <p className="cv-item-desc">{exp.descricao}</p>
                    </div>
                  ))}
                </div>
              )}

              {cvData.formacao.length > 0 && (
                <div className="cv-section">
                  <h3 className="cv-section-title">Formação Acadêmica</h3>
                  {cvData.formacao.map((form, i) => (
                    <div key={i} className="cv-item">
                      <div className="cv-item-header">
                        <strong>{form.curso || "Curso"}</strong>
                        <span>{form.periodo}</span>
                      </div>
                      <div className="cv-item-subtitle">{form.instituicao}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="cv-columns">
                {cvData.habilidades.length > 0 && (
                  <div className="cv-section cv-col">
                    <h3 className="cv-section-title">Habilidades</h3>
                    <ul className="cv-list">
                      {cvData.habilidades.map((hab, i) => (
                        <li key={i}><strong>{hab.nome}</strong>: {hab.nivel}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {cvData.idiomas.length > 0 && (
                  <div className="cv-section cv-col">
                    <h3 className="cv-section-title">Idiomas</h3>
                    <ul className="cv-list">
                      {cvData.idiomas.map((idioma, i) => (
                        <li key={i}><strong>{idioma.idioma}</strong>: {idioma.nivel}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CriadorCurriculo;