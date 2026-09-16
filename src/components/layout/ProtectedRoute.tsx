import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../lib/authStore';

// Guard SEBELUMNYA gak ada sama sekali — semua path AppLayout (/homepage, /profile, dst) bisa
// diakses langsung tanpa token apa pun (ketauan pas mulai migrasi Auth 2026-09-16, semua page lain
// masih 100% dummy jadi gap ini gak pernah kelihatan). Redirect ke /splash (bukan langsung /login)
// biar auth-check dijalanin ulang (token might still be valid di localStorage tapi state React
// belum sempat baca, atau justru expired — Splash yg nentuin ke mana selanjutnya).
export function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) {
    return <Navigate to="/splash" replace />;
  }
  return <Outlet />;
}
