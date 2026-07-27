import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DUMMY_STREAK } from '../../lib/dummyData';
import styles from './StreakModal.module.css';

interface StreakModalProps {
  open: boolean;
  onClose: () => void;
}

export function StreakModal({ open, onClose }: StreakModalProps) {
  const navigate = useNavigate();
  if (!open) return null;

  const streak = DUMMY_STREAK;
  const streakBigColor = streak.isGoalAchieved ? 'oklch(55% 0.1 220)' : 'var(--color-text-primary)';
  const streakCaption = streak.isGoalAchieved ? 'Goal Achieved 🎉' : 'Current streak';

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <X size={18} strokeWidth={2.4} />
        </button>

        <div className={styles.streakHeader}>
          <span className={styles.flameBg}>🔥</span>
          <span className={styles.streakBig} style={{ color: streakBigColor }}>{streak.count}</span>
          <span className={styles.streakCaption}>{streakCaption}</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.tokenRow}>
          <div className={styles.tokenCard} style={{ background: 'oklch(93% 0.02 220 / 0.55)' }}>
            <span className={styles.tokenEmoji}>❄️</span>
            <span className={styles.tokenLabel}>Streak Freeze</span>
            <span className={styles.tokenValue} style={{ color: 'oklch(42% 0.09 235)' }}>
              {streak.streakFreezeAvailable}/{streak.streakFreezeMax}
            </span>
          </div>
          <div className={styles.tokenCard} style={{ background: 'oklch(55% 0.09 255 / 0.1)' }}>
            <span className={styles.tokenEmoji}>🛡️</span>
            <span className={styles.tokenLabel}>Wipe<br />Freeze</span>
            <span className={styles.tokenValue} style={{ color: 'oklch(45% 0.1 255)' }}>
              {streak.wipeFreezeAvailable}/{streak.wipeFreezeMax}
            </span>
          </div>
        </div>

        <button
          className={styles.viewMonthlyButton}
          onClick={() => {
            onClose();
            navigate('/monthly-review');
          }}
        >
          View Monthly Review →
        </button>
      </div>
    </div>
  );
}
