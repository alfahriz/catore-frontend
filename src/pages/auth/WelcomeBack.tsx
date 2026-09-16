import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';

// PRD 4.0: state "Post-Wipe User" — Profile TETAP ADA (satu-satunya yg selamat dari wipe), jadi
// gak perlu isi ulang height/weight/age/gender dari nol. 2 pilihan: "Set today's plan" (langsung ke
// Gateway check-in step 3 Onboarding, skip step 1-2) atau "Update profile first" (buka Profile,
// otomatis lanjut ke check-in setelah selesai — TIDAK berhenti di Profile begitu saja, PRD eksplisit).
export function WelcomeBack() {
  const navigate = useNavigate();

  return (
    <div className={styles.authPage}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.hint}>
        Your account was reset after a period of inactivity, but your profile is safe. Ready to start fresh?
      </p>

      <button className={styles.primaryButton} onClick={() => navigate('/onboarding?step=3')}>
        Set today's plan
      </button>
      <button className={styles.secondaryButton} onClick={() => navigate('/profile?postWipe=true')}>
        Update profile first
      </button>
    </div>
  );
}
