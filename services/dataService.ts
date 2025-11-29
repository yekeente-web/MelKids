import { Product, Order, StoreConfig } from '../types';
import { PRODUCTS } from '../constants';
import { db, isConfigured } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, addDoc, query, orderBy } from 'firebase/firestore';

const KEYS = {
  PRODUCTS: 'melkids_products',
  ORDERS: 'melkids_orders',
  CONFIG: 'melkids_config'
};

const DEFAULT_CONFIG: StoreConfig = {
  storeName: 'MelKids',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Melkids_Logo.png',
  whatsappNumber: '244932853435'
};

// HELPER: LocalStorage implementation
const localStore = {
  getProducts: (): Product[] => {
    const stored = localStorage.getItem(KEYS.PRODUCTS);
    if (!stored) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(PRODUCTS));
      return PRODUCTS;
    }
    return JSON.parse(stored);
  },
  saveProducts: (products: Product[]) => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products)),
  
  getOrders: (): Order[] => {
    const stored = localStorage.getItem(KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
  },
  saveOrders: (orders: Order[]) => localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders)),

  getConfig: (): StoreConfig => {
    const stored = localStorage.getItem(KEYS.CONFIG);
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  },
  saveConfig: (config: StoreConfig) => localStorage.setItem(KEYS.CONFIG, JSON.stringify(config))
};

export const dataService = {
  // --- PRODUCTS ---
  getProducts: async (): Promise<Product[]> => {
    if (isConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        if (querySnapshot.empty) {
          // Se estiver vazio no Firebase, opcional: seedar com dados iniciais
          // Para evitar complexidade agora, retornamos array vazio ou seed manual
          return [];
        }
        return querySnapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as Product));
      } catch (e) {
        console.error("Firebase Read Error", e);
        return localStore.getProducts();
      }
    }
    return localStore.getProducts();
  },

  saveProduct: async (product: Product): Promise<void> => {
    if (isConfigured && db) {
      try {
        // Se id for 0, gera novo ID
        let idToSave = product.id;
        if (idToSave === 0) {
           idToSave = Date.now(); // Simple ID generation
        }
        await setDoc(doc(db, 'products', String(idToSave)), { ...product, id: idToSave });
        return;
      } catch (e) {
        console.error("Firebase Write Error", e);
      }
    }
    
    // Fallback LocalStorage Logic
    const products = localStore.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      products.push({ ...product, id: newId });
    }
    localStore.saveProducts(products);
  },

  deleteProduct: async (id: number): Promise<void> => {
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db, 'products', String(id)));
        return;
      } catch(e) { console.error(e) }
    }

    const products = localStore.getProducts().filter(p => p.id !== id);
    localStore.saveProducts(products);
  },

  // --- ORDERS ---
  getOrders: async (): Promise<Order[]> => {
    if (isConfigured && db) {
       try {
         const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
         const querySnapshot = await getDocs(q);
         return querySnapshot.docs.map(doc => doc.data() as Order);
       } catch (e) { console.error(e) }
    }
    return localStore.getOrders();
  },

  saveOrder: async (order: Order): Promise<void> => {
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'orders', order.id), order);
        return;
      } catch (e) { console.error(e) }
    }
    
    const orders = localStore.getOrders();
    orders.unshift(order);
    localStore.saveOrders(orders);
  },

  // --- CONFIG ---
  getConfig: async (): Promise<StoreConfig> => {
    if (isConfigured && db) {
      try {
        const docSnap = await getDocs(collection(db, 'config'));
        if (!docSnap.empty) {
          return docSnap.docs[0].data() as StoreConfig;
        }
      } catch (e) { console.error(e) }
    }
    return localStore.getConfig();
  },

  saveConfig: async (config: StoreConfig): Promise<void> => {
     if (isConfigured && db) {
       try {
         // Sempre sobrescreve o doc 'main'
         await setDoc(doc(db, 'config', 'main'), config);
         return;
       } catch (e) { console.error(e) }
     }
     localStore.saveConfig(config);
  }
};