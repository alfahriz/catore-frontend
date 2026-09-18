import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../lib/authStore';
import { useToastStore } from '../../lib/toastStore';
import { resolveAuthDestination } from '../../lib/resolveAuthDestination';
import styles from './Auth.module.css';

// PRD 4.0: error kredensial pakai pesan GENERIK ("Email atau password salah") — gak bedain email
// gak ketemu vs password salah, demi keamanan (gak bocorin akun terdaftar/tidak). Error network/server
// beda pesan. Semua error tampil sbg toast atas (Design Brief 12 + pola global app ini).
export function Login() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const showToast = useToastStore((s) => s.showToast);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      setTokens(res.data.accessToken, res.data.refreshToken);
      // Splash cuma buat cold-start app — Login sukses langsung ke tujuan asli (New User/Post-Wipe/
      // Existing) via fungsi shared yg sama dipakai Splash, TANPA numpang render Splash lagi.
      const destination = await resolveAuthDestination();
      if (destination.route === 'network-error') {
        showToast('Network error — please try again', 'error');
        return;
      }
      navigate(destination.route);
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 401) {
        showToast('Email atau password salah', 'error');
      } else {
        showToast('Network error — please try again', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <h1 className={styles.title}>Log in</h1>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Email</span>
          <input
            type="email"
            className={styles.fieldInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Password</span>
          <div className={styles.passwordWrapper}>
            <input
              type={passwordVisible ? 'text' : 'password'}
              className={styles.fieldInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" className={styles.eyeButton} onClick={() => setPasswordVisible((v) => !v)} aria-label="Toggle password visibility">
              {passwordVisible ? <Eye size={17} strokeWidth={2} color="var(--color-text-secondary)" /> : <EyeOff size={17} strokeWidth={2} color="var(--color-text-secondary)" />}
            </button>
          </div>
        </label>
      </div>

      <button className={styles.primaryButton} onClick={handleLogin} disabled={loading || !email || !password}>
        {loading ? 'Logging in…' : 'Login'}
      </button>

      <div className={styles.linkRow}>
        <Link to="/forgot-password" className={styles.link}>Forgot password?</Link>
        <Link to="/signup" className={styles.link}>Sign Up</Link>
      </div>
    </div>
  );
}
