import { DUMMY_CATEGORIES } from '../../lib/dummyData';
import styles from './CategorySheet.module.css';

interface CategorySheetProps {
  open: boolean;
  activeLabel: string;
  onClose: () => void;
  onSelect: (label: string) => void;
}

export function CategorySheet({ open, activeLabel, onClose, onSelect }: CategorySheetProps) {
  if (!open) return null;

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <span className={styles.title}>Choose deficit category</span>
        <div className={styles.list}>
          {DUMMY_CATEGORIES.map((opt) => {
            const active = opt.label === activeLabel;
            return (
              <button
                key={opt.label}
                className={styles.option}
                style={active ? { outline: '2px solid var(--color-primary)', outlineOffset: '-2px' } : undefined}
                onClick={() => onSelect(opt.label)}
              >
                <div className={styles.optionRow}>
                  <span className={styles.optionLabel}>{opt.label}</span>
                  <span className={styles.optionKcal} style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                    {opt.kcal.toLocaleString('en-US')} kcal
                  </span>
                </div>
                <span className={styles.optionDesc}>{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
