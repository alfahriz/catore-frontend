import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.logoBar}>
        <span className={styles.logo}>Catore</span>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
