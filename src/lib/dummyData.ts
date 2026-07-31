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
        { label: 'W1', intake: '12,450', deficit: '+320', deficitIsOver: false, weight: '77.40 kg', delta: '-0.20 kg' },
        { label: 'W2', intake: '13,100', deficit: '-150*', deficitIsOver: true, weight: '77.10 kg', delta: '-0.30 kg' },
        { label: 'W3', intake: '12,800', deficit: '+180', deficitIsOver: false, weight: '76.80 kg', delta: '-0.30 kg' },
        { label: 'W4', intake: '11,900', deficit: '+520', deficitIsOver: false, weight: '76.50 kg', delta: '-0.30 kg' },
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
      weight: `${weight.toFixed(2)} kg`,
      delta: `${weightDelta.toFixed(2)} kg`,
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
      headline: `${Math.abs(totalDelta).toFixed(2)} kg lost`,
      direction: 'lost',
      subtext: `${(startWeight - 68).toFixed(2)} kg left toward goal (${startWeight.toFixed(2)} → 68 kg)`,
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
    weight: hasData ? '77.40 kg' : '—',
    items: hasData ? DUMMY_LOGGED_ITEMS.slice(0, 2) : [],
  };
}

// --- Log (Brief 9) ---

// "Hari ini" acuan demo = Thu, Jul 23 2026 (offset 0) — sengaja jatuh di W4 Juli biar demo Month tab
// nunjukkin W4=current, W5=upcoming.
const LOG_TODAY = new Date(2026, 6, 23);

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
  // Format seragam apa pun kondisinya (sama bulan/lintas bulan/lintas tahun): "29 June - 5 July",
  // nama bulan penuh selalu ditulis kedua sisi biar desain konsisten, tahun akhir ikut ditulis kalau beda.
  const crossesYear = weekStart.getFullYear() !== weekEnd.getFullYear();
  const endMonthName = weekEnd.toLocaleDateString('en-US', { month: 'long' });
  const dateRange = `${weekStart.getDate()} ${monthName} - ${weekEnd.getDate()} ${endMonthName}${crossesYear ? ` ${weekEnd.getFullYear()}` : ''}`;
  const title = `W${weekNumberInMonth} ${monthName} ${weekStart.getFullYear()} (${dateRange})`;

  // Index hari ini dalam minggu (0=Senin..6=Minggu), dihitung dari LOG_TODAY beneran — bukan hardcode
  // index-5 (Sabtu). Hari sebelum today = logged/frozen/missed (sudah lewat), today = 'today', sesudah = upcoming.
  const todayIndex = (LOG_TODAY.getDay() + 6) % 7;
  const states: DayState[] = isCurrent
    ? DUMMY_WEEK.map((_, i) => {
        if (i === todayIndex) return 'today';
        if (i > todayIndex) return 'upcoming';
        const mod = i % 3;
        if (mod === 0) return 'logged';
        if (mod === 1) return 'frozen';
        return 'missed';
      })
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
    const label = `${dayLabels[i]} (${dayDate.getDate()})`;
    return { label, dayOffset, intake, displayValue: intake ?? PLACEHOLDER_BAR_HEIGHT, limit: dayLimit, state };
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
      // Delta = |limit-intake| polos (bukan surplus/defisit bertanda) — over limit selalu merah, under/sama
      // selalu hijau, angkanya cuma besaran selisih tanpa +/-.
      const delta = Math.abs(b.limit - actualIntake);
      // Intake null/0 (belum ada data beneran) → delta gak relevan dihitung, tampilkan "-" bukan angka.
      const hasIntake = b.intake !== null && b.intake > 0;
      return {
        day: b.label,
        dayOffset: b.dayOffset,
        intake: actualIntake.toLocaleString('en-US'),
        limit: b.limit.toLocaleString('en-US'),
        delta: hasIntake ? delta.toLocaleString('en-US') : '–',
        deltaIsOver: hasIntake && actualIntake > b.limit,
        state: b.state,
      };
    }),
  };
}

// 6 tipe minggu (Month tab), urut prioritas evaluasi (paling atas menang kalau kondisi tumpang tindih):
// 6 upcoming (belum kejalani) > 5 current (lagi berjalan) > 3 incomplete-open (ada hari kosong TANPA freeze,
// paling urgent krn user harus segera isi) > 4 incomplete-frozen (ada hari kosong tapi freeze, gak urgent)
// > 2 over (semua 7 hari terisi, total over limit) > 1 logged (semua 7 hari terisi, total under limit).
// Prioritas ini brarti minggu yang "over" tapi juga ada hari kosong-tanpa-freeze tetap masuk 3, BUKAN 2 —
// kelengkapan data selalu didahulukan sebelum performa (over/under).
export type MonthWeekState = 'logged' | 'over' | 'incomplete-open' | 'incomplete-frozen' | 'current' | 'upcoming';

export interface MonthBarDummy {
  label: string;
  weekOffset: number;
  intake: number | null;
  displayValue: number;
  limit: number;
  daysFilled: number; // dari 7 — dipakai kolom "Logged" tabel & badge hari kosong
  state: MonthWeekState;
  weight: number | null; // null kalau upcoming (belum ada weigh-in)
  weightDelta: number | null; // vs minggu weighable SEBELUMNYA (lintas-bulan) — null kalau gak ada pembanding
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
  rows: { week: string; weekOffset: number; intake: string; limit: string; deficit: string; deficitIsOver: boolean; logged: string; state: MonthWeekState }[];
}

// Berat badan minggu manapun (relatif LOG_TODAY, weekOffset=0 = minggu ini) — deterministik & KONTINU
// lintas-bulan, bukan reset per-bulan. Trennya turun ~0.3kg/minggu makin ke masa lalu (weekOffset makin
// negatif = weekOffset lebih lampau = berat lebih tinggi), + noise kecil deterministik biar gak garis lurus
// sempurna. Dipakai getDummyMonthLog supaya W1 bulan manapun punya delta valid vs minggu terakhir bulan
// SEBELUMNYA (dihitung dari weekOffset yang sama, bukan array index lokal per-bulan).
function weightAtWeekOffset(weekOffset: number): number {
  const BASE_WEIGHT = 77.8; // berat di weekOffset=0 (minggu ini)
  const TREND_PER_WEEK = 0.3; // makin ke masa lalu, makin berat (proses turun berat berjalan maju)
  const noise = Math.sin(weekOffset * 1.7) * 0.25; // variasi kecil deterministik, gak monotonic sempurna
  return Math.round((BASE_WEIGHT - weekOffset * TREND_PER_WEEK + noise) * 100) / 100;
}

// Konversi index bulan absolut (year*12+month) ke weekOffset minggu TERAKHIR yang overlap bulan itu —
// dipakai Year tab supaya weight per-bulan reuse weightAtWeekOffset (1 sumber kebenaran sama Month tab),
// bukan formula weight terpisah. "Minggu terakhir bulan" = Senin terakhir yang tanggalnya masih ≤ akhir bulan.
function monthOffsetToLastWeekOffset(monthAbsIndex: number): number {
  const year = Math.floor(monthAbsIndex / 12);
  const month = monthAbsIndex % 12;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lastOfMonth = new Date(year, month, daysInMonth);
  const lastMonday = new Date(lastOfMonth);
  lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7));

  const thisMonday = new Date(LOG_TODAY);
  thisMonday.setDate(thisMonday.getDate() - ((thisMonday.getDay() + 6) % 7));
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((lastMonday.getTime() - thisMonday.getTime()) / (MS_PER_DAY * 7));
}

export function getDummyMonthLog(monthOffset: number): MonthLogDummy {
  const limit = DUMMY_ACTIVE_LIMIT;

  // Senin minggu "hari ini" — acuan sama seperti getDummyWeekLog, dipakai buat hitung weekOffset
  // presisi tiap minggu dalam bulan ini (bukan cuma label "W1"/"W2" tanpa arti drill-down).
  const thisMonday = new Date(LOG_TODAY);
  thisMonday.setDate(thisMonday.getDate() - ((thisMonday.getDay() + 6) % 7));

  const targetMonthDate = new Date(2026, 6 + monthOffset, 1);
  const targetYear = targetMonthDate.getFullYear();
  const targetMonth = targetMonthDate.getMonth();
  const monthName = targetMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  // Senin dari minggu yang berisi tanggal 1 bulan ini — titik awal iterasi minggu.
  const firstOfMonth = new Date(targetYear, targetMonth, 1);
  const firstWeekMonday = new Date(firstOfMonth);
  firstWeekMonday.setDate(firstWeekMonday.getDate() - ((firstWeekMonday.getDay() + 6) % 7));

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const seed = Math.abs(monthOffset);
  const isCurrentMonth = monthOffset === 0;

  // Demo eksplisit buat bulan berjalan (Juli 2026, 5 minggu — LOG_TODAY jatuh di W4 jadi W1-W3 lampau,
  // W4 current, W5 upcoming otomatis dari weekOffset) — tunjukkin sisa kategori minggu (skip 'logged' murni
  // per permintaan user, biar variasi kelihatan kaya):
  // W1=over (semua terisi, over limit), W2=incomplete-open (ada hari kosong tanpa freeze, urgent),
  // W3=incomplete-frozen (ada hari kosong tapi freeze).
  const CURRENT_MONTH_DEMO_STATES: MonthWeekState[] = ['over', 'incomplete-open', 'incomplete-frozen'];

  const lastOfMonth = new Date(targetYear, targetMonth, daysInMonth);
  const bars: MonthBarDummy[] = [];
  let weekMonday = new Date(firstWeekMonday);
  let i = 0;
  // Iterasi tiap minggu (Senin start) yang overlap bulan ini — minggu terakhir dipakai selama Senin-nya
  // masih ≤ tanggal terakhir bulan (minggu itu tetap "milik" bulan ini walau ekor minggunya nyambung ke bulan depan).
  while (weekMonday.getTime() <= lastOfMonth.getTime()) {
    const weekOffset = Math.round((weekMonday.getTime() - thisMonday.getTime()) / (MS_PER_DAY * 7));
    const isFuture = weekOffset > 0;
    const isCur = weekOffset === 0;

    let state: MonthWeekState;
    if (isFuture) state = 'upcoming';
    else if (isCur) state = 'current';
    else if (isCurrentMonth && i < CURRENT_MONTH_DEMO_STATES.length) state = CURRENT_MONTH_DEMO_STATES[i];
    else {
      // Bulan lain (navigasi mundur): variasi seeded, cover ketiga kategori minggu lampau non-demo.
      const mod = (i + seed) % 5;
      state = mod === 0 ? 'incomplete-open' : mod === 1 ? 'incomplete-frozen' : mod === 2 ? 'over' : 'logged';
    }

    const weekLimit = limit * 7 + ((seed + i * 3) % 4) * 100; // limit per-minggu bisa beda, bukan flat
    const isIncomplete = state === 'incomplete-open' || state === 'incomplete-frozen';
    // incomplete-open maks 1 hari kosong: aturan wipe (PRD 5.1) bilang 1 hari missed tanpa backfill dlm 48 jam
    // langsung memicu wipe total, jadi "hari kosong tanpa freeze" realistanya cuma bisa nyangkut di grace window
    // sempit (H-1, blm expired) — gak akan pernah numpuk 2-3 hari kayak draf awal. incomplete-frozen bisa 1-2 hari
    // (ketutup Streak Freeze per-hari, stok token kecil jadi wajar cuma dikit).
    const daysFilled = state === 'upcoming' ? 0 : state === 'incomplete-open' ? 6 : state === 'incomplete-frozen' ? 6 - (i % 2) : state === 'current' ? 3 : 7;
    const intake =
      state === 'upcoming'
        ? null
        : state === 'over'
          ? weekLimit + 900 + i * 200
          : isIncomplete
            ? Math.round((weekLimit / 7) * daysFilled * (state === 'incomplete-open' ? 0.9 : 1.1)) // parsial, proporsional hari terisi
            : state === 'current'
              ? Math.round((weekLimit / 7) * daysFilled)
              : weekLimit - 1200 - i * 150;
    // displayValue: placeholder tinggi kecil buat minggu upcoming (intake null) — Recharts gak render bar value null/0.
    const displayValue = intake ?? Math.round(weekLimit * 0.05);
    // Weight & delta dihitung dari weekOffset absolut (weightAtWeekOffset), bukan index lokal — delta selalu
    // vs weekOffset-1 (minggu kalender sebelumnya), kontinu lintas-bulan. Upcoming = belum ada weigh-in (null).
    const weight = state === 'upcoming' ? null : weightAtWeekOffset(weekOffset);
    const weightDelta = weight === null ? null : Math.round((weight - weightAtWeekOffset(weekOffset - 1)) * 100) / 100;
    bars.push({ label: `W${i + 1}`, weekOffset, intake, displayValue, limit: weekLimit, daysFilled, state, weight, weightDelta });
    weekMonday = new Date(weekMonday);
    weekMonday.setDate(weekMonday.getDate() + 7);
    i += 1;
    if (i > 6) break; // safety, gak akan pernah lebih dari 6 minggu overlap 1 bulan
  }

  // Weight trend cuma punya titik buat minggu yang udah kejalani (bukan upcoming) — minggu yang belum
  // dimulai belum ada weigh-in beneran, jadi gak boleh diplot. Weight-nya reuse dari bar.weight yang udah
  // dihitung dari weekOffset absolut, jadi kontinu lintas-bulan (delta W1 bulan manapun tetap valid).
  const weighableBars = bars.filter((b) => b.weight !== null);
  const weightTrend = weighableBars.map((b) => ({ label: b.label, weight: b.weight as number }));
  const startWeight = weightTrend[0]?.weight ?? weightAtWeekOffset(0);
  const currentWeight = weightTrend[weightTrend.length - 1]?.weight ?? weightAtWeekOffset(0);

  const loggedBars = bars.filter((b) => b.intake !== null);
  const sumIntake = loggedBars.reduce((s, b) => s + (b.intake ?? 0), 0);
  const avgIntakePerWeek = loggedBars.length ? Math.round(sumIntake / loggedBars.length) : 0;
  const sumLimit = bars.reduce((s, b) => s + b.limit, 0);
  const avgLimitPerWeek = Math.round(sumLimit / bars.length);
  const daysLogged = bars.reduce((s, b) => s + b.daysFilled, 0);

  return {
    title: monthName,
    avgLimitPerWeek,
    sumLimit,
    avgIntakePerWeek,
    sumIntake,
    daysLogged,
    daysInMonth,
    bars,
    weightTrend,
    startWeight,
    currentWeight,
    // Semua minggu tetap tampil (termasuk upcoming) — konsisten sama pola Week tab (7 hari selalu tampil).
    rows: bars.map((b) => {
      const actualIntake = b.intake ?? 0;
      // Delta = |limit-intake| polos (bukan surplus/defisit bertanda) — over limit selalu merah, under/sama
      // selalu hijau, angkanya cuma besaran selisih tanpa +/-.
      const deficit = Math.abs(b.limit - actualIntake);
      const hasIntake = b.intake !== null;
      return {
        week: b.label,
        weekOffset: b.weekOffset,
        intake: actualIntake.toLocaleString('en-US'),
        limit: b.limit.toLocaleString('en-US'),
        deficit: hasIntake ? deficit.toLocaleString('en-US') : '–',
        deficitIsOver: hasIntake && actualIntake > b.limit,
        logged: `${b.daysFilled}/7`,
        state: b.state,
      };
    }),
  };
}

// 6 kategori state bulan (Year tab) — sama prinsip prioritas Month tab, tapi "incomplete" di sini artinya
// ada MINGGU (bukan hari) berstatus incomplete di dalam bulan itu (turunan hierarkis satu tingkat di atas):
// upcoming > current > incomplete-open (ada minggu incomplete-open di bulan itu) > incomplete-frozen (ada
// minggu incomplete-frozen, gak ada yang open) > over > logged.
export type YearMonthState = 'logged' | 'over' | 'incomplete-open' | 'incomplete-frozen' | 'current' | 'upcoming';

export interface YearBarDummy {
  label: string; // inisial 1 huruf, dipakai chart (bar & X-axis line) — biar gak padat 12 bulan
  monthFull: string; // 3 huruf ("Jan"), dipakai tabel Monthly Intake/Weight — lebih jelas dibaca
  monthOffset: number; // bulan relatif LOG_TODAY punya bulan (0 = bulan ini), dipakai drill-down Year→Month presisi
  intake: number | null;
  displayValue: number;
  limit: number;
  daysFilled: number; // dari total hari di bulan itu
  daysInMonth: number;
  weight: number | null; // null kalau upcoming
  weightDelta: number | null; // vs bulan SEBELUMNYA (lintas-tahun, kontinu)
  state: YearMonthState;
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
  rows: {
    month: string;
    monthOffset: number;
    intake: string;
    limit: string;
    deficit: string;
    deficitIsOver: boolean;
    logged: string;
    weight: number | null;
    weightDelta: number | null;
    state: YearMonthState;
  }[];
}

// Sumber kebenaran bulan cuma index 0-11 (Date month) — format tampilan (inisial 1 huruf utk chart,
// 3 huruf utk tabel) dikonversi dari index yg sama via monthInitial()/monthAbbrev(), BUKAN 2 array
// string terpisah yg bisa drift kalau salah satu diubah tanpa yg lain.
function monthInitial(monthIndex: number): string {
  return new Date(2000, monthIndex, 1).toLocaleDateString('en-US', { month: 'short' })[0];
}
function monthAbbrev(monthIndex: number): string {
  return new Date(2000, monthIndex, 1).toLocaleDateString('en-US', { month: 'short' });
}

export function getDummyYearLog(yearOffset: number): YearLogDummy {
  const limit = DUMMY_ACTIVE_LIMIT;
  const seed = Math.abs(yearOffset);
  const targetYear = 2026 + yearOffset;
  const isCurrentYear = targetYear === LOG_TODAY.getFullYear();
  const currentMonthAbsIndex = LOG_TODAY.getFullYear() * 12 + LOG_TODAY.getMonth(); // index bulan absolut, basis monthOffset

  // Demo eksplisit tahun berjalan (LOG_TODAY di bulan Juli/index 6) — sisa kategori (skip 'logged' murni)
  // biar variasi kelihatan kaya, sama pola Month tab.
  const CURRENT_YEAR_DEMO_STATES: YearMonthState[] = ['over', 'incomplete-open', 'incomplete-frozen', 'over', 'incomplete-frozen'];

  const bars: YearBarDummy[] = Array.from({ length: 12 }, (_, i) => monthInitial(i)).map((label, i) => {
    const monthAbsIndex = targetYear * 12 + i;
    const monthOffset = monthAbsIndex - currentMonthAbsIndex;
    const isFuture = monthOffset > 0;
    const isCur = monthOffset === 0;
    const daysInMonth = new Date(targetYear, i + 1, 0).getDate();
    const monthLimit = limit * daysInMonth + ((seed + i * 3) % 4) * 300; // limit per-bulan bisa beda, bukan flat

    let state: YearMonthState;
    if (isFuture) state = 'upcoming';
    else if (isCur) state = 'current';
    else if (isCurrentYear && i < CURRENT_YEAR_DEMO_STATES.length) state = CURRENT_YEAR_DEMO_STATES[i];
    else {
      const mod = (i + seed) % 5;
      state = mod === 0 ? 'incomplete-open' : mod === 1 ? 'incomplete-frozen' : mod === 2 ? 'over' : 'logged';
    }

    const isIncomplete = state === 'incomplete-open' || state === 'incomplete-frozen';
    // daysFilled: bulan penuh (7/7 minggu setara) beda dari bulan yang ada minggu incomplete di dalamnya —
    // representasi kasar proporsi hari terisi dari total hari bulan itu.
    const daysFilled =
      state === 'upcoming'
        ? 0
        : isIncomplete
          ? Math.round(daysInMonth * 0.85)
          : state === 'current'
            ? Math.round((daysInMonth * (LOG_TODAY.getDate() / daysInMonth)))
            : daysInMonth;
    const intake =
      state === 'upcoming'
        ? null
        : state === 'over'
          ? monthLimit + 3000 + i * 400
          : isIncomplete
            ? Math.round((monthLimit / daysInMonth) * daysFilled * (state === 'incomplete-open' ? 0.9 : 1.1))
            : state === 'current'
              ? Math.round((monthLimit / daysInMonth) * daysFilled)
              : monthLimit - 5000 - i * 300;
    const displayValue = intake ?? Math.round(monthLimit * 0.05);

    // Weight & delta: reuse weightAtWeekOffset (1 sumber kebenaran lintas Month & Year tab) — dihitung dari
    // weekOffset minggu TERAKHIR bulan itu (Senin terakhir yg overlap bulan ini), delta vs bulan sebelumnya.
    const monthWeekOffset = monthOffsetToLastWeekOffset(monthAbsIndex);
    const prevMonthWeekOffset = monthOffsetToLastWeekOffset(monthAbsIndex - 1);
    const weight = state === 'upcoming' ? null : weightAtWeekOffset(monthWeekOffset);
    const weightDelta = weight === null ? null : Math.round((weight - weightAtWeekOffset(prevMonthWeekOffset)) * 100) / 100;

    return { label, monthFull: monthAbbrev(i), monthOffset, intake, displayValue, limit: monthLimit, daysFilled, daysInMonth, weight, weightDelta, state };
  });

  const weighableBars = bars.filter((b) => b.weight !== null);
  const weightTrend = weighableBars.map((b) => ({ label: b.label, weight: b.weight as number }));
  const startWeight = weightTrend[0]?.weight ?? weightAtWeekOffset(0);
  const currentWeight = weightTrend[weightTrend.length - 1]?.weight ?? weightAtWeekOffset(0);

  const loggedBars = bars.filter((b) => b.intake !== null);
  const sumIntake = loggedBars.reduce((s, b) => s + (b.intake ?? 0), 0);
  const avgIntakePerMonth = loggedBars.length ? Math.round(sumIntake / loggedBars.length) : 0;
  const sumLimit = bars.reduce((s, b) => s + b.limit, 0);
  const daysInYear = bars.reduce((s, b) => s + b.daysInMonth, 0);
  const daysLogged = bars.reduce((s, b) => s + b.daysFilled, 0);

  return {
    title: `${targetYear}`,
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
    // Semua bulan tetap tampil (termasuk upcoming) — konsisten pola Week/Month tab.
    rows: bars.map((b) => {
      const actualIntake = b.intake ?? 0;
      // Delta = |limit-intake| polos (bukan surplus/defisit bertanda) — over limit selalu merah, under/sama
      // selalu hijau, angkanya cuma besaran selisih tanpa +/-.
      const deficit = Math.abs(b.limit - actualIntake);
      const hasIntake = b.intake !== null;
      return {
        month: b.monthFull,
        monthOffset: b.monthOffset,
        intake: actualIntake.toLocaleString('en-US'),
        limit: b.limit.toLocaleString('en-US'),
        deficit: hasIntake ? deficit.toLocaleString('en-US') : '–',
        deficitIsOver: hasIntake && actualIntake > b.limit,
        logged: `${b.daysFilled}/${b.daysInMonth}`,
        weight: b.weight,
        weightDelta: b.weightDelta,
        state: b.state,
      };
    }),
  };
}
