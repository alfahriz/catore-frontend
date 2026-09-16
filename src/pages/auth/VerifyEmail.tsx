import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import styles from './Auth.module.css';

// Web fallback utk deep link backend (`catore://verify-email?token=...`, EmailService.cs) — di
// Android asli, App Links (assetlinks.json + intent filter) yg nangkep link ini LANGSUNG ke app;
// route ini murni buat testing manual via browser (npm run dev), TIDAK menggantikan deep link asli.
type Status = 'verifying' | 'success' | 'error';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('verifying');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    apiClient
      .post('/auth/verify-email', { verifyToken: token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className={styles.authPage}>
      {status === 'verifying' && <h1 className={styles.title}>Verifying…</h1>}
      {status === 'success' && (
        <>
          <h1 className={styles.title}>Email verified</h1>
          <p className={styles.hint}>Your account is now active. You can log in.</p>
          <Link to="/login" className={styles.linkCenter}>Go to Login</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className={styles.title}>Verification failed</h1>
          <p className={styles.hint}>This link is invalid or has expired. Try signing up again to get a new link.</p>
          <Link to="/login" className={styles.linkCenter}>Back to Login</Link>
        </>
      )}
    </div>
  );
}
