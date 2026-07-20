"use client";
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function SettingsClient({ admin, initialSettings }: { admin: any, initialSettings: any }) {
  const [activeTab, setActiveTab] = useState<'account' | 'company' | 'leaves' | 'hours' | 'notifications' | 'export'>('account');
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (data.success) {
        alert("Settings saved successfully.");
      } else {
        alert(data.error || "Failed to save settings.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: string) => {
    window.location.href = `/api/v1/admin/export?type=${type}`;
  };

  const renderTabs = () => (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', overflowX: 'auto' }}>
      {[
        { id: 'account', label: 'Account' },
        { id: 'company', label: 'Company' },
        { id: 'leaves', label: 'Leave Policy' },
        { id: 'hours', label: 'Working Hours' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'export', label: 'Data Export' },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 4px',
            fontSize: '14px',
            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
            color: activeTab === tab.id ? '#166534' : '#6b7280',
            borderBottom: activeTab === tab.id ? '2px solid #166534' : '2px solid transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {renderTabs()}

      {activeTab === 'account' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Change password</h2>
          <p className={styles.cardDesc}>Use at least 8 characters with a mix of letters and numbers.</p>
          
          <form className={styles.form} method="POST" action="/settings/actions/update-password">
            <div className={styles.inputGroup}>
              <label className="label">Current password</label>
              <div className={styles.inputWrapper}>
                <input type="password" name="currentPassword" className="input" placeholder="••••••••••" required />
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label className="label">New password</label>
              <div className={styles.inputWrapper}>
                <input type="password" name="newPassword" className="input" placeholder="••••••••••" required />
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label className="label">Confirm new password</label>
              <div className={styles.inputWrapper}>
                <input type="password" name="confirmPassword" className="input" placeholder="••••••••••" required />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: 'fit-content' }}>
              Update password
            </button>
          </form>
        </div>
      )}

      {activeTab === 'company' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Company Profile</h2>
          <p className={styles.cardDesc}>Update your company branding and details.</p>
          <form className={styles.form} onSubmit={handleSettingsUpdate}>
            <div className={styles.inputGroup}>
              <label className="label">Company Name</label>
              <div className={styles.inputWrapper}>
                <input type="text" className="input" value={settings.COMPANY_NAME || ''} onChange={e => setSettings({...settings, COMPANY_NAME: e.target.value})} placeholder="SafeGrow" />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className="label">Support Email</label>
              <div className={styles.inputWrapper}>
                <input type="email" className="input" value={settings.SUPPORT_EMAIL || ''} onChange={e => setSettings({...settings, SUPPORT_EMAIL: e.target.value})} placeholder="support@safegrow.com" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', width: 'fit-content' }}>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Leave Policy Configuration</h2>
          <p className={styles.cardDesc}>Configure limits for different types of leaves.</p>
          <form className={styles.form} onSubmit={handleSettingsUpdate}>
            <div className={styles.inputGroup}>
              <label className="label">Casual Leaves (Yearly)</label>
              <div className={styles.inputWrapper}>
                <input type="number" className="input" value={settings.LEAVE_QUOTA_CASUAL || '5'} onChange={e => setSettings({...settings, LEAVE_QUOTA_CASUAL: e.target.value})} />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className="label">Privilege Leaves (Yearly)</label>
              <div className={styles.inputWrapper}>
                <input type="number" className="input" value={settings.LEAVE_QUOTA_PRIVILEGE || '10'} onChange={e => setSettings({...settings, LEAVE_QUOTA_PRIVILEGE: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <label className="label">Medical Leaves (Yearly)</label>
                <div className={styles.inputWrapper}>
                  <input type="number" className="input" value={settings.LEAVE_QUOTA_MEDICAL_YEARLY || '5'} onChange={e => setSettings({...settings, LEAVE_QUOTA_MEDICAL_YEARLY: e.target.value})} />
                </div>
              </div>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <label className="label">Medical Leaves (Monthly Limit)</label>
                <div className={styles.inputWrapper}>
                  <input type="number" className="input" value={settings.LEAVE_QUOTA_MEDICAL_MONTHLY || '2'} onChange={e => setSettings({...settings, LEAVE_QUOTA_MEDICAL_MONTHLY: e.target.value})} />
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', width: 'fit-content' }}>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'hours' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Working Hours</h2>
          <p className={styles.cardDesc}>Configure default times for employees.</p>
          <form className={styles.form} onSubmit={handleSettingsUpdate}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <label className="label">Default Check-in Time</label>
                <div className={styles.inputWrapper}>
                  <input type="time" className="input" value={settings.DEFAULT_CHECKIN_TIME || '09:00'} onChange={e => setSettings({...settings, DEFAULT_CHECKIN_TIME: e.target.value})} />
                </div>
              </div>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <label className="label">Default Check-out Time</label>
                <div className={styles.inputWrapper}>
                  <input type="time" className="input" value={settings.DEFAULT_CHECKOUT_TIME || '18:00'} onChange={e => setSettings({...settings, DEFAULT_CHECKOUT_TIME: e.target.value})} />
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', width: 'fit-content' }}>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'export' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Data Export</h2>
          <p className={styles.cardDesc}>Download raw CSV data for your records.</p>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <button 
              type="button" 
              className="btn" 
              style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => handleExport('attendance')}
            >
              Export Attendance (.csv)
            </button>
            <button 
              type="button" 
              className="btn" 
              style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => handleExport('leaves')}
            >
              Export Leaves (.csv)
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Email Notifications</h2>
          <p className={styles.cardDesc}>Choose what events you want to be notified about via email.</p>
          <form className={styles.form} onSubmit={handleSettingsUpdate}>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
              <input 
                type="checkbox" 
                checked={settings.NOTIFY_NEW_LEAVE === 'true'} 
                onChange={e => setSettings({...settings, NOTIFY_NEW_LEAVE: e.target.checked ? 'true' : 'false'})}
                style={{ width: '18px', height: '18px' }}
              />
              <label style={{ fontSize: '14px', fontWeight: 500 }}>Email me when a new leave request is submitted</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
              <input 
                type="checkbox" 
                checked={settings.NOTIFY_ATTENDANCE_CORRECTION === 'true'} 
                onChange={e => setSettings({...settings, NOTIFY_ATTENDANCE_CORRECTION: e.target.checked ? 'true' : 'false'})}
                style={{ width: '18px', height: '18px' }}
              />
              <label style={{ fontSize: '14px', fontWeight: 500 }}>Email me for attendance corrections</label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', width: 'fit-content' }}>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
