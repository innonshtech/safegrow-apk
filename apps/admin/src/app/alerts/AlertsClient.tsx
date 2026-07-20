'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';

function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(date));
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (d.toDateString() === today.toDateString()) return 'today';
  if (d.toDateString() === yesterday.toDateString()) return 'yesterday';
  return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' }).format(d);
}

export default function AlertsClient({ initialAlerts }: { initialAlerts: any[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState('unresolved');

  useEffect(() => {
    // Poll for new alerts every 30 seconds
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('/api/v1/alerts');
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts);
        }
      } catch (err) {
        console.error('Error polling alerts:', err);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const displayAlerts = filter === 'unresolved' ? alerts.filter(a => !a.resolvedAt) : alerts;

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Alerts</h1>
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'unresolved' ? styles.filterActive : ''}`}
            onClick={() => setFilter('unresolved')}
          >
            Unresolved · {alerts.filter(a => !a.resolvedAt).length}
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
      </div>

      <div className={styles.alertsList}>
        {displayAlerts.length > 0 ? displayAlerts.map((alert) => (
          <div key={alert.id} className={styles.alertItem}>
            <div className={styles.alertIconWrapper}>
              {alert.type === 'FAKE_LOCATION' && (
                <div className={`${styles.icon} ${styles.iconRed}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
              )}
              {alert.type === 'TRACKING_OFF' && (
                <div className={`${styles.icon} ${styles.iconOrange}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                </div>
              )}
              {alert.type === 'NO_CHECK_OUT' && (
                <div className={`${styles.icon} ${styles.iconYellow}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
              )}
              {alert.type === 'ZERO_VISITS' && (
                <div className={`${styles.icon} ${styles.iconYellow}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
              )}
              {alert.type === 'LATE_CHECK_IN' && (
                <div className={`${styles.icon} ${styles.iconYellow}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
              )}
            </div>
            
            <div className={styles.alertInfo}>
              <div className={styles.alertTitleRow}>
                <span className={styles.alertType}>
                  {alert.type === 'FAKE_LOCATION' && 'Fake location detected'}
                  {alert.type === 'TRACKING_OFF' && 'Tracking off'}
                  {alert.type === 'NO_CHECK_OUT' && 'No check-out'}
                  {alert.type === 'ZERO_VISITS' && '0 visits'}
                  {alert.type === 'LATE_CHECK_IN' && 'Late check-in'}
                </span>
                <span className={styles.alertSubtitle}>
                  {alert.type === 'FAKE_LOCATION' && ' · capture blocked'}
                  {alert.type === 'TRACKING_OFF' && ' · while checked in'}
                  {alert.type === 'NO_CHECK_OUT' && ' · day left incomplete'}
                  {alert.type === 'ZERO_VISITS' && ' · by 2:00 PM'}
                  {alert.type === 'LATE_CHECK_IN' && ` · ${formatTime(alert.createdAt)}`}
                </span>
              </div>
              <div className={styles.alertMeta}>
                {alert.user.name} · {alert.user.territory || 'Unassigned'} · {formatDate(alert.createdAt)}
                {alert.type !== 'LATE_CHECK_IN' && ` · ${formatTime(alert.createdAt)}`}
              </div>
            </div>
            
            <div className={styles.alertActions}>
              <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>View Profile</button>
              {filter === 'unresolved' && <button className={styles.dismissBtn}>Dismiss</button>}
            </div>
          </div>
        )) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎉</div>
            <p>No alerts here!</p>
          </div>
        )}
      </div>
    </>
  );
}
