import { apiClient } from './client';

// GET /transactions?data=AAAA-MM-DD — transações de UM dia (a API filtra em
// horário de São Paulo; monte a string com formatDateSP/todayDateString de
// utils/date.js). Sem `data` a API devolveria TODAS as transações do usuário,
// por isso esta função sempre exige um dateStr.
export function listTransactionsByDay(dateStr, token) {
  return apiClient.get(`/transactions?data=${dateStr}`, token);
}

// POST /transactions — cria SEMPRE com a data/hora atual do servidor: o
// validator só aceita description/amount/category_id/account_id, então não dá
// pra cadastrar transação retroativa/futura. Quem chama deve levar a
// navegação de volta pra hoje depois (ver TransacoesPage).
export function createTransaction({ description, amount, categoryId, accountId }, token) {
  return apiClient.post(
    '/transactions',
    { description, amount, category_id: categoryId, account_id: accountId },
    token
  );
}

// PUT /transactions/:id — edita em cima (não move de dia; createdAt não muda).
export function updateTransaction(id, { description, amount, categoryId, accountId }, token) {
  return apiClient.put(
    `/transactions/${id}`,
    { description, amount, category_id: categoryId, account_id: accountId },
    token
  );
}

export function deleteTransaction(id, token) {
  return apiClient.delete(`/transactions/${id}`, token);
}

// GET /transactions/search — filtros todos opcionais. minDate/maxDate em
// AAAA-MM-DD; sem eles a API usa o ano corrente inteiro. categoryId/accountId
// filtram por id exato.
export function searchTransactions({ description, minDate, maxDate, categoryId, accountId }, token) {
  const params = new URLSearchParams();
  if (description) params.set('description', description);
  if (minDate) params.set('minDate', minDate);
  if (maxDate) params.set('maxDate', maxDate);
  if (categoryId) params.set('category', categoryId);
  if (accountId) params.set('account', accountId);
  const qs = params.toString();
  return apiClient.get(`/transactions/search${qs ? `?${qs}` : ''}`, token);
}

// GET /transactions/summary/week?week_number=N — SEMPRE passe week_number
// explícito (getCurrentServerWeekNumber() ±1 de utils/date.js): o default do
// servidor calcula a semana errada.
export function fetchWeekSummary(weekNumber, token) {
  return apiClient.get(`/transactions/summary/week?week_number=${weekNumber}`, token);
}

// GET /transactions/summary/category?month=M&year=Y — total gasto por
// categoria no mês. month é 1-12.
export function fetchCategorySummary(month, year, token) {
  return apiClient.get(`/transactions/summary/category?month=${month}&year=${year}`, token);
}
