import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snowflake, TriangleAlert } from 'lucide-react';
import { DUMMY_BACKFILL_CARDS, type BackfillCardType } from '../lib/dummyData';
import { AddConsumptionModal } from '../components/consumption/AddConsumptionModal';
import { SubPageHeader } from '../components/layout/SubPageHeader';
import styles from './BackfillDetail.module.css';

const CARD_STYLE: Record<BackfillCardType, { background: string; border: string; boxShadow: string; statusColor: string }> = {
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

export function BackfillDetail() {
  const navigate = useNavigate();
  const [presetDate, setPresetDate] = useState<string | null>(null);

  return (
    <div className={styles.screen}>
      <SubPageHeader title="Catch up on missed days" onBack={() => navigate(-1)} />

      <div className={styles.page}>
        <div className={styles.list}>
          {DUMMY_BACKFILL_CARDS.map((card) => {
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
        onSave={() => setPresetDate(null)}
        initialDate={presetDate ?? undefined}
      />
    </div>
  );
}
