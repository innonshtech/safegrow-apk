'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { updateEmployeeAction, deactivateEmployeeAction } from './actions';

export default function EditEmployeeClient({ employee, managers }: { employee: any, managers: any[] }) {
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignManagerId, setReassignManagerId] = useState('none');
  const [isPending, setIsPending] = useState(false);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const repsCount = employee.subordinates?.length || 0;

  const handleDeactivateClick = () => {
    if (repsCount > 0) {
      setShowReassignModal(true);
    } else {
      setShowDeactivateModal(true);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href={`/employees/${employee.id}`} className={styles.backBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className={styles.title}>Edit Employee</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.profileSummary}>
          <div className={styles.avatarLarge}>{getInitials(employee.name)}</div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>{employee.name}</div>
            <div className={styles.profileMeta}>
              {employee.role === 'MANAGER' ? 'Manager' : 'Representative'} • {employee.employeeId || 'EMP-XXXX'}
            </div>
          </div>
        </div>

        <form action={updateEmployeeAction} className={styles.form}>
          <input type="hidden" name="id" value={employee.id} />
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Personal details</h3>
            <div className={styles.formRowFull}>
              <div className={styles.inputGroup}>
                <label className="label">Full name</label>
                <input type="text" name="name" className="input" defaultValue={employee.name} required />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className="label">Mobile</label>
                <input type="text" name="phone" className="input" defaultValue={employee.phone || ''} />
              </div>
              <div className={styles.inputGroup}>
                <label className="label">Email</label>
                <input type="email" name="email" className="input" defaultValue={employee.email || ''} />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Assignment</h3>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className="label">Assigned manager</label>
                <select name="managerId" className="input" defaultValue={employee.reportsToId || 'none'}>
                  <option value="none">None</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className="label">Territory / beat</label>
                <input type="text" name="territory" className="input" defaultValue={employee.territory || ''} />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Credentials</h3>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className="label">Current password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    name="currentPassword" 
                    className="input" 
                    defaultValue={employee.plainPassword || ''} 
                    readOnly 
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showCurrentPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className="label">New password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    name="newPassword" 
                    className="input" 
                    placeholder="Leave blank to keep current" 
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showNewPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.btnDeactivate} onClick={handleDeactivateClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
              Deactivate employee
            </button>
            <div className={styles.footerRight}>
              <Link href={`/employees/${employee.id}`} className="btn btn-outline">Cancel</Link>
              <button type="submit" className="btn btn-primary">Save changes</button>
            </div>
          </div>
        </form>
      </div>

      {/* Deactivate Modal (No Reps) */}
      {showDeactivateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIconRedWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d93025" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
            </div>
            <h2 className={styles.modalTitle}>Deactivate {employee.name}?</h2>
            <p className={styles.modalDesc}>
              Their login is revoked and tracking stops immediately. All past attendance and visit records are kept and stay viewable.
            </p>
            
            <div className={styles.infoBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              <span>Moves to Inactive — findable under the Inactive filter.</span>
            </div>

            <form action={deactivateEmployeeAction} className={styles.modalActions}>
              <input type="hidden" name="id" value={employee.id} />
              <button type="button" className="btn btn-outline" onClick={() => setShowDeactivateModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className={styles.btnDanger} style={{ flex: 1 }}>Deactivate</button>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Modal (Manager with Reps) */}
      {showReassignModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIconYellowWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e37400" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h2 className={styles.modalTitle}>Reassign {repsCount} reps first</h2>
            <p className={styles.modalDesc}>
              {employee.name} manages {repsCount} representatives. Move them to another manager before deactivating, so no rep is left unassigned.
            </p>

            <form action={deactivateEmployeeAction} className={styles.reassignForm}>
              <input type="hidden" name="id" value={employee.id} />
              
              <div className={styles.inputGroup} style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <label className="label">Reassign all {repsCount} reps to</label>
                <select 
                  name="reassignToId" 
                  className="input" 
                  value={reassignManagerId}
                  onChange={e => setReassignManagerId(e.target.value)}
                  required
                >
                  <option value="none">Select a manager</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-outline" onClick={() => setShowReassignModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={reassignManagerId === 'none'}
                >
                  Reassign & continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
