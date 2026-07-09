"use client";
import React, { useState } from 'react';
import styles from './page.module.css';

export default function LeavesClient({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdate = async (id: string, status: string) => {
    setLoadingId(id);
    try {
      const res = await fetch('http://localhost:3001/api/v1/admin/attendance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, status })
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: data.request.status } : r));
      } else {
        alert(data.error || 'Failed to update request');
      }
    } catch (error) {
      alert('Error updating request');
    } finally {
      setLoadingId(null);
    }
  };

  if (requests.length === 0) {
    return <div className={styles.empty}>No attendance requests found.</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Requested In/Out</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => {
            const dateStr = new Date(req.date).toLocaleDateString();
            const inStr = req.checkInTime ? new Date(req.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '--';
            const outStr = req.checkOutTime ? new Date(req.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '--';
            
            return (
              <tr key={req.id}>
                <td>
                  <div className={styles.empName}>{req.user.name}</div>
                  <div className={styles.empId}>{req.user.employeeId || 'N/A'}</div>
                </td>
                <td>{dateStr}</td>
                <td>
                  <div>In: {inStr}</div>
                  <div>Out: {outStr}</div>
                </td>
                <td>{req.reason}</td>
                <td>
                  <span className={`${styles.badge} ${styles[req.status.toLowerCase()]}`}>
                    {req.status}
                  </span>
                </td>
                <td>
                  {req.status === 'PENDING' ? (
                    <div className={styles.actions}>
                      <button 
                        className={styles.approveBtn}
                        onClick={() => handleUpdate(req.id, 'APPROVED')}
                        disabled={loadingId === req.id}
                      >
                        Approve
                      </button>
                      <button 
                        className={styles.rejectBtn}
                        onClick={() => handleUpdate(req.id, 'REJECTED')}
                        disabled={loadingId === req.id}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={styles.noAction}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
