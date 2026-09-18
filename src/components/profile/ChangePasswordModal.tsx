import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../lib/authStore';
import { useToastStore } from '../../lib/toastStore';
import styles from './ChangePasswordModal.module.css';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  // Sukses ganti password SELALU invalidate sesi (PRD — sama pola Reset Password), jadi caller
  // HARUS treat ini sbg "user perlu login ulang", bukan sekadar tutup modal.
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
        maxLength={12}
        autoComplete="new-password"
      />
      <button type="button" className={styles.eyeButton} onClick={() => setVisible((v) => !v)} aria-label="Toggle visibility">
        {visible ? <Eye size={17} strokeWidth={2} color="var(--color-text-secondary)" /> : <EyeOff size={17} strokeWidth={2} color="var(--color-text-secondary)" />}
      </button>
    </div>
  );
}

export function ChangePasswordModal({ open, onClose, onSave }: ChangePasswordModalProps) {
  const showToast = useToastStore((s) => s.showToast);
  const logout = useAuthStore((s) => s.logout);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const reset = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (saving) return;
    if (next.length < 6 || next.length > 12) {
      showToast('New password must be 6–12 characters', 'error');
      return;
    }
    if (next !== confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/auth/change-password', { currentPassword: current, newPassword: next });
      reset();
      // Backend invalidate refresh token begitu password berhasil diganti — access token yg lagi
      // dipegang tetap jalan sampai natural expire, tapi lebih jelas & aman langsung logout+arahkan
      // Login sekarang drpd nunggu ke-reject diam-diam nanti.
      logout();
      showToast('Password changed — please log in again', 'success');
      onSave();
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      showToast(message ?? 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <span className={styles.title}>Change Password</span>
        <div className={styles.fields}>
          <PasswordField placeholder="Current password" value={current} onChange={setCurrent} />
          <PasswordField placeholder="New password" value={next} onChange={setNext} />
          <PasswordField placeholder="Confirm new password" value={confirm} onChange={setConfirm} />
        </div>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={handleClose} disabled={saving}>Cancel</button>
          <button className={styles.saveButton} onClick={handleSave} disabled={saving || !current || !next || !confirm}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
