import { useEffect, useState } from 'react';
import { Flame, Shield, Snowflake, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import styles from './StreakModal.module.css';

interface StreakModalProps {
  open: boolean;
  onClose: () => void;
}

interface StreakSummary {
  currentStreakCount: number;
  streakFreezeCount: number;
  wipeFreezeCount: number;
}

interface ProfileForStreak {
  isUpgraded: boolean;
}

// MaxTokens (2) di-hardcode di sini krn backend (FreezeService.cs, modul Freeze) gak expose
// batas maksimal token lewat DTO manapun — cuma count TERSISA yg dikirim (`GET /streak`).
// Kalau backend nanti ubah batas ini, field ini WAJIB disesuaikan manual (gak ada API utk baca
// batasnya secara live).
const MAX_FREEZE_TOKENS = 2;

export function StreakModal({ open, onClose }: StreakModalProps) {
  const navigate = useNavigate();
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [isUpgraded, setIsUpgraded] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    Promise.all([
      apiClient.get<StreakSummary>('/streak'),
      apiClient.get<ProfileForStreak>('/profile'),
    ]).then(([streakRes, profileRes]) => {
      if (cancelled) return;
      setStreak(streakRes.data);
      setIsUpgraded(profileRes.data.isUpgraded);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open || !streak) return null;

  const streakBigColor = isUpgraded ? 'oklch(55% 0.1 220)' : 'var(--color-text-primary)';
  const streakCaption = isUpgraded ? 'Goal Achieved 🎉' : 'Current streak';

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <X size={18} strokeWidth={2.4} />
        </button>

        <div className={styles.streakHeader}>
          <Flame className={styles.flameBg} size={110} strokeWidth={1.5} color="var(--color-warning)" />
          <span className={styles.streakBig} style={{ color: streakBigColor }}>{streak.currentStreakCount}</span>
          <span className={styles.streakCaption}>{streakCaption}</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.tokenRow}>
          <div className={styles.tokenCard} style={{ background: 'oklch(93% 0.02 220 / 0.55)' }}>
            <Snowflake className={styles.tokenIcon} size={52} strokeWidth={1.5} color="oklch(42% 0.09 235)" />
            <span className={styles.tokenLabel}>Streak<br />Freeze</span>
            <span className={styles.tokenValue} style={{ color: 'oklch(42% 0.09 235)' }}>
              {streak.streakFreezeCount}/{MAX_FREEZE_TOKENS}
            </span>
          </div>
          <div className={styles.tokenCard} style={{ background: 'oklch(55% 0.09 255 / 0.1)' }}>
            <Shield className={styles.tokenIcon} size={52} strokeWidth={1.5} color="oklch(45% 0.1 255)" />
            <span className={styles.tokenLabel}>Wipe<br />Freeze</span>
            <span className={styles.tokenValue} style={{ color: 'oklch(45% 0.1 255)' }}>
              {streak.wipeFreezeCount}/{MAX_FREEZE_TOKENS}
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
