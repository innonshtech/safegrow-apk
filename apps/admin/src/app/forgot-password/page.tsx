"use client";

import React, { useState, useActionState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { requestPasswordResetAction, verifyAndResetPasswordAction } from './actions';
import styles from '../login/page.module.css';

const initialState = {
  step: 1,
  error: '',
  success: '',
  email: ''
};

export default function ForgotPasswordPage() {
  const [state1, formAction1] = useActionState(requestPasswordResetAction, initialState);
  const [state2, formAction2] = useActionState(verifyAndResetPasswordAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  // Determine current state based on which action was last successful
  const currentState = state2.step > state1.step ? state2 : state1;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Image src="/logo 1.svg" alt="SafeGrow Logo" width={120} height={150} style={{ objectFit: 'contain' }} priority />
          </div>
          <p className={styles.subtitle}>
            {currentState.step === 1 && "Reset your password"}
            {currentState.step === 2 && "Enter verification code"}
            {currentState.step === 3 && "Password updated"}
          </p>
        </div>

        {currentState.error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
            {currentState.error}
          </div>
        )}

        {currentState.success && currentState.step !== 3 && (
          <div style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
            {currentState.success}
          </div>
        )}

        {currentState.step === 1 && (
          <form className={styles.form} action={formAction1}>
            <div className={styles.inputGroup}>
              <label className="label" htmlFor="email">Email or User ID</label>
              <input 
                type="text" 
                name="email"
                id="email" 
                className="input" 
                placeholder="admin@safegrow.com" 
                required
              />
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
              Send Reset Code
            </button>
          </form>
        )}

        {currentState.step === 2 && (
          <form className={styles.form} action={formAction2}>
            <input type="hidden" name="email" value={currentState.email} />
            
            <div className={styles.inputGroup}>
              <label className="label" htmlFor="otp">6-Digit Code</label>
              <input 
                type="text" 
                name="otp"
                id="otp" 
                className="input" 
                placeholder="123456" 
                maxLength={6}
                required
                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
              />
              <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', textAlign: 'right' }}>Valid for 5 minutes</span>
            </div>

            <div className={styles.inputGroup}>
              <label className="label" htmlFor="newPassword">New Password</label>
              <div className={styles.passwordInputContainer}>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  id="newPassword" 
                  className={`input ${styles.passwordInput}`}
                  placeholder="••••••••" 
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
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
              Reset Password
            </button>
          </form>
        )}

        {currentState.step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 style={{ marginBottom: '8px', color: '#111827' }}>Success!</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>Your password has been reset successfully.</p>
            <Link href="/login" className={`btn btn-primary ${styles.submitBtn}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              Return to Login
            </Link>
          </div>
        )}

        {currentState.step !== 3 && (
          <div className={styles.footer}>
            <Link href="/login" className={styles.forgotLink}>
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
