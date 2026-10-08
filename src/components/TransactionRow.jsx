import { HiOutlineTrash } from 'react-icons/hi';
import { formatMoney } from '../utils/money';
import { formatDateTimeBR, formatTimeBR } from '../utils/date';

// Linha de transação. Na tela de Transações (um dia só) a data já está na barra
// de navegação, então só o horário aparece; na Busca (`showDate`) os resultados
// vêm de dias diferentes, então data e hora completas aparecem em cada linha.
export default function TransactionRow({ transaction, showDate = false, onEdit, onDelete }) {
  const when = showDate ? formatDateTimeBR(transaction.createdAt) : formatTimeBR(transaction.createdAt);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface transition-colors hover:border-primary/40">
      <button
        type="button"
        onClick={() => onEdit(transaction)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left"
        title="Editar transação"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-text">{transaction.description}</span>
          <span className="block truncate text-xs text-text-soft">
            {when} · {transaction.category?.name} · {transaction.account?.name}
          </span>
        </span>
        <span className="shrink-0 text-sm font-bold text-expense">{formatMoney(transaction.amount)}</span>
      </button>
      <button
        type="button"
        onClick={() => onDelete(transaction)}
        className="mr-2 shrink-0 rounded-lg p-2 text-text-soft transition-colors hover:bg-surface-alt hover:text-danger"
        title="Excluir transação"
        aria-label={`Excluir ${transaction.description}`}
      >
        <HiOutlineTrash className="h-4 w-4" />
      </button>
    </div>
  );
}
