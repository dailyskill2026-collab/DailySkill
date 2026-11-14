// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, type Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { env } from './env';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  isConfigured: boolean;
}

let services: FirebaseServices | null = null;

export function getFirebaseServices(): FirebaseServices | null {
  if (services) return services;

  const isConfigured = Boolean(
    env.FIREBASE_API_KEY &&
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_AUTH_DOMAIN
  );

  if (!isConfigured && env.BACKEND_MODE === 'firebase') {
    console.warn(
      '[Firebase] VITE_BACKEND_MODE is set to "firebase", but Firebase credentials (VITE_FIREBASE_API_KEY) are missing. Falling back to mock data.'
    );
    return null;
  }

  if (!isConfigured) {
    return null;
  }

  try {
    const firebaseConfig = {
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_AUTH_DOMAIN,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      appId: env.FIREBASE_APP_ID,
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const auth = getAuth(app);
    const db = getFirestore(app);

    if (env.USE_FIREBASE_EMULATOR && typeof window !== 'undefined') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.info('[Firebase] Connected to local Firebase Emulators (Auth: 9099, Firestore: 8080)');
      } catch (e) {
        // Emulator already connected
      }
    }

    services = { app, auth, db, isConfigured: true };
    return services;
  } catch (err) {
    console.error('[Firebase] Initialization error:', err);
    return null;
  }
}
