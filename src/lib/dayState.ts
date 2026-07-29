export type DayState = 'logged' | 'over' | 'missed' | 'today' | 'upcoming' | 'frozen';

export interface DayStateStyle {
  bg: string;
  border: string;
  ring?: boolean;
  icon: string;
  iconColor: string;
}

// Pastel fill — warna latar cukup buat komunikasikan state, teks/icon di dalamnya pakai warna gelap kontras
// (kecuali Today & Missed, tetap fill solid: Today paling penting utk menonjol, Missed sengaja beda tegas
// dari Over yang pastel biar gampang dibedain sekilas di circle kecil kalender).
// Base hue tiap state diseragamkan lewat token --color-* (tokens.css) — dipakai bareng chart Log (Week/Month/Year),
// cuma lightness/alpha di sini yang disesuaikan buat konteks circle kalender (butuh kontras tinggi jarak jauh).
export const DAY_STATE_STYLES: Record<DayState, DayStateStyle> = {
  logged: { bg: 'oklch(88% 0.09 145)', border: 'none', icon: '✓', iconColor: 'oklch(32% 0.1 145)' },
  over: { bg: 'oklch(88% 0.09 30)', border: 'none', icon: '', iconColor: 'oklch(38% 0.14 30)' },
  missed: { bg: 'var(--color-missed-solid)', border: 'none', icon: '×', iconColor: '#fff' },
  today: { bg: 'var(--color-today)', border: '3px solid var(--color-today)', ring: true, icon: '', iconColor: '#fff' },
  upcoming: { bg: 'oklch(95% 0.005 255)', border: 'none', icon: '', iconColor: '#9A9384' },
  frozen: { bg: 'oklch(91% 0.03 220)', border: 'none', icon: '❄', iconColor: 'oklch(45% 0.08 235)' },
};

export function dayStateBoxShadow(state: DayState): string {
  const style = DAY_STATE_STYLES[state];
  if (style.ring) return '0 0 0 3px #FDFBF5, 0 0 0 5.5px oklch(55% 0.09 255)';
  return 'none';
}
