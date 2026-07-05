import * as admin from 'firebase-admin';

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  try {
    // If FIREBASE_SERVICE_ACCOUNT_JSON is provided, parse and use it.
    // Otherwise, Firebase Admin will attempt to use GOOGLE_APPLICATION_CREDENTIALS.
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized with custom service account JSON.');
    } else {
      admin.initializeApp();
      console.log('Firebase Admin initialized with application default credentials.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

export const firebaseAdmin = admin;
export const messaging = admin.apps.length ? admin.messaging() : null;
