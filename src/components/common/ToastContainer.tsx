import { useToastStore } from '../../lib/toastStore';
import styles from './ToastContainer.module.css';

// Dipasang SEKALI di root App (App.tsx) — global, gak perlu diimport per-halaman. Toast baru
// nambah ke BAWAH stack existing (PRD 4.0: "toast stack berurutan turun ke bawah").
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.stack}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.variant]}`} onClick={() => dismissToast(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
