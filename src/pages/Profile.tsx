import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { DUMMY_LIMIT_PREVIEW, DUMMY_PROFILE } from '../lib/dummyData';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import styles from './Profile.module.css';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

function goalWeightFloor(heightCm: number): number {
  // Formula sederhana: floor lebih ketat dari (height-100)*0.9 atau BMI 16.
  const bmiFloor = 16 * Math.pow(heightCm / 100, 2);
  return Math.round(bmiFloor * 10) / 10;
}

export function Profile() {
  const [nickname, setNickname] = useState(DUMMY_PROFILE.nickname);
  const [gender, setGender] = useState(DUMMY_PROFILE.gender);
  const [genderMenuOpen, setGenderMenuOpen] = useState(false);
  const [age, setAge] = useState(String(DUMMY_PROFILE.age));
  const [height, setHeight] = useState(String(DUMMY_PROFILE.heightCm));
  const [weight, setWeight] = useState(String(DUMMY_PROFILE.weightKg));
  const [metricPreference, setMetricPreference] = useState(DUMMY_PROFILE.metricPreference);
  const [goalWeight, setGoalWeight] = useState(String(DUMMY_PROFILE.goalWeightKg));
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ field: 'gender' | 'age'; value: string } | null>(null);

  const floor = goalWeightFloor(Number(height) || DUMMY_PROFILE.heightCm);
  const currentWeightNum = Number(weight) || DUMMY_PROFILE.weightKg;
  const goalWeightNum = Number(goalWeight);
  const goalError =
    goalWeightNum >= currentWeightNum
      ? 'Goal weight must be lower than current weight'
      : goalWeightNum < floor
        ? `Goal weight cannot be below ${floor} kg (health safety floor)`
        : null;

  const handleGenderSelect = (option: string) => {
    setGenderMenuOpen(false);
    setPendingChange({ field: 'gender', value: option });
  };

  const handleAgeBlur = (value: string) => {
    if (value !== String(DUMMY_PROFILE.age)) {
      setPendingChange({ field: 'age', value });
    }
  };

  const confirmPendingChange = () => {
    if (!pendingChange) return;
    if (pendingChange.field === 'gender') setGender(pendingChange.value);
    if (pendingChange.field === 'age') setAge(pendingChange.value);
    setPendingChange(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.identityCard}>
        <div className={styles.avatar}>{DUMMY_PROFILE.avatarInitial}</div>
        <input
          className={styles.nicknameInput}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>

      <div className={styles.metricsCard}>
        <span className={styles.sectionEyebrow}>BODY METRICS</span>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Gender</span>
            <button className={styles.genderButton} onClick={() => setGenderMenuOpen((v) => !v)}>
              <span>{gender}</span>
              <span>▾</span>
            </button>
            {genderMenuOpen && (
              <div className={styles.genderMenu}>
                {GENDER_OPTIONS.map((option) => (
                  <button key={option} className={styles.genderOption} onClick={() => handleGenderSelect(option)}>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Age</span>
            <input
              className={styles.fieldInput}
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={(e) => handleAgeBlur(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Height ({metricPreference === 'kg' ? 'cm' : 'in'})</span>
            <input className={styles.fieldInput} value={height} onChange={(e) => setHeight(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Weight ({metricPreference})</span>
            <input className={styles.fieldInput} value={weight} onChange={(e) => setWeight(e.target.value)} />
          </label>
        </div>
      </div>

      <div className={styles.twoColRow}>
        <div className={styles.smallCard}>
          <div className={styles.smallCardRow}>
            <div>
              <div className={styles.smallCardLabel}>Timezone</div>
              <div className={styles.smallCardValue}>{DUMMY_PROFILE.timezone}</div>
            </div>
            <button
              className={styles.iconButton}
              title={DUMMY_PROFILE.timezoneLocked ? 'Locked while grace window is active' : 'Refresh timezone'}
              disabled={DUMMY_PROFILE.timezoneLocked}
              style={{ cursor: DUMMY_PROFILE.timezoneLocked ? 'not-allowed' : 'pointer', opacity: DUMMY_PROFILE.timezoneLocked ? 0.4 : 1 }}
            >
              <RefreshCw size={16} strokeWidth={2.2} color="var(--color-text-primary)" />
            </button>
          </div>
        </div>
        <div className={styles.smallCard}>
          <div className={styles.smallCardRow}>
            <div>
              <div className={styles.smallCardLabel}>Metric</div>
              <div className={styles.smallCardValue}>{metricPreference === 'kg' ? 'Metric (kg)' : 'Imperial (lb)'}</div>
            </div>
            <button
              className={styles.metricToggle}
              style={{ background: metricPreference === 'lb' ? 'var(--color-accent)' : '#DCD5C4' }}
              onClick={() => setMetricPreference((v) => (v === 'kg' ? 'lb' : 'kg'))}
              aria-label="Toggle metric preference"
            >
              <div className={styles.metricKnob} style={{ transform: metricPreference === 'lb' ? 'translateX(16px)' : 'translateX(0)' }} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.activityGoalRow}>
        <div className={styles.activityCard}>
          <div>
            <div className={styles.smallCardLabel}>Baseline activity level</div>
            {DUMMY_PROFILE.hasActivityAssessment && (
              <div className={styles.activityValue}>{DUMMY_PROFILE.activityLevel}</div>
            )}
          </div>
          <button className={styles.retakeButton}>
            {DUMMY_PROFILE.hasActivityAssessment ? 'Retake assessment' : 'Take assessment'}
          </button>
        </div>
        <div className={styles.goalCard} style={{ background: goalError ? 'oklch(60% 0.18 30 / 0.06)' : 'var(--color-surface)' }}>
          <span className={styles.smallCardLabel}>Goal weight ({metricPreference})</span>
          <div className={styles.goalInputRow}>
            <input className={styles.goalInput} value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} />
          </div>
          {goalError ? (
            <span className={styles.goalError}>{goalError}</span>
          ) : (
            <span className={styles.goalHint}>Suggested: {DUMMY_PROFILE.suggestedGoalKg} kg (BMI {DUMMY_PROFILE.suggestedGoalBmi})</span>
          )}
        </div>
      </div>

      <div className={styles.numbersSection}>
        <span className={styles.sectionEyebrow} style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: 700, letterSpacing: 0 }}>
          Your numbers
        </span>
        <div className={styles.numbersList}>
          <div className={styles.numberCard}>
            <div>
              <div className={styles.numberLabel}>BMI</div>
              <div className={styles.numberSub}>{DUMMY_PROFILE.bmiCategory}</div>
            </div>
            <div className={styles.numberValue}>{DUMMY_PROFILE.bmi}</div>
          </div>
          <div className={styles.numberCard}>
            <div className={styles.numberLabel}>TDEE</div>
            <div className={styles.numberValue}>
              {DUMMY_PROFILE.tdee} <span className={styles.numberUnit}>kcal</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.limitsSection}>
        <span className={styles.sectionEyebrow} style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: 700, letterSpacing: 0 }}>
          Preview calorie limits
        </span>
        <div className={styles.limitsGrid}>
          {DUMMY_LIMIT_PREVIEW.map((item) => (
            <div className={styles.limitCard} key={item.label}>
              <div className={styles.limitLabel}>{item.label}</div>
              <div className={styles.limitValue}>{item.kcal.toLocaleString('en-US')} kcal</div>
            </div>
          ))}
        </div>
      </div>

      <button className={styles.changePasswordButton} onClick={() => setPasswordModalOpen(true)}>
        Change Password →
      </button>

      <button className={styles.saveButton}>Save</button>
      <button className={styles.logoutButton} onClick={() => setLogoutConfirmOpen(true)}>Logout</button>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSave={() => setPasswordModalOpen(false)}
      />

      <ConfirmDialog
        open={pendingChange !== null}
        message="This will affect your TDEE calculation — continue?"
        confirmLabel="Confirm"
        onConfirm={confirmPendingChange}
        onCancel={() => setPendingChange(null)}
      />

      <ConfirmDialog
        open={logoutConfirmOpen}
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        confirmVariant="destructive"
        onConfirm={() => setLogoutConfirmOpen(false)}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
}
