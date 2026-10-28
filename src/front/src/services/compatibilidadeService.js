import API_URL from "./api";
import { readJson } from "./http";

const postJson = async (path, payload, fallback) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return readJson(res, fallback);
};

export async function buscarCurriculos(userId) {
  const res = await fetch(`${API_URL}/api/analises/${userId}`);
  return readJson(res, "Erro ao buscar currículos");
}

export async function buscarClassificacoes(userId) {
  const res = await fetch(`${API_URL}/api/classificacao/historico/${userId}`);
  return readJson(res, "Erro ao buscar classificações");
}

export async function analisarClassificacao(formData) {
  const res = await fetch(`${API_URL}/api/classificacao/analisar`, {
    method: "POST",
    body: formData
  });

  return readJson(res, "Erro ao classificar currículo");
}

export async function gerarVaga(payload) {
  return postJson("/api/vagas/gerar", payload, "Erro ao gerar vaga");
}

export async function analisarCompatibilidade(payload) {
  return postJson("/api/compatibilidade/analisar", payload, "Erro ao analisar compatibilidade");
}
