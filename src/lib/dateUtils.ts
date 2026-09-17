// `Date.toISOString().slice(0,10)` SELALU convert ke UTC dulu — di timezone bukan UTC (mis. WIB/
// UTC+7), local midnight bisa ke-geser mundur 1 hari (mis. local "17 Sep 00:00 WIB" jadi
// "2026-09-16T17:00:00Z" pas di-toISOString, `.slice(0,10)` ngasih "16", bukan "17"). Bug NYATA
// ketemu 2026-09-17 pas migrasi Log tabs: query `date=` API selalu 1 hari mundur dari yg dimaksud,
// chart/stat Day tab selalu nunjukin 0 walau entry hari itu ada. Ketauan CUMA krn browser/server
// testing ini jalan di WIB — kalau device UTC, bug ini gak pernah kelihatan (geser 0 hari).
// **PAKAI FUNGSI INI, JANGAN `date.toISOString().slice(0,10)` LAGI**, di mana pun butuh format
// tanggal LOKAL (bukan UTC) sbg "YYYY-MM-DD" buat query param API.
export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayLocalIso(): string {
  return toLocalIsoDate(new Date());
}
