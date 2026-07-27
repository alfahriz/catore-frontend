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

export const DUMMY_CONSUMED = 1450;

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
