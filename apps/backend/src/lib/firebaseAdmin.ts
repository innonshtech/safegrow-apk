import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    // If FIREBASE_SERVICE_ACCOUNT_JSON is provided, parse and use it.
    // Otherwise, Firebase Admin will attempt to use GOOGLE_APPLICATION_CREDENTIALS.
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase Admin initialized with custom service account JSON.');
    } else {
      initializeApp();
      console.log('Firebase Admin initialized with application default credentials.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

export const messaging = getApps().length ? getMessaging() : null;
