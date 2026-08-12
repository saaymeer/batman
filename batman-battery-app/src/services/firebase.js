import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;

// Show a clear warning in dev mode instead of a cryptic crash
if (import.meta.env.DEV && (!apiKey || !projectId)) {
  console.warn(
    '⚠️  Batman Battery App: Firebase credentials not configured.\n' +
    'Copy .env.example → .env and fill in your Firebase project values.\n' +
    'See README.md → Getting Started for instructions.\n' +
    'The app will load but Firestore reads/writes will fail until credentials are set.'
  );
}

const firebaseConfig = {
  apiKey: apiKey || 'MISSING_API_KEY',
  authDomain: authDomain || 'MISSING_AUTH_DOMAIN',
  projectId: projectId || 'MISSING_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
