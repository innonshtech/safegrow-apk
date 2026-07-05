import React from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import styles from './page.module.css';
import { prisma } from '@safegrow/db';
import StatusToggle from './StatusToggle';

export default async function EmployeesPage() {
  const users = await prisma.user.findMany({
    include: {
      manager: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const allCount = users.length;
  const managersCount = users.filter(u => u.role === 'MANAGER').length;
  const repsCount = users.filter(u => u.role === 'REP').length;
  const inactiveCount = users.filter(u => u.status === 'INACTIVE').length;

  const employees = users.map(u => ({
    id: u.id,
    name: u.name,
    role: u.role === 'MANAGER' ? 'Manager' : u.role === 'ADMIN' ? 'Admin' : 'Rep',
    manager: u.manager?.name || '—',
    territory: 'Assigned', // Mocked territory as per schema limitations
    status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
    rawStatus: u.status
  }));

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Employees</h1>
          <Link href="/employees/new" className={`btn btn-primary ${styles.addEmployeeBtn}`}>
            + Add employee
          </Link>
        </div>

        <div className={styles.controls}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.activeTab}`}>All · {allCount}</button>
            <button className={styles.tab}>Managers · {managersCount}</button>
            <button className={styles.tab}>Reps · {repsCount}</button>
            <button className={styles.tab}>Inactive {inactiveCount}</button>
          </div>
          
          <input 
            type="text" 
            className={`input ${styles.searchInput}`} 
            placeholder="Search employees" 
          />
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Manager</th>
                <th>Territory</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No employees found.</td>
                </tr>
              )}
              {employees.map((emp, i) => (
                <tr key={`${emp.id}-${i}`}>
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{getInitials(emp.name)}</div>
                      <Link href={`/employees/${emp.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <span className={styles.empName}>{emp.name}</span>
                      </Link>
                    </div>
                  </td>
                  <td>
                    <span className={emp.role === 'Manager' ? 'badge badge-green' : 'badge badge-gray'}>
                      {emp.role}
                    </span>
                  </td>
                  <td className={styles.managerCell}>{emp.manager}</td>
                  <td className={styles.territoryCell}>{emp.territory}</td>
                  <td>
                    <StatusToggle id={emp.id} initialStatus={emp.status} rawStatus={emp.rawStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
