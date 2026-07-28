// Dummy data terpusat — dipakai semua page selama backend belum diintegrasikan.
// Timpa/ganti isi file ini (atau ganti importer jadi hook API) saat data asli sudah tersedia,
// tanpa perlu menyentuh komponen yang mengimpornya.

import type { DayState } from './dayState';

export interface WeekDayDummy {
  label: string;
  state: DayState;
}

export const DUMMY_WEEK: WeekDayDummy[] = [
  { label: 'Mon', state: 'logged' },
  { label: 'Tue', state: 'logged' },
  { label: 'Wed', state: 'frozen' },
  { label: 'Thu', state: 'missed' },
  { label: 'Fri', state: 'missed' },
  { label: 'Sat', state: 'today' },
  { label: 'Sun', state: 'upcoming' },
];

export const DUMMY_LOGGED_ITEMS = [
  { name: 'Nasi goreng', kcal: 300, time: '7:15 AM' },
  { name: 'Telur dadar', kcal: 180, time: '7:20 AM' },
  { name: 'Ayam bakar', kcal: 420, time: '12:40 PM' },
  { name: 'Es teh manis', kcal: 150, time: '12:45 PM' },
  { name: 'Kerupuk', kcal: 50, time: '3:30 PM' },
  { name: 'Tahu isi', kcal: 350, time: '6:50 PM' },
];

export const DUMMY_CONSUMED = 1750;

export const DUMMY_CURRENT_WEIGHT = 77.4;

export interface DeficitCategoryDummy {
  label: string;
  kcal: number;
  desc: string;
}

export const DUMMY_CATEGORIES: DeficitCategoryDummy[] = [
  { label: 'Recovery', kcal: 2450, desc: 'Maintenance — no deficit, ideal for rest or recovery periods.' },
  { label: 'Soft', kcal: 2150, desc: 'Gentle, sustainable deficit for steady progress.' },
  { label: 'Mid', kcal: 2050, desc: 'Balanced deficit for faster results.' },
  { label: 'Hard', kcal: 1950, desc: 'Aggressive deficit — short-term use only.' },
];

export const DUMMY_ACTIVE_CATEGORY_LABEL = 'Soft';

export const DUMMY_STREAK = {
  count: 12,
  isGoalAchieved: false,
  streakFreezeAvailable: 1,
  streakFreezeMax: 2,
  wipeFreezeAvailable: 0,
  wipeFreezeMax: 2,
};

export const DUMMY_MISSED_BANNER = {
  show: true,
  title: '2 days not logged (Thu, Fri)',
  subtitle: 'Thu resets tonight',
};

export const DUMMY_TODAY_LABEL = 'Jul 16, 2026';

// true = user sudah log berat hari ini (mode "Update"), false = belum (mode "Log")
export const DUMMY_HAS_LOGGED_WEIGHT_TODAY = false;

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export interface FoodHistoryDummy {
  name: string;
  kcal: number;
}

// Riwayat all-time, sumber autocomplete saat mengetik nama item.
export const DUMMY_FOOD_HISTORY: FoodHistoryDummy[] = [
  { name: 'Nasi goreng', kcal: 300 },
  { name: 'Ayam bakar', kcal: 420 },
  { name: 'Telur dadar', kcal: 180 },
  { name: 'Oatmeal', kcal: 220 },
  { name: 'Es teh manis', kcal: 150 },
  { name: 'Kerupuk', kcal: 50 },
  { name: 'Tahu isi', kcal: 350 },
  { name: 'Salad ayam', kcal: 280 },
];

// Fixed list "kemarin", dipakai quick-add chips.
export const DUMMY_QUICK_ADD: FoodHistoryDummy[] = [
  { name: 'Oatmeal', kcal: 220 },
  { name: 'Salad ayam', kcal: 280 },
  { name: 'Susu kedelai', kcal: 120 },
];

export type BackfillCardType = 'missing-last' | 'missing' | 'today' | 'frozen';

export interface BackfillCardDummy {
  isoDate: string;
  type: BackfillCardType;
  dateLabel: string;
  statusLabel: string;
}

export const DUMMY_BACKFILL_CARDS: BackfillCardDummy[] = [
  { isoDate: '2026-07-04', type: 'missing-last', dateLabel: 'Thu, Jul 4', statusLabel: 'Last day, resets tonight' },
  { isoDate: '2026-07-05', type: 'missing', dateLabel: 'Fri, Jul 5', statusLabel: '1 day left' },
  { isoDate: '2026-07-06', type: 'today', dateLabel: 'Sat, Jul 6 · Today', statusLabel: 'Not logged yet' },
  { isoDate: '2026-07-10', type: 'frozen', dateLabel: 'Wed, Jul 10', statusLabel: 'Frozen — no deadline, but please submit the data' },
];

// --- Profile (Brief 11) ---

export const DUMMY_PROFILE = {
  nickname: 'Rafi',
  avatarInitial: 'R',
  gender: 'Male',
  age: 27,
  heightCm: 175,
  weightKg: 77.4,
  timezone: 'Asia/Jakarta (WIB)',
  timezoneLocked: false,
  metricPreference: 'kg' as 'kg' | 'lb',
  hasActivityAssessment: true,
  activityLevel: 'Moderately active',
  goalWeightKg: 68,
  suggestedGoalKg: 66.5,
  suggestedGoalBmi: 21.7,
  bmi: 25.3,
  bmiCategory: 'Overweight',
  tdee: 2416,
};

export interface LimitPreviewDummy {
  label: string;
  kcal: number;
}

export const DUMMY_LIMIT_PREVIEW: LimitPreviewDummy[] = [
  { label: 'Recovery', kcal: 2416 },
  { label: 'Soft', kcal: 2116 },
  { label: 'Mid', kcal: 2016 },
  { label: 'Hard', kcal: 1916 },
];

// --- Monthly Review (Brief 8) ---

export interface WeeklyRowDummy {
  label: string; // "W1"
  intake: string; // "12,450" atau "—" kalau belum terjadi
  deficit: string; // "+320" / "-150*" (bertanda * kalau ada hari Frozen belum diisi)
  deficitIsOver: boolean;
  weight: string; // carry-forward, "77.4 kg"
  delta: string; // "-0.2 kg"
}

export interface MonthCellDummy {
  day: number;
  state: DayState;
}

export interface MonthDataDummy {
  title: string;
  subtitle: string;
  weeklyRows: WeeklyRowDummy[];
  change: { headline: string; direction: 'lost' | 'gain' | 'none'; subtext: string };
  leadingEmpty: number;
  cells: MonthCellDummy[];
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "Bulan berjalan" acuan demo = Juli 2026 (offset 0). monthOffset negatif = mundur ke bulan lalu.
const CURRENT_YEAR = 2026;
const CURRENT_MONTH_INDEX = 6; // Juli (0-based)

// Bulan berjalan (offset 0) pakai data tetap yang sudah ada sebelumnya (dikurasi manual, cocok dengan detail modal).
// Bulan-bulan lampau (offset < 0) di-generate deterministik dari offset, biar tiap bulan beda tapi konsisten tiap render.
export function getDummyMonthData(monthOffset: number): MonthDataDummy {
  const targetDate = new Date(CURRENT_YEAR, CURRENT_MONTH_INDEX + monthOffset, 1);
  const year = targetDate.getFullYear();
  const monthIndex = targetDate.getMonth();
  const monthName = MONTH_NAMES[monthIndex];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingEmpty = (new Date(year, monthIndex, 1).getDay() + 6) % 7; // Senin=0

  if (monthOffset === 0) {
    return {
      title: `${monthName} review`,
      subtitle: 'Week 1–5 · Goal 68 kg',
      weeklyRows: [
        { label: 'W1', intake: '12,450', deficit: '+320', deficitIsOver: false, weight: '77.4 kg', delta: '-0.2 kg' },
        { label: 'W2', intake: '13,100', deficit: '-150*', deficitIsOver: true, weight: '77.1 kg', delta: '-0.3 kg' },
        { label: 'W3', intake: '12,800', deficit: '+180', deficitIsOver: false, weight: '76.8 kg', delta: '-0.3 kg' },
        { label: 'W4', intake: '11,900', deficit: '+520', deficitIsOver: false, weight: '76.5 kg', delta: '-0.3 kg' },
        { label: 'W5', intake: '—', deficit: '—', deficitIsOver: false, weight: '—', delta: '—' },
      ],
      change: { headline: '1.2 kg lost', direction: 'lost', subtext: '9.4 kg left toward goal (77.4 → 68 kg)' },
      leadingEmpty,
      cells: Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        let state: DayState = 'logged';
        if (day === 6) state = 'today';
        else if (day > 6) state = 'upcoming';
        else if (day === 3 || day === 4) state = 'missed';
        else if (day === 5) state = 'frozen';
        else if (day === 2) state = 'over';
        return { day, state };
      }),
    };
  }

  // Bulan lampau — seluruh bulan sudah terjadi, tidak ada "upcoming". Variasi deterministik dari offset.
  const seed = Math.abs(monthOffset);
  const weekCount = Math.ceil((leadingEmpty + daysInMonth) / 7);
  const totalDelta = -(0.8 + (seed % 3) * 0.4);
  const startWeight = 79 + seed * 0.6;

  const weeklyRows: WeeklyRowDummy[] = Array.from({ length: weekCount }, (_, wi) => {
    const intakeBase = 11500 + ((wi + seed) % 4) * 700;
    const limitBase = 15050;
    const deficit = limitBase - intakeBase;
    const hasFrozenThisWeek = (wi + seed) % 5 === 0;
    const weightDelta = -0.15 - ((wi + seed) % 3) * 0.1;
    const weight = startWeight + weightDelta * (wi + 1);
    return {
      label: `W${wi + 1}`,
      intake: intakeBase.toLocaleString('en-US'),
      deficit: `${deficit >= 0 ? '+' : ''}${deficit.toLocaleString('en-US')}${hasFrozenThisWeek ? '*' : ''}`,
      deficitIsOver: deficit < 0,
      weight: `${weight.toFixed(1)} kg`,
      delta: `${weightDelta.toFixed(1)} kg`,
    };
  });

  const cells: MonthCellDummy[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    let state: DayState = 'logged';
    const mod = (day + seed) % 7;
    if (mod === 0) state = 'over';
    else if (mod === 1) state = 'missed';
    else if (mod === 2 && day % 6 === 0) state = 'frozen';
    return { day, state };
  });

  return {
    title: `${monthName} review`,
    subtitle: `Week 1–${weekCount} · Goal 68 kg`,
    weeklyRows,
    change: {
      headline: `${Math.abs(totalDelta).toFixed(1)} kg lost`,
      direction: 'lost',
      subtext: `${(startWeight - 68).toFixed(1)} kg left toward goal (${startWeight.toFixed(1)} → 68 kg)`,
    },
    leadingEmpty,
    cells,
  };
}

export interface DayDetailDummy {
  intake: number | null;
  limit: number;
  deficit: number | null;
  weight: string;
  items: FoodHistoryDummy[];
}

// Dummy detail per hari, dipakai modal detail hari.
export function getDummyDayDetail(state: DayState): DayDetailDummy {
  const limit = 2150;
  const hasData = state === 'logged' || state === 'over' || state === 'today';
  const intake = hasData ? (state === 'over' ? 2400 : 1800) : null;
  return {
    intake,
    limit,
    deficit: hasData ? limit - intake! : null,
    weight: hasData ? '77.4 kg' : '—',
    items: hasData ? DUMMY_LOGGED_ITEMS.slice(0, 2) : [],
  };
}
