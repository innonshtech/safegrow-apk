'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../components/Toast/ToastContext';

export default function DeleteEmployeeButton({ employeeId }: { employeeId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/v1/employees/${employeeId}/hard-delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete employee');
      }

      showToast('Employee deleted successfully', 'success');
      setShowModal(false);
      router.push('/employees');
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      showToast(error.message || 'An error occurred while deleting', 'error');
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button 
        className="btn btn-outline" 
        onClick={() => setShowModal(true)}
        disabled={isDeleting}
        style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          alignItems: 'center', 
          height: '40px', 
          borderRadius: '8px',
          color: '#dc2626',
          borderColor: '#dc2626'
        }}
      >
        {isDeleting ? (
          <span style={{ fontSize: '14px' }}>Deleting...</span>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </>
        )}
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ marginTop: 0, color: '#111827', fontSize: '18px', fontWeight: 600 }}>Delete Employee</h3>
            <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '12px', lineHeight: '1.5' }}>
              Are you absolutely sure you want to permanently delete this employee?
            </p>
            <p style={{ color: '#b91c1c', fontSize: '14px', marginTop: '12px', fontWeight: 500, lineHeight: '1.5' }}>
              This will remove all their visits, attendances, alerts, and delete any associated images from the server. THIS CANNOT BE UNDONE.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                style={{ padding: '8px 16px', borderRadius: '6px' }}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  backgroundColor: '#dc2626', 
                  color: 'white',
                  border: 'none',
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
