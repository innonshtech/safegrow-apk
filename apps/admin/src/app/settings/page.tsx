import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import styles from './page.module.css';
import { getCurrentAdmin } from '../../lib/auth';
import { updatePasswordAction } from './actions';

export default async function SettingsPage() {
  const admin = await getCurrentAdmin();
  
  if (!admin) {
    return (
      <AdminLayout>
        <div className={styles.container}>Please log in to view settings.</div>
      </AdminLayout>
    );
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>Settings</h1>
        
        <div className={styles.profileSection}>
          <div className={styles.avatarLarge}>{getInitials(admin.name)}</div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>{admin.name}</div>
            <div className={styles.profileMeta}>
              {admin.email || admin.userId} • {admin.role === 'ADMIN' ? 'Admin' : admin.role === 'MANAGER' ? 'Manager' : 'Rep'}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Change password</h2>
          <p className={styles.cardDesc}>Use at least 8 characters with a mix of letters and numbers.</p>
          
          <form className={styles.form} action={updatePasswordAction as any}>
            <div className={styles.inputGroup}>
              <label className="label">Current password</label>
              <div className={styles.inputWrapper}>
                <input type="password" name="currentPassword" className="input" placeholder="••••••••••" required />
                <svg className={styles.eyeIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label className="label">New password</label>
              <div className={styles.inputWrapper}>
                <input type="password" name="newPassword" className="input" placeholder="••••••••••" required />
                <svg className={styles.eyeIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label className="label">Confirm new password</label>
              <div className={styles.inputWrapper}>
                <input type="password" name="confirmPassword" className="input" placeholder="••••••••••" required />
                <svg className={styles.eyeIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: 'fit-content' }}>
              Update password
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
