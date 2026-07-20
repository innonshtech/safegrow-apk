import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { prisma } from '@safegrow/db';
import styles from './page.module.css';
import LeavesClient from './LeavesClient';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function LeavesPage() {
  const requests = await prisma.attendanceRequest.findMany({
    include: {
      user: {
        select: { name: true, employeeId: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  const leaves = await prisma.leaveRequest.findMany({
    include: {
      user: {
        select: { name: true, employeeId: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const users = await prisma.user.findMany({
    where: { role: 'REP' },
    select: { id: true, name: true, employeeId: true }
  });

  // Convert dates to iso strings to pass to client component safely
  const serializedRequests = requests.map(req => ({
    ...req,
    date: req.date.toISOString(),
    checkInTime: req.checkInTime?.toISOString() || null,
    checkOutTime: req.checkOutTime?.toISOString() || null,
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
  }));

  const serializedLeaves = leaves.map(req => ({
    ...req,
    startDate: req.startDate.toISOString(),
    endDate: req.endDate.toISOString(),
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
  }));

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Attendance & Leave Requests</h1>
        </div>
        <LeavesClient initialRequests={serializedRequests} initialLeaves={serializedLeaves} users={users} />
      </div>
    </AdminLayout>
  );
}
