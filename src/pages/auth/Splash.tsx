import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/authStore';
import { resolveAuthDestination } from '../../lib/resolveAuthDestination';
import styles from './Splash.module.css';

// Splash cuma dipakai cold-start app (root) — Login.tsx punya jalur sendiri ke resolveAuthDestination
// TANPA lewat sini, biar gak numpang delay branding screen ini abis submit form.
const MIN_DISPLAY_MS = 3000;
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SplashState = 'loading' | 'error';

export function Splash() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [state, setState] = useState<SplashState>('loading');

  const runAuthCheck = async () => {
    setState('loading');
    const minDisplay = delay(MIN_DISPLAY_MS);

    if (!accessToken) {
      await minDisplay;
      navigate('/login');
      return;
    }

    const [destination] = await Promise.all([resolveAuthDestination(), minDisplay]);
    if (destination.route === 'network-error') {
      setState('error');
      return;
    }
    navigate(destination.route);
  };

  useEffect(() => {
    runAuthCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.page}>
      <h1 className={styles.logo}>Catore</h1>
      {state === 'error' && (
        <>
          <p className={styles.hint}>Can't connect — check your internet.</p>
          <button className={styles.primaryButton} onClick={runAuthCheck}>Retry</button>
        </>
      )}
    </div>
  );
}
