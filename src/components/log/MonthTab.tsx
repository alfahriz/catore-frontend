import { useEffect, useState } from 'react';
import { UtensilsCrossed, Scale } from 'lucide-react';
import { BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../lib/toastStore';
import { useDataRefreshStore } from '../../lib/dataRefreshStore';
import { useAuthStore } from '../../lib/authStore';
import { resolveMonthPeriod } from '../../lib/logPeriod';
import { buildWeightTicks } from '../../lib/weightTicks';
import { useUnitStore, formatWeight, kgToUnit } from '../../lib/unitStore';
import { ChartLegend } from './ChartLegend';
import styles from './LogTabs.module.css';

type ChartMode = 'calories' | 'weight';
type WeekState = 'logged' | 'over' | 'current' | 'incomplete-open' | 'incomplete-frozen' | 'upcoming';

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

function barStyle(state: WeekState): BarStyle {
  if (state === 'over') return { fill: 'oklch(60% 0.18 30 / 0.25)', stroke: 'oklch(60% 0.18 30)', strokeWidth: 1.5 };
  if (state === 'current') return { fill: 'oklch(58% 0.15 255 / 0.25)', stroke: 'var(--color-today)', strokeWidth: 1.5 };
  if (state === 'incomplete-open') return { fill: 'url(#incompleteOpenHatch)', stroke: 'var(--color-missed)', strokeWidth: 1.5 };
  if (state === 'incomplete-frozen') return { fill: 'url(#incompleteFrozenHatch)', stroke: 'var(--color-frozen)', strokeWidth: 1.5 };
  if (state === 'upcoming') return { fill: 'url(#upcomingHatch)', stroke: 'var(--color-upcoming)', strokeWidth: 1.5 };
  return { fill: 'oklch(55% 0.14 145 / 0.25)', stroke: 'var(--color-success)', strokeWidth: 1.5 };
}

interface WeekBar {
  weekNumber: number;
  startDate: string;
  endDate: string;
  intake: number;
  limit: number;
  isCurrent: boolean;
  isUpcoming: boolean;
}

interface WeekRow {
  weekNumber: number;
  intake: number;
  deficit: number;
  containsUnfilledFrozenDay: boolean;
  daysLogged: number;
}

interface WeightTrendPoint {
  date: string;
  weightValue: number;
}

interface LogMonthResponse {
  avgLimitPerWeek: number;
  totalLimit: number;
  avgIntakePerWeek: number;
  totalIntake: number;
  daysLogged: number;
  totalDaysInMonth: number;
  weeklyBars: WeekBar[];
  weightTrend: WeightTrendPoint[];
  byWeek: WeekRow[];
}

// Priority evaluasi (PRD, sama urutan backend LogService.GetMonth mengisi field2 sumbernya):
// upcoming > current > incomplete-open (ada hari kosong TANPA freeze) > incomplete-frozen (ada
// hari kosong TAPI ke-cover freeze) > over > logged. Backend gak expose "state" langsung — derive
// dari kombinasi WeekBarDto.IsCurrent/IsUpcoming + WeekRowDto.DaysLogged/ContainsUnfilledFrozenDay.
// firstSeenDate: kalau SELURUH minggu itu (endDate-nya) jatuh SEBELUM akun/device ini pernah
// login, treat 'upcoming' (netral) — sama fix yg dipasang WeekTab/Homepage/MonthlyReview. Minggu
// yg firstSeenDate-nya jatuh DI TENGAH (parsial) TETAP dievaluasi normal — cukup akurat drpd
// nambah kompleksitas partial-week handling yg PRD sendiri gak spesifik soal ini.
function deriveWeekState(bar: WeekBar, row: WeekRow, daysInWeek: number, firstSeenDate: string | null): WeekState {
  if (bar.isUpcoming) return 'upcoming';
  if (firstSeenDate && bar.endDate < firstSeenDate) return 'upcoming';
  if (bar.isCurrent) return 'current';
  const isIncomplete = row.daysLogged < daysInWeek;
  if (isIncomplete) return row.containsUnfilledFrozenDay ? 'incomplete-frozen' : 'incomplete-open';
  return bar.intake > bar.limit ? 'over' : 'logged';
}

function daysBetweenInclusive(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// weekOffset (konvensi Log.tsx: 0=minggu berjalan, -1=sebelumnya dst) dihitung dari startDate absolut
// minggu itu vs startDate minggu berjalan SEKARANG — sama formula resolveWeekPeriod tapi terbalik.
function weekOffsetFromStartDate(startIso: string): number {
  const target = new Date(startIso);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Cari Senin... eh, cari START minggu ala-backend (blok 7 hari dari tanggal 1) yg mengandung hari ini.
  const daysSinceMonth1 = today.getDate() - 1;
  const currentWeekStartOffset = Math.floor(daysSinceMonth1 / 7) * 7;
  const currentWeekStart = new Date(today.getFullYear(), today.getMonth(), 1 + currentWeekStartOffset);
  return Math.round((target.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
}

export function MonthTab({ monthOffset, onSelectWeek }: MonthTabProps) {
  const showToast = useToastStore((s) => s.showToast);
  const firstSeenAt = useAuthStore((s) => s.firstSeenAt);
  const firstSeenDate = firstSeenAt ? firstSeenAt.slice(0, 10) : null;
  const [data, setData] = useState<LogMonthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<ChartMode>('calories');
  const metricPreference = useUnitStore((s) => s.metricPreference);
  const consumptionBumpedAt = useDataRefreshStore((s) => s.consumptionBumpedAt);
  const weightBumpedAt = useDataRefreshStore((s) => s.weightBumpedAt);

  // Lihat catatan dataRefreshStore.ts — modal Add Consumption/Log Weight gak bikin tab ini
  // unmount, submit sukses cuma bump counter, ditaruh di dependency biar re-fetch.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const period = resolveMonthPeriod(monthOffset);
    apiClient
      .get<LogMonthResponse>('/log/month', { params: { year: period.year, month: period.month } })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) showToast('Failed to load month log', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthOffset, consumptionBumpedAt, weightBumpedAt]);

  if (loading || !data) return <div />;

  const overLimit = data.totalIntake > data.totalLimit;
  const rawPercent = data.totalLimit > 0 ? data.totalIntake / data.totalLimit : 0;

  const avgIntakeBg = overLimit
    ? 'oklch(60% 0.18 30 / 0.12)'
    : rawPercent >= 0.8
      ? 'oklch(75% 0.16 85 / 0.18)'
      : 'oklch(58% 0.15 255 / 0.1)';

  const rowByWeekNumber = new Map(data.byWeek.map((r) => [r.weekNumber, r]));
  const bars = data.weeklyBars.map((bar) => {
    const row = rowByWeekNumber.get(bar.weekNumber)!;
    const daysInWeek = daysBetweenInclusive(bar.startDate, bar.endDate);
    const state = deriveWeekState(bar, row, daysInWeek, firstSeenDate);
    const weekOffset = weekOffsetFromStartDate(bar.startDate);
    const displayValue = row.daysLogged > 0 || !bar.isUpcoming ? bar.intake : Math.round(bar.limit * 0.05);
    return { ...bar, label: `W${bar.weekNumber}`, state, weekOffset, daysInWeek, daysLogged: row.daysLogged, displayValue: displayValue || Math.round(bar.limit * 0.05) };
  });

  const weightTrendConverted = data.weightTrend.map((w) => ({ label: `W${bars.find((b) => w.date >= b.startDate && w.date <= b.endDate)?.weekNumber ?? ''}`, weight: kgToUnit(w.weightValue, metricPreference) }));
  const weightValues = weightTrendConverted.map((w) => w.weight);
  const weightTicks = buildWeightTicks(weightValues);
  const weightPad = weightTicks.length > 1 ? (weightTicks[weightTicks.length - 1] - weightTicks[0]) * 0.08 : 0.3;
  const weightDomain: [number, number] = weightTicks.length > 0 ? [weightTicks[0] - weightPad, weightTicks[weightTicks.length - 1] + weightPad] : [0, 1];
  const startWeightKg = data.weightTrend[0]?.weightValue;
  const currentWeightKg = data.weightTrend.at(-1)?.weightValue;

  const weightRows = bars.map((bar) => {
    const point = data.weightTrend.find((w) => w.date >= bar.startDate && w.date <= bar.endDate);
    return {
      week: bar.label,
      weekOffset: bar.weekOffset,
      logged: `${bar.daysLogged}/${bar.daysInWeek}`,
      weight: point ? kgToUnit(point.weightValue, metricPreference) : null,
      state: bar.state,
    };
  });

  return (
    <div>
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Limit/Week</span>
          <span className={styles.statValue}>{Math.round(data.avgLimitPerWeek).toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {Math.round(data.totalLimit).toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard} style={{ background: avgIntakeBg }}>
          <span className={styles.statLabel}>Avg Intake/Week</span>
          <span className={styles.statValue}>{Math.round(data.avgIntakePerWeek).toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {data.totalIntake.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Days Logged</span>
          <span className={styles.statValue}>{data.daysLogged}/{data.totalDaysInMonth}</span>
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
              <BarChart data={bars} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
                  {bars.map((b, i) => {
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
              <LineChart data={weightTrendConverted} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(180, 160, 120, 0.1)" horizontalValues={weightTicks} verticalValues={weightTrendConverted.map((w) => w.label)} />
                <XAxis dataKey="label" padding={{ left: 10, right: 10 }} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }} tickLine={false} />
                <YAxis
                  domain={weightDomain}
                  ticks={weightTicks}
                  interval={0}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                  axisLine={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }}
                  tickLine={false}
                />
                <Line type="monotone" dataKey="weight" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={false} isAnimationActive animationDuration={700} />
              </LineChart>
            </ResponsiveContainer>
            <div className={styles.chartCaption}>
              {startWeightKg !== undefined && currentWeightKg !== undefined
                ? `${formatWeight(startWeightKg, metricPreference)} → ${formatWeight(currentWeightKg, metricPreference)}`
                : 'No weight data this month'}
            </div>
          </>
        )}
      </div>

      {chartMode === 'calories' ? (
        <>
          <div className={styles.sectionHeader}>Weekly Intake</div>
          <div className={styles.table}>
            <div className={styles.tableHeaderRow5}>
              <span>Week</span><span>Progress</span><span>Limit</span><span>Intake</span><span>Δ</span>
            </div>
            {bars.map((bar) => {
              const rowBg =
                bar.state === 'incomplete-open'
                  ? 'oklch(70% 0.13 30 / 0.12)'
                  : bar.state === 'incomplete-frozen'
                    ? 'oklch(70% 0.08 235 / 0.15)'
                    : bar.state === 'upcoming'
                      ? 'var(--color-surface-input)'
                      : undefined;
              const isUpcoming = bar.state === 'upcoming';
              const deficit = Math.round(bar.limit - bar.intake);
              return (
                <button
                  className={styles.tableRowButton5}
                  key={bar.weekNumber}
                  style={{ background: rowBg, cursor: isUpcoming ? 'default' : 'pointer', opacity: isUpcoming ? 0.6 : 1 }}
                  disabled={isUpcoming}
                  onClick={() => onSelectWeek(bar.weekOffset)}
                >
                  <span className={styles.rowDay}>{bar.label}</span>
                  <span>{bar.daysLogged}/{bar.daysInWeek}</span>
                  <span>{Math.round(bar.limit)}</span>
                  <span>{bar.intake}</span>
                  <span style={{ color: deficit < 0 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 700 }}>
                    {deficit >= 0 ? `+${deficit}` : deficit}
                  </span>
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
            {weightRows.map((row, i) => {
              const isUpcoming = row.state === 'upcoming';
              const rowBg = isUpcoming ? 'var(--color-surface-input)' : undefined;
              const prevWeight = i > 0 ? weightRows[i - 1].weight : null;
              const delta = row.weight !== null && prevWeight !== null ? Math.round((row.weight - prevWeight) * 100) / 100 : null;
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
                  <span>{row.weight !== null ? row.weight.toFixed(2) : '–'}</span>
                  <span style={{ color: delta === null ? 'var(--color-text-secondary)' : delta > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    {delta === null ? '–' : `${delta > 0 ? '+' : ''}${delta.toFixed(2)}`}
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
