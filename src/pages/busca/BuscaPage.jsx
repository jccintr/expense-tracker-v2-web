import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Label, Select, Spinner, TextInput } from 'flowbite-react';
import { HiOutlineChevronLeft } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/DataContext';
import { deleteTransaction, searchTransactions } from '../../api/transactionsApi';
import { todayDateString } from '../../utils/date';
import { formatMoney } from '../../utils/money';
import ConfirmModal from '../../components/ConfirmModal';
import TransactionFormModal from '../../components/TransactionFormModal';
import TransactionRow from '../../components/TransactionRow';

export default function BuscaPage() {
  const { token } = useAuth();
  const { accounts, categories } = useAppData();

  const [description, setDescription] = useState('');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');

  const [results, setResults] = useState(null); // null = ainda não buscou
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const search = async () => {
    if (minDate && maxDate && minDate > maxDate) {
      setError('A data inicial deve ser anterior (ou igual) à data final.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await searchTransactions(
        { description: description.trim(), minDate, maxDate, categoryId, accountId },
        token
      );
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    search();
  };

  const handleSaved = () => {
    setEditing(null);
    search(); // refaz a busca com os mesmos filtros pra refletir a edição
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
      setResults((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      closeDelete();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const total = (results ?? []).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const today = todayDateString();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link
          to="/transacoes"
          className="rounded-lg p-2 text-text-soft transition-colors hover:bg-surface-alt hover:text-text"
          aria-label="Voltar para Transações"
          title="Voltar"
        >
          <HiOutlineChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-text">Buscar transações</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <Label htmlFor="search-description">Descrição</Label>
          <TextInput
            id="search-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Buscar por descrição"
          />
        </div>

        <div>
          <Label htmlFor="search-min-date">Data inicial</Label>
          <TextInput
            id="search-min-date"
            type="date"
            value={minDate}
            max={maxDate || today}
            onChange={(e) => setMinDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="search-max-date">Data final</Label>
          <TextInput
            id="search-max-date"
            type="date"
            value={maxDate}
            min={minDate || undefined}
            max={today}
            onChange={(e) => setMaxDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="search-category">Categoria</Label>
          <Select id="search-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="search-account">Conta</Label>
          <Select id="search-account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            <option value="">Todas as contas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-soft">Sem período definido, a busca considera o ano atual.</p>
          <Button
            type="submit"
            isProcessing={loading}
            disabled={loading}
            className="bg-primary! dark:bg-primary! text-primary-ink! enabled:hover:opacity-90"
          >
            Buscar
          </Button>
        </div>
      </form>

      {error && <Alert color="failure">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="xl" />
        </div>
      ) : results === null ? (
        !error && <p className="py-6 text-center text-sm text-text-soft">Defina os filtros e clique em "Buscar".</p>
      ) : results.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-soft">Nenhuma transação encontrada.</p>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3">
            <span className="text-sm text-text-soft">
              {results.length} {results.length === 1 ? 'transação' : 'transações'}
            </span>
            <span className="text-lg font-extrabold text-expense">{formatMoney(total)}</span>
          </div>
          <div className="flex flex-col gap-2">
            {results.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                showDate
                onEdit={setEditing}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        </>
      )}

      <TransactionFormModal
        show={Boolean(editing)}
        transaction={editing}
        onClose={() => setEditing(null)}
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
