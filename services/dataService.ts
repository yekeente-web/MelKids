
import { Product, Order, StoreConfig } from '../types';
import { PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from '../constants';

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
    // Fallback to Base64 since Firebase is removed
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  },

  // --- CATEGORIES ---
  getCategories: async (): Promise<string[]> => {
    return localStore.getCategories();
  },

  saveCategories: async (categories: string[]): Promise<void> => {
    localStore.saveCategories(categories);
  },

  // --- PRODUCTS ---
  getProducts: async (): Promise<Product[]> => {
    return localStore.getProducts();
  },

  saveProduct: async (product: Product): Promise<void> => {
    const products = localStore.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      // Ensure unique ID
      const newId = product.id === 0 ? Date.now() : product.id;
      products.push({ ...product, id: newId });
    }
    localStore.saveProducts(products);
  },

  deleteProduct: async (id: number): Promise<void> => {
    const products = localStore.getProducts().filter(p => p.id !== id);
    localStore.saveProducts(products);
  },

  // --- ORDERS ---
  getOrders: async (): Promise<Order[]> => {
    return localStore.getOrders();
  },

  saveOrder: async (order: Order): Promise<void> => {
    const orders = localStore.getOrders();
    orders.unshift(order);
    localStore.saveOrders(orders);
  },

  // --- CONFIG ---
  getConfig: async (): Promise<StoreConfig> => {
    return localStore.getConfig();
  },

  saveConfig: async (config: StoreConfig): Promise<void> => {
     localStore.saveConfig(config);
  }
};
