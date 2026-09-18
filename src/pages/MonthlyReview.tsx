import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { DAY_STATE_STYLES, dayStateBoxShadow, type DayState } from '../lib/dayState';
import { apiClient } from '../api/client';
import { useToastStore } from '../lib/toastStore';
import { useDataRefreshStore } from '../lib/dataRefreshStore';
import { useAuthStore } from '../lib/authStore';
import { useUnitStore, formatWeight, formatWeightNumber } from '../lib/unitStore';
import { toLocalIsoDate } from '../lib/dateUtils';
import { getWeekCountInMonth } from '../lib/logPeriod';
import { DayDetailModal } from '../components/monthly-review/DayDetailModal';
import styles from './MonthlyReview.module.css';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const LEGEND: { state: DayState; label: string }[] = [
  { state: 'logged', label: 'Logged' },
  { state: 'over', label: 'Over limit' },
  { state: 'missed', label: 'Missed' },
  { state: 'today', label: 'Today' },
  { state: 'frozen', label: 'Frozen' },
  { state: 'upcoming', label: 'Upcoming' },
];

interface DayBar {
  date: string;
  intake: number;
  limit: number;
  hasEntry: boolean;
  isFrozen: boolean;
  isUpcoming: boolean;
}

interface LogWeekResponse {
  dailyBars: DayBar[];
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
  weeklyBars: { weekNumber: number; startDate: string; endDate: string; isUpcoming: boolean }[];
  byWeek: WeekRow[];
  weightTrend: WeightTrendPoint[];
}

interface ProfileResponse {
  goalWeight: number | null;
}

// `firstSeenDate` = approximation signupDate (lihat authStore.ts/Homepage.tsx, backend gak expose
// account.createdOn ke FE) — tanggal SEBELUM ini di-treat 'upcoming' (netral), BUKAN 'missed',
// krn akun/device blm exist di tanggal itu. Backend `LogService.GetWeek` generate SEMUA hari
// kalender dlm rentang minggu yg diminta (fallback projected limit kalau blm ada row), gak peduli
// kapan akun dibuat — tanpa filter ini, kalender Monthly Review nunjukin puluhan hari MERAH
// "Missed" utk tanggal SEBELUM user pernah pakai app (bug sama persis yg difix di Homepage kemarin).
function deriveDayState(bar: DayBar, today: string, firstSeenDate: string | null): DayState {
  if (bar.date === today) return 'today';
  if (bar.isUpcoming) return 'upcoming';
  if (firstSeenDate && bar.date < firstSeenDate) return 'upcoming';
  if (!bar.hasEntry) return bar.isFrozen ? 'frozen' : 'missed';
  return bar.intake > bar.limit ? 'over' : 'logged';
}

export function MonthlyReview() {
  const showToast = useToastStore((s) => s.showToast);
  const firstSeenAt = useAuthStore((s) => s.firstSeenAt);
  const firstSeenDate = firstSeenAt ? firstSeenAt.slice(0, 10) : null;
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<{ day: number; isoDate: string; state: DayState } | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthResponse, setMonthResponse] = useState<LogMonthResponse | null>(null);
  const [dayBars, setDayBars] = useState<DayBar[]>([]);
  const [goalWeightKg, setGoalWeightKg] = useState(0);
  const metricPreference = useUnitStore((s) => s.metricPreference);
  const consumptionBumpedAt = useDataRefreshStore((s) => s.consumptionBumpedAt);
  const weightBumpedAt = useDataRefreshStore((s) => s.weightBumpedAt);

  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const leadingEmpty = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Senin=0
  const todayIso = toLocalIsoDate(today);

  // Lihat catatan dataRefreshStore.ts — modal Add Consumption/Log Weight gak bikin halaman ini
  // unmount, submit sukses cuma bump counter, ditaruh di dependency biar re-fetch.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const weekCount = getWeekCountInMonth(year, month);
    Promise.all([
      apiClient.get<LogMonthResponse>('/log/month', { params: { year, month } }),
      apiClient.get<ProfileResponse>('/profile'),
      ...Array.from({ length: weekCount }, (_, i) =>
        apiClient.get<LogWeekResponse>('/log/week', { params: { year, month, weekNumber: i + 1 } })
      ),
    ])
      .then(([monthRes, profileRes, ...weekResponses]) => {
        if (cancelled) return;
        setMonthResponse(monthRes.data);
        setGoalWeightKg(profileRes.data.goalWeight ?? 0);
        setDayBars(weekResponses.flatMap((r) => r.data.dailyBars));
      })
      .catch(() => {
        if (!cancelled) showToast('Failed to load monthly review', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthOffset, consumptionBumpedAt, weightBumpedAt]);

  if (loading || !monthResponse) {
    return <div className={styles.page} />;
  }

  const cells = dayBars.map((bar) => ({
    day: new Date(bar.date).getDate(),
    isoDate: bar.date,
    state: deriveDayState(bar, todayIso, firstSeenDate),
  }));

  const weeklyRows = monthResponse.weeklyBars.map((bar) => {
    const row = monthResponse.byWeek.find((r) => r.weekNumber === bar.weekNumber)!;
    const point = monthResponse.weightTrend.find((w) => w.date >= bar.startDate && w.date <= bar.endDate);
    const prevBar = monthResponse.weeklyBars.find((b) => b.weekNumber === bar.weekNumber - 1);
    const prevPoint = prevBar ? monthResponse.weightTrend.find((w) => w.date >= prevBar.startDate && w.date <= prevBar.endDate) : undefined;
    const weight = point ? point.weightValue : null;
    const delta = point && prevPoint ? Math.round((point.weightValue - prevPoint.weightValue) * 100) / 100 : null;
    return {
      label: `W${bar.weekNumber}`,
      intake: bar.isUpcoming ? '—' : row.intake.toLocaleString('en-US'),
      deficit: bar.isUpcoming ? '—' : `${row.deficit >= 0 ? '+' : ''}${Math.round(row.deficit)}${row.containsUnfilledFrozenDay ? '*' : ''}`,
      deficitIsOver: row.deficit < 0,
      weight,
      delta,
    };
  });
  const hasFrozenFootnote = weeklyRows.some((r) => r.deficit.includes('*'));

  const startPoint = monthResponse.weightTrend[0];
  const endPoint = monthResponse.weightTrend.at(-1);
  const deltaKg = startPoint && endPoint ? Math.round((endPoint.weightValue - startPoint.weightValue) * 100) / 100 : 0;
  const direction = deltaKg < 0 ? 'lost' : deltaKg > 0 ? 'gain' : 'none';

  const changeColor = direction === 'lost' ? 'var(--color-success)' : direction === 'gain' ? 'var(--color-warning)' : 'var(--color-text-primary)';
  const changeHeadline = `${formatWeightNumber(Math.abs(deltaKg), metricPreference)} ${metricPreference} ${direction === 'gain' ? 'gain' : direction === 'lost' ? 'lost' : ''}`.trim();
  const changeSubtext =
    direction === 'none' || !startPoint
      ? 'No change this month'
      : `${formatWeightNumber(startPoint.weightValue - goalWeightKg, metricPreference)} ${metricPreference} left toward goal (${formatWeight(startPoint.weightValue, metricPreference)} → ${formatWeight(goalWeightKg, metricPreference)})`;
  const monthName = targetDate.toLocaleDateString('en-US', { month: 'long' });
  const title = `${monthName} review`;
  const weekCount = getWeekCountInMonth(year, month);
  const subtitle = `Week 1–${weekCount} · Goal ${formatWeight(goalWeightKg, metricPreference)}`;

  const selectedDayLabel = selectedDay
    ? new Date(selectedDay.isoDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.navButton} onClick={() => setMonthOffset((o) => o - 1)} aria-label="Previous month">‹</button>
        <div className={styles.headerTitle}>
          <div className={styles.monthTitle}>{title}</div>
          <div className={styles.monthSubtitle}>{subtitle}</div>
        </div>
        <button
          className={styles.navButton}
          onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
          aria-label="Next month"
          style={{ visibility: monthOffset === 0 ? 'hidden' : 'visible' }}
        >
          ›
        </button>
      </div>

      <div className={styles.changeCard}>
        <div className={styles.changeHeadline} style={{ color: changeColor }}>
          {changeHeadline}
          {direction === 'lost' && <TrendingDown size={20} strokeWidth={2.2} style={{ verticalAlign: 'text-bottom', marginLeft: 4 }} />}
          {direction === 'gain' && <TrendingUp size={20} strokeWidth={2.2} style={{ verticalAlign: 'text-bottom', marginLeft: 4 }} />}
        </div>
        <div className={styles.changeSubtext}>{changeSubtext}</div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span>Week</span><span>Intake</span><span>Deficit</span><span>Weight ({metricPreference})</span><span>Δ</span>
        </div>
        {weeklyRows.map((row) => (
          <div
            className={styles.tableRow}
            key={row.label}
            style={{ background: row.deficitIsOver ? 'oklch(60% 0.18 30 / 0.06)' : 'transparent' }}
          >
            <span className={styles.weekLabel}>{row.label}</span>
            <span>{row.intake}</span>
            <span className={styles.deficitCell} style={{ color: row.deficitIsOver ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {row.deficit}
            </span>
            <span>{row.weight !== null ? formatWeightNumber(row.weight, metricPreference) : '—'}</span>
            <span>{row.delta !== null ? `${row.delta > 0 ? '+' : ''}${formatWeightNumber(row.delta, metricPreference)}` : '—'}</span>
          </div>
        ))}
        {hasFrozenFootnote && <div className={styles.footnote}>* Includes a Frozen day not yet submitted</div>}
      </div>

      <div className={styles.calendarSection}>
        <div className={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label, i) => (
            <span className={styles.weekdayLabel} key={i}>{label}</span>
          ))}
        </div>
        <div className={styles.calendarGrid}>
          {Array.from({ length: leadingEmpty }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {cells.map((cell) => {
            const style = DAY_STATE_STYLES[cell.state];
            return (
              <button
                key={cell.day}
                className={styles.cellButton}
                style={{
                  background: style.bg,
                  border: style.border,
                  boxShadow: dayStateBoxShadow(cell.state),
                  color: style.iconColor,
                }}
                onClick={() => setSelectedDay({ day: cell.day, isoDate: cell.isoDate, state: cell.state })}
              >
                {cell.day}
              </button>
            );
          })}
        </div>

        <div className={styles.legend}>
          {LEGEND.map(({ state, label }) => {
            const style = DAY_STATE_STYLES[state];
            return (
              <div className={styles.legendItem} key={state}>
                <div
                  className={styles.legendDot}
                  style={{ background: style.bg, border: style.border }}
                />
                <span className={styles.legendLabel}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <DayDetailModal
        open={selectedDay !== null}
        day={selectedDay?.day ?? null}
        state={selectedDay?.state ?? null}
        dateLabel={selectedDayLabel}
        isoDate={selectedDay?.isoDate ?? null}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}
