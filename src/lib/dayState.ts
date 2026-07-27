export type DayState = 'logged' | 'over' | 'missed' | 'today' | 'upcoming' | 'frozen';

export interface DayStateStyle {
  bg: string;
  border: string;
  ring?: boolean;
  icon: string;
  iconColor: string;
}

export const DAY_STATE_STYLES: Record<DayState, DayStateStyle> = {
  logged: { bg: 'oklch(58% 0.16 145)', border: 'none', icon: '✓', iconColor: '#fff' },
  over: { bg: 'oklch(60% 0.18 30)', border: 'none', icon: '', iconColor: '#fff' },
  missed: { bg: 'transparent', border: '2.5px solid oklch(70% 0.18 20)', icon: '×', iconColor: 'oklch(55% 0.19 20)' },
  today: { bg: 'oklch(55% 0.09 255)', border: '3px solid oklch(55% 0.09 255)', ring: true, icon: '', iconColor: '#fff' },
  upcoming: { bg: 'transparent', border: '1.5px solid #DCD5C4', icon: '', iconColor: '#7A7260' },
  frozen: { bg: 'oklch(88% 0.045 220)', border: 'none', icon: '❄', iconColor: 'oklch(42% 0.09 235)' },
};

export function dayStateBoxShadow(state: DayState): string {
  const style = DAY_STATE_STYLES[state];
  if (style.ring) return '0 0 0 3px #FDFBF5, 0 0 0 5.5px oklch(55% 0.09 255)';
  if (state === 'logged' || state === 'over' || state === 'frozen') return '0 2px 5px rgba(180,160,120,0.4)';
  return 'none';
}
