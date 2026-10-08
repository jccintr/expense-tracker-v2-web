import { useEffect, useState } from 'react';
import { Alert, Spinner } from 'flowbite-react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { fetchCategorySummary, fetchWeekSummary } from '../../api/transactionsApi';
import { MONTH_NAMES, currentMonthYearSP, formatDateBR, getCurrentServerWeekNumber } from '../../utils/date';
import { formatMoney } from '../../utils/money';
import MonthlyPieChart from '../../components/MonthlyPieChart';
import WeeklyBarChart from '../../components/WeeklyBarChart';

const navButtonClass =
  'rounded-lg p-2 text-text transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:text-border disabled:hover:bg-transparent';

function ModeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        active ? 'bg-primary text-primary-ink' : 'text-text hover:bg-surface'
      }`}
    >
      {children}
    </button>
  );
}

export default function GraficosPage() {
  const { token } = useAuth();

  const [mode, setMode] = useState('week'); // 'week' | 'month'

  // As transações só nascem "agora" (a API não aceita data), então não existe
  // semana/mês futuro com dados: a navegação pra frente para no atual.
  const [currentWeek] = useState(getCurrentServerWeekNumber);
  const [currentPeriod] = useState(currentMonthYearSP);

  const [weekNumber, setWeekNumber] = useState(currentWeek);
  const [weekData, setWeekData] = useState(null);
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [weekError, setWeekError] = useState('');

  const [month, setMonth] = useState(currentPeriod.month);
  const [year, setYear] = useState(currentPeriod.year);
  const [monthData, setMonthData] = useState(null);
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [monthError, setMonthError] = useState('');

  useEffect(() => {
    if (mode !== 'week') return undefined;
    let cancelled = false;
    setLoadingWeek(true);
    setWeekError('');
    // week_number sempre explícito: o default do servidor calcula a semana errada.
    fetchWeekSummary(weekNumber, token)
      .then((data) => !cancelled && setWeekData(data))
      .catch((err) => !cancelled && setWeekError(err.message))
      .finally(() => !cancelled && setLoadingWeek(false));
    return () => {
      cancelled = true;
    };
  }, [mode, weekNumber, token]);

  useEffect(() => {
    if (mode !== 'month') return undefined;
    let cancelled = false;
    setLoadingMonth(true);
    setMonthError('');
    fetchCategorySummary(month, year, token)
      .then((data) => !cancelled && setMonthData(data))
      .catch((err) => !cancelled && setMonthError(err.message))
      .finally(() => !cancelled && setLoadingMonth(false));
    return () => {
      cancelled = true;
    };
  }, [mode, month, year, token]);

  const goPrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const weekNextDisabled = weekNumber >= currentWeek;
  const monthNextDisabled = year * 12 + month >= currentPeriod.year * 12 + currentPeriod.month;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-text">Gráficos</h1>

      <div className="flex gap-1 rounded-xl bg-surface-alt p-1" role="group" aria-label="Período do gráfico">
        <ModeButton active={mode === 'week'} onClick={() => setMode('week')}>
          Semana
        </ModeButton>
        <ModeButton active={mode === 'month'} onClick={() => setMode('month')}>
          Mês
        </ModeButton>
      </div>

      {mode === 'week' ? (
        <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWeekNumber((w) => Math.max(1, w - 1))}
              disabled={weekNumber <= 1}
              className={navButtonClass}
              aria-label="Semana anterior"
            >
              <HiOutlineChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-bold text-text">
              {weekData ? `${formatDateBR(weekData.first_day)} — ${formatDateBR(weekData.last_day)}` : '...'}
            </span>
            <button
              type="button"
              onClick={() => setWeekNumber((w) => w + 1)}
              disabled={weekNextDisabled}
              className={navButtonClass}
              aria-label="Próxima semana"
            >
              <HiOutlineChevronRight className="h-5 w-5" />
            </button>
          </div>

          {weekError && <Alert color="failure" className="mb-3">{weekError}</Alert>}

          {loadingWeek ? (
            <div className="flex justify-center py-16">
              <Spinner size="xl" />
            </div>
          ) : (
            <>
              <p className="mb-4 text-center text-2xl font-extrabold text-expense">
                {formatMoney(weekData?.total_amount ?? 0)}
              </p>
              <WeeklyBarChart weekDays={weekData?.week_days ?? []} />
            </>
          )}
        </section>
      ) : (
        <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={goPrevMonth} className={navButtonClass} aria-label="Mês anterior">
              <HiOutlineChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-bold text-text">
              {MONTH_NAMES[month - 1]} de {year}
            </span>
            <button
              type="button"
              onClick={goNextMonth}
              disabled={monthNextDisabled}
              className={navButtonClass}
              aria-label="Próximo mês"
            >
              <HiOutlineChevronRight className="h-5 w-5" />
            </button>
          </div>

          {monthError && <Alert color="failure" className="mb-3">{monthError}</Alert>}

          {loadingMonth ? (
            <div className="flex justify-center py-16">
              <Spinner size="xl" />
            </div>
          ) : (
            <>
              <p className="mb-4 text-center text-2xl font-extrabold text-expense">
                {formatMoney(monthData?.total_amount ?? 0)}
              </p>
              <MonthlyPieChart categories={monthData?.categories ?? []} />
            </>
          )}
        </section>
      )}
    </div>
  );
}
