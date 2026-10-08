// Formata número pra "R$ 1.234,56". Envolvido em Number(...) de propósito —
// os endpoints de resumo fazem soma via SQL bruto, e qualquer valor vindo da
// API pode chegar como string.
export function formatMoney(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Converte o texto digitado no campo de valor pro número que a API espera.
// Aceita vírgula OU ponto como decimal, mas sem confundir um ponto DECIMAL
// ("35.90") com ponto de MILHAR ("1.234,56"): só tratamos pontos como milhar
// quando o texto também tem vírgula (aí a vírgula é inequivocamente o
// separador decimal).
export function parseAmountInput(text) {
  if (!text) return NaN;
  const trimmed = text.trim();
  const hasComma = trimmed.includes(',');
  const normalized = hasComma ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed;
  return normalized === '' ? NaN : Number(normalized);
}

// Valor vindo da API -> texto do campo de edição ("35.9" -> "35,90").
export function amountToInput(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2).replace('.', ',') : '';
}
