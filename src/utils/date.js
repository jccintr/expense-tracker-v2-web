// Utilitários de data. Dois cuidados que existem por causa de como a API
// (api-expense-tracker-adonis) realmente se comporta — mesmos do app Android:
//
// 1. O filtro por dia (`GET /transactions?data=AAAA-MM-DD`) é ancorado em
//    horário de São Paulo (a query SQL faz
//    `created_at AT TIME ZONE 'America/Sao_Paulo'`), não UTC e não o fuso
//    do navegador. O Brasil não tem horário de verão desde 2019, então
//    América/São_Paulo é um offset fixo de UTC-3 o ano inteiro — dá pra
//    calcular com aritmética simples, sem lib de fuso horário. Se o Brasil
//    voltar a ter horário de verão, isto precisa ser revisto.
//
// 2. O `week_number` default de `/transactions/summary/week` (quando o
//    parâmetro é omitido) calcula a semana ERRADA (devolve a que vem, não a
//    atual). Por isso nunca deixamos a API escolher: calculamos o
//    week_number no cliente, replicando a lógica pura de getWeekRange() do
//    servidor, e mandamos sempre explícito.

const SAO_PAULO_OFFSET_MS = -3 * 60 * 60 * 1000; // UTC-3, fixo (sem DST)
const DAY_MS = 86400000;

// Converte um Date (instante real) no "Date de calendário" equivalente em
// América/São_Paulo — os getters UTC do resultado já refletem dia/mês/ano de
// SP, independente do fuso do navegador.
function toSaoPauloCalendarDate(date) {
  return new Date(date.getTime() + SAO_PAULO_OFFSET_MS);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

// 'AAAA-MM-DD' de um Date, no calendário de São Paulo — formato que
// `GET /transactions?data=` espera.
export function formatDateSP(date) {
  const sp = toSaoPauloCalendarDate(date);
  return `${sp.getUTCFullYear()}-${pad2(sp.getUTCMonth() + 1)}-${pad2(sp.getUTCDate())}`;
}

// Hoje ('AAAA-MM-DD') no calendário de São Paulo.
export function todayDateString() {
  return formatDateSP(new Date());
}

// Soma (ou subtrai, com n negativo) dias a uma data 'AAAA-MM-DD'. Meio-dia
// UTC evita qualquer risco de a soma cruzar sozinha uma borda de fuso.
export function addDaysToDateString(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  base.setUTCDate(base.getUTCDate() + n);
  return `${base.getUTCFullYear()}-${pad2(base.getUTCMonth() + 1)}-${pad2(base.getUTCDate())}`;
}

export function isFutureDateString(dateStr) {
  return dateStr > todayDateString();
}

export function isTodayDateString(dateStr) {
  return dateStr === todayDateString();
}

const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Label amigável: "Hoje", "Ontem", "Amanhã" ou "seg, 12 de out".
export function formatDayLabel(dateStr) {
  const today = todayDateString();
  if (dateStr === today) return 'Hoje';
  if (dateStr === addDaysToDateString(today, -1)) return 'Ontem';
  if (dateStr === addDaysToDateString(today, 1)) return 'Amanhã';

  const [y, m, d] = dateStr.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return `${WEEKDAYS_SHORT[base.getUTCDay()]}, ${d} de ${MONTHS_SHORT[m - 1]}`;
}

// ===== Semana (gráfico de barras semanal) =====
//
// Replica EXATAMENTE getWeekRange(weekNumber) do servidor
// (transactions_controller.ts): dado um weekNumber, a segunda-feira da
// semana correspondente. Essa função pura está correta no servidor — só o
// valor default que ele escolhe sozinho é que erra.
function getWeekRangeLikeServer(weekNumber, year) {
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
  const refDate = new Date(firstDayOfYear.getTime() + (weekNumber - 1) * 7 * DAY_MS);

  const dayOfWeek = refDate.getUTCDay(); // 0=dom...6=sáb
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const firstDay = new Date(refDate);
  firstDay.setUTCDate(refDate.getUTCDate() - mondayOffset);

  return `${firstDay.getUTCFullYear()}-${pad2(firstDay.getUTCMonth() + 1)}-${pad2(firstDay.getUTCDate())}`;
}

// week_number (no esquema do PRÓPRIO servidor) da semana que contém a data
// 'AAAA-MM-DD'. Conta quantos blocos de 7 dias separam a segunda-feira da
// semana 1 do ano da segunda-feira da semana que contém a data — relação
// linear e exata, já que o servidor soma semanas inteiras a cada +1.
export function getServerWeekNumberForDate(targetDateStr) {
  const [y, m, d] = targetDateStr.split('-').map(Number);

  const week1Monday = new Date(`${getWeekRangeLikeServer(1, y)}T12:00:00Z`);

  const target = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dow = target.getUTCDay();
  const mondayOffset = dow === 0 ? 6 : dow - 1;
  const targetMonday = new Date(target);
  targetMonday.setUTCDate(target.getUTCDate() - mondayOffset);

  const diffDays = Math.round((targetMonday.getTime() - week1Monday.getTime()) / DAY_MS);
  return 1 + Math.round(diffDays / 7);
}

export function getCurrentServerWeekNumber() {
  return getServerWeekNumberForDate(todayDateString());
}

// 'AAAA-MM-DD' -> 'DD-MM-AAAA' (só para EXIBIR; o que vai pra API e fica em
// estado continua em AAAA-MM-DD).
export function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}-${m}-${y}`;
}

// 'HH:mm' de um timestamp ISO (o createdAt de cada transação), em SP.
export function formatTimeBR(isoString) {
  if (!isoString) return '';
  const sp = toSaoPauloCalendarDate(new Date(isoString));
  return `${pad2(sp.getUTCHours())}:${pad2(sp.getUTCMinutes())}`;
}

// 'DD-MM-AAAA HH:mm' de um timestamp ISO, em SP (resultados de busca vêm de
// dias diferentes, então a data completa precisa aparecer em cada linha).
export function formatDateTimeBR(isoString) {
  if (!isoString) return '';
  return `${formatDateBR(formatDateSP(new Date(isoString)))} ${formatTimeBR(isoString)}`;
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// Mês (1-12) e ano atuais no calendário de São Paulo.
export function currentMonthYearSP() {
  const [y, m] = todayDateString().split('-').map(Number);
  return { month: m, year: y };
}
