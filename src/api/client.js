const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://expense-tracker-adonis.up.railway.app').replace(/\/$/, '');

// Essa API (AdonisJS) não é consistente no formato de erro entre endpoints —
// são 3 formatos:
//   1. Validação (VineJS) / token inválido: { errors: [ { message, field?, rule? } ] }
//   2. Exceções customizadas (403/404/409 de accounts/categories/transactions):
//      { error: 'texto curto', message: 'texto mais específico' }
//   3. Erros simples direto no controller: { error: 'texto' }  — sem message
// Esta função tenta os 3 nessa ordem de prioridade.
function extractErrorMessage(data, fallback) {
  if (data?.errors?.[0]?.message) return data.errors[0].message;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return fallback;
}

// Quem cuida da sessão (AuthContext) registra aqui o que fazer quando a API
// responde 401 com um token enviado — assim um token expirado/revogado no
// meio do uso leva ao login, em vez de cada tela mostrar um erro solto.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch rejeitou: falha de rede de verdade (error.status fica undefined).
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet.');
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const httpError = new Error(extractErrorMessage(data, `Erro inesperado (${response.status}).`));
    // Permite distinguir falha de rede (sem status) de erro HTTP — sem isso,
    // um 500/cold start do servidor seria tratado como "sem conexão".
    httpError.status = response.status;
    if (response.status === 401 && token && unauthorizedHandler) unauthorizedHandler();
    throw httpError;
  }

  return data;
}

export const apiClient = {
  get: (path, token) => request(path, { method: 'GET', token }),
  post: (path, body, token) => request(path, { method: 'POST', body, token }),
  // A API usa PUT pra update em accounts/categories/transactions — não existe
  // rota PATCH. Não crie um método patch aqui por hábito dos outros apps.
  put: (path, body, token) => request(path, { method: 'PUT', body, token }),
  delete: (path, token) => request(path, { method: 'DELETE', token }),
};
