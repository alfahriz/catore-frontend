import { useState } from 'react';
import { DAY_STATE_STYLES, dayStateBoxShadow } from '../lib/dayState';
import {
  DUMMY_ACTIVE_CATEGORY_LABEL,
  DUMMY_CATEGORIES,
  DUMMY_CONSUMED,
  DUMMY_CURRENT_WEIGHT,
  DUMMY_LOGGED_ITEMS,
  DUMMY_MISSED_BANNER,
  DUMMY_WEEK,
} from '../lib/dummyData';
import { CategorySheet } from '../components/homepage/CategorySheet';
import styles from './Homepage.module.css';

const RING_RADIUS = 82;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function Homepage() {
  const [paOn, setPaOn] = useState(false);
  const [categoryLabel, setCategoryLabel] = useState(DUMMY_ACTIVE_CATEGORY_LABEL);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  const activeCategory = DUMMY_CATEGORIES.find((c) => c.label === categoryLabel) ?? DUMMY_CATEGORIES[1];
  const limit = activeCategory.kcal + (paOn ? 200 : 0);
  const remaining = limit - DUMMY_CONSUMED;
  const overLimit = remaining < 0;
  const percent = Math.min(DUMMY_CONSUMED / limit, 1);

  const ringColor = overLimit ? 'var(--color-warning)' : 'var(--color-primary)';
  const remainingColor = overLimit ? 'var(--color-warning)' : 'var(--color-success)';
  const remainingLabel = overLimit
    ? `${Math.abs(remaining).toLocaleString('en-US')} kcal over`
    : `${remaining.toLocaleString('en-US')} kcal left`;

  return (
    <div className={styles.page}>
      {DUMMY_MISSED_BANNER.show && (
        <div className={`${styles.banner} ${styles.bannerMissed}`}>
          <div style={{ flex: 1 }}>
            <div className={styles.bannerTitle}>{DUMMY_MISSED_BANNER.title}</div>
            <div className={styles.bannerSubtitle}>{DUMMY_MISSED_BANNER.subtitle}</div>
          </div>
          <button className={styles.fixButton}>Fix</button>
        </div>
      )}

      <div className={styles.ringWrapper}>
        <div className={styles.ring}>
          <svg width={200} height={200} viewBox="0 0 200 200" className={styles.ringSvg}>
            <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="#EDE7D9" strokeWidth={14} />
            <circle
              cx="100"
              cy="100"
              r={RING_RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - percent)}
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <div className={styles.ringLabels}>
            <span className={styles.ringConsumed}>{DUMMY_CONSUMED.toLocaleString('en-US')}</span>
            <span className={styles.ringLimit}>/ {limit.toLocaleString('en-US')} kcal</span>
            <span className={styles.ringRemaining} style={{ color: remainingColor }}>{remainingLabel}</span>
          </div>
        </div>
      </div>

      <div className={styles.categoryRow}>
        <button className={styles.categoryButton} onClick={() => setCategorySheetOpen(true)}>
          {activeCategory.label} · {limit.toLocaleString('en-US')} kcal ▾
        </button>
      </div>

      <div className={styles.cardRow}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Current weight</span>
          <span className={styles.cardValue}>{DUMMY_CURRENT_WEIGHT} kg</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Exercise today</span>
          <button
            className={styles.paToggle}
            style={{ background: paOn ? 'var(--color-accent)' : '#DCD5C4' }}
            onClick={() => setPaOn((v) => !v)}
            aria-label="Toggle exercise today"
          >
            <div className={styles.paKnob} style={{ transform: paOn ? 'translateX(20px)' : 'translateX(0)' }} />
          </button>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>This week</span>
        <button className={styles.linkButton}>See weekly review →</button>
      </div>
      <div className={styles.weekRow}>
        {DUMMY_WEEK.map((day) => {
          const style = DAY_STATE_STYLES[day.state];
          return (
            <div className={styles.weekDay} key={day.label}>
              <span className={styles.weekDayLabel}>{day.label}</span>
              <div
                className={styles.weekDayCircle}
                style={{
                  background: style.bg,
                  border: style.border,
                  boxShadow: dayStateBoxShadow(day.state),
                  color: style.iconColor,
                }}
              >
                {style.icon}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Logged today</span>
      </div>
      <div className={styles.loggedList}>
        {DUMMY_LOGGED_ITEMS.map((item, i) => (
          <div className={styles.loggedRow} key={i}>
            <div className={styles.loggedName}>{item.name}</div>
            <span className={styles.loggedKcal}>{item.kcal} kcal</span>
            <span className={styles.loggedTime}>{item.time}</span>
          </div>
        ))}
      </div>

      <CategorySheet
        open={categorySheetOpen}
        activeLabel={categoryLabel}
        onClose={() => setCategorySheetOpen(false)}
        onSelect={(label) => {
          setCategoryLabel(label);
          setCategorySheetOpen(false);
        }}
      />
    </div>
  );
}
