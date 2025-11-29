
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string; // Changed from rigid type to string to allow custom categories
  description: string;
  image: string;
  isNew?: boolean;
  soldOut?: boolean;
}

export type Category = 'Todos' | 'Roupas' | 'Calçados' | 'Bebê' | 'Acessórios' | string;

export interface CartItem extends Product {
  quantity: number;
}

export interface UserDetails {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  date: string;
  customer: UserDetails;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface StoreConfig {
  storeName: string;
  logoUrl: string;
  whatsappNumber: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
