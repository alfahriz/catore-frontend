import { create } from 'zustand';

// BottomNav (AppLayout) mount SEKALI di root, jadi modal Add Consumption/Log Weight yg dia-punya
// TIDAK pernah unmount pas dibuka/ditutup dari halaman manapun (Outlet sibling, bukan child
// Homepage) — Homepage/halaman lain gak ada cara tau kapan submit sukses via lifecycle biasa
// (mount-once useEffect). Store ini murni SIGNAL counter: dibump abis POST/PATCH sukses,
// halaman yg peduli tinggal taruh `bumpedAt` di dependency useEffect buat re-fetch.
interface DataRefreshState {
  consumptionBumpedAt: number;
  weightBumpedAt: number;
  bumpConsumption: () => void;
  bumpWeight: () => void;
}

export const useDataRefreshStore = create<DataRefreshState>()((set) => ({
  consumptionBumpedAt: 0,
  weightBumpedAt: 0,
  bumpConsumption: () => set({ consumptionBumpedAt: Date.now() }),
  bumpWeight: () => set({ weightBumpedAt: Date.now() }),
}));
