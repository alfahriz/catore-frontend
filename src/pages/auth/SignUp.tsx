import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../lib/toastStore';
import styles from './Auth.module.css';

// KOREKSI dari PRD literal (PRD Section Auth bilang "tidak ada verifikasi email" — TERNYATA
// outdated, kode backend AuthService.cs MASIH implement gate verifikasi email penuh: signup kirim
// email verifikasi, Login ditolak sebelum IsEmailVerif=true. Keputusan eksplisit 2026-09-16: kode
// BE yang jadi acuan, bukan PRD di titik ini. Jadi alur SEKARANG: signup sukses -> halaman "check
// your email" (BUKAN langsung Onboarding) -> user klik link verifikasi (deep link/web fallback,
// lihat route /verify-email) -> baru bisa Login -> lanjut Onboarding dari situ.
// Password min 6 karakter, divalidasi jg di sini biar user dapat feedback instan (BE tetap validasi ulang).
// Halaman "check your email" pasca-signup sukses — bukan komponen terpisah/route sendiri (state
// lokal SignUp, ganti tampilan in-place) krn cuma relevan sbg hasil langsung dari submit form ini.
function CheckEmailNotice({ email }: { email: string }) {
  const showToast = useToastStore((s) => s.showToast);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    try {
      const res = await apiClient.post('/auth/resend-verification', { email });
      setCooldown(res.data.cooldownSecondsRemaining ?? 60);
      showToast('Verification email sent', 'success');
    } catch {
      showToast('Network error — please try again', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <h1 className={styles.title}>Check your email</h1>
      <p className={styles.hint}>
        We sent a verification link to <strong>{email}</strong>. Open it to activate your account, then come back and log in.
      </p>
      <button className={styles.secondaryButton} onClick={handleResend} disabled={resending || cooldown > 0}>
        {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend email'}
      </button>
      <Link to="/login" className={styles.linkCenter}>Back to Login</Link>
    </div>
  );
}

// KOREKSI dari PRD literal (PRD Section Auth bilang "tidak ada verifikasi email" — TERNYATA
// outdated, kode backend AuthService.cs MASIH implement gate verifikasi email penuh: signup kirim
// email verifikasi, Login ditolak sebelum IsEmailVerif=true. Keputusan eksplisit 2026-09-16: kode
// BE yang jadi acuan, bukan PRD di titik ini. Jadi alur SEKARANG: signup sukses -> halaman "check
// your email" (BUKAN langsung Onboarding) -> user klik link verifikasi (deep link/web fallback,
// lihat route /verify-email) -> baru bisa Login -> lanjut Onboarding dari situ.
// Password min 6 karakter, divalidasi jg di sini biar user dapat feedback instan (BE tetap validasi ulang).
export function SignUp() {
  const showToast = useToastStore((s) => s.showToast);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null);

  const canSubmit = email.trim() !== '' && password.length >= 6 && password === confirmPassword;

  const handleSignUp = async () => {
    if (loading) return;
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/signup', { email, password, confirmPassword });
      setSignedUpEmail(email);
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      showToast(message ?? 'Network error — please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (signedUpEmail) {
    return <CheckEmailNotice email={signedUpEmail} />;
  }

  return (
    <div className={styles.authPage}>
      <h1 className={styles.title}>Sign Up</h1>

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
              autoComplete="new-password"
            />
            <button type="button" className={styles.eyeButton} onClick={() => setPasswordVisible((v) => !v)} aria-label="Toggle password visibility">
              {passwordVisible ? <EyeOff size={17} strokeWidth={2} color="var(--color-text-secondary)" /> : <Eye size={17} strokeWidth={2} color="var(--color-text-secondary)" />}
            </button>
          </div>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Confirm Password</span>
          <input
            type={passwordVisible ? 'text' : 'password'}
            className={styles.fieldInput}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
      </div>

      <button className={styles.primaryButton} onClick={handleSignUp} disabled={loading || !canSubmit}>
        {loading ? 'Signing up…' : 'Sign Up'}
      </button>

      <Link to="/login" className={styles.linkCenter}>Already have an account? Log in</Link>
    </div>
  );
}
