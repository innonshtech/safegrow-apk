export const dynamic = 'force-dynamic';
import React from 'react';
import { prisma } from '@safegrow/db';
import { notFound } from 'next/navigation';
import AdminLayout from '../../../../components/AdminLayout';
import EditEmployeeClient from './EditEmployeeClient';

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const employee = await prisma.user.findUnique({
    where: { id },
    include: { subordinates: true }
  });

  if (!employee) {
    notFound();
  }

  // Fetch managers for the assignment dropdown (exclude self)
  const allManagers = await prisma.user.findMany({
    where: { role: 'MANAGER' },
    select: { id: true, name: true }
  });
  
  const managers = allManagers.filter(m => m.id !== employee.id);

  return (
    <AdminLayout>
      <EditEmployeeClient employee={employee} managers={managers} />
    </AdminLayout>
  );
}
