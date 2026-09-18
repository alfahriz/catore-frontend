import { useEffect, useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../lib/toastStore';
import { useDataRefreshStore } from '../../lib/dataRefreshStore';
import { useAuthStore } from '../../lib/authStore';
import { resolveWeekPeriod } from '../../lib/logPeriod';
import { todayLocalIso } from '../../lib/dateUtils';
import { TwoLineTick } from './TwoLineTick';
import { ChartLegend } from './ChartLegend';
import styles from './LogTabs.module.css';

const LEGEND_ITEMS = [
  { label: 'Under limit', fill: 'oklch(55% 0.14 145 / 0.25)', border: 'var(--color-success)' },
  { label: 'Over limit', fill: 'oklch(60% 0.18 30 / 0.25)', border: 'oklch(60% 0.18 30)' },
  { label: 'Today', fill: 'oklch(58% 0.15 255 / 0.25)', border: 'var(--color-today)' },
  { label: 'Frozen', fill: 'url(#frozenHatch)', border: 'var(--color-frozen)' },
  { label: 'Missed', fill: 'url(#missedHatch)', border: 'var(--color-missed)' },
  { label: 'Upcoming', fill: 'url(#upcomingHatch)', border: 'var(--color-upcoming)' },
];

interface WeekTabProps {
  weekOffset: number;
  onSelectDay: (dayOffset: number) => void;
}

type DayState = 'logged' | 'over' | 'today' | 'frozen' | 'missed' | 'upcoming';

interface BarStyle {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

function barStyle(state: DayState): BarStyle {
  if (state === 'over') return { fill: 'oklch(60% 0.18 30 / 0.25)', stroke: 'oklch(60% 0.18 30)', strokeWidth: 1.5 };
  if (state === 'today') return { fill: 'oklch(58% 0.15 255 / 0.25)', stroke: 'var(--color-today)', strokeWidth: 1.5 };
  if (state === 'frozen') return { fill: 'url(#frozenHatch)', stroke: 'var(--color-frozen)', strokeWidth: 1.5 };
  if (state === 'missed') return { fill: 'url(#missedHatch)', stroke: 'var(--color-missed)', strokeWidth: 1.5 };
  if (state === 'upcoming') return { fill: 'url(#upcomingHatch)', stroke: 'var(--color-upcoming)', strokeWidth: 1.5 };
  return { fill: 'oklch(55% 0.14 145 / 0.25)', stroke: 'var(--color-success)', strokeWidth: 1.5 };
}

interface DayBar {
  date: string;
  intake: number;
  limit: number;
  hasEntry: boolean;
  isFrozen: boolean;
  isUpcoming: boolean;
}

interface ConsumedRow {
  date: string;
  intake: number | null;
  limit: number;
  hasEntry: boolean;
}

interface LogWeekResponse {
  avgLimitPerDay: number;
  totalLimit: number;
  avgIntakePerDay: number;
  totalIntake: number;
  daysLogged: number;
  dailyBars: DayBar[];
  consumedByDay: ConsumedRow[];
}

// firstSeenDate: tanggal SEBELUM akun/device ini pernah login di-treat 'upcoming' (netral), BUKAN
// 'missed' — sama fix yg dipasang di Homepage.tsx/MonthlyReview.tsx (backend generate SEMUA hari
// kalender dlm rentang minggu, gak peduli kapan akun dibuat).
function deriveState(
  bar: { date: string; intake: number; limit: number; hasEntry: boolean; isFrozen: boolean; isUpcoming: boolean },
  today: string,
  firstSeenDate: string | null
): DayState {
  if (bar.date === today) return 'today';
  if (bar.isUpcoming) return 'upcoming';
  if (firstSeenDate && bar.date < firstSeenDate) return 'upcoming';
  if (!bar.hasEntry) return bar.isFrozen ? 'frozen' : 'missed';
  return bar.intake > bar.limit ? 'over' : 'logged';
}

function dayOffsetFromToday(dateIso: string, todayIso: string): number {
  const date = new Date(dateIso);
  const today = new Date(todayIso);
  return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function WeekTab({ weekOffset, onSelectDay }: WeekTabProps) {
  const showToast = useToastStore((s) => s.showToast);
  const firstSeenAt = useAuthStore((s) => s.firstSeenAt);
  const firstSeenDate = firstSeenAt ? firstSeenAt.slice(0, 10) : null;
  const consumptionBumpedAt = useDataRefreshStore((s) => s.consumptionBumpedAt);
  const [data, setData] = useState<LogWeekResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Lihat catatan dataRefreshStore.ts — modal Add Consumption gak bikin tab ini unmount, submit
  // sukses cuma bump `consumptionBumpedAt`, ditaruh di dependency biar re-fetch.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const period = resolveWeekPeriod(weekOffset);
    apiClient
      .get<LogWeekResponse>('/log/week', { params: { year: period.year, month: period.month, weekNumber: period.weekNumber } })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) showToast('Failed to load week log', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset, consumptionBumpedAt]);

  if (loading || !data) return <div />;

  const today = todayLocalIso();
  const overLimit = data.totalIntake > data.totalLimit;
  const rawPercent = data.totalLimit > 0 ? data.totalIntake / data.totalLimit : 0;

  // 3 case sama seperti ring Homepage & card "Left of" Day tab: normal (<80%, biru) / caution (80-99%, kuning) / over (>=100%, merah)
  const avgIntakeBg = overLimit
    ? 'oklch(60% 0.18 30 / 0.12)'
    : rawPercent >= 0.8
      ? 'oklch(75% 0.16 85 / 0.18)'
      : 'oklch(58% 0.15 255 / 0.1)';

  const bars = data.dailyBars.map((bar) => {
    const state = deriveState(bar, today, firstSeenDate);
    const d = new Date(bar.date);
    const label = `${d.toLocaleDateString('en-US', { weekday: 'short' })} (${d.getDate()})`;
    // Recharts gak render bar kalau value null/0 — displayValue placeholder (5% limit) buat state
    // tanpa intake asli (frozen/missed/upcoming), warna tetap dari `state`, bukan dari displayValue.
    const displayValue = bar.hasEntry ? bar.intake : Math.round(bar.limit * 0.05);
    return { ...bar, state, label, displayValue };
  });

  // ConsumedRowDto (consumedByDay) gak py isFrozen/isUpcoming sendiri — JOIN by date ke dailyBars
  // (DayBarDto) yg py info lengkap, biar table row state (missed/frozen/upcoming) konsisten sama
  // chart bar di atasnya (1 sumber kebenaran state per tanggal, bukan 2 logic derive terpisah).
  const barByDate = new Map(data.dailyBars.map((bar) => [bar.date, bar]));
  const rows = data.consumedByDay.map((row) => {
    const bar = barByDate.get(row.date);
    const state = deriveState(
      { date: row.date, intake: row.intake ?? 0, limit: row.limit, hasEntry: row.hasEntry, isFrozen: bar?.isFrozen ?? false, isUpcoming: bar?.isUpcoming ?? false },
      today,
      firstSeenDate
    );
    const d = new Date(row.date);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const intake = row.intake ?? 0;
    const delta = row.limit - intake;
    return {
      day: dayLabel,
      dayOffset: dayOffsetFromToday(row.date, today),
      limit: Math.round(row.limit),
      intake: row.hasEntry ? intake : 0,
      delta: row.hasEntry ? (delta >= 0 ? `+${Math.round(delta)}` : String(Math.round(delta))) : '–',
      deltaIsOver: delta < 0,
      state,
    };
  });

  return (
    <div>
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Limit/Day</span>
          <span className={styles.statValue}>{Math.round(data.avgLimitPerDay).toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {Math.round(data.totalLimit).toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard} style={{ background: avgIntakeBg }}>
          <span className={styles.statLabel}>Avg Intake/Day</span>
          <span className={styles.statValue}>{Math.round(data.avgIntakePerDay).toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {data.totalIntake.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Days Logged</span>
          <span className={styles.statValue}>{data.daysLogged}/7</span>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartTitle}>Cumulative intake by day</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={bars} margin={{ top: 8, right: 8, left: -20, bottom: 12 }}>
            <defs>
              <pattern id="frozenHatch" width={6} height={6} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <line x1={0} y1={0} x2={0} y2={6} stroke="var(--color-frozen)" strokeWidth={2} opacity={0.35} />
              </pattern>
              <pattern id="missedHatch" width={6} height={6} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <line x1={0} y1={0} x2={0} y2={6} stroke="var(--color-missed)" strokeWidth={2} opacity={0.35} />
              </pattern>
              <pattern id="upcomingHatch" width={6} height={6} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <line x1={0} y1={0} x2={0} y2={6} stroke="var(--color-upcoming)" strokeWidth={2} opacity={0.35} />
              </pattern>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" tick={<TwoLineTick />} axisLine={false} tickLine={false} interval={0} />
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
      </div>

      <div className={styles.sectionHeader}>Daily Intake</div>
      <div className={styles.table}>
        <div className={styles.tableHeaderRow4}>
          <span>Day</span><span>Limit</span><span>Intake</span><span>Δ</span>
        </div>
        {rows.map((row) => {
          const rowBg =
            row.state === 'missed'
              ? 'oklch(70% 0.13 30 / 0.12)'
              : row.state === 'frozen'
                ? 'oklch(70% 0.08 235 / 0.15)'
                : row.state === 'upcoming'
                  ? 'var(--color-surface-input)'
                  : undefined;
          const isUpcoming = row.state === 'upcoming';
          return (
            <button
              className={styles.tableRowButton4}
              key={row.dayOffset}
              style={{ background: rowBg, cursor: isUpcoming ? 'default' : 'pointer', opacity: isUpcoming ? 0.6 : 1 }}
              disabled={isUpcoming}
              onClick={() => onSelectDay(row.dayOffset)}
            >
              <span className={styles.rowDay}>{row.day}</span>
              <span>{row.limit}</span>
              <span>{row.intake}</span>
              <span style={{ color: row.deltaIsOver ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 700 }}>{row.delta}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
