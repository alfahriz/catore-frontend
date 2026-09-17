import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  // Timestamp login SUKSES PERTAMA di device ini (bukan signupDate akun sebenarnya — approximation,
  // krn backend gak expose account.createdOn ke FE). Dipakai Homepage buat exclude tanggal SEBELUM
  // ini dari week-bar 6-state (biar gak keliru dianggap "missed" — akun/device blm exist di tanggal
  // itu). Di-set SEKALI, gak pernah diupdate lagi di login berikutnya (kalau udah ada nilainya).
  firstSeenAt: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      firstSeenAt: null,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, firstSeenAt: get().firstSeenAt ?? new Date().toISOString() }),
      logout: () => set({ accessToken: null, refreshToken: null }),
    }),
    { name: 'catore-auth' }
  )
);
