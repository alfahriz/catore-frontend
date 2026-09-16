import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../lib/authStore';
import styles from './Auth.module.css';

const LAST_SEEN_WIPE_KEY = 'catore-last-seen-wipe';

// PRD 4.0 Splash: auth-check ganti tergantung hasil:
// - Token invalid/expired (401) -> Login.
// - Network timeout/no connection (BUKAN 401) -> state error "Can't connect" + Retry, JANGAN
//   lempar ke Login (bisa menyesatkan, seolah sesi habis padahal cuma jaringan).
// - Token valid, Profile belum ada (404) -> New User -> Onboarding step 1.
// - Token valid, Profile ada, LastWipeOn > localStorage "terakhir dilihat" -> Post-Wipe User ->
//   WelcomeBack (localStorage dipakai krn BE gak expose flag "wipe ini sudah ditampilkan
//   Welcome-Back-nya belum" — begitu WelcomeBack ditampilkan, timestamp itu disimpan biar gak
//   muncul berulang tiap buka app selanjutnya).
// - Token valid, Profile ada, gak ada wipe baru -> Existing User -> Homepage.
type SplashState = 'loading' | 'error';

export function Splash() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [state, setState] = useState<SplashState>('loading');

  const runAuthCheck = async () => {
    setState('loading');

    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      const res = await apiClient.get('/profile');
      const lastWipeOn: string | null = res.data.lastWipeOn ?? null;
      const lastSeenWipe = localStorage.getItem(LAST_SEEN_WIPE_KEY);

      if (lastWipeOn && lastWipeOn !== lastSeenWipe) {
        localStorage.setItem(LAST_SEEN_WIPE_KEY, lastWipeOn);
        navigate('/welcome-back');
        return;
      }

      navigate('/homepage');
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        navigate('/onboarding');
        return;
      }
      if (status === 401) {
        navigate('/login');
        return;
      }
      // Network timeout/no response — bukan token invalid, jangan lempar Login.
      setState('error');
    }
  };

  useEffect(() => {
    runAuthCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.authPage}>
      <h1 className={styles.title}>Catore</h1>
      {state === 'error' && (
        <>
          <p className={styles.hint}>Can't connect — check your internet.</p>
          <button className={styles.primaryButton} onClick={runAuthCheck}>Retry</button>
        </>
      )}
    </div>
  );
}
