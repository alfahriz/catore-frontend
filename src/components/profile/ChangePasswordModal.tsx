import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './ChangePasswordModal.module.css';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface PasswordFieldProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function PasswordField({ placeholder, value, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.fieldWrapper}>
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
      />
      <button type="button" className={styles.eyeButton} onClick={() => setVisible((v) => !v)} aria-label="Toggle visibility">
        {visible ? <EyeOff size={17} strokeWidth={2} color="var(--color-text-secondary)" /> : <Eye size={17} strokeWidth={2} color="var(--color-text-secondary)" />}
      </button>
    </div>
  );
}

export function ChangePasswordModal({ open, onClose, onSave }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  if (!open) return null;

  const handleSave = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    onSave();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <span className={styles.title}>Change Password</span>
        <div className={styles.fields}>
          <PasswordField placeholder="Current password" value={current} onChange={setCurrent} />
          <PasswordField placeholder="New password" value={next} onChange={setNext} />
          <PasswordField placeholder="Confirm new password" value={confirm} onChange={setConfirm} />
        </div>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button className={styles.saveButton} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
