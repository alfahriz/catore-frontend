import { useState } from 'react';
import { EXERCISE_DAY_OPTIONS } from '../../lib/activityAssessment';
import styles from './ActivityAssessmentModal.module.css';

interface ActivityAssessmentModalProps {
  open: boolean;
  onClose: () => void;
  // Kirim jawaban MENTAH (bukan hasil map lokal) — caller (Profile.tsx) yg persist ke
  // `POST /profile/activity-assessment`, biar backend jadi 1 sumber kebenaran mapping
  // jawaban->level (sama pola Onboarding step 2), bukan dihitung ulang di FE lalu dibuang gitu aja.
  onSubmit: (workEnvironment: 'indoor' | 'outdoor', exerciseDays: number) => void;
}

export function ActivityAssessmentModal({ open, onClose, onSubmit }: ActivityAssessmentModalProps) {
  const [workEnvironment, setWorkEnvironment] = useState<'indoor' | 'outdoor' | null>(null);
  const [exerciseDays, setExerciseDays] = useState<number | null>(null);

  if (!open) return null;

  const canSubmit = workEnvironment !== null && exerciseDays !== null;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(workEnvironment, exerciseDays);
    setWorkEnvironment(null);
    setExerciseDays(null);
  };

  const handleClose = () => {
    setWorkEnvironment(null);
    setExerciseDays(null);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <span className={styles.title}>Baseline Activity Level</span>
        <span className={styles.subtitle}>Answer 2 quick questions — this doesn't change day-to-day, unlike your daily deficit category.</span>

        <div className={styles.question}>
          <span className={styles.questionLabel}>Q1. Is your daily work/routine mostly indoor or outdoor?</span>
          <div className={styles.pillRow}>
            <button
              className={`${styles.pill} ${workEnvironment === 'indoor' ? styles.pillActive : ''}`}
              onClick={() => setWorkEnvironment('indoor')}
            >
              Indoor
            </button>
            <button
              className={`${styles.pill} ${workEnvironment === 'outdoor' ? styles.pillActive : ''}`}
              onClick={() => setWorkEnvironment('outdoor')}
            >
              Outdoor
            </button>
          </div>
        </div>

        <div className={styles.question}>
          <span className={styles.questionLabel}>Q2. How many days a week do you exercise?</span>
          <div className={styles.dayGrid}>
            {EXERCISE_DAY_OPTIONS.map((d) => (
              <button
                key={d}
                className={`${styles.dayButton} ${exerciseDays === d ? styles.dayButtonActive : ''}`}
                onClick={() => setExerciseDays(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={handleClose}>Cancel</button>
          <button className={styles.submitButton} onClick={handleSubmit} disabled={!canSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
}
