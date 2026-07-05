"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';
import styles from './page.module.css';
import { createEmployeeAction, getManagersAction, recreatePasswordAction } from './actions';

export default function AddEmployeePage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [role, setRole] = useState<'Manager' | 'Representative'>('Representative');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [managers, setManagers] = useState<{id: string, name: string}[]>([]);

  React.useEffect(() => {
    getManagersAction().then(res => {
      if (res.success && res.managers) {
        setManagers(res.managers);
      }
    });
  }, []);

  // Generate User ID and Password automatically from name
  const handleNameChange = (val: string) => {
    setName(val);
    const parts = val.trim().split(/\s+/);
    const firstName = parts[0] ? parts[0].toLowerCase() : '';
    setTempPassword(firstName ? `${firstName}123` : '');
    
    const suggestedId = val.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    setUserId(suggestedId);
  };

  const handleAction = async (formData: FormData) => {
    setErrorMsg('');
    setIsPending(true);
    
    // Append manually controlled state
    formData.append('role', role === 'Manager' ? 'MANAGER' : 'REP');
    formData.append('tempPassword', tempPassword);
    
    const res = await createEmployeeAction(formData);
    
    setIsPending(false);
    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.success) {
      setIsSuccess(true);
    }
  };

  const handleAddAnother = () => {
    setIsSuccess(false);
    setName('');
    setUserId('');
    setEmail('');
    setTempPassword('');
  };

  const handleRecreatePassword = async () => {
    const res = await recreatePasswordAction(userId);
    if (res.success && res.newPassword) {
      setTempPassword(res.newPassword);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/employees" className={styles.backBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className={styles.title}>Add employee</h1>
        </div>

        <div className={styles.content}>
          {!isSuccess ? (
            <form className={styles.form} action={handleAction}>
              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Role</h3>
                <div className={styles.roleGrid}>
                  <div 
                    className={`${styles.roleCard} ${role === 'Manager' ? styles.activeRole : ''}`}
                    onClick={() => setRole('Manager')}
                  >
                    <div className={styles.roleIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div className={styles.roleInfo}>
                      <span className={styles.roleName}>Manager</span>
                      <span className={styles.roleDesc}>Field + sees a team</span>
                    </div>
                  </div>
                  <div 
                    className={`${styles.roleCard} ${role === 'Representative' ? styles.activeRole : ''}`}
                    onClick={() => setRole('Representative')}
                  >
                    <div className={styles.roleIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div className={styles.roleInfo}>
                      <span className={styles.roleName}>Representative</span>
                      <span className={styles.roleDesc}>Field sales rep</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Personal details</h3>
                <div className={styles.formRowFull}>
                  <div className={styles.inputGroup}>
                    <label className="label">Full name</label>
                    <input type="text" name="name" className="input" value={name} onChange={e => handleNameChange(e.target.value)} required />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className="label">Mobile</label>
                    <input type="tel" name="phone" className="input" placeholder="e.g. 9876543210" pattern="[0-9]{10}" maxLength={10} required title="Please enter exactly 10 digits" onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '') }} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className="label">Email (for login details)</label>
                    <input type="email" name="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Assignment</h3>
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className="label">Assigned manager</label>
                    <select name="managerId" className="input">
                      <option value="none">None</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className="label">Territory / beat</label>
                    <input type="text" name="territory" className="input" placeholder="Pune – Hadapsar" />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className="label">Employee ID</label>
                    <input type="text" name="employeeId" className="input" placeholder="EMP-1043" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className="label">Joining date</label>
                    <input type="date" name="joiningDate" className="input" required />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Account</h3>
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className="label">User ID</label>
                    <input type="text" name="userId" className="input" value={userId} onChange={e => setUserId(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className={styles.footer}>
                <Link href="/employees" className={`btn btn-outline ${styles.cancelBtn}`}>Cancel</Link>
                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={isPending}>
                  {isPending ? 'Creating...' : 'Create employee'}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.successCard}>
              <div className={styles.successIconWrapper}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h2 className={styles.successTitle}>Employee created</h2>
              <p className={styles.successDesc}>{name} has been added as a {role}.</p>

              <div className={styles.credentialsBox}>
                <div className={styles.credentialRow}>
                  <div className={styles.credInfo}>
                    <span className={styles.credLabel}>User ID</span>
                    <span className={styles.credValue}>{userId}</span>
                  </div>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.credentialRow}>
                  <div className={styles.credInfo}>
                    <span className={styles.credLabel}>Temporary password</span>
                    <span className={styles.credValue}>{tempPassword}</span>
                  </div>
                </div>
              </div>

              <div className={styles.recreateRow}>
                <button type="button" className={styles.recreateBtn} onClick={handleRecreatePassword}>
                  Recreate Password
                </button>
              </div>

              <div className={styles.successFooter}>
                <button type="button" className={`btn btn-outline ${styles.addAnotherBtn}`} onClick={handleAddAnother}>Add another</button>
                <button type="button" className={`btn btn-primary ${styles.doneBtn}`}>
                  <Link href="/employees">Done</Link>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
