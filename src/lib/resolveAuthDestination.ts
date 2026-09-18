import { apiClient } from '../api/client';

const LAST_SEEN_WIPE_KEY = 'catore-last-seen-wipe';

export type AuthDestination =
  | { route: '/onboarding' }
  | { route: '/welcome-back' }
  | { route: '/homepage' }
  | { route: '/login' }
  | { route: 'network-error' };

// Dipakai Splash.tsx (cold-start app) DAN Login.tsx (abis submit sukses) — 1 sumber logic
// routing New User/Post-Wipe/Existing, biar gak keduplikasi di 2 tempat (kalau ada gak akan
// pernah aman, gampang salah satu ketinggalan pas logic-nya berubah).
export async function resolveAuthDestination(): Promise<AuthDestination> {
  try {
    const res = await apiClient.get('/profile');
    const lastWipeOn: string | null = res.data.lastWipeOn ?? null;
    const lastSeenWipe = localStorage.getItem(LAST_SEEN_WIPE_KEY);

    if (lastWipeOn && lastWipeOn !== lastSeenWipe) {
      localStorage.setItem(LAST_SEEN_WIPE_KEY, lastWipeOn);
      return { route: '/welcome-back' };
    }

    return { route: '/homepage' };
  } catch (err) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 404) return { route: '/onboarding' };
    if (status === 401) return { route: '/login' };
    return { route: 'network-error' };
  }
}
