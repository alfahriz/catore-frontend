// Y/X-axis helpers khusus Progress Projection (PRD Section 4.6) — beda formula dari weightTicks.ts
// (Log Month/Year tab), jangan disatuin: Log pakai grid-rata-N-titik, Progress Projection pakai
// Floor/Ceiling ±15 dari ekstrem + kelipatan 20 + Goal sbg tick paksa.

// Y-axis: Floor = MIN(goal, min histori Reality) - 15, Ceiling = MAX(goal, max histori Reality) + 15,
// Goal selalu tick paksa, sisanya kelipatan 20 di antara Floor-Ceiling. Contoh PRD: Goal=77, max=113
// → 62, 77, 80, 100, 120, 128 (Floor=62 & Ceiling=128 TETAP muncul sbg tick meski bukan kelipatan 20).
export function buildProjectionYTicks(realityValues: number[], goal: number): number[] {
  const dataMin = Math.min(...realityValues, goal);
  const dataMax = Math.max(...realityValues, goal);
  const floor = Math.round(Math.min(goal, dataMin) - 15);
  const ceiling = Math.round(Math.max(goal, dataMax) + 15);

  const ticks = new Set<number>([floor, ceiling, Math.round(goal)]);
  const firstMultiple = Math.ceil(floor / 20) * 20;
  for (let v = firstMultiple; v < ceiling; v += 20) {
    if (v > floor) ticks.add(v);
  }

  return Array.from(ticks).sort((a, b) => a - b);
}

export type XAxisTier = 'week' | 'month' | 'year';

// 3 tier simetris berdasar rentang total hari-1 -> estimasi Ideal capai Goal (PRD 4.6):
// >12 bulan = tahun, >16 minggu s/d <=12 bulan = inisial bulan, <=16 minggu = "W1 Mon Year" stacked 3-baris.
// Threshold week/month dilonggarkan dari 12->16 minggu (2026-09-14): window ~13 minggu (dikit di atas
// 12) masih kepilih tier month walau visual udah cukup sempit buat butuh detail mingguan — 16 minggu
// (~4 bulan) kasih margin biar window segitu tetep dapet tier week.
export function pickXAxisTier(totalDays: number): XAxisTier {
  const totalWeeks = totalDays / 7;
  const totalMonths = totalDays / 30.44;
  if (totalWeeks <= 16) return 'week';
  if (totalMonths <= 12) return 'month';
  return 'year';
}
