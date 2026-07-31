import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// PRD 4.1: data internal SELALU kg/cm — toggle metric preference cuma ganti tampilan (chart, tabel,
// entry lama ikut convert), gak pernah nyimpen angka lb/ft-in di data itu sendiri.
interface UnitState {
  metricPreference: 'kg' | 'lb';
  setMetricPreference: (pref: 'kg' | 'lb') => void;
  toggleMetricPreference: () => void;
}

export const useUnitStore = create<UnitState>()(
  persist(
    (set) => ({
      metricPreference: 'kg',
      setMetricPreference: (pref) => set({ metricPreference: pref }),
      toggleMetricPreference: () => set((s) => ({ metricPreference: s.metricPreference === 'kg' ? 'lb' : 'kg' })),
    }),
    { name: 'catore-unit' }
  )
);

const KG_TO_LB = 2.20462;

// Format angka weight (SELALU disimpan sbg kg) ke string tampilan sesuai preference aktif —
// "77.40 kg" atau "170.64 lb". Dipakai di semua tempat yg nampilin weight (Homepage, Log, Monthly
// Review, Profile) biar 1 sumber konversi, bukan hitung ulang di tiap komponen.
export function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'lb') return `${(kg * KG_TO_LB).toFixed(2)} lb`;
  return `${kg.toFixed(2)} kg`;
}

// Sama seperti formatWeight tapi tanpa suffix unit — dipakai kolom tabel yg unit-nya ada di header
// (mis. "Weight" bukan "Weight (kg)" per baris), sesuai konvensi kg-suffix distrip dari tabel Log.
export function formatWeightNumber(kg: number, unit: 'kg' | 'lb'): string {
  return unit === 'lb' ? (kg * KG_TO_LB).toFixed(2) : kg.toFixed(2);
}

// Convert angka kg mentah (bukan string) ke unit aktif, dibulatkan 2 desimal — dipakai saat weight
// perlu diolah lebih lanjut sbg number (chart tick, domain, dsb), bukan langsung ditampilkan sbg
// string. Beda dari formatWeightNumber yg return string siap-tampil.
export function kgToUnit(kg: number, unit: 'kg' | 'lb'): number {
  const converted = unit === 'lb' ? kg * KG_TO_LB : kg;
  return Math.round(converted * 100) / 100;
}
