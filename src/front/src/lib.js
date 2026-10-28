export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

const cssVar = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

// Opções do SweetAlert2 acompanhando o tema atual (claro/escuro)
export function alertTheme(extra = {}) {
  return {
    background: cssVar("--surface", "#0f1722"),
    color: cssVar("--ink", "#eaf1f6"),
    confirmButtonColor: cssVar("--accent", "#a1ffcb"),
    cancelButtonColor: cssVar("--surface-2", "#172230"),
    ...extra
  };
}

export function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // sem armazenamento: o tema vale só nesta sessão
  }
}
