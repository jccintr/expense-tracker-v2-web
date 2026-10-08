import { useEffect, useState } from 'react';
import { createAccount, deleteAccount, updateAccount } from '../../api/accountsApi';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/DataContext';
import EntityListPage from '../../components/EntityListPage';

const formLabels = {
  createTitle: 'Nova conta',
  editTitle: 'Editar conta',
  field: 'Nome da conta',
  placeholder: 'Ex: Cartão Nubank',
  createButton: 'Nova conta',
};

const deleteLabels = {
  title: 'Excluir conta',
  blocked: 'Não é possível excluir: existem transações vinculadas a esta conta.',
};

export default function ContasPage() {
  const { token } = useAuth();
  const { accounts, loading, refreshAccounts } = useAppData();
  const [loadError, setLoadError] = useState('');

  // Os dados já vêm pré-carregados no login; aqui só garantimos que estão atuais.
  useEffect(() => {
    refreshAccounts().catch((err) => setLoadError(err.message));
  }, [refreshAccounts]);

  return (
    <EntityListPage
      title="Contas"
      items={accounts}
      loading={loading}
      loadError={loadError}
      emptyText='Nenhuma conta ainda. Clique em "Nova conta" pra criar a primeira.'
      formLabels={formLabels}
      deleteLabels={deleteLabels}
      onCreate={async (name) => {
        await createAccount({ name }, token);
        await refreshAccounts();
      }}
      onUpdate={async (id, name) => {
        await updateAccount(id, { name }, token);
        await refreshAccounts();
      }}
      onDelete={async (id) => {
        await deleteAccount(id, token);
        await refreshAccounts();
      }}
    />
  );
}
