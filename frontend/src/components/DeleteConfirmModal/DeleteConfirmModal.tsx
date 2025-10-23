import { useRef } from "react";
import type { Game } from "../../types/types";
import styles from "./DeleteConfirmModal.module.scss";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  game: Game | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  game,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !game) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
    // Handle Enter key for confirmation
    if (e.key === "Enter" && !isDeleting) {
      onConfirm();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{ overflow: "hidden" }} // Prevent body scroll
    >
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <h3 id="modal-title" className={styles.modalTitle}>
          Confirm Delete
        </h3>
        <p id="modal-description" className={styles.modalMessage}>
          Are you sure you want to delete "{game.title}"?
          <br />
          This action cannot be undone.
        </p>
        <div className={styles.modalActions}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isDeleting}
            type="button"
          >
            Cancel
          </button>
          <button
            className={styles.deleteConfirmButton}
            onClick={onConfirm}
            disabled={isDeleting}
            type="button"
            autoFocus // Focus the primary action
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
