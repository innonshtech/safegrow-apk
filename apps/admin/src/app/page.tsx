import React from 'react';
import AdminLayout from '../components/AdminLayout';
import styles from './page.module.css';
import { prisma } from '@safegrow/db';

export default async function OverviewPage() {
  const managersCount = await prisma.user.count({ where: { role: 'MANAGER' } });
  const repsCount = await prisma.user.count({ where: { role: 'REP' } });
  
  // Dummy data for complex analytics (in reality, we'd query Attendances and FraudAlerts)
  const checkedInCount = await prisma.attendance.count({
    where: {
      date: new Date(),
      checkOutTime: null,
    }
  });

  const alertsToday = await prisma.fraudAlert.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  });

  const rawAlerts = await prisma.fraudAlert.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  const needsAttention = rawAlerts.map((alert, index) => ({
    id: alert.id,
    name: alert.user.name,
    issue: alert.type === 'MOCK_LOCATION' ? 'Fake GPS detected' : 'Unusual activity',
    territory: 'Pune', // Mock territory for now since it's not strictly in schema
    severity: 'red' as const,
  }));

  const managersList = await prisma.user.findMany({
    where: { role: 'MANAGER' },
    include: {
      _count: {
        select: { subordinates: true }
      }
    }
  });

  const repsByManager = managersList.map((m) => ({
    id: m.id,
    manager: m.name,
    territory: 'Assigned Region',
    reps: m._count.subordinates,
  }));

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Overview</h1>
            <p className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className={styles.profileInfo}>
            Admin Portal
          </div>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>{managersCount}</span>
            <span className={styles.metricLabel}>Managers</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>{repsCount}</span>
            <span className={styles.metricLabel}>Representatives</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>{checkedInCount}</span>
            <span className={styles.metricLabel}>Checked in now</span>
          </div>
          <div className={`${styles.metricCard} ${styles.warning}`}>
            <span className={styles.metricValue}>{alertsToday}</span>
            <span className={styles.metricLabel}>Alerts today</span>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>Needs attention</div>
            <div className={styles.list}>
              {needsAttention.length === 0 && (
                <div className={styles.listItem}>
                  <span className={styles.itemText} style={{ color: 'var(--text-muted)' }}>No alerts requiring attention today.</span>
                </div>
              )}
              {needsAttention.map((item, index) => (
                <div key={`${item.id}-${index}`} className={styles.listItem}>
                  <div className={styles.itemLeft}>
                    <div className={`${styles.dot} ${styles[item.severity]}`}></div>
                    <span className={styles.itemText}>{item.name} · {item.issue}</span>
                  </div>
                  <span className={styles.itemTerritory}>{item.territory}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>Reps by manager</div>
            <div className={styles.list}>
              {repsByManager.map((item, index) => (
                <div key={`${item.id}-${index}`} className={styles.listItem}>
                  <span className={styles.itemText}>{item.manager} · {item.territory}</span>
                  {item.reps > 0 && <span className={styles.repCount}>{item.reps} reps</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
