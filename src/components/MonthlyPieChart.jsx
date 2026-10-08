import { formatMoney } from '../utils/money';

const SIZE = 180;
const RADIUS = SIZE / 2;
const CENTER = SIZE / 2;
const PALETTE_SIZE = 8; // --chart-1 ... --chart-8 em index.css

// Converte ângulo (graus, 0 = topo, sentido horário) num ponto na borda do
// círculo — matemática padrão de SVG pie chart.
function polarPoint(angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + RADIUS * Math.cos(angleRad), y: CENTER + RADIUS * Math.sin(angleRad) };
}

function describeSlice(startAngle, endAngle) {
  const start = polarPoint(endAngle);
  const end = polarPoint(startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

const percent = (amount, total) => `${((amount / total) * 100).toFixed(1).replace('.', ',')}%`;

export default function MonthlyPieChart({ categories }) {
  const items = categories.map((c, i) => ({
    name: c.category,
    amount: Number(c.total_amount) || 0,
    color: `var(--chart-${(i % PALETTE_SIZE) + 1})`,
  }));
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  if (total <= 0) {
    return (
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-44 w-44" aria-hidden="true">
          <circle cx={CENTER} cy={CENTER} r={RADIUS} style={{ fill: 'var(--color-surface-alt)' }} />
        </svg>
        <p className="text-sm text-text-soft">Nenhum gasto neste mês.</p>
      </div>
    );
  }

  const visible = items.filter((item) => item.amount > 0);
  let cumulativeAngle = 0;
  const slices = visible.map((item) => {
    const angle = (item.amount / total) * 360;
    const slice = { ...item, path: describeSlice(cumulativeAngle, cumulativeAngle + angle) };
    cumulativeAngle += angle;
    return slice;
  });

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-44 w-44" role="img" aria-label="Gastos do mês por categoria">
        {visible.length === 1 ? (
          // Uma categoria com 100%: o arco de 0° a 360° começa e termina no
          // mesmo ponto e o path não desenharia nada — usa um círculo inteiro.
          <circle cx={CENTER} cy={CENTER} r={RADIUS} style={{ fill: visible[0].color }}>
            <title>{`${visible[0].name}: ${formatMoney(visible[0].amount)}`}</title>
          </circle>
        ) : (
          slices.map((slice, i) => (
            <path key={i} d={slice.path} style={{ fill: slice.color, stroke: 'var(--color-surface)', strokeWidth: 1.5 }}>
              <title>{`${slice.name}: ${formatMoney(slice.amount)} (${percent(slice.amount, total)})`}</title>
            </path>
          ))
        )}
      </svg>

      <ul className="w-full divide-y divide-border rounded-lg border border-border">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
            <span className="min-w-0 flex-1 truncate font-semibold text-text">{item.name}</span>
            <span className="shrink-0 text-xs text-text-soft">{item.amount > 0 ? percent(item.amount, total) : '—'}</span>
            <span className="w-28 shrink-0 text-right text-text-soft">{formatMoney(item.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
