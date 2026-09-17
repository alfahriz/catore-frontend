import { toLocalIsoDate } from './dateUtils';

// Konversi offset (0 = periode berjalan, -1 = sebelumnya, dst — konvensi lama dummyData.ts) ke
// year/month/weekNumber yg dikirim ke API `GET /log/week|month|year` (backend gak terima "offset",
// cuma year/month/weekNumber absolut). SEMUA formula di sini WAJIB mirror PERSIS
// `WeekPartitionHelper.cs` (backend, SharedKernel) — kalau formula backend berubah, file ini
// harus ikut berubah juga, jaga 2 tempat ini tetap sinkron.

// W1 mulai TANGGAL 1 tiap bulan (BUKAN Senin-start ISO week seperti dummy lama) — mirror
// WeekPartitionHelper.GetWeekNumberInMonth: `((date.Day - 1) / 7) + 1`.
export function getWeekNumberInMonth(date: Date): number {
  return Math.floor((date.getDate() - 1) / 7) + 1;
}

// Mirror WeekPartitionHelper.GetWeekDateRange — start = tanggal 1 + (weekNumber-1)*7 hari, end =
// start+6 hari, dipotong di batas akhir bulan.
export function getWeekDateRange(year: number, month: number, weekNumber: number): { start: Date; end: Date } {
  const daysInMonth = new Date(year, month, 0).getDate();
  const start = new Date(year, month - 1, 1 + (weekNumber - 1) * 7);
  let end = new Date(start);
  end.setDate(end.getDate() + 6);
  const monthEnd = new Date(year, month - 1, daysInMonth);
  if (end > monthEnd) end = monthEnd;
  return { start, end };
}

// Mirror WeekPartitionHelper.GetWeekCountInMonth.
export function getWeekCountInMonth(year: number, month: number): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Math.ceil(daysInMonth / 7);
}

export interface DayPeriod {
  date: Date;
  isoDate: string; // YYYY-MM-DD, dikirim sbg query param `date`
}

export function resolveDayPeriod(dayOffset: number): DayPeriod {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return { date, isoDate: toLocalIsoDate(date) };
}

export interface WeekPeriod {
  year: number;
  month: number;
  weekNumber: number;
  start: Date;
  end: Date;
}

// weekOffset=0 -> minggu (partisi W1-W5 ala backend) yg mengandung HARI INI. weekOffset=-1 ->
// mundur 7 hari dari AWAL minggu skrg, dst — geser per-blok-7-hari dari minggu berjalan (BUKAN
// "mundur N minggu dalam kalender ISO"), konsisten sama cara backend mempartisi bulan jadi
// blok-blok 7 hari mulai tanggal 1.
export function resolveWeekPeriod(weekOffset: number): WeekPeriod {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentWeekNum = getWeekNumberInMonth(today);
  const { start: currentWeekStart } = getWeekDateRange(today.getFullYear(), today.getMonth() + 1, currentWeekNum);

  const targetStart = new Date(currentWeekStart);
  targetStart.setDate(targetStart.getDate() + weekOffset * 7);

  const year = targetStart.getFullYear();
  const month = targetStart.getMonth() + 1;
  const weekNumber = getWeekNumberInMonth(targetStart);
  const { start, end } = getWeekDateRange(year, month, weekNumber);
  return { year, month, weekNumber, start, end };
}

export function formatWeekTitle(period: WeekPeriod): string {
  const monthName = period.start.toLocaleDateString('en-US', { month: 'long' });
  const endMonthName = period.end.toLocaleDateString('en-US', { month: 'long' });
  const crossesYear = period.start.getFullYear() !== period.end.getFullYear();
  const dateRange = `${period.start.getDate()} ${monthName} - ${period.end.getDate()} ${endMonthName}${crossesYear ? ` ${period.end.getFullYear()}` : ''}`;
  return `W${period.weekNumber} ${monthName} ${period.start.getFullYear()} (${dateRange})`;
}

export interface MonthPeriod {
  year: number;
  month: number; // 1-12
}

export function resolveMonthPeriod(monthOffset: number): MonthPeriod {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  return { year: target.getFullYear(), month: target.getMonth() + 1 };
}

export function formatMonthTitle(period: MonthPeriod): string {
  const date = new Date(period.year, period.month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function resolveYearPeriod(yearOffset: number): number {
  return new Date().getFullYear() + yearOffset;
}
