import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import styles from './page.module.css';
import { prisma } from '@safegrow/db';
import AlertsClient from './AlertsClient';

export default async function AlertsPage() {
  const alerts = await prisma.fraudAlert.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminLayout>
      <div className={styles.container}>
        <AlertsClient initialAlerts={alerts} />
      </div>
    </AdminLayout>
  );
}
