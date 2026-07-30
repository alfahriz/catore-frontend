import { useState } from 'react';
import { DayTab } from '../components/log/DayTab';
import { WeekTab } from '../components/log/WeekTab';
import { MonthTab } from '../components/log/MonthTab';
import { YearTab } from '../components/log/YearTab';
import { getDummyDayLog, getDummyWeekLog, getDummyMonthLog, getDummyYearLog } from '../lib/dummyData';
import styles from './Log.module.css';

type LogTab = 'day' | 'week' | 'month' | 'year';
const TABS: { key: LogTab; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

export function Log() {
  const [tab, setTab] = useState<LogTab>('day');
  const [dayOffset, setDayOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const offset = tab === 'day' ? dayOffset : tab === 'week' ? weekOffset : tab === 'month' ? monthOffset : yearOffset;
  const isCurrent = offset === 0;
  const setOffset = tab === 'day' ? setDayOffset : tab === 'week' ? setWeekOffset : tab === 'month' ? setMonthOffset : setYearOffset;

  const periodLabel =
    tab === 'day'
      ? getDummyDayLog(dayOffset).dateLabel
      : tab === 'week'
        ? getDummyWeekLog(weekOffset).title
        : tab === 'month'
          ? getDummyMonthLog(monthOffset).title
          : getDummyYearLog(yearOffset).title;

  // Jumlah opsi picker beda per satuan waktu — skala wajar tiap tab (bukan 6 generik semua tab).
  const PICKER_RANGE: Record<LogTab, number> = { day: 30, week: 12, month: 12, year: 5 };
  const pickerOptions = Array.from({ length: PICKER_RANGE[tab] }, (_, i) => -i).map((o) => ({
    offset: o,
    label:
      tab === 'day'
        ? getDummyDayLog(o).dateLabel
        : tab === 'week'
          ? getDummyWeekLog(o).title
          : tab === 'month'
            ? getDummyMonthLog(o).title
            : getDummyYearLog(o).title,
  }));

  // Drill-down Week → Day: pindah tab, bukan buka modal (simetris dgn drill-down Year→Month, Month→Week).
  function handleSelectDay(dayOffsetToOpen: number) {
    setDayOffset(dayOffsetToOpen);
    setTab('day');
  }

  // Drill-down Month → Week: pindah tab, simetris dgn drill-down Week→Day.
  function handleSelectWeek(weekOffsetToOpen: number) {
    setWeekOffset(weekOffsetToOpen);
    setTab('week');
  }

  // Drill-down Year → Month: pindah tab, simetris dgn drill-down Month→Week & Week→Day.
  function handleSelectMonth(monthOffsetToOpen: number) {
    setMonthOffset(monthOffsetToOpen);
    setTab('month');
  }

  return (
    <div className={styles.page}>
      <div className={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tabButton} ${tab === t.key ? styles.tabButtonActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.header}>
        <button className={styles.navButton} onClick={() => setOffset((o) => o - 1)} aria-label="Previous period">‹</button>
        <button className={styles.periodButton} onClick={() => setPickerOpen(true)}>
          <span className={styles.periodTitle}>{periodLabel}</span>
        </button>
        <button
          className={styles.navButton}
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          aria-label="Next period"
          style={{ visibility: isCurrent ? 'hidden' : 'visible' }}
        >
          ›
        </button>
      </div>

      {tab === 'day' && <DayTab dayOffset={dayOffset} />}
      {tab === 'week' && <WeekTab weekOffset={weekOffset} onSelectDay={handleSelectDay} />}
      {tab === 'month' && <MonthTab monthOffset={monthOffset} onSelectWeek={handleSelectWeek} />}
      {tab === 'year' && <YearTab yearOffset={yearOffset} onSelectMonth={handleSelectMonth} />}

      {pickerOpen && (
        <div className={styles.pickerOverlay} onClick={() => setPickerOpen(false)}>
          <div className={styles.pickerSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.pickerTitle}>Jump to period</div>
            {pickerOptions.map((opt) => (
              <button
                key={opt.offset}
                className={`${styles.pickerItem} ${opt.offset === offset ? styles.pickerItemActive : ''}`}
                onClick={() => {
                  setOffset(opt.offset);
                  setPickerOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
