import { Product, Order, StoreConfig } from '../types';
import { PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from '../constants';
import { db, storage, isConfigured } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const KEYS = {
  PRODUCTS: 'melkids_products',
  ORDERS: 'melkids_orders',
  CONFIG: 'melkids_config',
  CATEGORIES: 'melkids_categories'
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
  saveConfig: (config: StoreConfig) => localStorage.setItem(KEYS.CONFIG, JSON.stringify(config)),

  getCategories: (): string[] => {
    const stored = localStorage.getItem(KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  },
  saveCategories: (categories: string[]) => localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories))
};

export const dataService = {
  // --- UPLOAD ---
  uploadImage: async (file: File): Promise<string> => {
    if (isConfigured && storage) {
      try {
        const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      } catch (e) {
        console.error("Upload Error", e);
        throw new Error("Falha ao fazer upload da imagem.");
      }
    }
    throw new Error("Armazenamento não configurado.");
  },

  // --- CATEGORIES ---
  getCategories: async (): Promise<string[]> => {
    if (isConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'config', 'categories'));
        if (docSnap.exists()) {
          return docSnap.data().list as string[];
        }
        return DEFAULT_CATEGORIES;
      } catch (e) { console.error(e) }
    }
    return localStore.getCategories();
  },

  saveCategories: async (categories: string[]): Promise<void> => {
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'config', 'categories'), { list: categories });
        return;
      } catch (e) { console.error(e) }
    }
    localStore.saveCategories(categories);
  },

  // --- PRODUCTS ---
  getProducts: async (): Promise<Product[]> => {
    if (isConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        if (querySnapshot.empty) {
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
        let idToSave = product.id;
        if (idToSave === 0) {
           idToSave = Date.now();
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
          // Check if main config exists among docs (handling potential multiple docs structure)
          // Simplified: Assume 'main' doc ID or first doc
          const mainDoc = docSnap.docs.find(d => d.id === 'main') || docSnap.docs[0];
          
          // Filter out 'categories' doc if it was fetched in the collection query by mistake
          if (mainDoc.id !== 'categories') {
             return mainDoc.data() as StoreConfig;
          }
           // Explicit fetch if needed
           const explicitMain = await getDoc(doc(db, 'config', 'main'));
           if(explicitMain.exists()) return explicitMain.data() as StoreConfig;
        }
      } catch (e) { console.error(e) }
    }
    return localStore.getConfig();
  },

  saveConfig: async (config: StoreConfig): Promise<void> => {
     if (isConfigured && db) {
       try {
         await setDoc(doc(db, 'config', 'main'), config);
         return;
       } catch (e) { console.error(e) }
     }
     localStore.saveConfig(config);
  }
};