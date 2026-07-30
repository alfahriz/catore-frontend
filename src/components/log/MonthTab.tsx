import { useState } from 'react';
import { UtensilsCrossed, Scale } from 'lucide-react';
import { BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDummyMonthLog } from '../../lib/dummyData';
import { ChartLegend } from './ChartLegend';
import styles from './LogTabs.module.css';

type ChartMode = 'calories' | 'weight';

interface MonthTabProps {
  monthOffset: number;
  onSelectWeek: (weekOffset: number) => void;
}

const LEGEND_ITEMS = [
  { label: 'Under limit', fill: 'oklch(55% 0.14 145 / 0.25)', border: 'var(--color-success)' },
  { label: 'Over limit', fill: 'oklch(60% 0.18 30 / 0.25)', border: 'oklch(60% 0.18 30)' },
  { label: 'Current week', fill: 'oklch(58% 0.15 255 / 0.25)', border: 'var(--color-today)' },
  { label: 'Has open day', fill: 'url(#incompleteOpenHatch)', border: 'var(--color-missed)' },
  { label: 'Has frozen day', fill: 'url(#incompleteFrozenHatch)', border: 'var(--color-frozen)' },
  { label: 'Upcoming', fill: 'url(#upcomingHatch)', border: 'var(--color-upcoming)' },
];

interface BarStyle {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

// Bar lebar (cuma 4-6/bulan, beda dari Week tab yg 7 bar ramping) — fill solid kelihatan ngejreng
// di area segede itu, jadi pastel fill + border warna tipis (senada card 3-case), bukan flat solid.
// incomplete-open/incomplete-frozen (ada hari kosong dlm minggu itu) pakai hatch pattern + border warna
// yg sama seperti Week tab (missed/frozen), biar bahasa visual "data belum lengkap" konsisten antar tab.
function barStyle(state: string): BarStyle {
  if (state === 'over') return { fill: 'oklch(60% 0.18 30 / 0.25)', stroke: 'oklch(60% 0.18 30)', strokeWidth: 1.5 };
  if (state === 'current') return { fill: 'oklch(58% 0.15 255 / 0.25)', stroke: 'var(--color-today)', strokeWidth: 1.5 };
  if (state === 'incomplete-open') return { fill: 'url(#incompleteOpenHatch)', stroke: 'var(--color-missed)', strokeWidth: 1.5 };
  if (state === 'incomplete-frozen') return { fill: 'url(#incompleteFrozenHatch)', stroke: 'var(--color-frozen)', strokeWidth: 1.5 };
  if (state === 'upcoming') return { fill: 'url(#upcomingHatch)', stroke: 'var(--color-upcoming)', strokeWidth: 1.5 };
  return { fill: 'oklch(55% 0.14 145 / 0.25)', stroke: 'var(--color-success)', strokeWidth: 1.5 };
}

export function MonthTab({ monthOffset, onSelectWeek }: MonthTabProps) {
  const data = getDummyMonthLog(monthOffset);
  const [chartMode, setChartMode] = useState<ChartMode>('calories');
  const overLimit = data.sumIntake > data.sumLimit;
  const rawPercent = data.sumIntake / data.sumLimit;

  // Y-axis Weight trend: buffer simetris tetap ±0.5kg dari titik ekstrem minggu ini (bukan dataMin-1/dataMax+1
  // independen) — biar garis selalu "di tengah" area chart, gak nempel ke tepi atas/bawah. Tick yang muncul
  // BUKAN grid angka bulat otomatis Recharts, tapi persis angka berat asli tiap minggu (+ 2 buffer di ujung)
  // — biar user langsung baca berat presisi tiap titik dari sumbu, bukan interpolasi grid generik.
  const weightValues = data.weightTrend.map((w) => w.weight);
  const weightMin = Math.min(...weightValues);
  const weightMax = Math.max(...weightValues);
  const weightDomain: [number, number] = [weightMin - 0.5, weightMax + 0.5];
  const weightTicks = [weightDomain[0], ...Array.from(new Set(weightValues)).sort((a, b) => a - b), weightDomain[1]];

  // 3 case sama seperti Day tab ("Left of") & Week tab ("Avg Intake/Day"): normal (<80%) / caution (80-99%) / over (>=100%)
  const avgIntakeBg = overLimit
    ? 'oklch(60% 0.18 30 / 0.12)'
    : rawPercent >= 0.8
      ? 'oklch(75% 0.16 85 / 0.18)'
      : 'oklch(58% 0.15 255 / 0.1)';

  // Tabel Weight trend: iterasi dari data.bars (SEMUA minggu bulan ini, termasuk upcoming) — bukan dari
  // weightTrend yang cuma punya titik minggu weighable, karena minggu upcoming tetap harus tampil di tabel
  // (row disabled, weight "–") biar user tau minggu itu emang belum kejalani, bukan baris yang hilang.
  // weight & weightDelta direuse langsung dari bar (dihitung generator berbasis weekOffset absolut, jadi
  // W1 tetap punya delta valid vs minggu terakhir bulan SEBELUMNYA — kontinu lintas-bulan, bukan reset).
  const weightRows = data.bars.map((bar) => ({
    week: bar.label,
    weekOffset: bar.weekOffset,
    logged: `${bar.daysFilled}/7`,
    weight: bar.weight,
    delta: bar.weightDelta,
    state: bar.state,
  }));

  return (
    <div>
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Limit/Week</span>
          <span className={styles.statValue}>{data.avgLimitPerWeek.toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {data.sumLimit.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard} style={{ background: avgIntakeBg }}>
          <span className={styles.statLabel}>Avg Intake/Week</span>
          <span className={styles.statValue}>{data.avgIntakePerWeek.toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {data.sumIntake.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Days Logged</span>
          <span className={styles.statValue}>{data.daysLogged}/{data.daysInMonth}</span>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>{chartMode === 'calories' ? 'Cumulative intake by week' : 'Weight trend by week'}</div>
          <div className={styles.chartToggle}>
            <button
              className={`${styles.chartToggleButton} ${chartMode === 'calories' ? styles.chartToggleButtonActive : ''}`}
              onClick={() => setChartMode('calories')}
              aria-label="Calories"
            >
              <UtensilsCrossed size={14} />
            </button>
            <button
              className={`${styles.chartToggleButton} ${chartMode === 'weight' ? styles.chartToggleButtonActive : ''}`}
              onClick={() => setChartMode('weight')}
              aria-label="Weight"
            >
              <Scale size={14} />
            </button>
          </div>
        </div>

        {chartMode === 'calories' ? (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.bars} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <pattern id="upcomingHatch" width={6} height={6} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                    <line x1={0} y1={0} x2={0} y2={6} stroke="var(--color-upcoming)" strokeWidth={2} opacity={0.35} />
                  </pattern>
                  <pattern id="incompleteOpenHatch" width={6} height={6} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                    <line x1={0} y1={0} x2={0} y2={6} stroke="var(--color-missed)" strokeWidth={2} opacity={0.35} />
                  </pattern>
                  <pattern id="incompleteFrozenHatch" width={6} height={6} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                    <line x1={0} y1={0} x2={0} y2={6} stroke="var(--color-frozen)" strokeWidth={2} opacity={0.35} />
                  </pattern>
                </defs>
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
            <ChartLegend items={LEGEND_ITEMS} />
          </>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.weightTrend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={weightDomain}
                  ticks={weightTicks}
                  tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Line type="monotone" dataKey="weight" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={false} isAnimationActive animationDuration={700} />
              </LineChart>
            </ResponsiveContainer>
            <div className={styles.chartCaption}>
              {data.startWeight.toFixed(1)} kg → {data.currentWeight.toFixed(1)} kg
            </div>
          </>
        )}
      </div>

      {chartMode === 'calories' ? (
        <>
          <div className={styles.sectionHeader}>Weekly Intake</div>
          <div className={styles.table}>
            <div className={styles.tableHeaderRow5}>
              <span>Week</span><span>Progress</span><span>Intake</span><span>Limit</span><span>Δ</span>
            </div>
            {data.rows.map((row) => {
              // Default (logged/over/current) gak dikasih background — delta udah cukup nunjukin over/under limit.
              // Cuma incomplete-open (ada hari missed tanpa freeze) & incomplete-frozen (ke-cover freeze) yang
              // dikasih warna beda, biar gampang dibedain sekilas "kenapa" minggu itu belum lengkap.
              const rowBg =
                row.state === 'incomplete-open'
                  ? 'oklch(70% 0.13 30 / 0.12)'
                  : row.state === 'incomplete-frozen'
                    ? 'oklch(70% 0.08 235 / 0.15)'
                    : row.state === 'upcoming'
                      ? 'var(--color-surface-input)'
                      : undefined;
              const isUpcoming = row.state === 'upcoming';
              return (
                <button
                  className={styles.tableRowButton5}
                  key={row.week}
                  style={{ background: rowBg, cursor: isUpcoming ? 'default' : 'pointer', opacity: isUpcoming ? 0.6 : 1 }}
                  disabled={isUpcoming}
                  onClick={() => onSelectWeek(row.weekOffset)}
                >
                  <span className={styles.rowDay}>{row.week}</span>
                  <span>{row.logged}</span>
                  <span>{row.intake}</span>
                  <span>{row.limit}</span>
                  <span style={{ color: row.deficitIsOver ? 'var(--color-warning)' : 'var(--color-success)' }}>{row.deficit}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className={styles.sectionHeader}>Weekly Weight</div>
          <div className={styles.table}>
            <div className={styles.tableHeaderRow4}>
              <span>Week</span><span>Progress</span><span>Weight</span><span>Δ</span>
            </div>
            {weightRows.map((row) => {
              const isUpcoming = row.state === 'upcoming';
              const rowBg = isUpcoming ? 'var(--color-surface-input)' : undefined;
              return (
                <button
                  className={styles.tableRowButton4}
                  key={row.week}
                  style={{ background: rowBg, cursor: isUpcoming ? 'default' : 'pointer', opacity: isUpcoming ? 0.6 : 1 }}
                  disabled={isUpcoming}
                  onClick={() => onSelectWeek(row.weekOffset)}
                >
                  <span className={styles.rowDay}>{row.week}</span>
                  <span>{row.logged}</span>
                  <span>{row.weight !== null ? `${row.weight.toFixed(1)} kg` : '–'}</span>
                  <span style={{ color: row.delta === null ? 'var(--color-text-secondary)' : row.delta > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    {row.delta === null ? '–' : `${row.delta > 0 ? '+' : ''}${row.delta.toFixed(1)} kg`}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
