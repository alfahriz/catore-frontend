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

// Limit kalori harian aktif — lookup dari kategori aktif user, bukan angka lepas.
// Dipakai semua generator Log (Day/Week/Month/Year) & Monthly Review day-detail, biar 1 sumber kebenaran.
// (Masih dummy: kalau user ganti kategori di CategorySheet, ini gak ikut berubah karena belum ada
// global state/API — tapi minimal gak ada 5 angka "2150" lepas yang harus disinkronkan manual.)
export const DUMMY_ACTIVE_LIMIT = DUMMY_CATEGORIES.find((c) => c.label === DUMMY_ACTIVE_CATEGORY_LABEL)!.kcal;

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
  const limit = DUMMY_ACTIVE_LIMIT;
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

// --- Log (Brief 9) ---

// "Hari ini" acuan demo = Sat, Jul 6 2026 (offset 0), konsisten dgn DUMMY_TODAY_LABEL/DUMMY_BACKFILL_CARDS.
const LOG_TODAY = new Date(2026, 6, 6);

interface TimedEntry {
  name: string;
  kcal: number;
  minutesFromMidnight: number;
}

function formatMinutes(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Bucketing rule (Brief 9 Day tab): entry berurutan digabung ke titik terakhir kalau gap <=30 menit
// dari entry TERAKHIR di titik itu (rolling, bukan fixed window). Titik pertama chart = entry
// pertama (setelah bucketing) sbg tick KEDUA, tick PERTAMA = tick kedua - 30 menit dengan 0 kcal.
function buildHourlyFromEntries(entries: TimedEntry[]): { hour: string; cumulative: number }[] {
  if (entries.length === 0) return [];
  const sorted = [...entries].sort((a, b) => a.minutesFromMidnight - b.minutesFromMidnight);

  const points: { minutes: number; cumulative: number }[] = [];
  let runningTotal = 0;
  let lastEntryMinutes = -Infinity;

  for (const entry of sorted) {
    runningTotal += entry.kcal;
    if (entry.minutesFromMidnight - lastEntryMinutes <= 30) {
      points[points.length - 1].cumulative = runningTotal;
    } else {
      points.push({ minutes: entry.minutesFromMidnight, cumulative: runningTotal });
    }
    lastEntryMinutes = entry.minutesFromMidnight;
  }

  // Clamp ke 00:00 hari itu — anchor gak pernah nembus ke hari sebelumnya
  // (mis. entry pertama 00:20 → anchor jadi 00:00, bukan 23:50 kemarin).
  const anchor = { minutes: Math.max(points[0].minutes - 30, 0), cumulative: 0 };
  return [anchor, ...points].map((p) => ({ hour: formatMinutes(p.minutes), cumulative: p.cumulative }));
}

export interface DayLogDummy {
  dateLabel: string;
  isFrozenUnfilled: boolean;
  intake: number;
  limit: number;
  itemsLogged: number;
  hourly: { hour: string; cumulative: number }[];
  items: { name: string; kcal: number; time: string }[];
}

export function getDummyDayLog(dayOffset: number): DayLogDummy {
  const date = new Date(LOG_TODAY);
  date.setDate(date.getDate() + dayOffset);
  const weekdayMonthDay = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const dateLabel = `${weekdayMonthDay} ${date.getFullYear()}`;
  const limit = DUMMY_ACTIVE_LIMIT;

  if (dayOffset === 0) {
    // Entry asli (menit-presisi) — sumber tunggal, dipakai list "Logged today" DAN chart (via buildHourlyFromEntries).
    // Nasi goreng+Telur dadar (gap 20mnt) dan Ayam bakar+Es teh manis (gap 5mnt) dan Tahu isi+Susu kedelai (gap 7mnt)
    // sengaja berdekatan buat contoh kasus bucketing "nambah menu yang kelupaan".
    const todayEntries: TimedEntry[] = [
      { name: 'Nasi goreng', kcal: 300, minutesFromMidnight: 5 * 60 + 37 },
      { name: 'Telur dadar', kcal: 180, minutesFromMidnight: 5 * 60 + 57 },
      { name: 'Ayam bakar', kcal: 420, minutesFromMidnight: 12 * 60 + 10 },
      { name: 'Es teh manis', kcal: 150, minutesFromMidnight: 12 * 60 + 15 },
      { name: 'Kerupuk', kcal: 50, minutesFromMidnight: 15 * 60 + 30 },
      { name: 'Tahu isi', kcal: 350, minutesFromMidnight: 18 * 60 + 50 },
      { name: 'Susu kedelai', kcal: 120, minutesFromMidnight: 18 * 60 + 57 },
      { name: 'Salad ayam', kcal: 280, minutesFromMidnight: 20 * 60 + 12 },
    ];

    return {
      dateLabel,
      isFrozenUnfilled: false,
      intake: todayEntries.reduce((sum, e) => sum + e.kcal, 0),
      limit,
      itemsLogged: todayEntries.length,
      hourly: buildHourlyFromEntries(todayEntries),
      items: todayEntries.map((e) => ({ name: e.name, kcal: e.kcal, time: formatMinutes(e.minutesFromMidnight) })),
    };
  }

  // Wed, Jul 10 (offset +4 dari LOG_TODAY) sengaja Frozen belum diisi — konsisten dgn DUMMY_BACKFILL_CARDS.
  if (dayOffset === 4) {
    return { dateLabel, isFrozenUnfilled: true, intake: 0, limit, itemsLogged: 0, hourly: [], items: [] };
  }

  const seed = Math.abs(dayOffset) + 1;
  const itemCount = 4 + (seed % 6); // 4-9 item, biar tiap hari ada variasi jumlah masuk akal
  // Porsi kalori tiap entry digandakan seed-dependent (1x-2x) biar total intake harian bervariasi
  // lebar dan bisa nembus 80% limit (caution) atau >100% (over) — bukan selalu jauh di bawah limit.
  const portionMultiplier = 1 + ((seed * 7) % 5) * 0.25; // 1.0 / 1.25 / 1.5 / 1.75 / 2.0
  // Sebar entry sepanjang hari (menit dari tengah malam, semua dalam rentang wajar 06:00-23:00).
  // Beberapa pasangan berdekatan (gap 5-15 menit) buat simulasikan kasus "nambah menu yang kelupaan",
  // sama seperti pola offset-0 — diambil berurutan (bukan modulo-wrap) biar gak ada entry melompat ke tengah malam.
  const allSlots = [390, 405, 480, 735, 750, 765, 930, 1080, 1095, 1110, 1245, 1290, 1305];
  const startIdx = (seed * 3) % Math.max(allSlots.length - itemCount, 1);
  const dayEntries: TimedEntry[] = Array.from({ length: itemCount }, (_, i) => {
    const food = DUMMY_FOOD_HISTORY[(seed + i) % DUMMY_FOOD_HISTORY.length];
    const minutes = allSlots[startIdx + i];
    return { name: food.name, kcal: Math.round(food.kcal * portionMultiplier), minutesFromMidnight: minutes };
  });

  const intake = dayEntries.reduce((sum, e) => sum + e.kcal, 0);
  const hourly = buildHourlyFromEntries(dayEntries);
  const items = [...dayEntries]
    .sort((a, b) => a.minutesFromMidnight - b.minutesFromMidnight)
    .map((e) => ({ name: e.name, kcal: e.kcal, time: formatMinutes(e.minutesFromMidnight) }));

  return {
    dateLabel,
    isFrozenUnfilled: false,
    intake,
    limit,
    itemsLogged: items.length,
    hourly,
    items,
  };
}

export interface WeekBarDummy {
  label: string;
  dayOffset: number; // offset relatif LOG_TODAY, dipakai buat drill-down ke Day tab (bukan cuma label "Mon"/"Tue")
  intake: number | null;
  displayValue: number; // sama dengan intake kalau ada; placeholder kecil kalau null (biar warna state tetap keliatan di chart)
  limit: number;
  state: DayState;
}

export interface WeekLogDummy {
  title: string;
  avgLimit: number;
  sumLimit: number;
  avgIntake: number;
  sumIntake: number;
  daysLogged: number;
  bars: WeekBarDummy[];
  rows: { day: string; dayOffset: number; intake: string; limit: string; delta: string; deltaIsOver: boolean; state: DayState }[];
}

export function getDummyWeekLog(weekOffset: number): WeekLogDummy {
  const limit = DUMMY_ACTIVE_LIMIT;
  const seed = Math.abs(weekOffset);
  const isCurrent = weekOffset === 0;

  // Senin minggu "hari ini" (LOG_TODAY = Sat Jul 6 2026) sebagai acuan offset-0, lalu geser per weekOffset.
  const thisMonday = new Date(LOG_TODAY);
  thisMonday.setDate(thisMonday.getDate() - ((thisMonday.getDay() + 6) % 7));
  const weekStart = new Date(thisMonday);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Nomor minggu dalam bulan (W1 = minggu berisi tanggal 1-7, dst) berdasar tanggal mulai minggu (Senin).
  const weekNumberInMonth = Math.ceil(weekStart.getDate() / 7);
  const monthName = weekStart.toLocaleDateString('en-US', { month: 'long' });
  // Minggu lintas-bulan/tahun: tampilkan nama bulan (dan tahun kalau beda) akhir juga di sisi kanan,
  // mis. "29 Jun-5 Jul" atau "29 Dec 2026-4 Jan 2027", biar gak ambigu.
  const crossesMonth = weekStart.getMonth() !== weekEnd.getMonth();
  const crossesYear = weekStart.getFullYear() !== weekEnd.getFullYear();
  const dateRange = crossesMonth
    ? `${weekStart.getDate()} ${monthName.slice(0, 3)}-${weekEnd.getDate()} ${weekEnd.toLocaleDateString('en-US', { month: 'short' })}${crossesYear ? ` ${weekEnd.getFullYear()}` : ''}`
    : `${weekStart.getDate()}-${weekEnd.getDate()}`;
  const title = `W${weekNumberInMonth} ${monthName} ${weekStart.getFullYear()} (${dateRange})`;

  const states: DayState[] = isCurrent
    ? ['logged', 'logged', 'frozen', 'missed', 'missed', 'today', 'upcoming']
    : DUMMY_WEEK.map((_, i) => {
        const mod = (i + seed) % 6;
        if (mod === 0) return 'over';
        if (mod === 1) return 'missed';
        if (mod === 5) return 'frozen';
        return 'logged';
      });

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Porsi kalori tiap hari digandakan seed-dependent (0.7x-2.0x) biar avgIntake/minggu bervariasi lebar
  // dan bisa nembus 80% avgLimit (caution) atau >100% (over) — bukan selalu moderat di bawah limit.
  const portionMultiplier = 0.7 + ((seed * 5) % 14) * 0.1; // 0.7 .. 2.0
  // Limit BISA beda tiap hari (bukan flat 1 angka seminggu) — user bisa ganti kategori deficit
  // mid-week, atau ada bonus PA (exercise) di hari tertentu, kayak di Homepage. Variasi kecil
  // ±0-150 kcal per hari, deterministik dari seed+index biar konsisten tiap render.
  const dailyLimits = dayLabels.map((_, i) => limit + ((seed + i * 3) % 4) * 50);
  // Missed = gak logged sama sekali, jadi TIDAK punya angka intake (null) — beda dari logged/over
  // yang emang beneran ada datanya. avg/sum intake gak menghitung hari ini (intake tetap null).
  // displayValue tetap dikasih placeholder tinggi kecil biar warna state (missed/upcoming/frozen)
  // tetap keliatan di bar chart — Recharts gak render bar sama sekali kalau value null/0.
  const PLACEHOLDER_BAR_HEIGHT = Math.round(limit * 0.05);
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const bars: WeekBarDummy[] = states.map((state, i) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const dayOffset = Math.round((dayDate.getTime() - LOG_TODAY.getTime()) / MS_PER_DAY);
    const dayLimit = dailyLimits[i];
    const hasIntake = state === 'logged' || state === 'over';
    const base = state === 'over' ? dayLimit + 150 + ((seed + i) % 4) * 80 : dayLimit - 200 - ((seed + i) % 5) * 60;
    const intake = hasIntake ? Math.round(base * portionMultiplier) : null;
    return { label: dayLabels[i], dayOffset, intake, displayValue: intake ?? PLACEHOLDER_BAR_HEIGHT, limit: dayLimit, state };
  });

  // Sum & avg intake selalu dibagi 7 (bukan cuma hari yang logged) — hari yang belum diisi (null)
  // dihitung 0 di pembilang, "menyeret turun" rata-rata. Ini representasi sementara: kalau hari yang
  // missed di-backfill via Grace, sum/avg otomatis naik karena null-nya keisi angka beneran — pembagi
  // tetap 7, gak ikut berubah (beda dari limit yang emang selalu ke-total penuh 7 hari apa pun kondisinya).
  const sumIntake = bars.reduce((s, b) => s + (b.intake ?? 0), 0);
  const avgIntake = Math.round(sumIntake / 7);
  // Sum/avg limit sekarang dari total limit AKTUAL per-hari (bisa beda-beda), bukan limit*7 flat.
  const sumLimit = bars.reduce((s, b) => s + b.limit, 0);
  const avgLimitPerDay = Math.round(sumLimit / 7);
  const daysLogged = states.filter((s) => s === 'logged' || s === 'over').length;

  return {
    title,
    avgLimit: avgLimitPerDay,
    sumLimit,
    avgIntake,
    sumIntake,
    daysLogged,
    bars,
    // Semua 7 hari tetap tampil di tabel — hari yang belum ada intake (null: missed/upcoming/frozen/today)
    // ditampilkan sebagai 0, bukan di-skip, biar tabel selalu representasi minggu penuh.
    rows: bars.map((b) => {
      const actualIntake = b.intake ?? 0;
      const delta = b.limit - actualIntake;
      // Intake null/0 (belum ada data beneran) → delta gak relevan dihitung, tampilkan "-" bukan angka.
      const hasIntake = b.intake !== null && b.intake > 0;
      return {
        day: b.label,
        dayOffset: b.dayOffset,
        intake: actualIntake.toLocaleString('en-US'),
        limit: b.limit.toLocaleString('en-US'),
        delta: hasIntake ? `${delta >= 0 ? '+' : ''}${delta.toLocaleString('en-US')}` : '–',
        deltaIsOver: hasIntake && delta < 0,
        state: b.state,
      };
    }),
  };
}

export interface MonthBarDummy {
  label: string;
  intake: number | null;
  limit: number;
  state: 'over' | 'logged' | 'current' | 'upcoming';
}

export interface MonthLogDummy {
  title: string;
  avgLimitPerWeek: number;
  sumLimit: number;
  avgIntakePerWeek: number;
  sumIntake: number;
  daysLogged: number;
  daysInMonth: number;
  bars: MonthBarDummy[];
  weightTrend: { label: string; weight: number }[];
  startWeight: number;
  currentWeight: number;
  rows: { week: string; intake: string; deficit: string; deficitIsOver: boolean; logged: string }[];
}

export function getDummyMonthLog(monthOffset: number): MonthLogDummy {
  const limit = DUMMY_ACTIVE_LIMIT;
  const seed = Math.abs(monthOffset);
  const isCurrent = monthOffset === 0;
  const weekCount = 4 + (seed % 2);

  const bars: MonthBarDummy[] = Array.from({ length: weekCount }, (_, i) => {
    const isFuture = isCurrent && i >= weekCount - 1;
    const isCur = isCurrent && i === weekCount - 2;
    const state: MonthBarDummy['state'] = isFuture ? 'upcoming' : isCur ? 'current' : (i + seed) % 4 === 0 ? 'over' : 'logged';
    const intake = state === 'upcoming' ? null : state === 'over' ? limit * 7 + 900 + i * 200 : limit * 7 - 1200 - i * 150;
    return { label: `W${i + 1}`, intake, limit: limit * 7, state };
  });

  const startWeight = 79 + seed * 0.5;
  const currentWeight = startWeight - (1.2 + seed * 0.3);
  const weightTrend = bars.map((b, i) => ({
    label: b.label,
    weight: Math.round((startWeight - (i / (weekCount - 1)) * (startWeight - currentWeight)) * 10) / 10,
  }));

  const loggedBars = bars.filter((b) => b.intake !== null);
  const sumIntake = loggedBars.reduce((s, b) => s + (b.intake ?? 0), 0);
  const avgIntakePerWeek = loggedBars.length ? Math.round(sumIntake / loggedBars.length) : 0;
  const sumLimit = limit * 7 * weekCount;
  const daysInMonth = weekCount * 7;
  const daysLogged = loggedBars.length * 7 - (isCurrent ? 3 : 0);

  const monthName = new Date(2026, 6 + monthOffset, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return {
    title: monthName,
    avgLimitPerWeek: limit * 7,
    sumLimit,
    avgIntakePerWeek,
    sumIntake,
    daysLogged,
    daysInMonth,
    bars,
    weightTrend,
    startWeight,
    currentWeight,
    rows: loggedBars.map((b, i) => {
      const deficit = b.limit - (b.intake ?? 0);
      return {
        week: b.label,
        intake: (b.intake ?? 0).toLocaleString('en-US'),
        deficit: `${deficit >= 0 ? '+' : ''}${deficit.toLocaleString('en-US')}${i === 1 && isCurrent ? '*' : ''}`,
        deficitIsOver: deficit < 0,
        logged: '7/7',
      };
    }),
  };
}

export interface YearBarDummy {
  label: string;
  intake: number | null;
  limit: number;
  state: 'over' | 'logged' | 'current' | 'upcoming';
}

export interface YearLogDummy {
  title: string;
  avgLimitPerMonth: number;
  sumLimit: number;
  avgIntakePerMonth: number;
  sumIntake: number;
  daysLogged: number;
  daysInYear: number;
  bars: YearBarDummy[];
  weightTrend: { label: string; weight: number }[];
  startWeight: number;
  currentWeight: number;
  rows: { month: string; intake: string; deficit: string; deficitIsOver: boolean; logged: string }[];
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getDummyYearLog(yearOffset: number): YearLogDummy {
  const limit = DUMMY_ACTIVE_LIMIT;
  const seed = Math.abs(yearOffset);
  const isCurrent = yearOffset === 0;
  const currentMonthIndex = 6; // Juli

  const bars: YearBarDummy[] = MONTH_SHORT.map((label, i) => {
    const isFuture = isCurrent && i > currentMonthIndex;
    const isCur = isCurrent && i === currentMonthIndex;
    const monthDays = new Date(2026 + yearOffset, i + 1, 0).getDate();
    const monthLimit = limit * monthDays;
    const state: YearBarDummy['state'] = isFuture ? 'upcoming' : isCur ? 'current' : (i + seed) % 5 === 0 ? 'over' : 'logged';
    const intake = state === 'upcoming' ? null : state === 'over' ? monthLimit + 3000 + i * 400 : monthLimit - 5000 - i * 300;
    return { label, intake, limit: monthLimit, state };
  });

  const startWeight = 82 + seed * 0.8;
  const currentWeight = startWeight - (5.4 + seed * 0.6);
  const loggedCount = bars.filter((b) => b.intake !== null).length;
  const weightTrend = bars.slice(0, loggedCount || 1).map((b, i) => ({
    label: b.label,
    weight: Math.round((startWeight - (i / Math.max(loggedCount - 1, 1)) * (startWeight - currentWeight)) * 10) / 10,
  }));

  const loggedBars = bars.filter((b) => b.intake !== null);
  const sumIntake = loggedBars.reduce((s, b) => s + (b.intake ?? 0), 0);
  const avgIntakePerMonth = loggedBars.length ? Math.round(sumIntake / loggedBars.length) : 0;
  const sumLimit = bars.reduce((s, b) => s + b.limit, 0);
  const daysInYear = 365;
  const daysLogged = loggedBars.length * 30 - (isCurrent ? 10 : 0);

  return {
    title: `${2026 + yearOffset}`,
    avgLimitPerMonth: Math.round(sumLimit / 12),
    sumLimit,
    avgIntakePerMonth,
    sumIntake,
    daysLogged,
    daysInYear,
    bars,
    weightTrend,
    startWeight,
    currentWeight,
    rows: loggedBars.map((b, i) => {
      const deficit = b.limit - (b.intake ?? 0);
      return {
        month: b.label,
        intake: (b.intake ?? 0).toLocaleString('en-US'),
        deficit: `${deficit >= 0 ? '+' : ''}${deficit.toLocaleString('en-US')}${i === 2 && isCurrent ? '*' : ''}`,
        deficitIsOver: deficit < 0,
        logged: `${new Date(2026, i + 1, 0).getDate()}/${new Date(2026, i + 1, 0).getDate()}`,
      };
    }),
  };
}
