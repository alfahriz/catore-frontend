import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../lib/toastStore';
import styles from './Auth.module.css';

// PRD: BE selalu return Ok terlepas email ketemu/gak (hindari account enumeration) — FE HARUS
// tampilkan pesan sukses generik yg sama utk kedua kasus, JANGAN bedakan feedback "email gak
// ketemu" vs "email terkirim" (itu bakal balik jadi celah enumeration di sisi FE).
export function ForgotPassword() {
  const showToast = useToastStore((s) => s.showToast);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (loading || !email.trim()) return;
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch {
      showToast('Network error — please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.authPage}>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.hint}>
          If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
        </p>
        <Link to="/login" className={styles.linkCenter}>Back to Login</Link>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <h1 className={styles.title}>Forgot password?</h1>
      <p className={styles.hint}>Enter your email and we'll send you a link to reset your password.</p>

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
      </div>

      <button className={styles.primaryButton} onClick={handleSubmit} disabled={loading || !email.trim()}>
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <Link to="/login" className={styles.linkCenter}>Back to Login</Link>
    </div>
  );
}
