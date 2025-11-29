
import { Product, Order, StoreConfig } from '../types';
import { PRODUCTS } from '../constants';

const KEYS = {
  PRODUCTS: 'melkids_products',
  ORDERS: 'melkids_orders',
  CONFIG: 'melkids_config'
};

// Initial Config
const DEFAULT_CONFIG: StoreConfig = {
  storeName: 'MelKids',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Melkids_Logo.png',
  whatsappNumber: '244932853435'
};

export const dataService = {
  // PRODUCTS
  getProducts: (): Product[] => {
    const stored = localStorage.getItem(KEYS.PRODUCTS);
    if (!stored) {
      // Initialize with default data if empty
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(PRODUCTS));
      return PRODUCTS;
    }
    return JSON.parse(stored);
  },

  saveProduct: (product: Product) => {
    const products = dataService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    
    if (index >= 0) {
      products[index] = product;
    } else {
      // New ID generation
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      products.push({ ...product, id: newId });
    }
    
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    return products;
  },

  deleteProduct: (id: number) => {
    const products = dataService.getProducts().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    return products;
  },

  // ORDERS
  getOrders: (): Order[] => {
    const stored = localStorage.getItem(KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
  },

  saveOrder: (order: Order) => {
    const orders = dataService.getOrders();
    orders.unshift(order); // Add to top
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  },

  // CONFIG
  getConfig: (): StoreConfig => {
    const stored = localStorage.getItem(KEYS.CONFIG);
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  },

  saveConfig: (config: StoreConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },
  
  // RESET (For debugging)
  resetToDefaults: () => {
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.CONFIG);
    window.location.reload();
  }
};
