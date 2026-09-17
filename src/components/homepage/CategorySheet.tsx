import styles from './CategorySheet.module.css';

// Deskripsi tiap kategori TETAP teks statis (bukan data dari BE — backend cuma expose nama+kcal,
// deskripsi copy ini murni UI, gak pernah berubah per user). Urutan render tetap konsisten
// (Recovery/Soft/Mid/Hard) walau `categoryLimits` dari API bisa berbeda urutan key JSON-nya.
const CATEGORY_ORDER = ['Recovery', 'Soft', 'Mid', 'Hard'];
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Recovery: 'Maintenance — no deficit, ideal for rest or recovery periods.',
  Soft: 'Gentle, sustainable deficit for steady progress.',
  Mid: 'Balanced deficit for faster results.',
  Hard: 'Aggressive deficit — short-term use only.',
};

interface CategorySheetProps {
  open: boolean;
  activeLabel: string;
  categoryLimits: Record<string, number>;
  onClose: () => void;
  onSelect: (label: string) => void;
}

export function CategorySheet({ open, activeLabel, categoryLimits, onClose, onSelect }: CategorySheetProps) {
  if (!open) return null;

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <span className={styles.title}>Choose deficit category</span>
        <div className={styles.list}>
          {CATEGORY_ORDER.filter((label) => label in categoryLimits).map((label) => {
            const active = label === activeLabel;
            const kcal = categoryLimits[label];
            return (
              <button
                key={label}
                className={styles.option}
                style={active ? { outline: '2px solid var(--color-primary)', outlineOffset: '-2px' } : undefined}
                onClick={() => onSelect(label)}
              >
                <div className={styles.optionRow}>
                  <span className={styles.optionLabel}>{label}</span>
                  <span className={styles.optionKcal} style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                    {Math.round(kcal).toLocaleString('en-US')} kcal
                  </span>
                </div>
                <span className={styles.optionDesc}>{CATEGORY_DESCRIPTIONS[label]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
