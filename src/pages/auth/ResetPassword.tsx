import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../lib/toastStore';
import styles from './Auth.module.css';

// Web fallback utk deep link backend (`catore://reset-password?token=...`, EmailService.cs) — sama
// pola VerifyEmail.tsx, dipakai testing manual browser. PRD: sesi aktif di-invalidate begitu reset
// berhasil (BE-side), user diarahkan Login manual — TIDAK ada auto-login pasca-reset.
export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = token !== null && newPassword.length >= 6 && newPassword.length <= 12 && newPassword === confirmPassword;

  const handleSubmit = async () => {
    if (loading || !canSubmit) return;
    if (newPassword.length < 6 || newPassword.length > 12) {
      showToast('Password must be 6–12 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { resetToken: token, newPassword });
      showToast('Password reset — please log in', 'success');
      navigate('/login');
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      showToast(message ?? 'Network error — please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.authPage}>
        <h1 className={styles.title}>Invalid link</h1>
        <p className={styles.hint}>This reset link is missing its token. Request a new one from the Forgot Password page.</p>
        <Link to="/forgot-password" className={styles.linkCenter}>Back to Forgot Password</Link>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <h1 className={styles.title}>Set new password</h1>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>New password</span>
          <input
            type="password"
            className={styles.fieldInput}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            maxLength={12}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Confirm new password</span>
          <input
            type="password"
            className={styles.fieldInput}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            maxLength={12}
          />
        </label>
      </div>

      <button className={styles.primaryButton} onClick={handleSubmit} disabled={loading || !canSubmit}>
        {loading ? 'Saving…' : 'Reset password'}
      </button>
    </div>
  );
}
