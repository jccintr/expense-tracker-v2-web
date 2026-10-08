import { useEffect, useState } from 'react';
import { createCategory, deleteCategory, updateCategory } from '../../api/categoriesApi';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/DataContext';
import EntityListPage from '../../components/EntityListPage';

const formLabels = {
  createTitle: 'Nova categoria',
  editTitle: 'Editar categoria',
  field: 'Nome da categoria',
  placeholder: 'Ex: Transporte',
  createButton: 'Nova categoria',
};

const deleteLabels = {
  title: 'Excluir categoria',
  blocked: 'Não é possível excluir: existem transações vinculadas a esta categoria.',
};

export default function CategoriasPage() {
  const { token } = useAuth();
  const { categories, loading, refreshCategories } = useAppData();
  const [loadError, setLoadError] = useState('');

  // Os dados já vêm pré-carregados no login; aqui só garantimos que estão atuais.
  useEffect(() => {
    refreshCategories().catch((err) => setLoadError(err.message));
  }, [refreshCategories]);

  return (
    <EntityListPage
      title="Categorias"
      items={categories}
      loading={loading}
      loadError={loadError}
      emptyText='Nenhuma categoria ainda. Clique em "Nova categoria" pra criar a primeira.'
      formLabels={formLabels}
      deleteLabels={deleteLabels}
      onCreate={async (name) => {
        await createCategory({ name }, token);
        await refreshCategories();
      }}
      onUpdate={async (id, name) => {
        await updateCategory(id, { name }, token);
        await refreshCategories();
      }}
      onDelete={async (id) => {
        await deleteCategory(id, token);
        await refreshCategories();
      }}
    />
  );
}
