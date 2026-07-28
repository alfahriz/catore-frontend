import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DatePickerField.module.css';

interface DatePickerFieldProps {
  value: string; // ISO date, e.g. "2026-07-16"
  onChange: (isoDate: string) => void;
}

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(iso: string): string {
  const date = parseIsoDate(iso);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Terima ketikan manual bebas format umum: "Jul 16, 2026", "2026-07-16", "7/16/2026", dst.
function tryParseTypedDate(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;
  return formatIsoDate(parsed);
}

// Grid Senin-Minggu, termasuk padding hari dari bulan sebelum/sesudah.
function buildCalendarGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0=Mon
  const gridStart = new Date(year, month, 1 - firstWeekday);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return days;
}

export function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const [typedValue, setTypedValue] = useState<string | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const today = new Date();
  const grid = buildCalendarGrid(viewYear, viewMonth);

  const goPrevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const goNextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleSelectDay = (day: Date) => {
    onChange(formatIsoDate(day));
    setTypedValue(undefined);
    setOpen(false);
  };

  const handleTypedBlur = () => {
    if (typedValue !== undefined) {
      const parsed = tryParseTypedDate(typedValue);
      if (parsed) onChange(parsed);
    }
    setTypedValue(undefined);
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.field}>
        <input
          type="text"
          className={styles.textInput}
          value={typedValue !== undefined ? typedValue : formatDisplayDate(value)}
          onChange={(e) => setTypedValue(e.target.value)}
          onBlur={handleTypedBlur}
          onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
        />
        <button type="button" className={styles.iconButton} onClick={() => setOpen((v) => !v)} aria-label="Open calendar">
          <Calendar size={16} strokeWidth={2} color="var(--color-accent)" />
        </button>
      </div>

      {open && (
        <div className={styles.popover}>
          <div className={styles.popoverHeader}>
            <button type="button" className={styles.navButton} onClick={goPrevMonth} aria-label="Previous month">
              <ChevronLeft size={16} strokeWidth={2.2} />
            </button>
            <span className={styles.monthLabel}>{MONTH_LABELS[viewMonth]} {viewYear}</span>
            <button type="button" className={styles.navButton} onClick={goNextMonth} aria-label="Next month">
              <ChevronRight size={16} strokeWidth={2.2} />
            </button>
          </div>

          <div className={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i} className={styles.weekdayLabel}>{label}</span>
            ))}
          </div>

          <div className={styles.grid}>
            {grid.map((day, i) => {
              const isCurrentMonth = day.getMonth() === viewMonth;
              const isSelected = formatIsoDate(day) === value;
              const isToday = formatIsoDate(day) === formatIsoDate(today);
              return (
                <button
                  type="button"
                  key={i}
                  className={styles.dayCell}
                  style={{
                    color: isSelected ? 'var(--color-text-inverse)' : isCurrentMonth ? 'var(--color-text-primary)' : 'var(--color-text-disabled)',
                    background: isSelected ? 'var(--color-primary)' : 'transparent',
                    border: !isSelected && isToday ? '1.5px solid var(--color-primary)' : 'none',
                  }}
                  onClick={() => handleSelectDay(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
