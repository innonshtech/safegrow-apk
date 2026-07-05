export const dynamic = 'force-dynamic';
import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import styles from './page.module.css';
import { prisma } from '@safegrow/db';

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(date));
}

function formatDate(date: Date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) return 'today';
  if (date.toDateString() === yesterday.toDateString()) return 'yesterday';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

export default async function AlertsPage() {
  const alerts = await prisma.fraudAlert.findMany({
    where: { resolvedAt: null },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Alerts</h1>
          <div className={styles.filters}>
            <button className={`${styles.filterBtn} ${styles.filterActive}`}>Unresolved · {alerts.length}</button>
            <button className={styles.filterBtn}>All</button>
          </div>
        </div>

        <div className={styles.alertsList}>
          {alerts.length > 0 ? alerts.map((alert) => (
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
                    {/* Extract metadata if possible, otherwise generic */}
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
                <button className={styles.dismissBtn}>Dismiss</button>
              </div>
            </div>
          )) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎉</div>
              <p>No unresolved alerts!</p>
            </div>
          )}
          
          {/* Mock data to match Figma if DB is empty */}
          {alerts.length === 0 && (
            <>
              <div className={styles.alertItem}>
                <div className={styles.alertIconWrapper}>
                  <div className={`${styles.icon} ${styles.iconRed}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                </div>
                <div className={styles.alertInfo}>
                  <div className={styles.alertTitleRow}>
                    <span className={styles.alertType}>Fake location detected</span>
                    <span className={styles.alertSubtitle}> · capture blocked</span>
                  </div>
                  <div className={styles.alertMeta}>Deepak T · Satara · 11:20 AM</div>
                </div>
                <div className={styles.alertActions}>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>View Profile</button>
                  <button className={styles.dismissBtn}>Dismiss</button>
                </div>
              </div>
              
              <div className={styles.alertItem}>
                <div className={styles.alertIconWrapper}>
                  <div className={`${styles.icon} ${styles.iconOrange}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  </div>
                </div>
                <div className={styles.alertInfo}>
                  <div className={styles.alertTitleRow}>
                    <span className={styles.alertType}>Tracking off 2h</span>
                    <span className={styles.alertSubtitle}> · while checked in</span>
                  </div>
                  <div className={styles.alertMeta}>Suresh M · Pune · since 1:10 PM</div>
                </div>
                <div className={styles.alertActions}>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>View Profile</button>
                  <button className={styles.dismissBtn}>Dismiss</button>
                </div>
              </div>
              
              <div className={styles.alertItem}>
                <div className={styles.alertIconWrapper}>
                  <div className={`${styles.icon} ${styles.iconYellow}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                </div>
                <div className={styles.alertInfo}>
                  <div className={styles.alertTitleRow}>
                    <span className={styles.alertType}>No check-out</span>
                    <span className={styles.alertSubtitle}> · day left incomplete</span>
                  </div>
                  <div className={styles.alertMeta}>Anil K · Nashik · yesterday</div>
                </div>
                <div className={styles.alertActions}>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>View Profile</button>
                  <button className={styles.dismissBtn}>Dismiss</button>
                </div>
              </div>
              
              <div className={styles.alertItem}>
                <div className={styles.alertIconWrapper}>
                  <div className={`${styles.icon} ${styles.iconYellow}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                </div>
                <div className={styles.alertInfo}>
                  <div className={styles.alertTitleRow}>
                    <span className={styles.alertType}>0 visits</span>
                    <span className={styles.alertSubtitle}> · by 2:00 PM</span>
                  </div>
                  <div className={styles.alertMeta}>Deepak T · Satara · today</div>
                </div>
                <div className={styles.alertActions}>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>View Profile</button>
                  <button className={styles.dismissBtn}>Dismiss</button>
                </div>
              </div>
              
              <div className={styles.alertItem}>
                <div className={styles.alertIconWrapper}>
                  <div className={`${styles.icon} ${styles.iconYellow}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                </div>
                <div className={styles.alertInfo}>
                  <div className={styles.alertTitleRow}>
                    <span className={styles.alertType}>Late check-in</span>
                    <span className={styles.alertSubtitle}> · 10:45 AM</span>
                  </div>
                  <div className={styles.alertMeta}>Priya N · Satara · today</div>
                </div>
                <div className={styles.alertActions}>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>View Profile</button>
                  <button className={styles.dismissBtn}>Dismiss</button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}
