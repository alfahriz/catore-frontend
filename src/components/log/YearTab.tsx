import { useEffect, useState } from 'react';
import { UtensilsCrossed, Scale } from 'lucide-react';
import { BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../lib/toastStore';
import { useDataRefreshStore } from '../../lib/dataRefreshStore';
import { useAuthStore } from '../../lib/authStore';
import { resolveYearPeriod } from '../../lib/logPeriod';
import { buildWeightTicks, pickLabelTicks } from '../../lib/weightTicks';
import { useUnitStore, formatWeight, kgToUnit } from '../../lib/unitStore';
import { ChartLegend } from './ChartLegend';
import styles from './LogTabs.module.css';

type ChartMode = 'calories' | 'weight';
type MonthState = 'logged' | 'over' | 'current' | 'incomplete-open' | 'incomplete-frozen' | 'upcoming';

interface YearTabProps {
  yearOffset: number;
  onSelectMonth: (monthOffset: number) => void;
}

const LEGEND_ITEMS = [
  { label: 'Under limit', fill: 'oklch(55% 0.14 145 / 0.25)', border: 'var(--color-success)' },
  { label: 'Over limit', fill: 'oklch(60% 0.18 30 / 0.25)', border: 'oklch(60% 0.18 30)' },
  { label: 'Current month', fill: 'oklch(58% 0.15 255 / 0.25)', border: 'var(--color-today)' },
  { label: 'Has open week', fill: 'url(#incompleteOpenHatch)', border: 'var(--color-missed)' },
  { label: 'Has frozen week', fill: 'url(#incompleteFrozenHatch)', border: 'var(--color-frozen)' },
  { label: 'Upcoming', fill: 'url(#upcomingHatch)', border: 'var(--color-upcoming)' },
];

interface BarStyle {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

function barStyle(state: MonthState): BarStyle {
  if (state === 'over') return { fill: 'oklch(60% 0.18 30 / 0.25)', stroke: 'oklch(60% 0.18 30)', strokeWidth: 1.5 };
  if (state === 'current') return { fill: 'oklch(58% 0.15 255 / 0.25)', stroke: 'var(--color-today)', strokeWidth: 1.5 };
  if (state === 'incomplete-open') return { fill: 'url(#incompleteOpenHatch)', stroke: 'var(--color-missed)', strokeWidth: 1.5 };
  if (state === 'incomplete-frozen') return { fill: 'url(#incompleteFrozenHatch)', stroke: 'var(--color-frozen)', strokeWidth: 1.5 };
  if (state === 'upcoming') return { fill: 'url(#upcomingHatch)', stroke: 'var(--color-upcoming)', strokeWidth: 1.5 };
  return { fill: 'oklch(55% 0.14 145 / 0.25)', stroke: 'var(--color-success)', strokeWidth: 1.5 };
}

interface MonthBar {
  month: number;
  intake: number;
  limit: number;
  isCurrent: boolean;
  isUpcoming: boolean;
}

interface MonthRow {
  month: number;
  intake: number;
  deficit: number;
  containsUnfilledFrozenDay: boolean;
  daysLogged: number;
}

interface WeightTrendPoint {
  date: string;
  weightValue: number;
}

interface LogYearResponse {
  avgLimitPerMonth: number;
  totalLimit: number;
  avgIntakePerMonth: number;
  totalIntake: number;
  daysLogged: number;
  totalDaysInYear: number;
  monthlyBars: MonthBar[];
  weightTrend: WeightTrendPoint[];
  byMonth: MonthRow[];
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function monthInitial(month: number): string {
  return ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][month - 1];
}

function monthAbbrev(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });
}

// firstSeenDate: kalau SELURUH bulan itu jatuh SEBELUM akun/device ini pernah login, treat
// 'upcoming' (netral) — sama fix yg dipasang Week/MonthTab/Homepage/MonthlyReview.
function deriveMonthState(bar: MonthBar, row: MonthRow, year: number, firstSeenDate: string | null): MonthState {
  if (bar.isUpcoming) return 'upcoming';
  const monthEndIso = `${year}-${String(bar.month).padStart(2, '0')}-${String(daysInMonth(year, bar.month)).padStart(2, '0')}`;
  if (firstSeenDate && monthEndIso < firstSeenDate) return 'upcoming';
  if (bar.isCurrent) return 'current';
  const isIncomplete = row.daysLogged < daysInMonth(year, bar.month);
  if (isIncomplete) return row.containsUnfilledFrozenDay ? 'incomplete-frozen' : 'incomplete-open';
  return bar.intake > bar.limit ? 'over' : 'logged';
}

function monthOffsetFromAbsolute(year: number, month: number): number {
  const today = new Date();
  return (year - today.getFullYear()) * 12 + (month - 1 - today.getMonth());
}

export function YearTab({ yearOffset, onSelectMonth }: YearTabProps) {
  const showToast = useToastStore((s) => s.showToast);
  const firstSeenAt = useAuthStore((s) => s.firstSeenAt);
  const firstSeenDate = firstSeenAt ? firstSeenAt.slice(0, 10) : null;
  const [data, setData] = useState<LogYearResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<ChartMode>('calories');
  const metricPreference = useUnitStore((s) => s.metricPreference);
  const consumptionBumpedAt = useDataRefreshStore((s) => s.consumptionBumpedAt);
  const weightBumpedAt = useDataRefreshStore((s) => s.weightBumpedAt);

  const year = resolveYearPeriod(yearOffset);

  // Lihat catatan dataRefreshStore.ts — modal Add Consumption/Log Weight gak bikin tab ini
  // unmount, submit sukses cuma bump counter, ditaruh di dependency biar re-fetch.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .get<LogYearResponse>('/log/year', { params: { year } })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) showToast('Failed to load year log', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearOffset, consumptionBumpedAt, weightBumpedAt]);

  if (loading || !data) return <div />;

  const overLimit = data.totalIntake > data.totalLimit;
  const rawPercent = data.totalLimit > 0 ? data.totalIntake / data.totalLimit : 0;

  const avgIntakeBg = overLimit
    ? 'oklch(60% 0.18 30 / 0.12)'
    : rawPercent >= 0.8
      ? 'oklch(75% 0.16 85 / 0.18)'
      : 'oklch(58% 0.15 255 / 0.1)';

  const rowByMonth = new Map(data.byMonth.map((r) => [r.month, r]));
  const bars = data.monthlyBars.map((bar) => {
    const row = rowByMonth.get(bar.month)!;
    const state = deriveMonthState(bar, row, year, firstSeenDate);
    const monthOffset = monthOffsetFromAbsolute(year, bar.month);
    const displayValue = bar.intake > 0 ? bar.intake : Math.round(bar.limit * 0.05);
    return { ...bar, label: monthInitial(bar.month), monthFull: monthAbbrev(bar.month), state, monthOffset, daysInMonth: daysInMonth(year, bar.month), daysLogged: row.daysLogged, displayValue };
  });

  const weightTrendConverted = data.weightTrend.map((w) => {
    const d = new Date(w.date);
    return { label: monthInitial(d.getMonth() + 1), weight: kgToUnit(w.weightValue, metricPreference) };
  });
  const weightValues = weightTrendConverted.map((w) => w.weight);
  const weightTicks = buildWeightTicks(weightValues);
  const weightLabelTicks = pickLabelTicks(weightTicks, 6);
  const weightPad = weightTicks.length > 1 ? (weightTicks[weightTicks.length - 1] - weightTicks[0]) * 0.08 : 0.3;
  const weightDomain: [number, number] = weightTicks.length > 0 ? [weightTicks[0] - weightPad, weightTicks[weightTicks.length - 1] + weightPad] : [0, 1];
  const startWeightKg = data.weightTrend[0]?.weightValue;
  const currentWeightKg = data.weightTrend.at(-1)?.weightValue;

  const weightRows = bars.map((bar) => {
    const point = data.weightTrend.find((w) => new Date(w.date).getMonth() + 1 === bar.month);
    return {
      month: bar.monthFull,
      monthOffset: bar.monthOffset,
      logged: `${bar.daysLogged}/${bar.daysInMonth}`,
      weight: point ? kgToUnit(point.weightValue, metricPreference) : null,
      state: bar.state,
    };
  });

  return (
    <div>
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Limit/Month</span>
          <span className={styles.statValue}>{Math.round(data.avgLimitPerMonth).toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {Math.round(data.totalLimit).toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard} style={{ background: avgIntakeBg }}>
          <span className={styles.statLabel}>Avg Intake/Month</span>
          <span className={styles.statValue}>{Math.round(data.avgIntakePerMonth).toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {data.totalIntake.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Days Logged</span>
          <span className={styles.statValue}>{data.daysLogged}/{data.totalDaysInYear}</span>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>{chartMode === 'calories' ? 'Cumulative intake by month' : 'Weight trend by month'}</div>
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
                <Bar dataKey="displayValue" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={700}>
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
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(180, 160, 120, 0.1)" horizontalValues={weightTicks} />
                <XAxis dataKey="label" padding={{ left: 10, right: 10 }} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }} tickLine={false} />
                <YAxis
                  domain={weightDomain}
                  ticks={weightTicks}
                  interval={0}
                  tickFormatter={(v: number) => (weightLabelTicks.includes(v) ? v.toFixed(2) : '')}
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
                : 'No weight data this year'}
            </div>
          </>
        )}
      </div>

      {chartMode === 'calories' ? (
        <>
          <div className={styles.sectionHeader}>Monthly Intake</div>
          <div className={styles.table}>
            <div className={styles.tableHeaderRow5}>
              <span>Month</span><span>Progress</span><span>Limit</span><span>Intake</span><span>Δ</span>
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
                  key={bar.month}
                  style={{ background: rowBg, cursor: isUpcoming ? 'default' : 'pointer', opacity: isUpcoming ? 0.6 : 1 }}
                  disabled={isUpcoming}
                  onClick={() => onSelectMonth(bar.monthOffset)}
                >
                  <span className={styles.rowDay}>{bar.monthFull}</span>
                  <span>{bar.daysLogged}/{bar.daysInMonth}</span>
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
          <div className={styles.sectionHeader}>Monthly Weight</div>
          <div className={styles.table}>
            <div className={styles.tableHeaderRow4}>
              <span>Month</span><span>Progress</span><span>Weight</span><span>Δ</span>
            </div>
            {weightRows.map((row, i) => {
              const isUpcoming = row.state === 'upcoming';
              const rowBg = isUpcoming ? 'var(--color-surface-input)' : undefined;
              const prevWeight = i > 0 ? weightRows[i - 1].weight : null;
              const delta = row.weight !== null && prevWeight !== null ? Math.round((row.weight - prevWeight) * 100) / 100 : null;
              return (
                <button
                  className={styles.tableRowButton4}
                  key={row.month}
                  style={{ background: rowBg, cursor: isUpcoming ? 'default' : 'pointer', opacity: isUpcoming ? 0.6 : 1 }}
                  disabled={isUpcoming}
                  onClick={() => onSelectMonth(row.monthOffset)}
                >
                  <span className={styles.rowDay}>{row.month}</span>
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
