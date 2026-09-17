import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snowflake, TriangleAlert } from 'lucide-react';
import { apiClient } from '../api/client';
import { useToastStore } from '../lib/toastStore';
import { todayLocalIso } from '../lib/dateUtils';
import { AddConsumptionModal } from '../components/consumption/AddConsumptionModal';
import { SubPageHeader } from '../components/layout/SubPageHeader';
import styles from './BackfillDetail.module.css';

type CardType = 'missing-last' | 'missing' | 'today' | 'frozen';

interface BackfillCard {
  isoDate: string;
  type: CardType;
  dateLabel: string;
  statusLabel: string;
}

const CARD_STYLE: Record<CardType, { background: string; border: string; boxShadow: string; statusColor: string }> = {
  'missing-last': {
    background: 'oklch(60% 0.18 30 / 0.07)',
    border: '1.5px solid oklch(70% 0.14 30)',
    boxShadow: 'var(--shadow-card)',
    statusColor: 'var(--color-warning)',
  },
  missing: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-card)',
    statusColor: 'var(--color-text-secondary)',
  },
  today: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-card)',
    statusColor: 'var(--color-text-secondary)',
  },
  frozen: {
    background: 'oklch(93% 0.02 220 / 0.5)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-input-inset)',
    statusColor: 'oklch(42% 0.09 235)',
  },
};

interface MissingDateApi {
  date: string;
  isLastDay: boolean;
  daysLeft: number;
}

function formatDateLabel(iso: string, suffix?: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return suffix ? `${label} · ${suffix}` : label;
}

export function BackfillDetail() {
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const [presetDate, setPresetDate] = useState<string | null>(null);
  const [cards, setCards] = useState<BackfillCard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCards = () => {
    const today = todayLocalIso();
    Promise.all([
      apiClient.get<MissingDateApi[]>('/streak/missing-dates'),
      apiClient.get<string[]>('/streak/frozen-days'),
      apiClient.get<{ intakeSum: number }>(`/consumption/daily-record/${today}`),
    ])
      .then(([missingRes, frozenRes, todayRecordRes]) => {
        const missingDates = missingRes.data;
        const frozenDays = frozenRes.data;
        const todayIsMissing = missingDates.some((m) => m.date === today);
        // Card "today" statusnya HARUS reflect kondisi asli (bukan hardcode "Not logged yet") —
        // ketemu bug pas testing submit beneran: abis submit entry hari ini, card ini gak pernah
        // berubah statusnya walau `loadCards()` di-refresh, krn label-nya statis sebelumnya.
        const todayHasEntry = todayRecordRes.data.intakeSum > 0;

        // PRD 5.1: urutan kartu — grace-active (tertua/"Last day" dulu) -> hari ini (kalau blm ada
        // di daftar missing di atas, krn hari ini blm pernah kena deadline) -> Frozen (opsional,
        // gak bawa tekanan deadline, ditaruh paling akhir).
        const missingCards: BackfillCard[] = missingDates.map((m) => ({
          isoDate: m.date,
          type: m.isLastDay ? 'missing-last' : 'missing',
          dateLabel: formatDateLabel(m.date),
          statusLabel: m.isLastDay ? 'Last day, resets tonight' : `${m.daysLeft} day${m.daysLeft === 1 ? '' : 's'} left`,
        }));

        const todayCard: BackfillCard[] = todayIsMissing
          ? []
          : [{
              isoDate: today,
              type: 'today',
              dateLabel: formatDateLabel(today, 'Today'),
              statusLabel: todayHasEntry ? 'Logged' : 'Not logged yet',
            }];

        const frozenCards: BackfillCard[] = frozenDays.map((date) => ({
          isoDate: date,
          type: 'frozen',
          dateLabel: formatDateLabel(date),
          statusLabel: 'Frozen — no deadline, but please submit the data',
        }));

        setCards([...missingCards, ...todayCard, ...frozenCards]);
      })
      .catch(() => {
        showToast('Failed to load backfill data', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.screen}>
      <SubPageHeader title="Catch up on missed days" onBack={() => navigate(-1)} />

      <div className={styles.page}>
        <div className={styles.list}>
          {!loading &&
            cards.map((card) => {
              const style = CARD_STYLE[card.type];
              return (
                <button
                  key={card.isoDate}
                  className={styles.card}
                  style={{ background: style.background, border: style.border, boxShadow: style.boxShadow }}
                  onClick={() => setPresetDate(card.isoDate)}
                >
                  <div className={styles.cardDate}>
                    {card.type === 'missing-last' && <TriangleAlert size={14} strokeWidth={2} color="var(--color-warning)" />}
                    {card.type === 'frozen' && <Snowflake size={14} strokeWidth={2} color="oklch(42% 0.09 235)" />}
                    {card.dateLabel}
                  </div>
                  <div className={styles.cardStatus} style={{ color: style.statusColor }}>
                    {card.statusLabel}
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      <AddConsumptionModal
        open={presetDate !== null}
        onClose={() => setPresetDate(null)}
        onSave={() => {
          setPresetDate(null);
          loadCards();
        }}
        initialDate={presetDate ?? undefined}
      />
    </div>
  );
}
