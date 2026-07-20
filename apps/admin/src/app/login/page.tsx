"use client";

import React, { useState, useActionState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { loginAction } from './actions';
import { useSearchParams } from 'next/navigation';
import { useToast } from '../../components/Toast/ToastContext';
import styles from './page.module.css';
import { Suspense, useEffect } from 'react';

const initialState = {
  error: '',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [state, formAction] = useActionState(loginAction as any, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get('error') === 'session_expired') {
      showToast('Session expired. Please log in again.', 'error');
      // Clean up the URL
      window.history.replaceState({}, '', '/login');
    }
    if (searchParams.get('logout') === 'success') {
      showToast('Logged out successfully', 'success');
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams, showToast]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Image src="/Safegrow_Logo.png" alt="SafeGrow Logo" width={120} height={150} style={{ objectFit: 'contain' }} priority />
          </div>
          <p className={styles.subtitle}>Sign in to manage your field team</p>
        </div>

        {state?.error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
            {state.error}
          </div>
        )}

        <form className={styles.form} action={formAction}>
          <div className={styles.inputGroup}>
            <label className="label" htmlFor="email">Email or User ID</label>
            <input 
              type="text" 
              name="email"
              id="email" 
              className="input" 
              placeholder="safegrowapp@gmail.com" 
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className="label" htmlFor="password">Password</label>
            <div className={styles.passwordInputContainer}>
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                id="password" 
                className={`input ${styles.passwordInput}`}
                placeholder="••••••••" 
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            Sign in
          </button>
        </form>

        <div className={styles.footer}>
          <Link href="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}

