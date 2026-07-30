import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDummyDayLog } from '../../lib/dummyData';
import styles from './LogTabs.module.css';

interface DayTabProps {
  dayOffset: number;
}

export function DayTab({ dayOffset }: DayTabProps) {
  const data = getDummyDayLog(dayOffset);
  const remaining = data.limit - data.intake;
  const overLimit = remaining < 0;
  const rawPercent = data.intake / data.limit;

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
          <span className={styles.statLabel}>Left of {data.limit.toLocaleString('en-US')}</span>
          <span className={styles.statValue}>{remaining.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Items Logged</span>
          <span className={styles.statValue}>{data.itemsLogged}</span>
        </div>
      </div>

      {!data.isFrozenUnfilled && (
        <>
          <div className={styles.chartSection}>
            <div className={styles.chartTitle}>Progressive intake by hour</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.hourly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                <Line
                  type="monotone"
                  dataKey="cumulative"
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
            {data.items.map((item, i) => (
              <div className={styles.loggedRow} key={i}>
                <div className={styles.loggedName}>{item.name}</div>
                <span className={styles.loggedKcal}>{item.kcal.toLocaleString('en-US')}</span>
                <span className={styles.loggedTime}>{item.time}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {data.isFrozenUnfilled && (
        <div className={styles.frozenNotice}>Day frozen. Please submit the data.</div>
      )}
    </div>
  );
}
