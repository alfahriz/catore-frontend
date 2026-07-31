// Tick Y-axis chart Weight trend: grid buatan rata N tick dari weightMin ke weightMax — TANPA
// buffer di ujung (dicoba pakai buffer ±step, tapi 7 label utk 5 titik data kerasa ramai/padat,
// dibuang biar lebih lega). Tick BUKAN representasi weight asli tiap titik data (kecuali titik
// pertama/terakhir) — step dihitung supaya selalu pas nutup range tanpa collide, gak perlu
// merge/drop kayak pendekatan sebelumnya. Konsekuensi: garis chart nempel dikit ke tepi atas/bawah
// area (gak ada ruang buffer lagi) — trade-off diterima demi label lebih lega.
//
// step = (weightMax - weightMin) / (N - 1)  — N titik = N-1 gap (fencepost), jadi tick ke-N pas
// jatuh di weightMax, bukan meleset.
//
// tickCount (opsional): default N = weightValues.length (1 tick per titik data, dipakai Month tab
// yg cuma 4-6 titik/bulan — masih lega).
export function buildWeightTicks(weightValues: number[], tickCount?: number): number[] {
  const min = Math.min(...weightValues);
  const max = Math.max(...weightValues);
  const n = tickCount ?? weightValues.length;

  if (n <= 1 || min === max) {
    return [min];
  }

  const step = (max - min) / (n - 1);
  return Array.from({ length: n }, (_, i) => Math.round((min + i * step) * 100) / 100);
}

// Subset dari ticks buat DITAMPILIN LABELNYA — grid line tetap ikut SEMUA ticks asli (mis. 12 bulan
// Year tab), tapi teks angka cuma muncul di sebagian index, sisanya grid line polos tanpa angka.
// Tick pertama (min) & terakhir (max) SELALU ikut kena label (paling informatif, aneh kalau gak ada).
// `targetCount` = kira-kira berapa label yang mau ditampilin (bukan angka eksak — dibulatkan ke index
// terdekat, spacing antar-label bisa beda 1 index tapi gak akan ada kasus 2 label terakhir nempel
// separuh step kayak pendekatan "i % every === 0" polos). Dipakai bareng tickFormatter: kalau value
// gak ada di subset ini, return string kosong.
export function pickLabelTicks(ticks: number[], targetCount: number): number[] {
  const lastIndex = ticks.length - 1;
  if (lastIndex <= 0 || targetCount <= 1) return ticks;

  const segments = Math.min(targetCount - 1, lastIndex);
  const indices = new Set<number>();
  for (let s = 0; s <= segments; s += 1) {
    indices.add(Math.round((s * lastIndex) / segments));
  }

  return ticks.filter((_, i) => indices.has(i));
}
