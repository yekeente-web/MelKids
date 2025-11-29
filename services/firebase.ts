import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

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

// Inicialização segura do Analytics (evita erro com AdBlock e erro de build top-level await)
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  // Executa a verificação sem bloquear o módulo (sem top-level await)
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(e => {
    console.warn("Analytics blocked or not supported:", e);
  });
}

export { analytics };

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