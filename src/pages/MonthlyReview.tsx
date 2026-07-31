import { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { DAY_STATE_STYLES, dayStateBoxShadow, type DayState } from '../lib/dayState';
import { getDummyMonthData } from '../lib/dummyData';
import { useUnitStore, formatWeight, formatWeightNumber } from '../lib/unitStore';
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

export function MonthlyReview() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<{ day: number; state: DayState } | null>(null);

  const monthData = useMemo(() => getDummyMonthData(monthOffset), [monthOffset]);
  const hasFrozenFootnote = monthData.weeklyRows.some((r) => r.deficit.includes('*'));
  const metricPreference = useUnitStore((s) => s.metricPreference);

  const changeColor =
    monthData.change.direction === 'lost' ? 'var(--color-success)' : monthData.change.direction === 'gain' ? 'var(--color-warning)' : 'var(--color-text-primary)';

  const changeHeadline = `${formatWeightNumber(Math.abs(monthData.change.deltaKg), metricPreference)} ${metricPreference} ${monthData.change.direction === 'gain' ? 'gain' : monthData.change.direction === 'lost' ? 'lost' : ''}`.trim();
  const changeSubtext =
    monthData.change.direction === 'none'
      ? 'No change this month'
      : `${formatWeightNumber(monthData.change.startWeightKg - monthData.goalWeightKg, metricPreference)} ${metricPreference} left toward goal (${formatWeight(monthData.change.startWeightKg, metricPreference)} → ${formatWeight(monthData.goalWeightKg, metricPreference)})`;
  const subtitle = `${monthData.weekRangeLabel} · Goal ${formatWeight(monthData.goalWeightKg, metricPreference)}`;

  const dayDateLabel = selectedDay
    ? new Date(2026, 6 + monthOffset, selectedDay.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.navButton} onClick={() => setMonthOffset((o) => o - 1)} aria-label="Previous month">‹</button>
        <div className={styles.headerTitle}>
          <div className={styles.monthTitle}>{monthData.title}</div>
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
          {monthData.change.direction === 'lost' && <TrendingDown size={20} strokeWidth={2.2} style={{ verticalAlign: 'text-bottom', marginLeft: 4 }} />}
          {monthData.change.direction === 'gain' && <TrendingUp size={20} strokeWidth={2.2} style={{ verticalAlign: 'text-bottom', marginLeft: 4 }} />}
        </div>
        <div className={styles.changeSubtext}>{changeSubtext}</div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span>Week</span><span>Intake</span><span>Deficit</span><span>Weight ({metricPreference})</span><span>Δ</span>
        </div>
        {monthData.weeklyRows.map((row) => (
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
          {Array.from({ length: monthData.leadingEmpty }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {monthData.cells.map((cell) => {
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
                onClick={() => setSelectedDay({ day: cell.day, state: cell.state })}
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
        dateLabel={dayDateLabel}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}
