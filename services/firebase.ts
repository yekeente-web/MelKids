
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Configuração fornecida pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyBuocEfXJsrdYkg7wfvrC-vUu5X9VNo6mI",
  authDomain: "melkids-2ff33.firebaseapp.com",
  projectId: "melkids-2ff33",
  storageBucket: "melkids-2ff33.firebasestorage.app",
  messagingSenderId: "394463672064",
  appId: "1:394463672064:web:1fe1032c9ddf60dead65e5",
  measurementId: "G-LHEG5MWL3J"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços para serem usados no resto do site
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Informa ao sistema que está tudo configurado
export const isConfigured = true;

// Função auxiliar para o AdminDashboard não bloquear o acesso
export const getConfigStatus = () => {
  return {
    isConfigured: true,
    missingKeys: [],
    envVars: []
  };
};
