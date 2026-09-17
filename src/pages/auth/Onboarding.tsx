import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../lib/toastStore';
import { todayLocalIso } from '../../lib/dateUtils';
import { mapActivityAssessment, EXERCISE_DAY_OPTIONS } from '../../lib/activityAssessment';
import styles from './Onboarding.module.css';

const GENDER_OPTIONS = ['Male', 'Female'];
const DEFICIT_CATEGORIES = [
  { label: 'Soft', offset: -300, desc: 'Gentle deficit, slow and steady.' },
  { label: 'Mid', offset: -400, desc: 'Balanced pace, most common choice.' },
  { label: 'Hard', offset: -500, desc: 'Aggressive deficit, faster results.' },
];

// PRD 4.0 Onboarding: linear 3-step, back-nav antar step, TIDAK ADA partial-save (interrupt = mulai
// ulang dari step 1). Data disimpan sementara di state form, submit final di step terakhir per step
// (step 1 -> PUT profile, step 2 -> POST activity-assessment, step 3 -> PATCH daily-record) —
// masing-masing langsung API call di step-nya sendiri (bukan 1 submit besar di akhir), krn 3 endpoint
// itu independen (modul beda) dan step 2/3 butuh Profile step 1 SUDAH tersimpan duluan (activity
// assessment & daily record keduanya query row profile yg sama).
export function Onboarding() {
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const [searchParams] = useSearchParams();
  // WelcomeBack.tsx (Post-Wipe User) navigate ke sini dgn ?step=3 — Profile sudah ada (selamat dari
  // wipe), jadi skip step 1-2, langsung Gateway check-in. Step 1/2 punya state kosong di render ini
  // (gak dipakai/gak divalidasi) krn user gak pernah melewatinya scr UI kalau start dari step 3.
  const initialStep = searchParams.get('step') === '3' ? 3 : 1;
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<string | null>(null);

  // Step 2
  const [workEnvironment, setWorkEnvironment] = useState<'indoor' | 'outdoor' | null>(null);
  const [exerciseDays, setExerciseDays] = useState<number | null>(null);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);

  // Step 3
  const [deficitCategory, setDeficitCategory] = useState<string | null>(null);
  const [paToday, setPaToday] = useState(false);

  const step1Valid = height.trim() !== '' && weight.trim() !== '' && age.trim() !== '' && gender !== null;
  const step2Valid = workEnvironment !== null && exerciseDays !== null;
  const step3Valid = deficitCategory !== null;

  const handleStep1Next = async () => {
    if (!step1Valid || loading) return;
    setLoading(true);
    try {
      // PRD 4.1: "Timezone hanya berubah lewat aksi eksplisit pengguna (refresh manual) ATAU SAAT
      // PERTAMA KALI SETUP" — sebelumnya field ini gak pernah dikirim di Onboarding step 1 sama
      // sekali, row Profile baru kesimpen Timezone="" kosong permanen. Efeknya baru ketauan belakangan:
      // tombol Refresh Timezone manual di Profile.tsx GAK BISA dipakai buat ngisi kekosongan itu,
      // krn endpoint refresh justru nge-cek grace window pakai timezone LAMA (kosong) dulu sebelum
      // ngizinin ganti — deadlock. Fix akar: kirim timezone browser di sini juga, biar row baru
      // gak pernah kosong dari awal.
      await apiClient.put('/profile', {
        height: Number(height),
        weightCurrent: Number(weight),
        age: Number(age),
        gender,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setStep(2);
    } catch {
      showToast('Network error — please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = async () => {
    if (!step2Valid || loading) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/profile/activity-assessment', {
        workEnvironment,
        exerciseFrequency: String(exerciseDays),
      });
      setActivityLevel(res.data.activityLevel ?? mapActivityAssessment(workEnvironment, exerciseDays));
      setStep(3);
    } catch {
      showToast('Network error — please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!step3Valid || loading) return;
    setLoading(true);
    try {
      const today = todayLocalIso();
      // PATCH daily-record return 404 kalau row belum ada — backend gak punya "get or create" di
      // endpoint PATCH itu sendiri (cuma GET yg punya, ConsumptionController.GetDailyRecord ->
      // GetOrCreateDailyRecord). Ketemu bug ini pas testing manual (403... eh 404) — GET dulu
      // biar row ke-create, baru PATCH update kategori/PA-nya.
      await apiClient.get(`/consumption/daily-record/${today}`);
      await apiClient.patch(`/consumption/daily-record/${today}`, {
        deficitCategory,
        paToday,
      });
      navigate('/homepage');
    } catch {
      showToast('Network error — please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.dots}>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`${styles.dot} ${s === step ? styles.dotActive : ''} ${s < step ? styles.dotDone : ''}`} />
        ))}
      </div>

      {step === 1 && (
        <div className={styles.stepContent}>
          <h1 className={styles.title}>Tell us about yourself</h1>
          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Gender</span>
                <div className={styles.pillRow}>
                  {GENDER_OPTIONS.map((g) => (
                    <button key={g} className={`${styles.pill} ${gender === g ? styles.pillActive : ''}`} onClick={() => setGender(g)}>
                      {g}
                    </button>
                  ))}
                </div>
              </label>
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Age</span>
                <input className={styles.fieldInput} value={age} onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))} />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Height (cm)</span>
                <input className={styles.fieldInput} value={height} onChange={(e) => setHeight(e.target.value)} />
              </label>
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Weight (kg)</span>
                <input className={styles.fieldInput} value={weight} onChange={(e) => setWeight(e.target.value)} />
              </label>
            </div>
          </div>
          <div className={styles.stepActions}>
            <button className={styles.primaryButton} onClick={handleStep1Next} disabled={!step1Valid || loading}>
              {loading ? 'Saving…' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.stepContent}>
          <h1 className={styles.title}>Baseline activity level</h1>
          <div className={styles.question}>
            <span className={styles.questionLabel}>Is your daily work/routine mostly indoor or outdoor?</span>
            <div className={styles.pillRow}>
              <button className={`${styles.pill} ${workEnvironment === 'indoor' ? styles.pillActive : ''}`} onClick={() => setWorkEnvironment('indoor')}>Indoor</button>
              <button className={`${styles.pill} ${workEnvironment === 'outdoor' ? styles.pillActive : ''}`} onClick={() => setWorkEnvironment('outdoor')}>Outdoor</button>
            </div>
          </div>
          <div className={styles.question}>
            <span className={styles.questionLabel}>How many days a week do you exercise?</span>
            <div className={styles.dayGrid}>
              {EXERCISE_DAY_OPTIONS.map((d) => (
                <button key={d} className={`${styles.dayButton} ${exerciseDays === d ? styles.dayButtonActive : ''}`} onClick={() => setExerciseDays(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          {activityLevel && <p className={styles.hint}>Suggested level: <strong>{activityLevel}</strong></p>}
          <div className={styles.stepActions}>
            <button className={styles.secondaryButton} onClick={() => setStep(1)}>Back</button>
            <button className={styles.primaryButton} onClick={handleStep2Next} disabled={!step2Valid || loading}>
              {loading ? 'Saving…' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.stepContent}>
          <h1 className={styles.title}>Set today's plan</h1>
          <div className={styles.categoryGrid}>
            {DEFICIT_CATEGORIES.map((c) => (
              <button
                key={c.label}
                className={`${styles.categoryCard} ${deficitCategory === c.label ? styles.categoryCardActive : ''}`}
                onClick={() => setDeficitCategory(c.label)}
              >
                <span className={styles.categoryLabel}>{c.label}</span>
                <span className={styles.categoryDesc}>{c.desc}</span>
              </button>
            ))}
          </div>
          <label className={styles.paRow}>
            <span className={styles.questionLabel}>Physical activity today (+200 kcal)</span>
            <button
              className={styles.toggle}
              style={{ background: paToday ? 'var(--color-accent)' : '#DCD5C4' }}
              onClick={() => setPaToday((v) => !v)}
              aria-label="Toggle PA today"
            >
              <div className={styles.toggleKnob} style={{ transform: paToday ? 'translateX(16px)' : 'translateX(0)' }} />
            </button>
          </label>
          <div className={styles.stepActions}>
            <button className={styles.secondaryButton} onClick={() => setStep(2)}>Back</button>
            <button className={styles.primaryButton} onClick={handleStep3Submit} disabled={!step3Valid || loading}>
              {loading ? 'Finishing…' : 'Finish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
