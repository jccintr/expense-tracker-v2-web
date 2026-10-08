import { Button, Modal, ModalBody, ModalHeader } from 'flowbite-react';

// Modal de confirmação genérico — usado antes de excluir categoria/tarefa,
// pra evitar clique acidental numa ação destrutiva.
export default function ConfirmModal({
  show,
  title,
  message,
  confirmLabel = 'Confirmar',
  confirmColor = 'red',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal show={show} onClose={onCancel} size="md">
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <p className="text-sm text-text-soft">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button color="light" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button color={confirmColor} onClick={onConfirm} isProcessing={loading} disabled={loading}>
            {confirmLabel}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}
