// Custom XAxis tick Recharts: pecah label "Mon (27)" jadi 2 baris (hari di atas, tanggal di bawah)
// biar tetap kebaca pas 7 tick berdesakan di layar sempit — bukan 1 baris panjang yang bikin Recharts skip tick.
interface TwoLineTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

export function TwoLineTick({ x, y, payload }: TwoLineTickProps) {
  if (x === undefined || y === undefined || !payload) return null;
  const match = payload.value.match(/^(\S+)\s*(\(.+\))?$/);
  const main = match?.[1] ?? payload.value;
  const sub = match?.[2];
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">
        {main}
      </text>
      {sub && (
        <text x={0} y={0} dy={22} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">
          {sub}
        </text>
      )}
    </g>
  );
}
