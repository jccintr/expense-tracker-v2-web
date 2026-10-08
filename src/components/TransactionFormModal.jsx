import { useEffect, useState } from 'react';
import { Alert, Button, Label, Modal, ModalBody, ModalHeader, Select, TextInput } from 'flowbite-react';
import { createTransaction, updateTransaction } from '../api/transactionsApi';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/DataContext';
import { amountToInput, parseAmountInput } from '../utils/money';

// `transaction` null = criar; objeto = editar. `onSaved(isEdit)` roda depois
// do sucesso — quem abriu o modal decide fechar e recarregar a lista.
export default function TransactionFormModal({ show, transaction, onClose, onSaved }) {
  const { token } = useAuth();
  const { accounts, categories } = useAppData();
  const isEdit = Boolean(transaction);

  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reseta o formulário toda vez que o modal abre — sem isso, editar uma
  // transação e depois abrir "Nova transação" mostraria os dados da anterior.
  useEffect(() => {
    if (show) {
      setDescription(transaction?.description ?? '');
      setAmountText(transaction ? amountToInput(transaction.amount) : '');
      setCategoryId(transaction?.category?.id != null ? String(transaction.category.id) : '');
      setAccountId(transaction?.account?.id != null ? String(transaction.account.id) : '');
      setError('');
    }
  }, [show, transaction]);

  const missingLists = accounts.length === 0 || categories.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseAmountInput(amountText);

    // Mesmas regras do servidor (createTransactionValidator): descrição com 3+
    // caracteres, valor >= 0,01, categoria e conta obrigatórias.
    if (description.trim().length < 3) {
      setError('Descreva a transação (pelo menos 3 caracteres).');
      return;
    }
    if (!Number.isFinite(amount) || amount < 0.01) {
      setError('Informe um valor maior que zero.');
      return;
    }
    if (!categoryId) {
      setError('Selecione uma categoria.');
      return;
    }
    if (!accountId) {
      setError('Selecione uma conta.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        description: description.trim(),
        amount,
        categoryId: Number(categoryId),
        accountId: Number(accountId),
      };
      if (isEdit) {
        await updateTransaction(transaction.id, payload, token);
      } else {
        await createTransaction(payload, token);
      }
      onSaved(isEdit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="md">
      <ModalHeader>{isEdit ? 'Editar transação' : 'Nova transação'}</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {!isEdit && (
            <p className="rounded-lg bg-surface-alt px-3 py-2 text-xs text-text-soft">
              A transação é sempre criada com a data/hora de agora, não é possível cadastrar com datas passadas.
            </p>
          )}

          {missingLists && (
            <Alert color="warning">Cadastre ao menos uma conta e uma categoria antes de criar transações.</Alert>
          )}
          {error && <Alert color="failure">{error}</Alert>}

          <div>
            <Label htmlFor="tx-description">Descrição</Label>
            <TextInput
              id="tx-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Almoço"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="tx-amount">Valor</Label>
            <TextInput
              id="tx-amount"
              addon="R$"
              inputMode="decimal"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor="tx-category">Categoria</Label>
            <Select id="tx-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Selecione a categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="tx-account">Conta</Label>
            <Select id="tx-account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Selecione a conta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" color="light" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isProcessing={loading}
              disabled={loading}
              className="bg-primary! dark:bg-primary! text-primary-ink! enabled:hover:opacity-90"
            >
              {isEdit ? 'Salvar alterações' : 'Criar transação'}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
