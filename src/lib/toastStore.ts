import { create } from 'zustand';

// PRD 4.0: semua error (network/auth/validasi) tampil sbg toast di atas layar — pola GLOBAL 1
// konsisten di SELURUH app, bukan per-halaman. Kalau beberapa error muncul hampir bersamaan, toast
// STACK berurutan turun ke bawah (bukan saling menimpa/cuma nampilin 1 toast terakhir) — makanya
// state-nya array, bukan single value.
export type ToastVariant = 'error' | 'success' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  showToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: (id: number) => void;
}

let nextId = 1;
const AUTO_DISMISS_MS = 4000;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  showToast: (message, variant = 'error') => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => get().dismissToast(id), AUTO_DISMISS_MS);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
