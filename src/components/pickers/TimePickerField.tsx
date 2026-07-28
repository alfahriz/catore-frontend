import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import styles from './TimePickerField.module.css';

interface TimePickerFieldProps {
  value: string; // "HH:MM", 24h
  onChange: (time: string) => void;
}

const INTERVAL_MINUTES = 15;

function buildTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += INTERVAL_MINUTES) {
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return options;
}

const TIME_OPTIONS = buildTimeOptions();

function formatDisplayTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// Terima ketikan manual: "7:30 AM", "19:30", "7:30pm", dst.
function tryParseTypedTime(text: string): string | null {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3];

  if (minute > 59) return null;

  if (period) {
    if (hour < 1 || hour > 12) return null;
    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
  } else if (hour > 23) {
    return null;
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function TimePickerField({ value, onChange }: TimePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [typedValue, setTypedValue] = useState<string | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open || !listRef.current) return;
    const selectedEl = listRef.current.querySelector<HTMLElement>('[data-selected="true"]');
    selectedEl?.scrollIntoView({ block: 'center' });
  }, [open]);

  const handleSelect = (time: string) => {
    onChange(time);
    setTypedValue(undefined);
    setOpen(false);
  };

  const handleTypedBlur = () => {
    if (typedValue !== undefined) {
      const parsed = tryParseTypedTime(typedValue);
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
          value={typedValue !== undefined ? typedValue : formatDisplayTime(value)}
          onChange={(e) => setTypedValue(e.target.value)}
          onBlur={handleTypedBlur}
          onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
        />
        <button type="button" className={styles.iconButton} onClick={() => setOpen((v) => !v)} aria-label="Open time list">
          <Clock size={16} strokeWidth={2} color="var(--color-accent)" />
        </button>
      </div>

      {open && (
        <div className={styles.popover} ref={listRef}>
          {TIME_OPTIONS.map((time) => {
            const isSelected = time === value;
            return (
              <button
                type="button"
                key={time}
                data-selected={isSelected}
                className={styles.option}
                style={{
                  background: isSelected ? 'var(--color-primary)' : 'transparent',
                  color: isSelected ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                }}
                onClick={() => handleSelect(time)}
              >
                {formatDisplayTime(time)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
