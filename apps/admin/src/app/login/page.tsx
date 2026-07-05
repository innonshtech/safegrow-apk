import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { loginAction } from './actions';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Image src="/logo 1.png" alt="SafeGrow Logo" width={120} height={150} style={{ objectFit: 'contain' }} />
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
              defaultValue="admin@safegrow.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className="label" htmlFor="password">Password</label>
            <input 
              type="password" 
              name="password"
              id="password" 
              className="input" 
              placeholder="••••••••" 
              defaultValue="password123"
              required
            />
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
