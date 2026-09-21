import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useDataRefreshStore } from '../../lib/dataRefreshStore';
import { StreakModal } from '../streak/StreakModal';
import styles from './TopBar.module.css';

interface StreakSummary {
  currentStreakCount: number;
}

interface ProfileForTopBar {
  displayName: string;
}

export function TopBar() {
  const navigate = useNavigate();
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [avatarInitial, setAvatarInitial] = useState('?');
  const consumptionBumpedAt = useDataRefreshStore((s) => s.consumptionBumpedAt);
  const weightBumpedAt = useDataRefreshStore((s) => s.weightBumpedAt);

  // TopBar mount SEKALI di AppLayout (sibling <Outlet/>, sama pola BottomNav) — gak pernah
  // unmount pas pindah halaman, jadi bump counter dari dataRefreshStore dipakai jaga streak count
  // tetap akurat abis submit consumption/weight (lihat catatan dataRefreshStore.ts).
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiClient.get<StreakSummary>('/streak'),
      apiClient.get<ProfileForTopBar>('/profile'),
    ]).then(([streakRes, profileRes]) => {
      if (cancelled) return;
      setStreakCount(streakRes.data.currentStreakCount);
      setAvatarInitial(profileRes.data.displayName.charAt(0).toUpperCase() || '?');
    });
    return () => {
      cancelled = true;
    };
  }, [consumptionBumpedAt, weightBumpedAt]);

  return (
    <header className={styles.topBar}>
      <button className={styles.streak} onClick={() => setStreakModalOpen(true)} aria-label="Streak, view details">
        <Flame size={20} color="var(--color-accent)" />
        <span>{streakCount}</span>
      </button>
      <span className={styles.logo}>Catore</span>
      <button className={styles.avatar} onClick={() => navigate('/profile')} aria-label="Profile">
        <span>{avatarInitial}</span>
      </button>

      <StreakModal open={streakModalOpen} onClose={() => setStreakModalOpen(false)} />
    </header>
  );
}
