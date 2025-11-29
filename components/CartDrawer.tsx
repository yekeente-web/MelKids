import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, delta: number) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  onRemove, 
  onUpdateQuantity,
  onCheckout
}) => {
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
              <ShoppingBag size={24} className="text-mel-blue" />
              Carrinho
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
              <X size={24} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                    <ShoppingBag size={32} className="opacity-20" />
                </div>
                <div>
                    <p className="text-lg font-semibold text-gray-600">Seu carrinho está vazio.</p>
                    <p className="text-sm">Explore nossa loja e encontre algo especial!</p>
                </div>
                <button onClick={onClose} className="mt-4 text-mel-blue font-bold hover:underline">
                    Começar a comprar
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{item.name}</h3>
                        <p className="text-mel-blue font-bold text-sm">{item.price.toLocaleString('pt-AO')} Kz</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition font-bold"
                        >-</button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition font-bold"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => onRemove(item.id)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-gray-500 text-sm">
                    <span>Subtotal</span>
                    <span>{total.toLocaleString('pt-AO')} Kz</span>
                </div>
                <div className="flex justify-between items-center text-xl font-extrabold text-gray-900">
                    <span>Total</span>
                    <span>{total.toLocaleString('pt-AO')} Kz</span>
                </div>
              </div>
              <button 
                onClick={onCheckout}
                className="w-full bg-mel-blue hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-mel-blue/20 transform transition active:scale-95 flex items-center justify-center gap-2"
              >
                Finalizar Compra
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};