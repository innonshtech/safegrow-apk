'use client';

import { useEffect } from 'react';
import { logoutAction } from '../app/login/actions';
import { usePathname } from 'next/navigation';

export default function SessionTimeout() {
  const pathname = usePathname();

  useEffect(() => {
    // Do not run timeout logic on public pages
    if (pathname === '/login' || pathname === '/forgot-password') {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      // 2 hours inactivity timeout (2 * 60 * 60 * 1000 ms)
      timeoutId = setTimeout(() => {
        logoutAction();
      }, 2 * 60 * 60 * 1000); 
    };

    // List of events to listen to for user activity
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];

    resetTimeout();

    events.forEach((event) => {
      document.addEventListener(event, resetTimeout);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [pathname]);

  return null;
}
