import { BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDummyYearLog } from '../../lib/dummyData';
import styles from './LogTabs.module.css';

interface YearTabProps {
  yearOffset: number;
  onSelectMonth: (month: string) => void;
}

function barColor(state: string): string {
  if (state === 'over') return 'oklch(60% 0.18 30)';
  if (state === 'current') return 'var(--color-primary)';
  if (state === 'upcoming') return 'oklch(85% 0.01 255)';
  return 'var(--color-success)';
}

export function YearTab({ yearOffset, onSelectMonth }: YearTabProps) {
  const data = getDummyYearLog(yearOffset);

  return (
    <div>
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Limit/Month</span>
          <span className={styles.statValue}>{data.avgLimitPerMonth.toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {data.sumLimit.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Intake/Month</span>
          <span className={styles.statValue}>{data.avgIntakePerMonth.toLocaleString('en-US')}</span>
          <span className={styles.statSub}>Σ {data.sumIntake.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Days Logged</span>
          <span className={styles.statValue}>{data.daysLogged}/{data.daysInYear}</span>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartTitle}>Calories vs limit — by month</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.bars} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
            <Bar dataKey="intake" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={700}>
              {data.bars.map((b, i) => (
                <Cell key={i} fill={barColor(b.state)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartTitle}>Weight trend</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data.weightTrend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
            <Line type="monotone" dataKey="weight" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={false} isAnimationActive animationDuration={700} />
          </LineChart>
        </ResponsiveContainer>
        <div className={styles.chartCaption}>
          {data.startWeight.toFixed(1)} kg → {data.currentWeight.toFixed(1)} kg
        </div>
      </div>

      <div className={styles.sectionHeader}>By month</div>
      <div className={styles.table}>
        <div className={styles.tableHeaderRow}>
          <span>Month</span><span>Intake</span><span>Deficit</span><span>Logged</span>
        </div>
        {data.rows.map((row) => (
          <button className={styles.tableRowButton4} key={row.month} onClick={() => onSelectMonth(row.month)}>
            <span className={styles.rowDay}>{row.month}</span>
            <span>{row.intake}</span>
            <span style={{ color: row.deficitIsOver ? 'var(--color-warning)' : 'var(--color-success)' }}>{row.deficit}</span>
            <span>{row.logged}</span>
          </button>
        ))}
        {data.rows.some((r) => r.deficit.includes('*')) && <div className={styles.footnote}>* Includes a Frozen day not yet submitted</div>}
      </div>
    </div>
  );
}
