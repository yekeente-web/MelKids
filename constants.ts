import { Product, Category } from './types';

export const CATEGORIES: Category[] = ['Todos', 'Roupas', 'Calçados', 'Bebê', 'Acessórios'];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Conjunto Verão Colorido",
    price: 8500,
    category: 'Roupas',
    description: "Conjunto leve e fresco para dias de sol, feito com algodão sustentável. Perfeito para passeios no parque.",
    image: "https://picsum.photos/600/600?random=1",
    isNew: true
  },
  {
    id: 2,
    name: "Tênis Infantil Conforto",
    price: 12000,
    category: 'Calçados',
    description: "Tênis ortopédico com cores vibrantes, ideal para brincar o dia todo sem cansar os pezinhos.",
    image: "https://picsum.photos/600/600?random=2"
  },
  {
    id: 3,
    name: "Pacote Fraldas Premium",
    price: 6000,
    category: 'Bebê',
    description: "Pacote com 40 unidades, super absorção e toque suave para a pele delicada do bebê.",
    image: "https://picsum.photos/600/600?random=3",
    soldOut: true
  },
  {
    id: 4,
    name: "Vestido Floral Encanto",
    price: 10500,
    category: 'Roupas',
    description: "Vestido rodado com estampa floral exclusiva MelKids. Tecido leve que não amassa.",
    image: "https://picsum.photos/600/600?random=4"
  },
  {
    id: 5,
    name: "Mochila Escolar Leãozinho",
    price: 14000,
    category: 'Acessórios',
    description: "Mochila resistente e divertida em formato de leãozinho. Espaço amplo para cadernos e lancheira.",
    image: "https://picsum.photos/600/600?random=5",
    isNew: true
  },
  {
    id: 6,
    name: "Kit 3 Babadores",
    price: 3500,
    category: 'Bebê',
    description: "Babadores fáceis de limpar com estampas divertidas. Material impermeável.",
    image: "https://picsum.photos/600/600?random=6"
  },
  {
    id: 7,
    name: "Sandália Papete Aventura",
    price: 7800,
    category: 'Calçados',
    description: "Perfeita para o verão, solado antiderrapante e tiras ajustáveis para maior segurança.",
    image: "https://picsum.photos/600/600?random=7"
  },
  {
    id: 8,
    name: "Boné MelKids Oficial",
    price: 4500,
    category: 'Acessórios',
    description: "Proteção contra o sol com muito estilo. Tamanho ajustável.",
    image: "https://picsum.photos/600/600?random=8",
    soldOut: true
  },
   {
    id: 9,
    name: "Macacão Inverno Quentinho",
    price: 15000,
    category: 'Roupas',
    description: "Macacão peluciado internamente para manter seu pequeno aquecido nos dias mais frios.",
    image: "https://picsum.photos/600/600?random=9"
  },
  {
    id: 10,
    name: "Chupeta Ergonômica",
    price: 2500,
    category: 'Bebê',
    description: "Livre de BPA, design que respeita o desenvolvimento oral da criança.",
    image: "https://picsum.photos/600/600?random=10"
  },
  {
    id: 11,
    name: "Laço de Cabelo Gigante",
    price: 2000,
    category: 'Acessórios',
    description: "O toque final perfeito para qualquer look. Disponível em várias cores.",
    image: "https://picsum.photos/600/600?random=11"
  },
  {
    id: 12,
    name: "Bota de Chuva Colorida",
    price: 9500,
    category: 'Calçados',
    description: "Para pular nas poças d'água sem molhar as meias! Material 100% impermeável.",
    image: "https://picsum.photos/600/600?random=12"
  }
];