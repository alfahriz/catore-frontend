// Tick Y-axis chart Weight trend: label persis angka berat asli (bukan grid bulat generik Recharts).
// Gap adaptif dari sebaran data itu sendiri — bukan angka threshold fixed — supaya reaktif ke kondisi
// bulan/tahun yang lagi dibuka: data rapat (range kecil) → gap kecil, hampir semua titik dapat label
// sendiri; data lebar (range besar) → gap besar, titik yang berdekatan digabung otomatis.
//
// Formula: gap = (max - min) / periodCount (mis. jumlah minggu dalam bulan itu — BUKAN /(N-1) seperti
// bucketing biasa). periodCount jadi pembagi karena itu representasi "resolusi wajar" — makin banyak
// periode dalam rentang yang sama, makin rapat titik data, makin kecil gap yang masih dianggap "beda".
//
// Merge kumulatif: jalan dari nilai terkecil, titik berikutnya (dari array TERSORT ascending) dibanding
// ke NILAI HASIL GABUNGAN terakhir (bukan ke nilai asli sebelumnya) — kalau selisihnya <= gap, gabung jadi
// rata-rata (replace, bukan tambah entry baru); kalau > gap, jadi label baru. Rantai 3+ titik yang semua
// berdekatan melebur jadi 1 angka bertahap (rata-rata terus diperbarui tiap gabung baru masuk).
//
// Grid horizontal TETAP di posisi asli semua titik data (lihat CartesianGrid — dia ambil ticks dari axis
// yang sama dengan label, jadi titik yang di-drop dari label otomatis juga gak dapat garis sendiri; itu
// trade-off yang disengaja, bukan bug).
export function buildWeightTicks(weightValues: number[], domain: [number, number], periodCount: number): number[] {
  const sorted = Array.from(new Set(weightValues)).sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const gap = periodCount > 0 ? (max - min) / periodCount : 0;

  const merged: number[] = [];
  for (const v of sorted) {
    const last = merged[merged.length - 1];
    if (merged.length > 0 && v - last <= gap) {
      merged[merged.length - 1] = (last + v) / 2; // gabung kumulatif — replace, bukan average dari nilai asli
    } else {
      merged.push(v);
    }
  }

  return [domain[0], ...merged, domain[1]];
}
