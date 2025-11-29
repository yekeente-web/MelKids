
import { collection, getDocs, setDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Product, Order, StoreConfig } from '../types';
import { PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from '../constants';

const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CONFIG: 'store_config',
  CATEGORIES: 'categories'
};

const DEFAULT_CONFIG: StoreConfig = {
  storeName: 'MelKids',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Melkids_Logo.png',
  whatsappNumber: '244932853435'
};

export const dataService = {
  // --- UPLOAD ---
  uploadImage: async (file: File, folder: string = 'products'): Promise<string> => {
    if (!storage) throw new Error("Firebase Storage não configurado.");
    
    // Client-side validation for better UX
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("A imagem é muito grande. O tamanho máximo é 5MB.");
    }
    
    const storageRef = ref(storage, `${folder}/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // --- CATEGORIES ---
  getCategories: async (): Promise<string[]> => {
    if (!db) return DEFAULT_CATEGORIES;
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return data.list || DEFAULT_CATEGORIES;
      }
      return DEFAULT_CATEGORIES;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories: async (categories: string[]): Promise<void> => {
    if (!db) throw new Error("Banco de dados não conectado.");
    // Saving as a single document for simplicity
    await setDoc(doc(db, COLLECTIONS.CATEGORIES, 'main'), { list: categories });
  },

  // --- PRODUCTS ---
  getProducts: async (): Promise<Product[]> => {
    if (!db) return []; 
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push(doc.data() as Product);
      });
      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  saveProduct: async (product: Product): Promise<void> => {
    if (!db) throw new Error("Banco de dados não conectado.");
    // Ensure ID exists
    const id = product.id === 0 ? Date.now() : product.id;
    const finalProduct = { ...product, id };
    
    await setDoc(doc(db, COLLECTIONS.PRODUCTS, String(id)), finalProduct);
  },

  // Bulk Import
  importProductsBatch: async (products: Product[]): Promise<void> => {
    if (!db) throw new Error("Banco de dados não conectado.");
    
    const promises = products.map(product => {
        const id = product.id || Date.now() + Math.floor(Math.random() * 1000);
        const finalProduct = { ...product, id };
        return setDoc(doc(db, COLLECTIONS.PRODUCTS, String(id)), finalProduct);
    });

    await Promise.all(promises);
  },

  deleteProduct: async (id: number): Promise<void> => {
    if (!db) throw new Error("Banco de dados não conectado.");
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, String(id)));
  },

  // --- ORDERS ---
  getOrders: async (): Promise<Order[]> => {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTIONS.ORDERS)); 
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        orders.push(doc.data() as Order);
      });
      // Manual sort
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  saveOrder: async (order: Order): Promise<void> => {
    if (!db) throw new Error("Banco de dados não conectado.");
    await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), order);
  },

  // --- CONFIG ---
  getConfig: async (): Promise<StoreConfig> => {
    if (!db) return DEFAULT_CONFIG;
    try {
      const docSnap = await getDocs(collection(db, COLLECTIONS.CONFIG));
      if (!docSnap.empty) {
        return docSnap.docs[0].data() as StoreConfig;
      }
      return DEFAULT_CONFIG;
    } catch (error) {
      return DEFAULT_CONFIG;
    }
  },

  saveConfig: async (config: StoreConfig): Promise<void> => {
     if (!db) throw new Error("Banco de dados não conectado.");
     await setDoc(doc(db, COLLECTIONS.CONFIG, 'main'), config);
  }
};
