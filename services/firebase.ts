import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// Reads from Vercel Environment Variables (Secure)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Check if keys are present to prevent crash on initialize
const hasKeys = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app: any;
let db: any;
let storage: any;
let auth: any;

if (hasKeys) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase init error:", error);
  }
}

// Helper to ensure user is authenticated (anonymously) before operations
// This fixes "Missing or insufficient permissions" errors on Storage/Firestore
export const ensureAuth = async () => {
  if (auth && !auth.currentUser) {
    try {
      await signInAnonymously(auth);
      console.log("Authenticated anonymously for database access");
    } catch (error) {
      console.error("Auth error:", error);
    }
  }
};

// Safe Analytics Initialization
let analytics: Analytics | null = null;

if (typeof window !== 'undefined' && app) {
  isSupported().then(supported => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Analytics blocked by client");
      }
    }
  }).catch(() => {});
}

export { db, storage, auth, analytics };

// Helper to check configuration status in Admin Dashboard
export const getConfigStatus = () => {
  const envVars = [
    { key: 'FIREBASE_API_KEY', val: firebaseConfig.apiKey },
    { key: 'FIREBASE_AUTH_DOMAIN', val: firebaseConfig.authDomain },
    { key: 'FIREBASE_PROJECT_ID', val: firebaseConfig.projectId },
    { key: 'FIREBASE_STORAGE_BUCKET', val: firebaseConfig.storageBucket },
    { key: 'FIREBASE_MESSAGING_SENDER_ID', val: firebaseConfig.messagingSenderId },
    { key: 'FIREBASE_APP_ID', val: firebaseConfig.appId },
  ];

  const missingKeys = envVars.filter(v => !v.val).map(v => v.key);

  return {
    isConfigured: missingKeys.length === 0,
    missingKeys,
    envVars
  };
};
