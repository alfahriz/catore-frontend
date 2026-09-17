import { buildProjectionYTicks } from './projectionTicks';

// PRINSIP TEGAS (dipertahankan dari versi dummy, WAJIB tetap berlaku di data asli): garis Reality
// SELALU murni histori/log BENERAN dari `weightlog` — TIDAK PERNAH ada proyeksi/ekstrapolasi rate
// ke masa depan dalam bentuk apa pun. Modul ini murni PRESENTASI dari data yg udah ada, bukan
// KALKULASI prediksi. Kalau ada kebutuhan "Reality capai Goal di masa depan", itu HARUS dari entry
// weightlog asli yg beneran ada (user beneran log sampai situ), BUKAN dihitung/diproyeksikan di sini.
export interface ProjectionPoint {
  date: Date;
  weight: number;
}

export interface ProjectionTableRow {
  period: string;
  ideal: number;
  reality: number | null;
  delta: number | null;
  deltaIsPositive: boolean;
  isPreview: boolean;
}

export interface ProjectionResult {
  goalWeightKg: number;
  tdee: number;
  reality: ProjectionPoint[];
  ideal: ProjectionPoint[];
  idealEtaDate: Date;
  softEtaDate: Date;
  hardEtaDate: Date;
  yTicks: number[];
  xAxisEndDate: Date;
  tableRows: ProjectionTableRow[];
}

const KCAL_PER_KG = 7700;
const DEFICIT_CATEGORY_OFFSETS: Record<'Soft' | 'Mid' | 'Hard', number> = { Soft: 300, Mid: 400, Hard: 500 };

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

// `reality` HARUS histori asli non-kosong (minimal 1 titik — biasanya dari weightlog user, atau
// placeholder Profile.weight kalau belum pernah Log Weight sama sekali, PRD 4.6). Titik PERTAMA
// `reality` jadi acuan startDate/startWeight buat garis Ideal (2 garis mulai dari 1 titik identik).
export function computeProjection(reality: ProjectionPoint[], goalWeightKg: number, tdee: number): ProjectionResult {
  const startDate = reality[0].date;
  const startWeight = reality[0].weight;

  // Ideal: mulus dari titik awal (sama persis Reality), kategori Mid, linear turun sampai goalWeightKg.
  const idealTotalToLoseKg = startWeight - goalWeightKg;
  const kgPerDayMid = DEFICIT_CATEGORY_OFFSETS.Mid / KCAL_PER_KG;
  const idealTotalDays = idealTotalToLoseKg > 0 ? Math.ceil(idealTotalToLoseKg / kgPerDayMid) : 0;
  const idealEtaDate = addDays(startDate, idealTotalDays);

  const ideal: ProjectionPoint[] = [];
  const idealStepDays = 7;
  for (let d = 0; d <= idealTotalDays; d += idealStepDays) {
    ideal.push({ date: addDays(startDate, d), weight: Math.round((startWeight - kgPerDayMid * d) * 100) / 100 });
  }
  if (ideal.length === 0 || ideal[ideal.length - 1].date.getTime() !== idealEtaDate.getTime()) {
    ideal.push({ date: idealEtaDate, weight: goalWeightKg });
  }

  const softTotalDays = idealTotalToLoseKg > 0 ? Math.ceil(idealTotalToLoseKg / (DEFICIT_CATEGORY_OFFSETS.Soft / KCAL_PER_KG)) : 0;
  const hardTotalDays = idealTotalToLoseKg > 0 ? Math.ceil(idealTotalToLoseKg / (DEFICIT_CATEGORY_OFFSETS.Hard / KCAL_PER_KG)) : 0;
  const softEtaDate = addDays(startDate, softTotalDays);
  const hardEtaDate = addDays(startDate, hardTotalDays);

  const yTicks = buildProjectionYTicks(reality.map((p) => p.weight), goalWeightKg);

  function idealWeightAtDate(date: Date): number {
    if (date >= idealEtaDate) return goalWeightKg;
    const daysFromStart = daysBetween(startDate, date);
    return Math.round((startWeight - kgPerDayMid * daysFromStart) * 100) / 100;
  }

  function formatPeriodLabel(date: Date, weekNumber: number): string {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `W${weekNumber} ${month} ${year}`;
  }

  // W1..Wn reset tiap bulan kalender baru (keputusan user 2026-09-14) — nomor = urutan ke-berapa
  // CHECKPOINT ASLI (bukan asumsi "tiap Jumat" lagi, krn user bisa Log Weight kapan aja, bukan
  // cuma hari Jumat — keputusan eksplisit sesi migrasi 2026-09-17) itu dlm bulan berjalan.
  let periodCounter = 0;
  let periodLastMonthKey: string | null = null;
  const tableRows: ProjectionTableRow[] = reality.map((point) => {
    const monthKey = `${point.date.getFullYear()}-${point.date.getMonth()}`;
    periodCounter = monthKey === periodLastMonthKey ? periodCounter + 1 : 1;
    periodLastMonthKey = monthKey;
    const idealAtPoint = idealWeightAtDate(point.date);
    const delta = Math.round((idealAtPoint - point.weight) * 100) / 100;
    return {
      period: formatPeriodLabel(point.date, periodCounter),
      ideal: idealAtPoint,
      reality: point.weight,
      delta,
      deltaIsPositive: delta >= 0,
      isPreview: false,
    };
  });

  return {
    goalWeightKg,
    tdee,
    reality,
    ideal,
    idealEtaDate,
    softEtaDate,
    hardEtaDate,
    yTicks,
    xAxisEndDate: softEtaDate,
    tableRows,
  };
}
