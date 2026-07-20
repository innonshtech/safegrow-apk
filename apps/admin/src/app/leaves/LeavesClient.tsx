"use client";
import React, { useState } from 'react';
import styles from './page.module.css';

export default function LeavesClient({ initialRequests, initialLeaves, users }: { initialRequests: any[], initialLeaves: any[], users?: any[] }) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves'>('attendance');
  const [requests, setRequests] = useState(initialRequests);
  const [leaves, setLeaves] = useState(initialLeaves);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Emergency Leave Modal State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyData, setEmergencyData] = useState({ userId: '', type: 'CASUAL', startDate: '', endDate: '', reason: '' });
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpdate = async (id: string, status: string, isLeave: boolean = false) => {
    setLoadingId(id);
    try {
      const endpoint = isLeave ? '/api/v1/admin/leaves' : '/api/v1/admin/attendance-requests';
      const body = isLeave ? { leaveId: id, status } : { requestId: id, status };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success || data.request) {
        if (isLeave) {
          setLeaves(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        } else {
          setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        }
      } else {
        alert(data.error || 'Failed to update request');
      }
    } catch (error) {
      alert('Error updating request');
    } finally {
      setLoadingId(null);
    }
  };

  const handleEmergencySubmit = async () => {
    if (!emergencyData.userId || !emergencyData.startDate || !emergencyData.endDate || !emergencyData.reason) {
      alert("Please fill all fields for emergency leave.");
      return;
    }
    setEmergencyLoading(true);
    try {
      const res = await fetch('/api/v1/admin/leaves/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyData)
      });
      const data = await res.json();
      if (data.success) {
        alert("Emergency leave granted successfully.");
        // We add it locally to state
        setLeaves(prev => [data.request, ...prev]);
        setShowEmergencyModal(false);
        setEmergencyData({ userId: '', type: 'CASUAL', startDate: '', endDate: '', reason: '' });
      } else {
        alert(data.error || "Failed to grant emergency leave");
      }
    } catch (e) {
      alert("Network error while submitting emergency leave");
    } finally {
      setEmergencyLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.tabs} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button 
            className={`${styles.tab} ${activeTab === 'attendance' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance Corrections
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'leaves' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('leaves')}
          >
            Leave Requests
          </button>
        </div>
        
        {activeTab === 'leaves' && (
          <button 
            className={styles.approveBtn} 
            style={{ padding: '8px 16px', fontSize: '14px' }}
            onClick={() => setShowEmergencyModal(true)}
          >
            + Grant Emergency Leave
          </button>
        )}
      </div>

      {activeTab === 'attendance' && (
        requests.length === 0 ? (
          <div className={styles.empty}>No attendance requests found.</div>
        ) : (
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
                  let dateStr = '';
                  let inStr = '';
                  let outStr = '';
                  
                  if (mounted) {
                    dateStr = new Date(req.date).toLocaleDateString();
                    inStr = req.checkInTime ? new Date(req.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '--';
                    outStr = req.checkOutTime ? new Date(req.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '--';
                  }
                  
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
        )
      )}

      {activeTab === 'leaves' && (
        leaves.length === 0 ? (
          <div className={styles.empty}>No leave requests found.</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days (Unpaid)</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(req => {
                  let startDateStr = '';
                  let endDateStr = '';
                  
                  if (mounted) {
                    startDateStr = new Date(req.startDate).toLocaleDateString();
                    endDateStr = new Date(req.endDate).toLocaleDateString();
                  }
                  
                  return (
                    <tr key={req.id}>
                      <td>
                        <div className={styles.empName}>{req.user.name}</div>
                        <div className={styles.empId}>{req.user.employeeId || 'N/A'}</div>
                      </td>
                      <td>{req.type}</td>
                      <td>
                        <div>{startDateStr} - {endDateStr}</div>
                      </td>
                      <td>
                        <div>{req.totalDays} Total</div>
                        {req.unpaidDays > 0 && <div style={{color: '#d93025', fontSize: '12px'}}>{req.unpaidDays} Unpaid</div>}
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
                              onClick={() => handleUpdate(req.id, 'APPROVED', true)}
                              disabled={loadingId === req.id}
                            >
                              Approve
                            </button>
                            <button 
                              className={styles.rejectBtn}
                              onClick={() => handleUpdate(req.id, 'REJECTED', true)}
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
        )
      )}

      {showEmergencyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Grant Emergency Leave</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Employee</label>
              <select 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                value={emergencyData.userId}
                onChange={e => setEmergencyData({...emergencyData, userId: e.target.value})}
              >
                <option value="">Select Employee...</option>
                {users?.map(u => <option key={u.id} value={u.id}>{u.name} ({u.employeeId})</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Leave Type</label>
              <select 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                value={emergencyData.type}
                onChange={e => setEmergencyData({...emergencyData, type: e.target.value})}
              >
                <option value="CASUAL">Casual</option>
                <option value="PRIVILEGE">Privilege</option>
                <option value="MEDICAL">Medical</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Start Date</label>
                <input 
                  type="date" 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={emergencyData.startDate}
                  onChange={e => setEmergencyData({...emergencyData, startDate: e.target.value})}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>End Date</label>
                <input 
                  type="date" 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={emergencyData.endDate}
                  onChange={e => setEmergencyData({...emergencyData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Reason</label>
              <textarea 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
                value={emergencyData.reason}
                onChange={e => setEmergencyData({...emergencyData, reason: e.target.value})}
                placeholder="Reason for override..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#f9fafb', cursor: 'pointer' }}
                onClick={() => setShowEmergencyModal(false)}
                disabled={emergencyLoading}
              >
                Cancel
              </button>
              <button 
                className={styles.approveBtn}
                style={{ padding: '8px 16px' }}
                onClick={handleEmergencySubmit}
                disabled={emergencyLoading}
              >
                {emergencyLoading ? "Submitting..." : "Grant Leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
