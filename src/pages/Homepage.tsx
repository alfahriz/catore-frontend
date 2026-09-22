import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DAY_STATE_STYLES, dayStateBoxShadow, type DayState } from '../lib/dayState';
import { apiClient } from '../api/client';
import { useUnitStore, formatWeight } from '../lib/unitStore';
import { useAuthStore } from '../lib/authStore';
import { useToastStore } from '../lib/toastStore';
import { useDataRefreshStore } from '../lib/dataRefreshStore';
import { todayLocalIso, toLocalIsoDate } from '../lib/dateUtils';
import { getWeekNumberInMonth } from '../lib/logPeriod';
import { CategorySheet } from '../components/homepage/CategorySheet';
import styles from './Homepage.module.css';

const RING_RADIUS = 82;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Backend shape (ProfileFullDto.categoryLimits, camelCase key = nama kategori — Recovery/Soft/Mid/Hard).
interface CategoryLimits {
  [label: string]: number;
}

// DailyRecordDto (Consumption module).
interface DailyRecordResponse {
  recordDate: string;
  calorieCategory: string;
  paToday: boolean;
  effectiveTdee: number;
  effectiveLimit: number;
  isFrozen: boolean;
  intakeSum: number;
}

// WeightLog history item (WeightTracking module GET).
// Bug ditemukan 2026-09-17 pas migrasi LogWeightModal: field ini SEBELUMNYA `checkpointDate`
// (nama internal EF entity TWeightLog.CheckpointDate) — TAPI backend DTO publik (WeightEntryDto)
// serialize sbg `loggedDate`, BEDA nama. Silent bug: gak pernah kepicu krn akun test blm py
// histori weightlog sama sekali (array selalu kosong, `.checkpointDate` undefined gak pernah
// diakses). Ketauan pas nulis LogWeightModal.tsx yg baca API yg sama, cross-check field asli.
interface WeightHistoryItem {
  loggedDate: string;
  weightValue: number;
}

// DayBarDto (Log module, dalam LogWeekDto.dailyBars).
interface DayBar {
  date: string;
  intake: number;
  limit: number;
  hasEntry: boolean;
  isFrozen: boolean;
  isUpcoming: boolean;
}

interface LogDayEntry {
  entryPk: number;
  foodName: string;
  calories: number;
  mealType: string;
  entryTimestamp: string;
}

interface MissingDate {
  date: string;
  deadline: string;
  isLastDay: boolean;
  daysLeft: number;
}

// `firstSeenDate` = approximation signupDate (backend gak expose account.createdOn ke FE, lihat
// authStore.ts) — tanggal SEBELUM ini di-treat sbg "upcoming" (kosong/netral), BUKAN "missed",
// krn akun/device blm exist di tanggal itu. Ketemu bug nyata: minggu berjalan nunjukin Senin
// (sebelum akun ini dibuat Selasa) sbg merah X "missed", padahal `streak/missing-dates` (sumber
// kebenaran grace window BE) cuma nunjuk 1 hari beneran outstanding.
function deriveDayState(bar: DayBar, isToday: boolean, firstSeenDate: string | null): DayState {
  if (isToday) return 'today';
  if (bar.isUpcoming) return 'upcoming';
  if (firstSeenDate && bar.date < firstSeenDate) return 'upcoming';
  if (!bar.hasEntry) return bar.isFrozen ? 'frozen' : 'missed';
  return bar.intake > bar.limit ? 'over' : 'logged';
}

export function Homepage() {
  const navigate = useNavigate();
  const metricPreference = useUnitStore((s) => s.metricPreference);
  const showToast = useToastStore((s) => s.showToast);
  const consumptionBumpedAt = useDataRefreshStore((s) => s.consumptionBumpedAt);
  const weightBumpedAt = useDataRefreshStore((s) => s.weightBumpedAt);
  const firstSeenAt = useAuthStore((s) => s.firstSeenAt);
  const firstSeenDate = firstSeenAt ? firstSeenAt.slice(0, 10) : null;

  const [loading, setLoading] = useState(true);
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimits>({});
  const [dailyRecord, setDailyRecord] = useState<DailyRecordResponse | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [weekDays, setWeekDays] = useState<{ label: string; state: DayState }[]>([]);
  const [loggedItems, setLoggedItems] = useState<LogDayEntry[]>([]);
  const [missingDates, setMissingDates] = useState<MissingDate[]>([]);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [updatingRecord, setUpdatingRecord] = useState(false);

  const loadAll = (cancelled: { current: boolean }) => {
    const today = todayLocalIso();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const weekNumber = getWeekNumberInMonth(now);
    const historyStart = new Date(now);
    historyStart.setDate(historyStart.getDate() - 90);

    // `GET /consumption/daily-record/{date}` DAN `GET /log/day` SAMA-SAMA "get or create" row
    // tdailyrecord hari ini secara independen (backend: ConsumptionService.GetOrCreateDailyRecord,
    // LogService.GetDay manggil fungsi yg sama) — kalau dipanggil PARALEL (Promise.all), race
    // condition: 2 request coba INSERT row yg sama bersamaan, salah satu kena unique-constraint
    // violation 500 (ketemu 2026-09-17, curl manual sendirian selalu 200, cuma muncul pas dipanggil
    // bareng endpoint lain). Fix: daily-record DIPANGGIL DULU sendirian (row-nya udah pasti dibuat
    // duluan), baru sisanya paralel setelahnya — TIDAK fix di backend (kemungkinan race yg sama
    // masih ada kalau ada 2 client beda manggil endpoint ini bersamaan, tapi itu skenario langka
    // dibanding 1 halaman yg sengaja manggil 2 endpoint sekaligus).
    apiClient
      .get(`/consumption/daily-record/${today}`)
      .then((recordRes) => {
        if (cancelled.current) return null;
        setDailyRecord(recordRes.data);
        return Promise.all([
          apiClient.get('/profile'),
          apiClient.get('/weightlog', { params: { startDate: toLocalIsoDate(historyStart), endDate: today } }),
          apiClient.get('/log/week', { params: { year, month, weekNumber } }),
          apiClient.get('/log/day', { params: { date: today } }),
          apiClient.get('/streak/missing-dates'),
        ]);
      })
      .then((results) => {
        if (cancelled.current || !results) return;
        const [profileRes, weightRes, weekRes, dayRes, missingRes] = results;
        setCategoryLimits(profileRes.data.categoryLimits);

        const history: WeightHistoryItem[] = weightRes.data;
        if (history.length > 0) {
          const latest = [...history].sort((a, b) => a.loggedDate.localeCompare(b.loggedDate)).at(-1)!;
          setCurrentWeight(latest.weightValue);
        }

        const bars: DayBar[] = weekRes.data.dailyBars;
        setWeekDays(
          bars.map((bar, i) => ({
            label: DAY_LABELS[i] ?? '',
            state: deriveDayState(bar, bar.date === today, firstSeenDate),
          }))
        );

        setLoggedItems(dayRes.data.entries);
        setMissingDates(missingRes.data);
      })
      .catch(() => {
        // Request masih bisa reject SETELAH komponen unmount (mis. forced-logout krn token
        // expired mid-fetch, ProtectedRoute langsung lempar ke /splash) — promise chain yg
        // udah kepalang jalan tetap nyampe .catch(), tapi cancelled=true krn cleanup effect
        // udah kepanggil duluan. Guard ini nyegah toast nyasar nongol di halaman yg udah gak
        // aktif (BUG ke-15: 2 toast identik muncul barengan React StrictMode dev double-invoke
        // + token expired, ketauan 2026-09-18).
        if (cancelled.current) return;
        showToast('Failed to load homepage data', 'error');
      })
      .finally(() => {
        if (!cancelled.current) setLoading(false);
      });
  };

  // BottomNav (AppLayout, mount sekali di root) yg pegang modal Add Consumption/Log Weight —
  // Homepage gak pernah unmount pas modal itu dibuka/ditutup (Outlet sibling, bukan child),
  // jadi mount-once biasa gak akan pernah lihat entry baru. `consumptionBumpedAt`/`weightBumpedAt`
  // dari dataRefreshStore di-bump abis submit sukses di modal manapun, retrigger loadAll di sini.
  useEffect(() => {
    const cancelled = { current: false };
    loadAll(cancelled);
    return () => {
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consumptionBumpedAt, weightBumpedAt]);

  const handleUpdateRecord = async (changes: { calorieCategory?: string; paToday?: boolean }) => {
    if (updatingRecord) return;
    setUpdatingRecord(true);
    try {
      const res = await apiClient.patch(`/consumption/daily-record/${todayLocalIso()}`, changes);
      setDailyRecord(res.data);
    } catch {
      showToast('Failed to update — please try again', 'error');
    } finally {
      setUpdatingRecord(false);
    }
  };

  if (loading || !dailyRecord) {
    return <div className={styles.page} />;
  }

  const limit = dailyRecord.effectiveLimit;
  const consumed = dailyRecord.intakeSum;
  const remaining = limit - consumed;
  const overLimit = remaining < 0;
  const rawPercent = limit > 0 ? consumed / limit : 0;
  const percent = Math.min(rawPercent, 1);

  // 3 case: normal (<80%) / mendekati limit (80-99%) / over (>=100%)
  const ringColor = overLimit ? 'var(--color-warning)' : rawPercent >= 0.8 ? 'var(--color-caution)' : 'var(--color-primary)';
  const remainingColor = overLimit ? 'var(--color-warning)' : rawPercent >= 0.8 ? 'var(--color-caution)' : 'var(--color-success)';
  const remainingLabel = overLimit
    ? `${Math.abs(remaining).toLocaleString('en-US')} kcal over`
    : `${remaining.toLocaleString('en-US')} kcal left`;

  const oldestMissing = missingDates.find((m) => m.isLastDay);
  const missedBannerShow = missingDates.length > 0;
  const missedBannerTitle =
    missingDates.length === 1
      ? '1 day not logged'
      : `${missingDates.length} days not logged (${missingDates.map((m) => new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' })).join(', ')})`;
  const missedBannerSubtitle = oldestMissing
    ? `${new Date(oldestMissing.date).toLocaleDateString('en-US', { weekday: 'short' })} resets tonight`
    : '';

  return (
    <div className={styles.page}>
      {missedBannerShow && (
        <div className={`${styles.banner} ${styles.bannerMissed}`}>
          <div style={{ flex: 1 }}>
            <div className={styles.bannerTitle}>{missedBannerTitle}</div>
            <div className={styles.bannerSubtitle}>{missedBannerSubtitle}</div>
          </div>
          <button className={styles.fixButton} onClick={() => navigate('/backfill')}>Fix</button>
        </div>
      )}

      <div className={styles.ringWrapper}>
        <div className={styles.ring}>
          <svg width={200} height={200} viewBox="0 0 200 200" className={styles.ringSvg}>
            <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="#EDE7D9" strokeWidth={14} />
            <circle
              cx="100"
              cy="100"
              r={RING_RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - percent)}
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <div className={styles.ringLabels}>
            <span className={styles.ringConsumed}>{consumed.toLocaleString('en-US')}</span>
            <span className={styles.ringLimit}>/ {Math.round(limit).toLocaleString('en-US')} kcal</span>
            <span className={styles.ringRemaining} style={{ color: remainingColor }}>{remainingLabel}</span>
          </div>
        </div>
      </div>

      <div className={styles.categoryRow}>
        <button className={styles.categoryButton} onClick={() => setCategorySheetOpen(true)}>
          {dailyRecord.calorieCategory} · {Math.round(limit).toLocaleString('en-US')} kcal ▾
        </button>
      </div>

      <div className={styles.cardRow}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Current weight</span>
          <span className={styles.cardValue}>{currentWeight !== null ? formatWeight(currentWeight, metricPreference) : '–'}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Exercise today</span>
          <button
            className={styles.paToggle}
            style={{ background: dailyRecord.paToday ? 'var(--color-accent)' : '#DCD5C4' }}
            onClick={() => handleUpdateRecord({ paToday: !dailyRecord.paToday })}
            disabled={updatingRecord}
            aria-label="Toggle exercise today"
          >
            <div className={styles.paKnob} style={{ transform: dailyRecord.paToday ? 'translateX(20px)' : 'translateX(0)' }} />
          </button>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>This week</span>
        <button className={styles.linkButton} onClick={() => navigate('/monthly-review')}>See weekly review →</button>
      </div>
      <div className={styles.weekRow}>
        {weekDays.map((day) => {
          const style = DAY_STATE_STYLES[day.state];
          return (
            <div className={styles.weekDay} key={day.label}>
              <span className={styles.weekDayLabel}>{day.label}</span>
              <div
                className={styles.weekDayCircle}
                style={{
                  background: style.bg,
                  border: style.border,
                  boxShadow: dayStateBoxShadow(day.state),
                  color: style.iconColor,
                }}
              >
                {style.icon}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Logged today</span>
      </div>
      <div className={styles.loggedList}>
        {loggedItems.map((item) => (
          <div className={styles.loggedRow} key={item.entryPk}>
            <div className={styles.loggedName}>{item.foodName}</div>
            <span className={styles.loggedKcal}>{item.calories} kcal</span>
            <span className={styles.loggedTime}>
              {new Date(item.entryTimestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      <CategorySheet
        open={categorySheetOpen}
        activeLabel={dailyRecord.calorieCategory}
        categoryLimits={categoryLimits}
        onClose={() => setCategorySheetOpen(false)}
        onSelect={(label) => {
          setCategorySheetOpen(false);
          handleUpdateRecord({ calorieCategory: label });
        }}
      />
    </div>
  );
}
