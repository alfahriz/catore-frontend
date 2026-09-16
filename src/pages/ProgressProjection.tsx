import { useMemo, useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceDot, Brush } from 'recharts';

// Recharts gak export tipe traveller-nya (TravellerProps internal) — didefinisiin ulang di sini
// biar custom traveller (handle bulat solid, match mockup Design Brief) type-safe.
interface BrushTravellerProps {
  x: number;
  y: number;
  width: number;
  height: number;
}
import { getDummyProjection } from '../lib/dummyData';
import { useUnitStore, formatWeight, kgToUnit } from '../lib/unitStore';
import { pickLabelTicks } from '../lib/weightTicks';
import { pickXAxisTier } from '../lib/projectionTicks';
import { ThreeLineTick } from '../components/projection/ThreeLineTick';
import { MonthYearTick } from '../components/projection/MonthYearTick';
import { RangeSlider } from '../components/projection/RangeSlider';
import { ChartLegend } from '../components/log/ChartLegend';
import logStyles from '../components/log/LogTabs.module.css';
import styles from './ProgressProjection.module.css';

// Berapa label yg ditampilin sekaligus di X-axis chart utama, per tier — grid Recharts categorical
// gak auto-skip label overlap sendiri (beda dari axis numerik), jadi disaring manual via
// pickLabelTicks (reuse dari weightTicks.ts, konsepnya index-based jadi valid jg buat time value).
// Tier "week" dikasih lebih sedikit krn tiap tick 3-baris (lebih makan tempat horizontal).
const X_AXIS_LABEL_TARGET: Record<'week' | 'month' | 'year', number> = { week: 5, month: 5, year: 8 };

// X-axis label per tier (PRD 4.6): <=12 minggu = "W1|Mon|Year" (3-baris via ThreeLineTick, tahun
// SELALU tampil tiap tick), >12 minggu s/d <=12 bulan = "Mon|Year" (2-baris via MonthYearTick, tahun
// cuma di titik pertama & transisi tahun — `showYear` dihitung di caller), >12 bulan = label tahun polos.
// Tier month SEMPAT pakai inisial 1 huruf polos (J F M A M J J A S O N D, literal PRD 4.6) tapi
// user ketemu ambigu nyata (kombinasi window kayak "M J J A A S" gak jelas urutan bulannya tanpa
// bantuan lain). Sempat dicoba Tooltip hover/tap buat disambiguasi, tapi project ini punya keputusan
// sebelumnya "Tooltip di-drop dari semua chart Log — hover-based gak masuk akal di mobile" (lihat
// catatan Day tab) — demi konsisten & zero-interaction (gak gantung tap/hover sama sekali), diganti
// ke inisial 3-huruf ("Jan Feb Mar") yg dijamin unik, Tooltip yg sempat ditambah DIHAPUS lagi.
function xAxisLabel(date: Date, tier: 'week' | 'month' | 'year', weekNumber: number, showYear: boolean): string {
  if (tier === 'week') {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `W${weekNumber}|${month}|${date.getFullYear()}`;
  }
  if (tier === 'month') {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${month}|${showYear ? date.getFullYear() : ''}`;
  }
  return `${date.getFullYear()}`;
}

// Handle slider bulat solid teal (match mockup Design Brief — Recharts default traveller-nya
// persegi tipis abu-abu, kurang keliatan sbg "handle" yg bisa didrag).
function RoundTraveller({ x, y, height }: BrushTravellerProps) {
  return <circle cx={x + 3} cy={y + height / 2} r={4} fill="oklch(55% 0.09 190)" stroke="none" />;
}

const TABLE_PAGE_SIZE = 10;

function daysBetweenMs(a: number, b: number): number {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function ProgressProjection() {
  const data = useMemo(() => getDummyProjection(), []);
  const metricPreference = useUnitStore((s) => s.metricPreference);
  const [page, setPage] = useState(0);

  // Gabung Reality + Ideal jadi 1 dataset per-tanggal buat ComposedChart. Dipakai sbg CATEGORICAL
  // XAxis (dataKey "time" tapi type default/category, bukan type="number") — pola sama persis
  // MonthTab/YearTab yg terbukti jalan di Recharts v3 project ini; numeric XAxis+domain dataMin/dataMax
  // sempat dicoba duluan, garis Line gak nongol sama sekali tanpa error (regresi Recharts v3 kemungkinan),
  // categorical lebih aman krn udah ada presedennya. `null` eksplisit (bukan `undefined`) di titik yg
  // gak ada datanya — connectNulls cuma treat `null` sbg gap-lanjut.
  const chartData = useMemo(() => {
    const points = new Map<number, { time: number; reality: number | null; ideal: number | null }>();
    // data.reality = MURNI histori/log (gak ada proyeksi apa pun) — dipakai bareng buat chart & tabel.
    data.reality.forEach((p) => {
      const t = p.date.getTime();
      const existing = points.get(t) ?? { time: t, reality: null, ideal: null };
      points.set(t, { ...existing, reality: kgToUnit(p.weight, metricPreference) });
    });
    data.ideal.forEach((p) => {
      const t = p.date.getTime();
      const existing = points.get(t) ?? { time: t, reality: null, ideal: null };
      points.set(t, { ...existing, ideal: kgToUnit(p.weight, metricPreference) });
    });
    // Titik KOSONG tambahan di ujung (buffer 25% dari durasi total, y' = y + 0.25*(y-x) — naik dari
    // 10% awal, user minta lebih jauh jaraknya) — biar area chart py ruang napas visual setelah
    // titik data terjauh, gak mentok pas di tepi kanan. Cuma dorong DOMAIN kategorikal XAxis,
    // reality/ideal null (gak digambar Line apa pun, connectNulls treat sbg gap). Ditambah DI SINI
    // (bukan di dummyData.ts) krn ini murni concern rendering chart, bukan bagian data histori/
    // proyeksi asli — data.reality/data.ideal TETAP murni tanpa titik buatan (prinsip tegas
    // "reality = histori asli" gak boleh kesenggol titik kosmetik ini).
    const allPoints = Array.from(points.values()).sort((a, b) => a.time - b.time);
    if (allPoints.length > 0) {
      const x = allPoints[0].time;
      const y = allPoints[allPoints.length - 1].time;
      const yPrime = y + 0.25 * (y - x);
      allPoints.push({ time: yPrime, reality: null, ideal: null });
    }
    return allPoints;
  }, [data, metricPreference]);

  // Titik kosong buffer (ditambah di atas) HARUS di-exclude dari nomor minggu — dia bukan checkpoint
  // asli, gak boleh kebagian label "W_" apa pun ataupun ikut nge-reset/nambah counter bulan berjalan.
  const lastRealDataTime = data.reality[data.reality.length - 1]?.date.getTime();
  const lastIdealTime = data.ideal[data.ideal.length - 1]?.date.getTime();
  const bufferPointTime = chartData.length > 0 ? chartData[chartData.length - 1].time : undefined;
  const isBufferPoint = (t: number) => t === bufferPointTime && t !== lastRealDataTime && t !== lastIdealTime;

  // W1..Wn RESET tiap bulan kalender baru (keputusan user 2026-09-14, gantiin sequential
  // global dari seluruh chart — itu SEMPAT jadi fix buat bug "W0" di luar histori, tapi ternyata
  // bukan itu yg dimau: mei = W1 W2 W3 W4, lanjut juni balik W1 W2 W3... dst, BUKAN lanjut W18 W19).
  // Checkpoint mingguan project ini emang SELALU jatuh hari Jumat (interval log per PRD), jadi
  // "tiap Jumat" == tiap titik chartData berurutan — nomor = urutan ke-berapa titik itu dlm bulan
  // berjalan (reset ke 1 pas bulan/tahun titik SEBELUMNYA beda dari titik ini).
  const weekNumberByTime = useMemo(() => {
    const map = new Map<number, number>();
    let counter = 0;
    let lastMonthKey: string | null = null;
    chartData.forEach((p) => {
      if (isBufferPoint(p.time)) return;
      const d = new Date(p.time);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      counter = monthKey === lastMonthKey ? counter + 1 : 1;
      lastMonthKey = monthKey;
      map.set(p.time, counter);
    });
    return map;
  }, [chartData]);

  const yTicksConverted = data.yTicks.map((t) => kgToUnit(t, metricPreference));
  const goalConverted = kgToUnit(data.goalWeightKg, metricPreference);

  // Dot/marker cuma di titik AWAL & AKHIR Reality/Ideal (PRD 4.6) — via ReferenceDot terpisah,
  // BUKAN custom `dot` render-prop di <Line> (sempat dicoba, silently membuat garisnya gak
  // ter-render sama sekali di Recharts v3 — lihat catatan sesi Progress Projection).
  const realityFirst = data.reality[0];
  const realityLast = data.reality[data.reality.length - 1];
  const idealFirst = data.ideal[0];
  const idealLast = data.ideal[data.ideal.length - 1];

  // Default slider SEKARANG full-range (0 sampai index TERAKHIR chartData, TERMASUK titik buffer
  // 25%) — user minta "dibuat full aja", biar begitu halaman dibuka langsung nampilin seluruh
  // rentang + ruang kosong ujung kanan (gak perlu drag manual). Gantiin formula lama (endIndex
  // berhenti di y/titik data asli terakhir, exclude buffer) — riwayat formula lama masih relevan
  // kalau nanti user minta balik ke behavior "berhenti pas di data", tapi utk sekarang plain
  // `chartData.length - 1`.
  const defaultBrushEndIndex = chartData.length > 0 ? chartData.length - 1 : 0;
  // Posisi slider aktual (default: day1 -> y', lihat defaultBrushEndIndex) — di-update via onChange
  // RangeSlider biar teks "Showing" & label real-time ikut posisi drag, bukan statis.
  const [brushRange, setBrushRange] = useState<[number, number]>([0, defaultBrushEndIndex]);
  const brushStartIndex = brushRange[0];
  const brushEndIndex = brushRange[1];

  // Chart utama & Brush SEKARANG 1 instance ComposedChart yg sama, data FULL (chartData) — Recharts
  // v3 (state management berbasis Redux internal) otomatis crop sibling Line/XAxis sesuai window
  // Brush aktif via context (`useChartData`/`setDataStartEndIndexes`), TANPA perlu slice manual.
  // (Percobaan awal pakai 2 instance chart terpisah + slice manual — ternyata cuma workaround gak
  // perlu, built-in support ini yg jadi akar masalah kenapa X-axis gak ke-crop waktu itu: Brush
  // ditaruh di ComposedChart TERPISAH dari Line/XAxis, jadi gak pernah masuk context yg sama.)
  const windowedChartData = chartData.slice(brushStartIndex, brushEndIndex + 1);

  // Tier X-axis SEKARANG dihitung dari WINDOW AKTIF (rentang tanggal yg lagi keliatan di slider),
  // BUKAN dari total rentang proyeksi keseluruhan (`data.xAxisTier`, statis dari getDummyProjection).
  // Keputusan user eksplisit sesi 2026-09-11: makin di-zoom in (window dipersempit), makin detail
  // (year -> month -> week) — beda dari bacaan literal PRD 4.6 ("berdasarkan rentang total dari
  // hari 1 sampai estimasi Ideal capai Goal") tapi lebih match ekspektasi UX real (window kecil
  // pakai tier kasar/tahun kelihatan nyaris kosong, gak informatif). Threshold tetap sama
  // (<=12 minggu=week, <=12 bulan=month, >12 bulan=year), basisnya aja yg ganti.
  const windowRangeDays =
    windowedChartData.length > 1 ? daysBetweenMs(windowedChartData[0].time, windowedChartData[windowedChartData.length - 1].time) : 0;
  const activeXAxisTier = pickXAxisTier(windowRangeDays);

  // Subset waktu yg dikasih label X-axis. Tier week/month: pickLabelTicks (count-based, lihat
  // X_AXIS_LABEL_TARGET) — dihitung ulang tiap window brush berubah karena jumlah titik dlm window
  // ikut berubah. Tier year BEDA PENDEKATAN: PRD eksplisit "gak ada batas atas jumlah tick, label
  // tahun singkat gak berisiko nabrak" — jadi bukan disaring by count, tapi DEDUP by tahun unik
  // (1 label per tahun, di titik PERTAMA tahun itu muncul), krn chartData mingguan/tahunan bisa
  // ratusan titik dan render label di tiap titik (bukan cuma tiap tahun) bakal duplikat parah
  // (mis. "2025 2025 2025 2026 2026" — ketemu & difix sesi 2026-09-11 pas histori diperpanjang).
  // Tier year: dedup by TAHUN unik (lihat komentar di bawah). Tier month: pickLabelTicks awalnya
  // index-based, bisa milih 2 titik BEDA MINGGU yg kebetulan jatuh di BULAN+TAHUN SAMA sbg 2 label
  // representative terpisah — muncul "Dec Dec" berdampingan tanpa pembeda apa pun (ketemu & difix
  // 2026-09-14, window ~13 minggu). Fix: dari hasil pickLabelTicks, dedup lagi by bulan+tahun unik
  // (titik PERTAMA yg muncul utk kombinasi itu yg dipertahankan) — konsisten sama prinsip tier year.
  // Titik buffer kosong (ujung chartData, lihat komentar di chartData useMemo) DIKELUARIN dari
  // kandidat label — kalau user drag slider sampai mentok penuh, titik ini bisa kepilih pickLabelTicks/
  // dedup year-month sbg "representative", padahal dia bukan checkpoint asli & sengaja di-exclude
  // dari weekNumberByTime (bakal muncul "W0" kalau kepilih jadi label).
  const labelCandidatePoints = windowedChartData.filter((p) => !isBufferPoint(p.time));
  const visibleXLabelTimes =
    activeXAxisTier === 'year'
      ? (() => {
          const seenYears = new Set<number>();
          const times: number[] = [];
          for (const p of labelCandidatePoints) {
            const y = new Date(p.time).getFullYear();
            if (!seenYears.has(y)) {
              seenYears.add(y);
              times.push(p.time);
            }
          }
          return times;
        })()
      : activeXAxisTier === 'month'
        ? (() => {
            const candidates = pickLabelTicks(labelCandidatePoints.map((p) => p.time), X_AXIS_LABEL_TARGET.month);
            const seenMonthYear = new Set<string>();
            const times: number[] = [];
            for (const t of candidates) {
              const d = new Date(t);
              const key = `${d.getFullYear()}-${d.getMonth()}`;
              if (!seenMonthYear.has(key)) {
                seenMonthYear.add(key);
                times.push(t);
              }
            }
            return times;
          })()
        : pickLabelTicks(labelCandidatePoints.map((p) => p.time), X_AXIS_LABEL_TARGET[activeXAxisTier]);
  const visibleXTimes = new Set(visibleXLabelTimes);

  // Tier "month" (PRD 4.6): tahun ditampilkan cuma di titik PERTAMA yg kelabel & titik transisi
  // tahun (dibanding titik-berlabel SEBELUMNYA, bukan tiap titik data mentah) — dihitung di sini
  // (bukan di dalam xAxisLabel/MonthYearTick) krn butuh urutan titik yg SUDAH difilter visibleXTimes.
  const yearShownAtTime = new Set<number>();
  if (activeXAxisTier === 'month') {
    let lastYear: number | null = null;
    for (const t of visibleXLabelTimes) {
      const y = new Date(t).getFullYear();
      if (y !== lastYear) yearShownAtTime.add(t);
      lastYear = y;
    }
  }

  const totalPages = Math.ceil(data.tableRows.length / TABLE_PAGE_SIZE);
  const pageRows = data.tableRows.slice(page * TABLE_PAGE_SIZE, page * TABLE_PAGE_SIZE + TABLE_PAGE_SIZE);

  const softLabel = data.softEtaDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const hardLabel = data.hardEtaDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className={styles.page}>

      <div className={styles.chartSection}>
        <div className={styles.axisLabel}>Weight ({metricPreference})</div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(180, 160, 120, 0.1)" horizontalValues={yTicksConverted} />
            <XAxis
              dataKey="time"
              tickFormatter={(t: number) => (visibleXTimes.has(t) ? xAxisLabel(new Date(t), activeXAxisTier, weekNumberByTime.get(t) ?? 0, yearShownAtTime.has(t)) : '')}
              tick={(props: { x?: string | number; y?: string | number; payload?: { value: number } }) => {
                // Custom tick component Recharts nerima `payload.value` sbg RAW data value (time number),
                // BUKAN hasil tickFormatter — tickFormatter cuma diterapkan Recharts ke tick default
                // (text polos), gak diteruskan ke custom component. Jadi format manual di sini dgn
                // manggil xAxisLabel/tickFormatter yg sama, bukan ngarep payload.value udah jadi string.
                const t = props.payload?.value;
                const x = typeof props.x === 'string' ? Number(props.x) : props.x;
                const y = typeof props.y === 'string' ? Number(props.y) : props.y;
                if (t === undefined) return <g />;
                // Titik yg gak kelabel TETAP dikasih tick mark (garis vertikal pendek) — biar axis
                // gak keliatan kosong pas window kecil/tier "year" (dedup-by-tahun, bisa cuma 1 label
                // dalam window sempit). Cuma teksnya yg dihilangin, bukan tick mark-nya jg ikut hilang.
                if (!visibleXTimes.has(t)) {
                  return <line x1={x} y1={y} x2={x} y2={(y ?? 0) + 4} stroke="var(--color-border)" strokeWidth={1} />;
                }
                const label = xAxisLabel(new Date(t), activeXAxisTier, weekNumberByTime.get(t) ?? 0, yearShownAtTime.has(t));
                if (activeXAxisTier === 'week') return <ThreeLineTick x={x} y={y} payload={{ value: label }} />;
                if (activeXAxisTier === 'month') return <MonthYearTick x={x} y={y} payload={{ value: label }} />;
                return (
                  <text x={x} y={(y ?? 0) + 10} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">
                    {label}
                  </text>
                );
              }}
              axisLine={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }}
              tickLine={false}
              height={activeXAxisTier === 'week' ? 46 : activeXAxisTier === 'month' ? 36 : 24}
              interval={0}
            />
            <YAxis
              domain={[yTicksConverted[0], yTicksConverted[yTicksConverted.length - 1]]}
              ticks={yTicksConverted}
              tickFormatter={(v: number) => `${v}`}
              tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
              axisLine={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }}
              tickLine={false}
            />
            <ReferenceLine y={goalConverted} stroke="oklch(52% 0.01 255)" strokeWidth={1.5} label={{ value: `Goal : ${goalConverted} ${metricPreference}`, position: 'insideTopLeft', fontSize: 10.5, fill: 'oklch(52% 0.01 255)' }} />
            <Line type="monotone" dataKey="ideal" stroke="oklch(58% 0.15 190)" strokeWidth={2.5} dot={false} connectNulls activeDot={false} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="reality"
              stroke="oklch(56% 0.16 285)"
              strokeWidth={2.5}
              dot={false}
              connectNulls
              activeDot={false}
              isAnimationActive={false}
            />
            <ReferenceDot x={idealFirst.date.getTime()} y={kgToUnit(idealFirst.weight, metricPreference)} r={4} fill="oklch(58% 0.15 190)" stroke="none" ifOverflow="hidden" />
            <ReferenceDot x={idealLast.date.getTime()} y={kgToUnit(idealLast.weight, metricPreference)} r={4} fill="oklch(58% 0.15 190)" stroke="none" ifOverflow="hidden" />
            <ReferenceDot x={realityFirst.date.getTime()} y={kgToUnit(realityFirst.weight, metricPreference)} r={4} fill="oklch(56% 0.16 285)" stroke="none" ifOverflow="hidden" />
            <ReferenceDot x={realityLast.date.getTime()} y={kgToUnit(realityLast.weight, metricPreference)} r={4} fill="oklch(56% 0.16 285)" stroke="none" ifOverflow="hidden" />

            {/* Track slider solid polos (match mockup) — mini-chart preview-nya SEKARANG card
                terpisah di atas (lihat <svg> di bawah), bukan lagi Brush.children. */}
            <Brush
              dataKey="time"
              height={8}
              travellerWidth={6}
              traveller={RoundTraveller}
              startIndex={brushStartIndex}
              endIndex={brushEndIndex}
              onChange={(range) => {
                if (range.startIndex !== undefined && range.endIndex !== undefined) {
                  setBrushRange([range.startIndex, range.endIndex]);
                }
              }}
              tickFormatter={(t: number) => new Date(chartData[t]?.time ?? t).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              stroke="oklch(55% 0.09 190)"
              fill="oklch(55% 0.09 190 / 0.25)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ChartLegend
        className={styles.legendNoBorder}
        items={[
          { label: 'Reality', fill: 'oklch(56% 0.16 285)', border: 'oklch(56% 0.16 285)' },
          { label: 'Ideal', fill: 'oklch(58% 0.15 190)', border: 'oklch(58% 0.15 190)' },
          { label: 'Goal', fill: 'oklch(52% 0.01 255)', border: 'oklch(52% 0.01 255)' },
        ]}
      />

      <div className={styles.narrative}>
        If you stick to your program, you could reach <strong>{formatWeight(data.goalWeightKg, metricPreference)}</strong> <span className={styles.narrativeSmall}>sometime</span> between{' '}
        <strong>{hardLabel} – {softLabel}</strong> <span className={styles.narrativeSmall}>— faster with a stricter or slower with a gentler deficit category.</span>
      </div>

      <div className={styles.sliderSection}>
        <RangeSlider min={0} max={chartData.length - 1} value={brushRange} onChange={setBrushRange} />
        <div className={styles.showingLabel}>
          Showing: {new Date(chartData[brushStartIndex]?.time ?? Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – {new Date(chartData[brushEndIndex]?.time ?? Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </div>
      </div>

      <div className={logStyles.sectionHeader}>Reality vs Ideal Log Comparison</div>
      <div className={styles.axisLabel}>Weight in {metricPreference}</div>
      <div className={logStyles.table}>
        <div className={logStyles.tableHeaderRow4}>
          <span>Period</span><span>Ideal</span><span>Reality</span><span>Δ</span>
        </div>
        {pageRows.map((row) => (
          <div
            key={row.period}
            className={logStyles.tableRowButton4}
            style={{ cursor: 'default' }}
          >
            <span className={`${logStyles.rowDay} ${row.isPreview ? styles.previewRow : ''}`}>{row.period}</span>
            <span>{kgToUnit(row.ideal, metricPreference).toFixed(2)}</span>
            <span>{row.reality === null ? '–' : kgToUnit(row.reality, metricPreference).toFixed(2)}</span>
            <span style={{ color: row.delta === null ? 'var(--color-text-secondary)' : row.deltaIsPositive ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {row.delta === null ? '–' : `${row.delta > 0 ? '+' : ''}${kgToUnit(row.delta, metricPreference).toFixed(2)}`}
            </span>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageButton} onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            Prev
          </button>
          <span className={styles.pageIndicator}>Page {page + 1} / {totalPages}</span>
          <button className={styles.pageButton} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
