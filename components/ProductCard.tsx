import React from 'react';
import { Plus, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div 
      onClick={() => onClick(product)}
      className={`
        bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border border-gray-100 cursor-pointer
        ${product.soldOut ? 'opacity-75 grayscale-[0.5]' : ''}
      `}
    >
      <div className="relative overflow-hidden aspect-[4/5] bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && !product.soldOut && (
            <span className="bg-mel-green text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm tracking-wider">
              Novo
            </span>
          )}
          {product.soldOut && (
            <span className="bg-gray-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm tracking-wider">
              Esgotado
            </span>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Eye size={16} /> Ver Detalhes
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-[10px] font-bold text-mel-blue mb-2 uppercase tracking-widest opacity-60">
          {product.category}
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight group-hover:text-mel-blue transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <span className="text-xs text-gray-400 block mb-0.5">Preço</span>
            <span className="text-xl font-extrabold text-gray-900">
              Kz {product.price.toLocaleString('pt-AO')}
            </span>
          </div>
          
          {!product.soldOut && (
            <div className="w-8 h-8 rounded-full bg-mel-orange text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Plus size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};