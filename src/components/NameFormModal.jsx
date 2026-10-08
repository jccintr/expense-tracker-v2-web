import { useEffect, useState } from 'react';
import { Alert, Button, Label, Modal, ModalBody, ModalHeader, TextInput } from 'flowbite-react';

// Formulário de um único campo (nome) — usado por Contas e Categorias, que têm
// a mesma regra da API (nome com pelo menos 3 caracteres). `onSubmit(name)`
// faz a chamada à API e lança erro se falhar; a mensagem aparece aqui dentro.
export default function NameFormModal({ show, item, labels, onClose, onSubmit }) {
  const isEdit = Boolean(item);

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reseta o formulário toda vez que o modal abre (senão editar A e depois
  // criar um novo mostraria o nome de A ainda preenchido).
  useEffect(() => {
    if (show) {
      setName(item?.name ?? '');
      setError('');
    }
  }, [show, item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(name.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="md">
      <ModalHeader>{isEdit ? labels.editTitle : labels.createTitle}</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && <Alert color="failure">{error}</Alert>}

          <div>
            <Label htmlFor="entity-name">{labels.field}</Label>
            <TextInput
              id="entity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={labels.placeholder}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" color="light" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isProcessing={loading}
              disabled={loading}
              className="bg-primary! dark:bg-primary! text-primary-ink! enabled:hover:opacity-90"
            >
              {isEdit ? 'Salvar alterações' : labels.createButton}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
