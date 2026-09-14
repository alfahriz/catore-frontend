// Custom XAxis tick Recharts: pecah label "W1|Jul|2026" (dipisah "|") jadi 3 baris center-aligned
// (nomor minggu / inisial bulan / tahun) — dipakai tier "<=12 minggu" Progress Projection (PRD 4.6).
// Beda dari TwoLineTick (Log Week tab, "Mon (27)" jadi 2 baris) — spec di sini eksplisit minta
// stacking 3-baris, bukan rotate, buat label sepanjang "W1 Jul 2025" gak nabrak antar-tick.
interface ThreeLineTickProps {
  x?: number;
  y?: number;
  payload?: { value: unknown };
}

export function ThreeLineTick({ x, y, payload }: ThreeLineTickProps) {
  if (x === undefined || y === undefined || !payload) return null;
  // Defensif: payload.value bisa jadi raw number (belum lewat tickFormatter) di render transient
  // tertentu — lihat catatan sama di MonthYearTick.tsx (crash `.split` sempat kejadian di sana).
  const [week, month, year] = String(payload.value).split('|');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">{week}</text>
      <text x={0} y={0} dy={22} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">{month}</text>
      <text x={0} y={0} dy={34} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">{year}</text>
    </g>
  );
}
