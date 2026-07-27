import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Plus, BarChart2, TrendingUp, UtensilsCrossed, Scale, X } from 'lucide-react';
import styles from './BottomNav.module.css';

export function BottomNav() {
  const [fanOpen, setFanOpen] = useState(false);

  return (
    <nav className={styles.bottomNav}>
      {fanOpen && <div className={styles.scrim} onClick={() => setFanOpen(false)} />}

      <NavLink to="/homepage" className={({ isActive }) => (isActive ? styles.active : styles.item)} aria-label="Homepage">
        <Home size={20} strokeWidth={2} />
      </NavLink>
      <NavLink to="/monthly-review" className={({ isActive }) => (isActive ? styles.active : styles.item)} aria-label="Monthly Review">
        <Calendar size={20} strokeWidth={2} />
      </NavLink>

      <div className={styles.fabWrapper}>
        {fanOpen && (
          <>
            <button className={`${styles.bubble} ${styles.bubbleLeft}`} aria-label="Add Consumption">
              <UtensilsCrossed size={20} strokeWidth={2} />
              <span className={styles.bubbleLabel}>Add Consumption</span>
            </button>
            <button className={`${styles.bubble} ${styles.bubbleRight}`} aria-label="Log Weight">
              <Scale size={20} strokeWidth={2} />
              <span className={styles.bubbleLabel}>Log Weight</span>
            </button>
          </>
        )}
        <button className={styles.fab} onClick={() => setFanOpen((v) => !v)} aria-label={fanOpen ? 'Close' : 'Add'}>
          {fanOpen ? <X size={24} strokeWidth={2} /> : <Plus size={24} strokeWidth={2} />}
        </button>
      </div>

      <NavLink to="/log" className={({ isActive }) => (isActive ? styles.active : styles.item)} aria-label="Log">
        <BarChart2 size={20} strokeWidth={2} />
      </NavLink>
      <NavLink to="/progress" className={({ isActive }) => (isActive ? styles.active : styles.item)} aria-label="Progress Projection">
        <TrendingUp size={20} strokeWidth={2} />
      </NavLink>
    </nav>
  );
}
