"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { loginAction } from './actions';
import styles from './page.module.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Image src="/logo 1.svg" alt="SafeGrow Logo" width={120} height={150} style={{ objectFit: 'contain' }} />
          </div>
          <p className={styles.subtitle}>Sign in to manage your field team</p>
        </div>

        <form className={styles.form} action={loginAction}>
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

