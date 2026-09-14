// Dual-handle range slider custom (2 <input type="range"> ditumpuk, teknik umum dual-range) —
// GANTIAN dari Recharts <Brush> sebagai TAMPILAN & interaksi user (Brush Recharts tetap ada di
// ComposedChart tersembunyi, cuma jadi "mesin" auto-crop window, lihat ProgressProjection.tsx).
// Kenapa bukan CSS translate Brush ke posisi ini: jarak Brush->posisi ini dinamis (tergantung
// tinggi Legend+Narrative yg bisa berubah), CSS trick sebelumnya (nempelin Brush ke bawah CARD)
// udah cukup rapuh — makin jauh translate-nya makin gampang berantakan. Slider native ini lebih
// stabil krn independen dari struktur DOM internal Recharts.
import styles from './RangeSlider.module.css';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function RangeSlider({ min, max, value, onChange }: RangeSliderProps) {
  const [start, end] = value;
  const range = max - min || 1;
  const startPct = ((start - min) / range) * 100;
  const endPct = ((end - min) / range) * 100;

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.min(Number(e.target.value), end);
    onChange([next, end]);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.max(Number(e.target.value), start);
    onChange([start, next]);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.track} />
      <div className={styles.activeTrack} style={{ left: `${startPct}%`, right: `${100 - endPct}%` }} />
      <input
        type="range"
        min={min}
        max={max}
        value={start}
        onChange={handleStartChange}
        className={styles.input}
        aria-label="Range start"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={end}
        onChange={handleEndChange}
        className={styles.input}
        aria-label="Range end"
      />
    </div>
  );
}
