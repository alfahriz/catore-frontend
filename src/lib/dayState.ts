export type DayState = 'logged' | 'over' | 'missed' | 'today' | 'upcoming' | 'frozen';

export interface DayStateStyle {
  bg: string;
  border: string;
  ring?: boolean;
  icon: string;
  iconColor: string;
}

// Pastel fill — warna latar cukup buat komunikasikan state, teks/icon di dalamnya pakai warna gelap kontras
// (kecuali Today, tetap fill solid + ring karena ini state paling penting untuk menonjol).
export const DAY_STATE_STYLES: Record<DayState, DayStateStyle> = {
  logged: { bg: 'oklch(88% 0.09 145)', border: 'none', icon: '✓', iconColor: 'oklch(32% 0.1 145)' },
  over: { bg: 'oklch(88% 0.09 30)', border: 'none', icon: '', iconColor: 'oklch(38% 0.14 30)' },
  missed: { bg: 'oklch(55% 0.16 25)', border: 'none', icon: '×', iconColor: '#fff' },
  today: { bg: 'oklch(55% 0.09 255)', border: '3px solid oklch(55% 0.09 255)', ring: true, icon: '', iconColor: '#fff' },
  upcoming: { bg: 'oklch(95% 0.005 255)', border: 'none', icon: '', iconColor: '#9A9384' },
  frozen: { bg: 'oklch(91% 0.03 220)', border: 'none', icon: '❄', iconColor: 'oklch(45% 0.08 235)' },
};

export function dayStateBoxShadow(state: DayState): string {
  const style = DAY_STATE_STYLES[state];
  if (style.ring) return '0 0 0 3px #FDFBF5, 0 0 0 5.5px oklch(55% 0.09 255)';
  return 'none';
}
