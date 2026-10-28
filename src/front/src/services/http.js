// Lê a resposta da API e lança Error com a mensagem do backend (erro ou message).
export async function readJson(response, fallbackMessage) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? "Resposta inesperada do servidor."
        : `${fallbackMessage} (servidor respondeu ${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(data?.erro || data?.message || fallbackMessage);
  }

  return data;
}
