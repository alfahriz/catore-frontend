// Custom XAxis tick Recharts: label "Jan|2026" (dipisah "|", baris kedua bisa kosong) jadi 2 baris —
// nama bulan 3-huruf di atas selalu, tahun di bawah CUMA di titik pertama & titik transisi tahun.
// (PRD 4.6 tier ">12 minggu s/d <=12 bulan" literal minta inisial 1 huruf, tapi user ketemu ambigu
// nyata di kombinasi tertentu — mis. "M J J A A S" gak jelas urutan bulannya — diganti 3-huruf yg
// dijamin unik, lihat catatan di xAxisLabel/ProgressProjection.tsx.) Beda dari ThreeLineTick (tier
// <=12 minggu, W-nomor/bulan/tahun) yg tahunnya SELALU tampil tiap tick.
interface MonthYearTickProps {
  x?: number;
  y?: number;
  payload?: { value: unknown };
}

export function MonthYearTick({ x, y, payload }: MonthYearTickProps) {
  if (x === undefined || y === undefined || !payload) return null;
  // `payload.value` NORMALNYA string terformat (via tickFormatter), tapi Recharts kadang manggil
  // custom `tick` component dgn raw value (number time) sebelum tickFormatter sempat diterapkan
  // (mis. render awal/transient state) — defensif convert ke string dulu biar gak crash `.split`.
  const [month, year] = String(payload.value).split('|');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">{month}</text>
      {year && (
        <text x={0} y={0} dy={22} textAnchor="middle" fontSize={9.5} fill="var(--color-text-secondary)" fontWeight={600}>{year}</text>
      )}
    </g>
  );
}
