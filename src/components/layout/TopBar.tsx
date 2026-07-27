import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { DUMMY_STREAK } from '../../lib/dummyData';
import { StreakModal } from '../streak/StreakModal';
import styles from './TopBar.module.css';

export function TopBar() {
  const navigate = useNavigate();
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  return (
    <header className={styles.topBar}>
      <button className={styles.streak} onClick={() => setStreakModalOpen(true)} aria-label="Streak, view details">
        <Flame size={20} color="var(--color-accent)" />
        <span>{DUMMY_STREAK.count}</span>
      </button>
      <span className={styles.logo}>Catore</span>
      <button className={styles.avatar} onClick={() => navigate('/profile')} aria-label="Profile">
        <span>?</span>
      </button>

      <StreakModal open={streakModalOpen} onClose={() => setStreakModalOpen(false)} />
    </header>
  );
}
