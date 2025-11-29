import React from 'react';
import { X, ShoppingCart, Check, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-scale-up">
        {/* Close Button Mobile */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full md:hidden text-gray-800"
        >
          <X size={24} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-100 relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-full h-64 md:h-full object-cover ${product.soldOut ? 'grayscale-[0.5]' : ''}`}
          />
          {product.soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
               <span className="bg-gray-900 text-white text-xl font-bold px-6 py-2 rounded-full shadow-lg border-2 border-white transform -rotate-12 uppercase tracking-widest">
                  Esgotado
               </span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 p-8 flex flex-col h-full overflow-y-auto bg-white">
          <div className="flex justify-between items-start mb-2">
            <span className="text-mel-blue font-bold tracking-widest text-xs uppercase bg-mel-blue/10 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <button 
              onClick={onClose} 
              className="hidden md:block p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-800 transition"
            >
              <X size={24} />
            </button>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h2>
          
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-3xl font-extrabold text-mel-green">
              {product.price.toLocaleString('pt-AO')} Kz
            </span>
            {product.isNew && (
                <span className="text-sm font-bold text-mel-pink animate-pulse">
                    ✨ Novidade Exclusiva
                </span>
            )}
          </div>

          <div className="prose prose-sm text-gray-600 mb-8 leading-relaxed">
            <p>{product.description}</p>
          </div>
          
          <div className="mt-auto space-y-4">
             {/* Features/Badges (Mock) */}
             <div className="grid grid-cols-2 gap-3 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                    <Check size={16} className="text-mel-green" /> Alta Qualidade
                </div>
                <div className="flex items-center gap-2">
                    <Check size={16} className="text-mel-green" /> Entrega Rápida
                </div>
                <div className="flex items-center gap-2">
                    <Check size={16} className="text-mel-green" /> Compra Segura
                </div>
                <div className="flex items-center gap-2">
                    <Check size={16} className="text-mel-green" /> Troca Grátis
                </div>
             </div>

            {product.soldOut ? (
                <button 
                    disabled
                    className="w-full bg-gray-200 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                    Produto Indisponível
                </button>
            ) : (
                <button 
                    onClick={() => {
                        onAddToCart(product);
                        onClose();
                    }}
                    className="w-full bg-mel-orange hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transform transition hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 text-lg"
                >
                    <ShoppingCart size={24} />
                    Adicionar ao Carrinho
                </button>
            )}
            
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <Info size={12} />
                Dúvidas? Use o chat para falar com a gente!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};