import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDummyWeekLog } from '../../lib/dummyData';
import styles from './LogTabs.module.css';

interface WeekTabProps {
  weekOffset: number;
  onSelectDay: (dayOffset: number) => void;
}

// 5 kondisi bar: logged under/over limit = fill solid pastel. Frozen/missed/upcoming = outline-only
// (fill transparan, cuma border warna) — beda dari logged/over yang punya data kalori beneran.
// Base hue reference token --color-* (tokens.css), diseragamkan sama warna kalender Homepage/Monthly Review.
interface BarStyle {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

function barStyle(state: string): BarStyle {
  if (state === 'over') return { fill: 'var(--color-warning)' }; // merah — logged, over limit
  if (state === 'today') return { fill: 'var(--color-today)' }; // biru solid — hari ini, belum ada intake yg beneran dihitung
  if (state === 'frozen') return { fill: 'transparent', stroke: 'var(--color-frozen)', strokeWidth: 1.5 }; // biru outline — kelewat, pakai freeze token
  if (state === 'missed') return { fill: 'transparent', stroke: 'var(--color-missed)', strokeWidth: 1.5 }; // merah/pink outline — kelewat, gak pakai freeze token
  if (state === 'upcoming') return { fill: 'transparent', stroke: 'var(--color-upcoming)', strokeWidth: 1.5 }; // abu outline — belum kejalani
  return { fill: 'var(--color-success)' }; // hijau — logged, under limit
}

export function WeekTab({ weekOffset, onSelectDay }: WeekTabProps) {
  const data = getDummyWeekLog(weekOffset);
  const overLimit = data.sumIntake > data.sumLimit;
  const rawPercent = data.sumIntake / data.sumLimit;

  // 3 case sama seperti ring Homepage & card "Left of" Day tab: normal (<80%, biru) / caution (80-99%, kuning) / over (>=100%, merah)
  // Dibandingkan total minggu (sumIntake vs sumLimit), bukan avg per-hari — hasilnya identik (avg = sum/7 di kedua sisi)
  // tapi lebih jelas niatnya: total realisasi minggu ini vs total limit minggu ini.
  const avgIntakeBg = overLimit
    ? 'oklch(60% 0.18 30 / 0.12)'
    : rawPercent >= 0.8
      ? 'oklch(75% 0.16 85 / 0.18)'
      : 'oklch(58% 0.15 255 / 0.1)';

  return (
    <div>
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Limit/Day</span>
          <span className={styles.statValue}>{data.avgLimit.toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {data.sumLimit.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard} style={{ background: avgIntakeBg }}>
          <span className={styles.statLabel}>Avg Intake/Day</span>
          <span className={styles.statValue}>{data.avgIntake.toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {data.sumIntake.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Days Logged</span>
          <span className={styles.statValue}>{data.daysLogged}/7</span>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartTitle}>Cumulative intake by day</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.bars} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
            <Bar dataKey="displayValue" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={700}>
              {data.bars.map((b, i) => {
                const style = barStyle(b.state);
                return <Cell key={i} fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.sectionHeader}>Daily Intake</div>
      <div className={styles.table}>
        <div className={styles.tableHeaderRow4}>
          <span>Day</span><span>Limit</span><span>Intake</span><span>Δ</span>
        </div>
        {data.rows.map((row) => {
          const rowBg =
            row.state === 'over'
              ? 'oklch(60% 0.18 30 / 0.12)'
              : row.intake === '0'
                ? 'var(--color-surface-input)'
                : undefined;
          const isUpcoming = row.state === 'upcoming';
          return (
            <button
              className={styles.tableRowButton4}
              key={row.day}
              style={{ background: rowBg, cursor: isUpcoming ? 'default' : 'pointer', opacity: isUpcoming ? 0.6 : 1 }}
              disabled={isUpcoming}
              onClick={() => onSelectDay(row.dayOffset)}
            >
              <span className={styles.rowDay}>{row.day}</span>
              <span>{row.limit}</span>
              <span>{row.intake}</span>
              <span style={{ color: row.deltaIsOver ? 'var(--color-warning)' : 'var(--color-success)' }}>{row.delta}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
