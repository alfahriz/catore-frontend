import styles from './LogTabs.module.css';

interface LegendEntry {
  label: string;
  fill: string; // warna solid ATAU 'url(#patternId)' — cuma valid resolve di dalam <svg>, makanya swatch dirender via <svg> bukan div
  border: string;
}

export function ChartLegend({ items }: { items: LegendEntry[] }) {
  return (
    <div className={styles.chartLegend}>
      {items.map((item) => (
        <div className={styles.legendItem} key={item.label}>
          <svg width={14} height={14} className={styles.legendSwatch}>
            <rect x={0.75} y={0.75} width={12.5} height={12.5} rx={3} fill={item.fill} stroke={item.border} strokeWidth={1.5} />
          </svg>
          <span className={styles.legendLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
