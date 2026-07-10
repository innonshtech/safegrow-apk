import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '../components/Toast/ToastContext';
import SessionTimeout from '../components/SessionTimeout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SafeGrow Admin',
  description: 'Manage your field team',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <ToastProvider>
          <SessionTimeout />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
