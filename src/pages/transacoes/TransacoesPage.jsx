import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Spinner } from 'flowbite-react';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { deleteTransaction, listTransactionsByDay } from '../../api/transactionsApi';
import {
  addDaysToDateString,
  formatDateBR,
  formatDayLabel,
  isFutureDateString,
  todayDateString,
} from '../../utils/date';
import { formatMoney } from '../../utils/money';
import ConfirmModal from '../../components/ConfirmModal';
import TransactionFormModal from '../../components/TransactionFormModal';
import TransactionRow from '../../components/TransactionRow';

const navButtonClass =
  'rounded-lg p-2 text-text transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:text-border disabled:hover:bg-transparent';

export default function TransacoesPage() {
  const { token } = useAuth();

  const [dateStr, setDateStr] = useState(todayDateString);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const pickerRef = useRef(null);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    // Navegar rápido entre dias dispara várias requisições: só a última vale.
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const data = await listTransactionsByDay(dateStr, token);
      if (id === requestId.current) setTransactions(data);
    } catch (err) {
      if (id === requestId.current) setError(err.message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [dateStr, token]);

  useEffect(() => {
    load();
  }, [load]);

  const total = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const nextDisabled = isFutureDateString(addDaysToDateString(dateStr, 1));

  const goPrevious = () => setDateStr((d) => addDaysToDateString(d, -1));
  const goNext = () => {
    if (!nextDisabled) setDateStr((d) => addDaysToDateString(d, 1));
  };

  const openPicker = () => {
    const input = pickerRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  };

  const handlePicked = (e) => {
    const picked = e.target.value; // 'AAAA-MM-DD' ('' se o usuário limpar o campo)
    if (!picked) return;
    const today = todayDateString();
    setDateStr(picked > today ? today : picked);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (transaction) => {
    setEditing(transaction);
    setFormOpen(true);
  };

  const handleSaved = (isEdit) => {
    setFormOpen(false);
    if (isEdit) {
      load();
      return;
    }
    // A API cria a transação sempre com a data/hora de agora, então volta a
    // navegação pra hoje — senão a pessoa ficaria olhando outro dia, "sem ver"
    // a transação que acabou de criar.
    const today = todayDateString();
    if (dateStr === today) load();
    else setDateStr(today);
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteTransaction(deleteTarget.id, token);
      setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      closeDelete();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-text">Transações</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/busca"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-alt"
          >
            <HiOutlineSearch className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar</span>
          </Link>
          <Button onClick={openCreate} className="bg-primary! dark:bg-primary! text-primary-ink! enabled:hover:opacity-90">
            <HiOutlinePlus className="mr-1.5 h-4 w-4" />
            Nova transação
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-2">
        <button type="button" onClick={goPrevious} className={navButtonClass} aria-label="Dia anterior">
          <HiOutlineChevronLeft className="h-5 w-5" />
        </button>

        <div className="relative flex-1">
          <button
            type="button"
            onClick={openPicker}
            className="mx-auto flex flex-col items-center rounded-lg px-4 py-1 transition-colors hover:bg-surface-alt"
            title="Escolher data"
          >
            <span className="font-bold text-text">{formatDayLabel(dateStr)}</span>
            <span className="text-xs text-text-soft">{formatDateBR(dateStr)}</span>
          </button>
          {/* Campo de data nativo, invisível, ancorado sob o rótulo: o botão acima abre o seletor. */}
          <input
            ref={pickerRef}
            type="date"
            value={dateStr}
            max={todayDateString()}
            onChange={handlePicked}
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          />
        </div>

        <button type="button" onClick={goNext} disabled={nextDisabled} className={navButtonClass} aria-label="Próximo dia">
          <HiOutlineChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3">
        <span className="text-sm text-text-soft">Total do dia</span>
        <span className="text-lg font-extrabold text-expense">{formatMoney(total)}</span>
      </div>

      {error && <Alert color="failure">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="xl" />
        </div>
      ) : transactions.length === 0 ? (
        !error && <p className="py-10 text-center text-sm text-text-soft">Nenhuma transação nesse dia.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <TransactionFormModal
        show={formOpen}
        transaction={editing}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Excluir transação"
        message={deleteError || `Excluir "${deleteTarget?.description}"?`}
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}
