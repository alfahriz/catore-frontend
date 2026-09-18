import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useUnitStore, formatWeightNumber, formatHeightNumber, heightToCm } from '../lib/unitStore';
import { useAuthStore } from '../lib/authStore';
import { useToastStore } from '../lib/toastStore';
import { apiClient } from '../api/client';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';
import { ActivityAssessmentModal } from '../components/profile/ActivityAssessmentModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import styles from './Profile.module.css';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const LB_PER_KG = 2.20462;

// PRD 4.1: floor final = MAX(floor praktis, floor BMI16). Floor praktis = idealWeight(BMI22) - 10kg
// (batas wajar kebanyakan kasus). Floor BMI16 = backstop medis (severely underweight WHO), relevan
// cuma di tinggi badan sangat pendek. Contoh PRD: tinggi 169cm -> floor praktis 70kg, BMI16 ~45.7kg
// -> floor final 70kg (lapis praktis menang).
function idealWeightBmi22(heightCm: number): number {
  return 22 * Math.pow(heightCm / 100, 2);
}

function goalWeightFloor(heightCm: number): number {
  const practicalFloor = idealWeightBmi22(heightCm) - 10;
  const bmi16Floor = 16 * Math.pow(heightCm / 100, 2);
  return Math.round(Math.max(practicalFloor, bmi16Floor) * 10) / 10;
}

// BMI/TDEE/kategori limit SEBELUMNYA statis dari DUMMY_PROFILE.bmi/.tdee/DUMMY_LIMIT_PREVIEW
// (angka tetap, gak pernah dihitung ulang) — padahal PRD 4.1 eksplisit "TDEE dan BMI ter-update
// otomatis setiap kali height/weight/age/gender/baseline activity level diubah". Ketemu user
// 2026-09-16 pas mau nambah modal Retake Assessment (hasil assessment baru gak akan kelihatan
// ngaruh ke TDEE kalau tetap statis). Formula di bawah MIRROR PERSIS NutritionCalculator.cs
// (backend, Modules/ProfileAccount/Internal) — jaga 2 file ini tetap sinkron kalau formula
// backend berubah nanti.
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  Sedentary: 1.2,
  'Lightly active': 1.375,
  'Moderately active': 1.55,
  'Very active': 1.725,
};

const CATEGORY_OFFSETS: Record<string, number> = {
  Recovery: 0,
  Soft: -300,
  Mid: -400,
  Hard: -500,
};

function calculateBmr(weightKg: number, heightCm: number, age: number, gender: string): number {
  const baseBmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'Male' ? baseBmr + 5 : baseBmr - 161;
}

function calculateTdee(weightKg: number, heightCm: number, age: number, gender: string, activityLevel: string): number {
  const bmr = calculateBmr(weightKg, heightCm, age, gender);
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return bmr * multiplier;
}

function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// Shape response GET /profile (backend ProfileFullDto, camelCase default System.Text.Json).
interface ProfileApiResponse {
  height: number;
  weightCurrent: number;
  age: number;
  gender: string;
  displayName: string;
  baselineActivityLevel: string;
  goalWeight: number | null;
  goalWeightIsManual: boolean;
  metricPreference: string;
  timezone: string;
  isUpgraded: boolean;
  tdee: number;
  bmi: number;
  bmiCategory: string;
  categoryLimits: Record<string, number>;
  lastWipeOn: string | null;
}

export function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showToast = useToastStore((s) => s.showToast);
  const isPostWipe = searchParams.get('postWipe') === 'true';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('Male');
  const [genderMenuOpen, setGenderMenuOpen] = useState(false);
  const [age, setAge] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [hasActivityAssessment, setHasActivityAssessment] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  // Height SELALU disimpan sbg cm (pola sama weightKg) — tampilan di-convert via formatHeightNumber
  // sesuai metricPreference, user ngetik dalam unit aktif lalu di-convert balik ke cm (heightToCm)
  // sebelum disimpan. Sebelumnya `height` disimpan sbg STRING RAW cm, gak pernah ikut convert kalau
  // toggle ke lb (bug: label berubah jadi "Height (in)" tapi angkanya tetap angka cm) — ketemu user
  // 2026-09-16, weight udah convert lama tapi height kelewat pas awal dibikin.
  const [heightCm, setHeightCm] = useState(0);
  // Data internal SELALU kg (PRD 4.1) — weightKg/goalWeightKg disimpan sbg number murni, tampilan
  // (termasuk saat sedang diedit di input) di-convert via formatWeightNumber sesuai metricPreference
  // global. User ngetik dalam unit aktif, nilai di-convert balik ke kg sebelum disimpan ke state.
  const [weightKg, setWeightKg] = useState(0);
  const [goalWeightKg, setGoalWeightKg] = useState(0);
  const metricPreference = useUnitStore((s) => s.metricPreference);
  const setMetricPreference = useUnitStore((s) => s.setMetricPreference);
  const toggleMetricPreference = useUnitStore((s) => s.toggleMetricPreference);
  const [timezone, setTimezone] = useState('');
  const [refreshingTimezone, setRefreshingTimezone] = useState(false);
  // PRD 4.1: goal weight belum di-override manual = ikut auto-recalculate tiap height berubah (kayak
  // TDEE/BMI).
  const [isGoalManual, setIsGoalManual] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ field: 'gender' | 'age'; value: string } | null>(null);
  const originalAge = useRef('');

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<ProfileApiResponse>('/profile')
      .then((res) => {
        if (cancelled) return;
        const p = res.data;
        setNickname(p.displayName);
        setGender(p.gender);
        setAge(String(p.age));
        originalAge.current = String(p.age);
        setActivityLevel(p.baselineActivityLevel);
        setHasActivityAssessment(p.baselineActivityLevel !== '');
        setHeightCm(p.height);
        setWeightKg(p.weightCurrent);
        // goalWeight null (belum pernah di-set user, mis. abis Onboarding) -> pakai saran BMI22
        // dari height asli, BUKAN 0 (0 langsung nembus safety floor & bikin goalError nyala terus
        // dari awal render — ketemu pas testing manual, screenshot nunjukin "0.00" + error merah).
        setGoalWeightKg(p.goalWeight ?? idealWeightBmi22(p.height));
        setIsGoalManual(p.goalWeightIsManual);
        setTimezone(p.timezone);
        setMetricPreference(p.metricPreference === 'Pound' ? 'lb' : 'kg');
        // heightDraft/weightDraft/goalWeightDraft SENGAJA gak di-set manual di sini — effect
        // terpisah di bawah (dependency [heightCm, weightKg, goalWeightKg, metricPreference])
        // yg nanganin sinkronisasi draft, jalan otomatis begitu 4 state di atas berubah abis
        // fetch selesai. Set manual di sini beresiko race (closure `metricPreference` di scope
        // .then() ini masih nilai LAMA dari render sebelum fetch, bukan yg baru di-set barusan).
      })
      .catch(() => {
        if (!cancelled) showToast('Failed to load profile', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const floor = goalWeightFloor(heightCm);
  // goalError dihitung selalu dalam kg (data internal), gak peduli unit tampilan aktif.
  const goalError =
    goalWeightKg >= weightKg
      ? 'Goal weight must be lower than current weight'
      : goalWeightKg < floor
        ? `Goal weight cannot be below ${formatWeightNumber(floor, metricPreference)} ${metricPreference} (health safety floor)`
        : null;

  // BMI/TDEE/kategori limit LIVE — dihitung ulang tiap render dari state terkini (bukan lagi
  // DUMMY_PROFILE.bmi/.tdee/DUMMY_LIMIT_PREVIEW statis), sesuai PRD 4.1. Age di-parse dari string
  // draft, fallback ke age tersimpan kalau lagi kosong/invalid (konsisten pola heightNum lama).
  const ageNum = Number(age) || Number(originalAge.current) || 0;
  const bmi = Math.round(calculateBmi(weightKg, heightCm) * 10) / 10;
  const bmiCategory = getBmiCategory(bmi);
  const tdee = Math.round(calculateTdee(weightKg, heightCm, ageNum, gender, activityLevel));
  const limitPreview = Object.keys(CATEGORY_OFFSETS).map((label) => ({
    label,
    kcal: Math.round(tdee + CATEGORY_OFFSETS[label]),
  }));

  // Suggested goal = BMI 22 (titik tengah rentang sehat) dari height saat ini — ikut berubah live
  // kalau height diedit, TAPI cuma di-apply ke goalWeightKg kalau belum pernah di-override manual.
  const suggestedGoalKg = Math.round(idealWeightBmi22(heightCm) * 10) / 10;
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isGoalManual) setGoalWeightKg(suggestedGoalKg);
  }, [suggestedGoalKg, isGoalManual]);

  // Height/Weight/Goal Weight punya DRAFT STRING lokal terpisah dari state number (heightCm/weightKg/
  // goalWeightKg) — sebelumnya `value=` field ini langsung computed dari angka (`formatXNumber(...)`)
  // tiap render, jadi begitu user backspace smp kosong, `Number('')`=0 (bukan NaN) langsung nyimpen
  // 0 ke state, next render field balik keisi "0.00" — user gak PERNAH bisa liat field kosong sama
  // sekali buat ganti angka manual (ketemu user 2026-09-16, "gabisa didelete"). Fix: draft string
  // bebas diketik/dikosongin, cuma di-parse+disimpan ke state number kalau hasilnya angka valid;
  // draft di-RESYNC dari state tiap metricPreference berubah (toggle kg/lb tetap convert seperti biasa).
  const [heightDraft, setHeightDraft] = useState('');
  const [weightDraft, setWeightDraft] = useState('');
  const [goalWeightDraft, setGoalWeightDraft] = useState('');

  // Sync draft dari state SETELAH fetch profile selesai (`loading` false->kejadian sekali) DAN
  // tiap kali metricPreference di-toggle manual (kg<->lb) — TAPI SENGAJA TIDAK include heightCm/
  // weightKg/goalWeightKg di dependency, krn 3 value itu jg berubah tiap KEYSTROKE user ngetik
  // (handleHeightChange dkk) — kalau ikut jadi dependency, effect ini bakal overwrite draft user
  // balik ke format "rapi" di tengah ngetik, ngerusak fix "gabisa didelete" (field harus bisa
  // dikosongin bebas). `loading` dipakai sbg trigger proxy buat "abis fetch" TANPA depend ke value
  // heightCm dkk secara langsung.
  useEffect(() => {
    if (loading) return;
    setHeightDraft(formatHeightNumber(heightCm, metricPreference));
    setWeightDraft(formatWeightNumber(weightKg, metricPreference));
    setGoalWeightDraft(formatWeightNumber(goalWeightKg, metricPreference));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, metricPreference]);

  const handleHeightChange = (value: string) => {
    setHeightDraft(value);
    const num = Number(value);
    if (value.trim() !== '' && !Number.isNaN(num)) setHeightCm(heightToCm(num, metricPreference));
  };

  const handleWeightChange = (value: string) => {
    setWeightDraft(value);
    const num = Number(value);
    if (value.trim() !== '' && !Number.isNaN(num)) setWeightKg(metricPreference === 'lb' ? num / LB_PER_KG : num);
  };

  const handleGoalWeightChange = (value: string) => {
    setGoalWeightDraft(value);
    const num = Number(value);
    if (value.trim() !== '' && !Number.isNaN(num)) {
      setGoalWeightKg(metricPreference === 'lb' ? num / LB_PER_KG : num);
      setIsGoalManual(true);
    }
  };

  const handleGenderSelect = (option: string) => {
    setGenderMenuOpen(false);
    setPendingChange({ field: 'gender', value: option });
  };

  const handleAgeBlur = (value: string) => {
    if (value !== originalAge.current) {
      setPendingChange({ field: 'age', value });
    }
  };

  const confirmPendingChange = () => {
    if (!pendingChange) return;
    if (pendingChange.field === 'gender') setGender(pendingChange.value);
    if (pendingChange.field === 'age') setAge(pendingChange.value);
    setPendingChange(null);
  };

  const handleRefreshTimezone = async () => {
    if (refreshingTimezone) return;
    setRefreshingTimezone(true);
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      await apiClient.post('/profile/timezone/refresh', { timezone: detected });
      setTimezone(detected);
      showToast('Timezone updated', 'success');
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      showToast(message ?? 'Failed to refresh timezone', 'error');
    } finally {
      setRefreshingTimezone(false);
    }
  };

  const handleSave = async () => {
    if (saving || goalError) return;
    setSaving(true);
    try {
      await apiClient.put('/profile', {
        height: heightCm,
        weightCurrent: weightKg,
        age: Number(age),
        gender,
        displayName: nickname,
        goalWeight: goalWeightKg,
        metricPreference: metricPreference === 'lb' ? 'Pound' : 'Kilogram',
        timezone,
      });
      originalAge.current = age;
      showToast('Profile saved', 'success');
      // WelcomeBack "Update profile first" (?postWipe=true) — PRD: setelah Profile diupdate,
      // OTOMATIS lanjut ke Gateway check-in (bukan berhenti di Profile begitu saja).
      if (isPostWipe) {
        navigate('/onboarding?step=3');
      }
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      showToast(message ?? 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLogoutConfirmOpen(false);
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Logout tetap clear token lokal walau API call gagal (mis. token udah expired duluan) —
      // gak ada gunanya blokir user stuck di halaman ini kalau BE-side call gagal, sisi client tetap
      // harus ter-logout.
    } finally {
      useAuthStore.getState().logout();
      navigate('/login');
    }
  };

  if (loading) {
    return <div className={styles.page} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.identityCard}>
        <div className={styles.avatar}>{nickname.charAt(0).toUpperCase() || '?'}</div>
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
            <input className={styles.fieldInput} value={heightDraft} onChange={(e) => handleHeightChange(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Weight ({metricPreference})</span>
            <input className={styles.fieldInput} value={weightDraft} onChange={(e) => handleWeightChange(e.target.value)} />
          </label>
        </div>
      </div>

      <div className={styles.twoColRow}>
        <div className={styles.smallCard}>
          <div className={styles.smallCardRow}>
            <div>
              <div className={styles.smallCardLabel}>Timezone</div>
              <div className={styles.smallCardValue}>{timezone}</div>
            </div>
            <button
              className={styles.iconButton}
              title="Refresh timezone"
              disabled={refreshingTimezone}
              style={{ cursor: refreshingTimezone ? 'not-allowed' : 'pointer', opacity: refreshingTimezone ? 0.4 : 1 }}
              onClick={handleRefreshTimezone}
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
              onClick={toggleMetricPreference}
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
            {hasActivityAssessment && (
              <div className={styles.activityValue}>{activityLevel}</div>
            )}
          </div>
          <button className={styles.retakeButton} onClick={() => setAssessmentModalOpen(true)}>
            {hasActivityAssessment ? 'Retake assessment' : 'Take assessment'}
          </button>
        </div>
        <div
          className={styles.goalCard}
          style={{
            background: goalError
              ? 'oklch(60% 0.18 30 / 0.06)'
              : isGoalManual
                ? 'oklch(55% 0.09 190 / 0.08)'
                : 'var(--color-surface)',
          }}
        >
          <span className={styles.smallCardLabel}>Goal weight ({metricPreference})</span>
          <div className={styles.goalInputRow}>
            <input className={styles.goalInput} value={goalWeightDraft} onChange={(e) => handleGoalWeightChange(e.target.value)} />
          </div>
          {goalError ? (
            <span className={styles.goalError}>{goalError}</span>
          ) : (
            <span className={styles.goalHint}>Suggested: {formatWeightNumber(suggestedGoalKg, metricPreference)} {metricPreference} (BMI 22)</span>
          )}
        </div>
      </div>

      <div className={styles.numbersSection}>
        <div className={styles.numbersCard}>
          <div className={styles.numbersCol}>
            <div className={styles.numberLabelRow}>
              <span className={styles.numberLabel}>BMI</span>
              <span className={styles.numberSub}>{bmiCategory}</span>
            </div>
            <div className={styles.numberValue}>{bmi}</div>
          </div>
          <div className={styles.numbersDivider} />
          <div className={styles.numbersCol}>
            <div className={styles.numberLabelRow}>
              <span className={styles.numberLabel}>TDEE</span>
            </div>
            <div className={styles.numberValue}>
              {tdee} <span className={styles.numberUnit}>kcal</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.limitsSection}>
        <span className={styles.sectionEyebrow} style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: 700, letterSpacing: 0 }}>
          Preview calorie limits
        </span>
        <div className={styles.limitsGrid}>
          {limitPreview.map((item) => (
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

      <button className={styles.saveButton} onClick={handleSave} disabled={saving || !!goalError}>
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button className={styles.logoutButton} onClick={() => setLogoutConfirmOpen(true)}>Logout</button>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSave={() => {
          setPasswordModalOpen(false);
          navigate('/login');
        }}
      />

      <ActivityAssessmentModal
        open={assessmentModalOpen}
        onClose={() => setAssessmentModalOpen(false)}
        onSubmit={(level) => {
          setActivityLevel(level);
          setHasActivityAssessment(true);
          setAssessmentModalOpen(false);
        }}
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
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
}
