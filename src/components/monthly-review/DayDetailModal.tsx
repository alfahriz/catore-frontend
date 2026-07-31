import { Check, Snowflake, X } from 'lucide-react';
import type { DayState } from '../../lib/dayState';
import { getDummyDayDetail } from '../../lib/dummyData';
import { useUnitStore, formatWeight } from '../../lib/unitStore';
import styles from './DayDetailModal.module.css';

interface DayDetailModalProps {
  open: boolean;
  day: number | null;
  state: DayState | null;
  dateLabel: string;
  onClose: () => void;
}

const STATUS_ICON: Partial<Record<DayState, typeof Check>> = {
  logged: Check,
  over: Check,
  missed: X,
  frozen: Snowflake,
};

const STATUS_LABEL: Record<DayState, string> = {
  logged: 'Logged · Under limit',
  over: 'Logged · Over limit',
  missed: 'Missed',
  today: 'Today',
  upcoming: 'Upcoming',
  frozen: 'Frozen · streak protected',
};

const STATUS_TINT: Record<DayState, string> = {
  logged: 'oklch(58% 0.16 145 / 0.1)',
  over: 'oklch(60% 0.18 30 / 0.1)',
  missed: 'oklch(60% 0.18 30 / 0.08)',
  frozen: 'oklch(93% 0.02 220 / 0.6)',
  today: 'oklch(55% 0.09 255 / 0.1)',
  upcoming: 'var(--color-surface-input)',
};

const STATUS_COLOR: Record<DayState, string> = {
  logged: 'var(--color-success)',
  over: 'var(--color-warning)',
  missed: 'var(--color-warning)',
  frozen: 'oklch(42% 0.09 235)',
  today: 'var(--color-primary)',
  upcoming: 'var(--color-text-secondary)',
};

export function DayDetailModal({ open, day, state, dateLabel, onClose }: DayDetailModalProps) {
  const metricPreference = useUnitStore((s) => s.metricPreference);
  if (!open || day === null || state === null) return null;

  const detail = getDummyDayDetail(state);
  const hasData = detail.intake !== null;
  const StatusIcon = STATUS_ICON[state];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dateLabel}>{dateLabel}</div>
        <div className={styles.statusBadge} style={{ color: STATUS_COLOR[state], background: STATUS_TINT[state] }}>
          {StatusIcon && <StatusIcon size={13} strokeWidth={2.5} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />}
          {STATUS_LABEL[state]}
        </div>

        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Intake</span>
            <span className={styles.rowValue}>
              {hasData ? `${detail.intake!.toLocaleString('en-US')} kcal` : state === 'frozen' ? '— not logged (Frozen)' : '—'}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Limit</span>
            <span className={styles.rowValue}>{detail.limit.toLocaleString('en-US')} kcal</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Deficit</span>
            <span
              className={styles.rowValue}
              style={{ color: detail.deficit !== null && detail.deficit < 0 ? 'var(--color-warning)' : 'var(--color-success)' }}
            >
              {detail.deficit !== null ? `${detail.deficit >= 0 ? '+' : ''}${detail.deficit.toLocaleString('en-US')} kcal` : '—'}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Weight</span>
            <span className={styles.rowValue}>{detail.weight !== null ? formatWeight(detail.weight, metricPreference) : '—'}</span>
          </div>
        </div>

        {detail.items.length > 0 && (
          <div className={styles.itemsSection}>
            <span className={styles.itemsTitle}>What you ate</span>
            <div className={styles.itemsList}>
              {detail.items.map((item, i) => (
                <div className={styles.itemRow} key={i}>
                  {item.name} · {item.kcal} kcal
                </div>
              ))}
            </div>
          </div>
        )}

        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
