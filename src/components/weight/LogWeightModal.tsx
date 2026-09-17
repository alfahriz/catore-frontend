import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Minus, Plus } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useUnitStore, formatWeightNumber } from '../../lib/unitStore';
import { useToastStore } from '../../lib/toastStore';
import { useDataRefreshStore } from '../../lib/dataRefreshStore';
import { todayLocalIso, toLocalIsoDate } from '../../lib/dateUtils';
import styles from './LogWeightModal.module.css';

interface LogWeightModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (weight: number) => void;
}

interface WeightHistoryItem {
  loggedDate: string;
  weightValue: number;
}

function round1Decimal(value: number): number {
  return Math.round(value * 100) / 100;
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const LB_PER_KG = 2.20462;

export function LogWeightModal({ open, onClose, onSave }: LogWeightModalProps) {
  const showToast = useToastStore((s) => s.showToast);
  // weight (state) SELALU kg — onSave(weight) tetap kontrak kg ke pemanggil. Tampilan/stepper/input
  // dikonversi ke unit aktif, step ±0.1 diterapkan di unit TAMPILAN (0.1kg atau 0.1lb, bukan dipaksa
  // selalu 0.1kg lalu ke-render ganjil di lb).
  const [weight, setWeight] = useState(0);
  const [rawInput, setRawInput] = useState<string | undefined>(undefined);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const metricPreference = useUnitStore((s) => s.metricPreference);

  // PRD 4.3: field berat HARUS pre-filled angka TERAKHIR tercatat (checkpoint sebelumnya, atau
  // placeholder Profile.weight kalau belum pernah ada checkpoint sama sekali) — TIDAK PERNAH
  // kosong dari awal. Title berubah "Update" vs "Log" tergantung apa hari ini SUDAH py checkpoint
  // (backend upsert per-hari, AddOrUpdateWeightLog) — dicek dari histori 1 hari terakhir, bukan
  // state lokal yg gampang basi (mis. modal dibuka lagi setelah reload).
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const today = todayLocalIso();
    Promise.all([
      apiClient.get<WeightHistoryItem[]>('/weightlog', { params: { startDate: today, endDate: today } }),
      apiClient.get('/profile'),
    ])
      .then(([todayRes, profileRes]) => {
        if (todayRes.data.length > 0) {
          setWeight(todayRes.data[0].weightValue);
          setHasLoggedToday(true);
          return;
        }
        setHasLoggedToday(false);
        // Belum ada checkpoint hari ini — cari checkpoint TERAKHIR sebelumnya (90 hari ke belakang,
        // cukup jauh buat kebanyakan kasus pemakaian normal); kalau tetap gak ada sama sekali,
        // fallback ke Profile.weightCurrent (placeholder, PRD 4.1).
        const historyStart = new Date();
        historyStart.setDate(historyStart.getDate() - 90);
        return apiClient
          .get<WeightHistoryItem[]>('/weightlog', { params: { startDate: toLocalIsoDate(historyStart), endDate: today } })
          .then((historyRes) => {
            const history = historyRes.data;
            if (history.length > 0) {
              const latest = [...history].sort((a, b) => a.loggedDate.localeCompare(b.loggedDate)).at(-1)!;
              setWeight(latest.weightValue);
            } else {
              setWeight(profileRes.data.weightCurrent);
            }
          });
      })
      .catch(() => {
        showToast('Failed to load weight data', 'error');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const title = hasLoggedToday ? "Update today's weight" : "Log today's weight";
  const displayValue = rawInput !== undefined ? rawInput : formatWeightNumber(weight, metricPreference);

  const step = (delta: number) => {
    setWeight((w) => {
      const displayed = metricPreference === 'lb' ? w * LB_PER_KG : w;
      const nextDisplayed = round1Decimal(displayed + delta);
      return round1Decimal(metricPreference === 'lb' ? nextDisplayed / LB_PER_KG : nextDisplayed);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawInput(e.target.value.replace(/[^0-9.]/g, ''));
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(rawInput ?? '');
    if (!isNaN(parsed)) {
      setWeight(round1Decimal(metricPreference === 'lb' ? parsed / LB_PER_KG : parsed));
    }
    setRawInput(undefined);
  };

  // PRD: "Tap Save di form Log Weight selalu kembali ke Homepage setelah commit berhasil" —
  // navigasi balik ditangani caller (BottomNav) via onSave, bukan di sini.
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await apiClient.post('/weightlog', { weightValue: weight });
      useDataRefreshStore.getState().bumpWeight();
      onSave(weight);
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      showToast(message ?? 'Network error — please try again', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onClose} aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.stepperRow}>
          <button
            className={styles.stepperButton}
            onClick={() => step(-0.1)}
            disabled={loading}
            aria-label="Decrease weight"
          >
            <Minus size={22} strokeWidth={2.4} />
          </button>
          <div className={styles.valueColumn}>
            <input
              className={styles.valueInput}
              value={displayValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={loading}
              inputMode="decimal"
            />
            <span className={styles.unit}>{metricPreference}</span>
          </div>
          <button
            className={styles.stepperButton}
            onClick={() => step(0.1)}
            disabled={loading}
            aria-label="Increase weight"
          >
            <Plus size={22} strokeWidth={2.4} />
          </button>
        </div>

        <div className={styles.dateField}>
          <Calendar size={14} strokeWidth={2} color="var(--color-accent)" style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
          {todayLabel()}
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
        <button className={styles.saveButton} onClick={handleSave} disabled={loading || saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
