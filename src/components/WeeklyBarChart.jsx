import { formatDateBR } from '../utils/date';
import { formatMoney } from '../utils/money';

// day_of_week 0 = segunda ... 6 = domingo (como a API devolve em week_days).
const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const SLOT = 56;
const BAR_WIDTH = 32;
const CHART_HEIGHT = 160;
const LABELS_HEIGHT = 38;

// Gráfico de barras da semana em SVG responsivo (viewBox + w-full). As cores
// vêm de CSS vars do tema, então trocam sozinhas entre claro e escuro. A lista
// abaixo repete os valores em texto: o tooltip do SVG não aparece no toque e
// leitores de tela não leem as barras.
export default function WeeklyBarChart({ weekDays }) {
  const amounts = weekDays.map((d) => Number(d.total_amount) || 0);
  const max = Math.max(1, ...amounts);
  const width = Math.max(weekDays.length, 1) * SLOT;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT + LABELS_HEIGHT}`}
        className="mx-auto w-full max-w-md"
        role="img"
        aria-label="Gastos por dia da semana"
      >
        {weekDays.map((day, i) => {
          const amount = amounts[i];
          const barHeight = Math.max(2, (amount / max) * CHART_HEIGHT);
          const x = i * SLOT + (SLOT - BAR_WIDTH) / 2;
          const centerX = i * SLOT + SLOT / 2;
          return (
            <g key={day.date}>
              <rect
                x={x}
                y={CHART_HEIGHT - barHeight}
                width={BAR_WIDTH}
                height={barHeight}
                rx={6}
                style={{ fill: amount > 0 ? 'var(--color-primary)' : 'var(--color-border)' }}
              >
                <title>{`${DAY_LABELS[i]}, ${formatDateBR(day.date)}: ${formatMoney(amount)}`}</title>
              </rect>
              <text
                x={centerX}
                y={CHART_HEIGHT + 17}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                style={{ fill: 'var(--color-text-soft)' }}
              >
                {DAY_LABELS[i]}
              </text>
              <text
                x={centerX}
                y={CHART_HEIGHT + 31}
                textAnchor="middle"
                fontSize="11"
                style={{ fill: 'var(--color-text-soft)' }}
              >
                {day.date.slice(8, 10)}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="mt-5 divide-y divide-border rounded-lg border border-border">
        {weekDays.map((day, i) => (
          <li key={day.date} className="flex items-center justify-between px-3 py-2 text-sm">
            <span className="text-text-soft">
              {DAY_LABELS[i]} · {formatDateBR(day.date)}
            </span>
            <span className={amounts[i] > 0 ? 'font-semibold text-text' : 'text-text-soft'}>
              {formatMoney(amounts[i])}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
