import styles from './SummaryDetailModal.module.css';

export interface SummaryDetailRow {
  label: string;
  value: string;
  color?: string;
}

interface SummaryDetailModalProps {
  open: boolean;
  title: string;
  rows: SummaryDetailRow[];
  onClose: () => void;
}

export function SummaryDetailModal({ open, title, rows, onClose }: SummaryDetailModalProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>{title}</div>
        <div className={styles.rows}>
          {rows.map((row) => (
            <div className={styles.row} key={row.label}>
              <span className={styles.rowLabel}>{row.label}</span>
              <span className={styles.rowValue} style={{ color: row.color ?? 'var(--color-text-primary)' }}>{row.value}</span>
            </div>
          ))}
        </div>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
