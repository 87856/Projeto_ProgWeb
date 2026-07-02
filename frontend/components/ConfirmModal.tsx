"use client";

// =====================================================================
//  ConfirmModal.tsx — Modal genérico de confirmação (apagar, etc.)
// =====================================================================

import { Modal, Button } from "react-bootstrap";

interface Props {
  show: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  show,
  title = "Confirmar acção",
  message,
  confirmLabel = "Confirmar",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
