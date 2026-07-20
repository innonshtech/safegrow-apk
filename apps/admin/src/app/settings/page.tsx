import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import styles from './page.module.css';
import { getCurrentAdmin } from '../../lib/auth';
import { prisma } from '@safegrow/db';
import SettingsClient from './SettingsClient';

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

  const settingsRecords = await prisma.setting.findMany();
  const settingsMap = settingsRecords.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

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

        <SettingsClient admin={admin} initialSettings={settingsMap} />
      </div>
    </AdminLayout>
  );
}
