import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, message, confirmLabel, confirmVariant = 'primary', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <span className={styles.message}>{message}</span>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
          <button
            className={styles.confirmButton}
            style={{ background: confirmVariant === 'destructive' ? 'oklch(50% 0.18 30)' : 'var(--color-accent)' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
