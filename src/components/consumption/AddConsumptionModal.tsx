import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Pencil, X } from 'lucide-react';
import { DUMMY_FOOD_HISTORY, DUMMY_QUICK_ADD, MEAL_TYPES, type MealType } from '../../lib/dummyData';
import { DatePickerField } from '../pickers/DatePickerField';
import { TimePickerField } from '../pickers/TimePickerField';
import styles from './AddConsumptionModal.module.css';

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

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowIsoTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

export function AddConsumptionModal({ open, onClose, onSave, initialDate }: AddConsumptionModalProps) {
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [date, setDate] = useState(initialDate ?? todayIsoDate());
  const [time, setTime] = useState(nowIsoTime());
  const [draftName, setDraftName] = useState('');
  const [draftKcal, setDraftKcal] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showDiscard, setShowDiscard] = useState(false);

  const suggestions = useMemo(() => {
    const query = draftName.trim().toLowerCase();
    if (!showAutocomplete || query.length === 0) return [];
    return DUMMY_FOOD_HISTORY.filter((h) => h.name.toLowerCase().includes(query)).slice(0, 5);
  }, [draftName, showAutocomplete]);

  const hasDraft = draftName.trim().length > 0 || draftKcal.length > 0;
  const canAddDraft = draftName.trim().length > 0 && draftKcal.length > 0;

  const resetState = () => {
    setMealType('Breakfast');
    setDraftName('');
    setDraftKcal('');
    setShowAutocomplete(false);
    setSavedItems([]);
    setEditingIndex(null);
    setShowDiscard(false);
  };

  // Sync tanggal & waktu tiap kali modal dibuka — bukan cuma di mount pertama,
  // karena modal ini tetap ter-render (open toggle doang) dan initialDate bisa beda tiap dibuka (dari kartu backfill berbeda).
  useEffect(() => {
    if (open) {
      setDate(initialDate ?? todayIsoDate());
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

  const handleSelectSuggestion = (item: { name: string; kcal: number }) => {
    setDraftName(item.name);
    setDraftKcal(String(item.kcal));
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

  const handleQuickAdd = (item: { name: string; kcal: number }) => {
    setSavedItems((items) => [...items, { name: item.name, kcal: String(item.kcal) }]);
  };

  const totalKcal = savedItems.reduce((sum, r) => sum + (parseInt(r.kcal, 10) || 0), 0);
  const saveLabel =
    savedItems.length > 0
      ? `Submit (${savedItems.length} item${savedItems.length > 1 ? 's' : ''} · ${totalKcal.toLocaleString('en-US')} kcal)`
      : 'Submit';

  const handleSave = () => {
    if (savedItems.length === 0) return;
    onSave(savedItems);
    resetState();
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
              className={styles.mealTab}
              style={{
                boxShadow: meal === mealType ? 'var(--shadow-input-inset)' : 'var(--shadow-card)',
                color: meal === mealType ? 'var(--color-primary)' : 'var(--color-text-primary)',
              }}
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
                {suggestions.map((sug) => (
                  <button key={sug.name} className={styles.autocompleteItem} onClick={() => handleSelectSuggestion(sug)}>
                    {sug.name} · {sug.kcal} kcal
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
          <span className={styles.sectionLabel}>Recent items — everything you ate yesterday</span>
          <div className={styles.quickAddChips}>
            {DUMMY_QUICK_ADD.map((chip) => (
              <button key={chip.name} className={styles.chip} onClick={() => handleQuickAdd(chip)}>
                {chip.name} · {chip.kcal}
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
          onClick={handleSave}
          disabled={savedItems.length === 0}
        >
          {saveLabel}
        </button>
      </div>

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
