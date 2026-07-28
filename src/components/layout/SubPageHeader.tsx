import { ArrowLeft } from 'lucide-react';
import styles from './SubPageHeader.module.css';

interface SubPageHeaderProps {
  title: string;
  onBack: () => void;
}

export function SubPageHeader({ title, onBack }: SubPageHeaderProps) {
  return (
    <div className={styles.header}>
      <button className={styles.backButton} onClick={onBack} aria-label="Back">
        <ArrowLeft size={22} strokeWidth={2.2} />
      </button>
      <span className={styles.title}>{title}</span>
    </div>
  );
}
