import { X } from 'lucide-react';
import type { MealType } from '../../lib/dummyData';
import styles from './SubmitConfirmModal.module.css';

interface SubmitConfirmModalProps {
  open: boolean;
  mealType: MealType;
  dateLabel: string;
  timeLabel: string;
  items: { name: string; kcal: string }[];
  totalKcal: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SubmitConfirmModal({ open, mealType, dateLabel, timeLabel, items, totalKcal, onConfirm, onCancel }: SubmitConfirmModalProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onCancel} aria-label="Close">
          <X size={18} strokeWidth={2.2} />
        </button>

        <span className={styles.title}>Confirm entry</span>

        <div className={styles.metaRow}>
          <div className={styles.mealBadge}>{mealType}</div>
          <span className={styles.dateTime}>{dateLabel} · {timeLabel}</span>
        </div>

        <div className={styles.itemList}>
          {items.map((item, i) => (
            <div className={styles.itemRow} key={i}>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemKcal}>{item.kcal} kcal</span>
            </div>
          ))}
        </div>

        <div className={styles.totalRow}>
          <span>Total</span>
          <span>{totalKcal.toLocaleString('en-US')} kcal</span>
        </div>

        <button className={styles.confirmButton} onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  );
}
