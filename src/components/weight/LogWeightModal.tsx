import { useState } from 'react';
import { ArrowLeft, Calendar, Minus, Plus } from 'lucide-react';
import { DUMMY_CURRENT_WEIGHT, DUMMY_HAS_LOGGED_WEIGHT_TODAY, DUMMY_TODAY_LABEL } from '../../lib/dummyData';
import styles from './LogWeightModal.module.css';

interface LogWeightModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (weight: number) => void;
}

function round1Decimal(value: number): number {
  return Math.round(value * 100) / 100;
}

export function LogWeightModal({ open, onClose, onSave }: LogWeightModalProps) {
  const [weight, setWeight] = useState(DUMMY_CURRENT_WEIGHT);
  const [rawInput, setRawInput] = useState<string | undefined>(undefined);

  if (!open) return null;

  const title = DUMMY_HAS_LOGGED_WEIGHT_TODAY ? "Update today's weight" : "Log today's weight";
  const displayValue = rawInput !== undefined ? rawInput : weight.toFixed(2);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawInput(e.target.value.replace(/[^0-9.]/g, ''));
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(rawInput ?? '');
    if (!isNaN(parsed)) {
      setWeight(round1Decimal(parsed));
    }
    setRawInput(undefined);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onClose} aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.stepperRow}>
          <button
            className={styles.stepperButton}
            onClick={() => setWeight((w) => round1Decimal(w - 0.1))}
            aria-label="Decrease weight"
          >
            <Minus size={22} strokeWidth={2.4} />
          </button>
          <div className={styles.valueColumn}>
            <input
              className={styles.valueInput}
              value={displayValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              inputMode="decimal"
            />
            <span className={styles.unit}>kg</span>
          </div>
          <button
            className={styles.stepperButton}
            onClick={() => setWeight((w) => round1Decimal(w + 0.1))}
            aria-label="Increase weight"
          >
            <Plus size={22} strokeWidth={2.4} />
          </button>
        </div>

        <div className={styles.dateField}>
          <Calendar size={14} strokeWidth={2} color="var(--color-accent)" style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
          {DUMMY_TODAY_LABEL}
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
        <button className={styles.saveButton} onClick={() => onSave(weight)}>Save</button>
      </div>
    </div>
  );
}
