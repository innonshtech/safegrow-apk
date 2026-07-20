"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './AdminLayout.module.css';
import { logoutAction } from '../app/login/actions';
import { LayoutDashboard, Users, Bell, Settings, LogOut, Calendar } from 'lucide-react';
import { useToast } from './Toast/ToastContext';
import { useEffect, Suspense } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Leaves', href: '/leaves', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLayoutContent children={children} navItems={navItems} pathname={pathname} />
    </Suspense>
  );
}

function AdminLayoutContent({ children, navItems, pathname }: any) {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      showToast('Login successful', 'success');
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, showToast]);

  return (
    <div className={styles.container}>
      {/* Mobile Header (Only visible on mobile) */}
      <div className={styles.mobileHeader}>
        <div className={styles.logoContainer} style={{ display: 'flex', padding: 0 }}>
          <div className={styles.logoIcon}>
            <img src="/Safegrow_logo.png" alt="SafeGrow Logo" width={32} height={32} />
          </div>
          <span className={styles.logoText}>SafeGrow</span>
        </div>
        <form action={logoutAction as any}>
          <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
            <LogOut size={20} />
          </button>
        </form>
      </div>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <img src="/Safegrow_logo.png" alt="SafeGrow Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
          </div>
          <span className={styles.logoText}>SafeGrow</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item: any) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon size={18} className={styles.navIcon} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <form action={logoutAction as any}>
            <button type="submit" className={styles.logoutBtn}>
              <LogOut size={18} />
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
