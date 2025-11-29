export interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
  isNew?: boolean;
  soldOut?: boolean;
}

export type Category = 'Todos' | 'Roupas' | 'Calçados' | 'Bebê' | 'Acessórios';

export interface CartItem extends Product {
  quantity: number;
}

export interface UserDetails {
  name: string;
  phone: string;
  address: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}