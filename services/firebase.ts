
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Check if critical keys exist
const hasKeys = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

export const app = hasKeys ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export const isConfigured = hasKeys;

export const getConfigStatus = () => {
  const missingKeys: string[] = [];
  const envVars = [
    { key: 'FIREBASE_API_KEY', val: firebaseConfig.apiKey },
    { key: 'FIREBASE_AUTH_DOMAIN', val: firebaseConfig.authDomain },
    { key: 'FIREBASE_PROJECT_ID', val: firebaseConfig.projectId },
    { key: 'FIREBASE_STORAGE_BUCKET', val: firebaseConfig.storageBucket },
    { key: 'FIREBASE_MESSAGING_SENDER_ID', val: firebaseConfig.messagingSenderId },
    { key: 'FIREBASE_APP_ID', val: firebaseConfig.appId },
  ];

  envVars.forEach(v => {
    if (!v.val) missingKeys.push(v.key);
  });

  return {
    isConfigured: missingKeys.length === 0,
    missingKeys,
    envVars
  };
};
