import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../lib/toastStore';
import { useDataRefreshStore } from '../../lib/dataRefreshStore';
import { resolveDayPeriod } from '../../lib/logPeriod';
import styles from './LogTabs.module.css';

interface DayTabProps {
  dayOffset: number;
}

interface HourlyPoint {
  hour: number;
  cumulativeCalories: number;
}

interface EntryItem {
  entryPk: number;
  foodName: string;
  calories: number;
  mealType: string;
  entryTimestamp: string;
}

interface LogDayResponse {
  intake: number;
  left: number;
  itemsLogged: number;
  isFrozen: boolean;
  cumulativeIntakeByHour: HourlyPoint[];
  entries: EntryItem[];
}

export function DayTab({ dayOffset }: DayTabProps) {
  const showToast = useToastStore((s) => s.showToast);
  const consumptionBumpedAt = useDataRefreshStore((s) => s.consumptionBumpedAt);
  const [data, setData] = useState<LogDayResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Add Consumption dipegang BottomNav (mount sekali di AppLayout, sibling dari tab ini) —
  // submit sukses gak bikin tab ini unmount/remount, jadi butuh `consumptionBumpedAt` di dependency
  // biar re-fetch (lihat dataRefreshStore.ts).
  useEffect(() => {
    setLoading(true);
    const { isoDate } = resolveDayPeriod(dayOffset);
    apiClient
      .get<LogDayResponse>('/log/day', { params: { date: isoDate } })
      .then((res) => setData(res.data))
      .catch(() => showToast('Failed to load day log', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayOffset, consumptionBumpedAt]);

  if (loading || !data) return <div />;

  const limit = data.intake + data.left;
  const remaining = data.left;
  const overLimit = remaining < 0;
  const rawPercent = limit > 0 ? data.intake / limit : 0;
  // isFrozenUnfilled = hari Frozen (Streak Freeze) yg BELUM diisi sama sekali — beda dari Frozen
  // yg udah dibackfill (itemsLogged>0, treated normal spt hari Logged biasa, PRD 5.6).
  const isFrozenUnfilled = data.isFrozen && data.itemsLogged === 0;

  // 3 case sama seperti ring Homepage: normal (<80%, biru) / caution (80-99%, kuning) / over (>=100%, merah)
  const leftOfBg = overLimit
    ? 'oklch(60% 0.18 30 / 0.12)'
    : rawPercent >= 0.8
      ? 'oklch(75% 0.16 85 / 0.18)'
      : 'oklch(58% 0.15 255 / 0.1)';

  return (
    <div>
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Intake</span>
          <span className={styles.statValue}>{data.intake.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard} style={{ background: leftOfBg }}>
          <span className={styles.statLabel}>Left of {limit.toLocaleString('en-US')}</span>
          <span className={styles.statValue}>{remaining.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Items Logged</span>
          <span className={styles.statValue}>{data.itemsLogged}</span>
        </div>
      </div>

      {!isFrozenUnfilled && (
        <>
          <div className={styles.chartSection}>
            <div className={styles.chartTitle}>Progressive intake by hour</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.cumulativeIntakeByHour} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                <Line
                  type="monotone"
                  dataKey="cumulativeCalories"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={false}
                  isAnimationActive
                  animationDuration={700}
                  animationBegin={0}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className={styles.chartCaption}>Intake accumulated through the day, hour by hour.</div>
          </div>

          <div className={styles.sectionHeader}>Logged Today</div>
          <div className={styles.loggedList}>
            <div className={styles.loggedHeaderRow}>
              <span className={styles.loggedHeaderName}>Name</span>
              <span className={styles.loggedHeaderIntake}>Intake</span>
              <span className={styles.loggedHeaderTime}>Time</span>
            </div>
            {data.entries.map((item) => (
              <div className={styles.loggedRow} key={item.entryPk}>
                <div className={styles.loggedName}>{item.foodName}</div>
                <span className={styles.loggedKcal}>{item.calories.toLocaleString('en-US')}</span>
                <span className={styles.loggedTime}>
                  {new Date(item.entryTimestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {isFrozenUnfilled && (
        <div className={styles.frozenNotice}>Day frozen. Please submit the data.</div>
      )}
    </div>
  );
}
