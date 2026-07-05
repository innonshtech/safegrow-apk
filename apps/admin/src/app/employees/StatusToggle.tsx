'use client';

import React, { useTransition } from 'react';
import { toggleEmployeeStatusAction } from './actions';
import styles from './page.module.css';

interface StatusToggleProps {
  id: string;
  initialStatus: string; // 'Active' | 'Pending' | 'Inactive...'
  rawStatus: string; // 'ACTIVE' | 'INACTIVE'
}

export default function StatusToggle({ id, initialStatus, rawStatus }: StatusToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      toggleEmployeeStatusAction(id, rawStatus);
    });
  };

  const isActive = rawStatus === 'ACTIVE';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <button 
        onClick={handleToggle}
        disabled={isPending}
        style={{
          width: '36px',
          height: '20px',
          backgroundColor: isActive ? 'var(--primary)' : '#e5e7eb',
          borderRadius: '999px',
          position: 'relative',
          cursor: isPending ? 'wait' : 'pointer',
          border: 'none',
          transition: 'background-color 0.2s',
          opacity: isPending ? 0.7 : 1
        }}
        aria-label="Toggle status"
      >
        <div style={{
          width: '16px',
          height: '16px',
          backgroundColor: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: isActive ? '18px' : '2px',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }} />
      </button>

      <div className={styles.statusCell} style={{ minWidth: '80px' }}>
        {initialStatus === 'Active' && (
          <><div className={`${styles.statusDot} ${styles.dotGreen}`}></div> Active</>
        )}
        {initialStatus === 'Pending' && (
          <><div className={`${styles.statusDot} ${styles.dotOrange}`}></div> <span className={styles.textOrange}>Pending</span></>
        )}
        {initialStatus.startsWith('Inactive') && (
          <><div className={`${styles.statusDot}`} style={{ backgroundColor: '#9ca3af' }}></div> <span style={{ color: '#6b7280' }}>Inactive</span></>
        )}
      </div>
    </div>
  );
}
