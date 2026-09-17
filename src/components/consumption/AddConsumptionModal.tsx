import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, X } from 'lucide-react';
import { MEAL_TYPES, type MealType } from '../../lib/dummyData';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../lib/toastStore';
import { useDataRefreshStore } from '../../lib/dataRefreshStore';
import { todayLocalIso } from '../../lib/dateUtils';
import { DatePickerField } from '../pickers/DatePickerField';
import { TimePickerField } from '../pickers/TimePickerField';
import { SubmitConfirmModal } from './SubmitConfirmModal';
import styles from './AddConsumptionModal.module.css';

interface AutocompleteItem {
  foodName: string;
  calories: number;
}

interface QuickAddItem {
  foodName: string;
  calories: number;
  mealType: string;
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

interface SavedItem {
  name: string;
  kcal: string;
}

interface AddConsumptionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (items: SavedItem[]) => void;
  initialDate?: string; // ISO date, dipakai saat dibuka dari kartu backfill (tanggal ter-preset)
}

function nowIsoTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

export function AddConsumptionModal({ open, onClose, onSave, initialDate }: AddConsumptionModalProps) {
  const showToast = useToastStore((s) => s.showToast);
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [date, setDate] = useState(initialDate ?? todayLocalIso());
  const [time, setTime] = useState(nowIsoTime());
  const [draftName, setDraftName] = useState('');
  const [draftKcal, setDraftKcal] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [quickAddItems, setQuickAddItems] = useState<QuickAddItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showDiscard, setShowDiscard] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasDraft = draftName.trim().length > 0 || draftKcal.length > 0;
  const canAddDraft = draftName.trim().length > 0 && draftKcal.length > 0;

  const resetState = () => {
    setMealType('Breakfast');
    setDraftName('');
    setDraftKcal('');
    setShowAutocomplete(false);
    setSuggestions([]);
    setSavedItems([]);
    setEditingIndex(null);
    setShowDiscard(false);
    setShowSubmitConfirm(false);
  };

  // Autotext berbasis histori (PRD 4.3) — search ke SELURUH histori consumptionentry milik user
  // (BEDA dari quick-add yg cuma "kemarin"), debounce 250ms biar gak spam request tiap keystroke.
  useEffect(() => {
    const query = draftName.trim();
    if (!showAutocomplete || query.length === 0) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      apiClient
        .get<AutocompleteItem[]>('/consumption/autocomplete', { params: { query, page: 0, pageSize: 5 } })
        .then((res) => setSuggestions(res.data))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [draftName, showAutocomplete]);

  // Quick-add chips (PRD 4.3: "Recent items — everything you ate yesterday") — fetch sekali tiap
  // modal dibuka, gak perlu re-fetch tiap keystroke (beda dari autocomplete).
  useEffect(() => {
    if (!open) return;
    apiClient
      .get<QuickAddItem[]>('/consumption/quick-add')
      .then((res) => setQuickAddItems(res.data))
      .catch(() => setQuickAddItems([]));
  }, [open]);

  // Sync tanggal & waktu tiap kali modal dibuka — bukan cuma di mount pertama,
  // karena modal ini tetap ter-render (open toggle doang) dan initialDate bisa beda tiap dibuka (dari kartu backfill berbeda).
  useEffect(() => {
    if (open) {
      setDate(initialDate ?? todayLocalIso());
      setTime(nowIsoTime());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialDate]);

  const handleBack = () => {
    if (hasDraft || savedItems.length > 0) {
      setShowDiscard(true);
      return;
    }
    resetState();
    onClose();
  };

  const handleDiscard = () => {
    resetState();
    onClose();
  };

  const handleAddDraftRow = () => {
    if (!canAddDraft) return;
    setSavedItems((items) => [...items, { name: draftName.trim(), kcal: draftKcal }]);
    setDraftName('');
    setDraftKcal('');
    setShowAutocomplete(false);
  };

  const handleSelectSuggestion = (item: AutocompleteItem) => {
    setDraftName(item.foodName);
    setDraftKcal(String(item.calories));
    setShowAutocomplete(false);
  };

  const handleEditRow = (index: number) => {
    if (hasDraft) return;
    const row = savedItems[index];
    setDraftName(row.name);
    setDraftKcal(row.kcal);
    setEditingIndex(index);
    setSavedItems((items) => items.filter((_, i) => i !== index));
  };

  const handleRemoveRow = (index: number) => {
    setSavedItems((items) => items.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  // PRD 4.3: tap chip quick-add CUMA ngisi form draft (nama+kalori) — BUKAN langsung commit ke
  // list, beda dari implementasi dummy lama yg langsung push ke savedItems. User tetap harus tap
  // "+" manual. "Kalau form draft sudah terisi dan user tap chip lain, isi draft LANGSUNG tertimpa"
  // — makanya gak ada guard `if (hasDraft) return` di sini (beda dari aturan pensil/edit row).
  const handleQuickAdd = (item: QuickAddItem) => {
    setDraftName(item.foodName);
    setDraftKcal(String(item.calories));
    setShowAutocomplete(false);
  };

  const totalKcal = savedItems.reduce((sum, r) => sum + (parseInt(r.kcal, 10) || 0), 0);
  const saveLabel =
    savedItems.length > 0
      ? `Submit (${savedItems.length} item${savedItems.length > 1 ? 's' : ''} · ${totalKcal.toLocaleString('en-US')} kcal)`
      : 'Submit';

  // Submit gak langsung nyimpen — buka ringkasan konfirmasi dulu (meal type/tanggal/waktu di-highlight),
  // karena salah pencet tab meal (mis. niatnya Breakfast kepencet Lunch) gak kelihatan sampai user cek log lagi.
  const handleSubmitClick = () => {
    if (savedItems.length === 0) return;
    setShowSubmitConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // EntryTimestamp digabung dari date+time field (2 input terpisah di UI, 1 field DateTime
      // di backend, AddEntriesRequestDto) — kolom DB `timestamptz`, Npgsql NOLAK DateTime
      // Kind=Unspecified (string tanpa suffix Z/offset) dgn ArgumentException 500 (ketemu pas
      // testing submit beneran, bukan cuma baca kode). Backend SENDIRI gak convert timezone field
      // ini (grouping "hari" di ConsumptionRepository pakai `entryTimestamp AT TIME ZONE 'UTC'`,
      // asumsi timestamp yg disimpan = representasi hari yg user maksud) — jadi kirim `Z` suffix
      // (treated as UTC), BUKAN konversi timezone asli user ke UTC (konsisten sama simplifikasi
      // yg backend udah pakai duluan, bukan nambah lapisan konversi baru yg malah bisa geser
      // tanggal kalau ada timezone offset).
      await apiClient.post('/consumption/entries', {
        mealType,
        entryTimestamp: `${date}T${time}:00Z`,
        items: savedItems.map((item) => ({ foodName: item.name, calories: parseInt(item.kcal, 10) || 0 })),
      });
      useDataRefreshStore.getState().bumpConsumption();
      onSave(savedItems);
      resetState();
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      showToast(message ?? 'Network error — please try again', 'error');
      setShowSubmitConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack} aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <span className={styles.title}>Add Consumption</span>
      </div>

      <div className={styles.body}>
        <div className={styles.mealTabs}>
          {MEAL_TYPES.map((meal) => (
            <button
              key={meal}
              className={`${styles.mealTab} ${meal === mealType ? styles.mealTabActive : ''}`}
              onClick={() => setMealType(meal)}
            >
              {meal}
            </button>
          ))}
        </div>

        <div className={styles.dateTimeRow}>
          <DatePickerField value={date} onChange={setDate} />
          <TimePickerField value={time} onChange={setTime} />
        </div>

        <div className={styles.draftSection}>
          <span className={styles.sectionLabel}>What did you eat?</span>
          <div className={styles.draftCard}>
            <div className={styles.draftRow}>
              <input
                className={styles.draftNameInput}
                value={draftName}
                onChange={(e) => {
                  setDraftName(e.target.value);
                  setShowAutocomplete(true);
                }}
                placeholder="e.g. Nasi goreng"
              />
              <input
                className={styles.draftKcalInput}
                value={draftKcal}
                onChange={(e) => setDraftKcal(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="300"
              />
            </div>

            {suggestions.length > 0 && (
              <div className={styles.autocomplete}>
                {suggestions.map((sug, i) => (
                  <button key={`${sug.foodName}-${sug.calories}-${i}`} className={styles.autocompleteItem} onClick={() => handleSelectSuggestion(sug)}>
                    {sug.foodName} · {sug.calories} kcal
                  </button>
                ))}
              </div>
            )}

            <button
              className={styles.addItemButton}
              style={{
                background: canAddDraft ? 'var(--color-primary)' : 'var(--color-surface-input)',
                color: canAddDraft ? 'var(--color-text-inverse)' : '#9C9587',
              }}
              onClick={handleAddDraftRow}
              disabled={!canAddDraft}
            >
              ＋ Add item
            </button>
          </div>
        </div>

        <div className={styles.quickAddSection}>
          <span className={styles.sectionLabel}>What you ate yesterday</span>
          <div className={styles.quickAddChips}>
            {quickAddItems.map((chip, i) => (
              <button key={`${chip.foodName}-${i}`} className={styles.chip} onClick={() => handleQuickAdd(chip)}>
                {chip.foodName} · {chip.calories}
              </button>
            ))}
          </div>
        </div>

        {savedItems.length > 0 && (
          <div className={styles.itemsSection}>
            <span className={styles.sectionLabel}>Items</span>
            <div className={styles.itemsList}>
              {savedItems.map((row, i) => (
                <div className={styles.itemRow} key={i}>
                  <div className={styles.itemName}>{row.name}</div>
                  <span className={styles.itemKcal}>{row.kcal} kcal</span>
                  <button
                    className={styles.itemAction}
                    style={{ opacity: hasDraft ? 0.35 : 1, pointerEvents: hasDraft ? 'none' : 'auto' }}
                    onClick={() => handleEditRow(i)}
                    aria-label="Edit item"
                  >
                    <Pencil size={16} strokeWidth={2} />
                  </button>
                  <button className={styles.itemAction} onClick={() => handleRemoveRow(i)} aria-label="Remove item">
                    <X size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.saveButton}
          style={{ opacity: savedItems.length === 0 ? 0.5 : 1 }}
          onClick={handleSubmitClick}
          disabled={savedItems.length === 0}
        >
          {saveLabel}
        </button>
      </div>

      <SubmitConfirmModal
        open={showSubmitConfirm}
        mealType={mealType}
        dateLabel={formatDateLabel(date)}
        timeLabel={formatTimeLabel(time)}
        items={savedItems}
        totalKcal={totalKcal}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSubmitConfirm(false)}
      />

      {showDiscard && (
        <div className={styles.discardOverlay} onClick={() => setShowDiscard(false)}>
          <div className={styles.discardCard} onClick={(e) => e.stopPropagation()}>
            <span className={styles.discardTitle}>Discard unsaved entries?</span>
            <p className={styles.discardBody}>Your draft and any unsaved items in this batch will be lost.</p>
            <div className={styles.discardActions}>
              <button className={styles.discardButton} onClick={handleDiscard}>Discard</button>
              <button className={styles.keepEditingButton} onClick={() => setShowDiscard(false)}>Keep editing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
