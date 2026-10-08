import { useState } from 'react';
import { Alert, Button, Spinner } from 'flowbite-react';
import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import ConfirmModal from './ConfirmModal';
import NameFormModal from './NameFormModal';

// Tela de lista com criar/editar/excluir para entidades que só têm "nome"
// (Contas e Categorias). O 409 da API (entidade com transações vinculadas) é
// tratado com mensagem própria, mais clara que o texto técnico do servidor.
export default function EntityListPage({
  title,
  items,
  loading,
  loadError,
  emptyText,
  formLabels,
  deleteLabels,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const openCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmit = async (name) => {
    if (editingItem) await onUpdate(editingItem.id, name);
    else await onCreate(name);
    setFormOpen(false);
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await onDelete(deleteTarget.id);
      closeDelete();
    } catch (err) {
      // Não fecha o modal: a pessoa lê o motivo antes de ele sumir.
      setDeleteError(err.status === 409 ? deleteLabels.blocked : err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text">{title}</h1>
        <Button onClick={openCreate} className="bg-primary! dark:bg-primary! text-primary-ink! enabled:hover:opacity-90">
          <HiOutlinePlus className="mr-1.5 h-4 w-4" />
          {formLabels.createButton}
        </Button>
      </div>

      {loadError && <Alert color="failure">{loadError}</Alert>}

      {loading && items.length === 0 ? (
        <div className="flex justify-center py-16">
          <Spinner size="xl" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-soft">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3.5"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">{item.name}</span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="rounded-lg p-2 text-text-soft transition-colors hover:bg-surface-alt hover:text-text"
                  title="Editar"
                  aria-label={`Editar ${item.name}`}
                >
                  <HiOutlinePencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError('');
                    setDeleteTarget(item);
                  }}
                  className="rounded-lg p-2 text-text-soft transition-colors hover:bg-surface-alt hover:text-danger"
                  title="Excluir"
                  aria-label={`Excluir ${item.name}`}
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NameFormModal
        show={formOpen}
        item={editingItem}
        labels={formLabels}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title={deleteLabels.title}
        message={deleteError || `Excluir "${deleteTarget?.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}
