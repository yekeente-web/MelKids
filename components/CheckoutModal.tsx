import React, { useState } from 'react';
import { X, CheckCircle, Smartphone, MapPin, User, FileText } from 'lucide-react';
import { UserDetails, CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  clearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, clearCart }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState<UserDetails>({
    name: '',
    phone: '',
    address: ''
  });

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setStep('success');
      clearCart();
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="bg-white p-6 border-b flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Finalizar Pedido</h2>
                <p className="text-xs text-gray-500">Preencha seus dados para entrega</p>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                <span className="text-gray-600 text-sm font-medium">{cart.length} itens no carrinho</span>
                <span className="font-bold text-mel-blue text-lg">Kz {total.toLocaleString('pt-AO')}</span>
              </div>

              {/* Personal Info */}
              <div className="space-y-5">
                <div className="relative">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nome Completo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                        required name="name" value={formData.name} onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-mel-blue/20 focus:border-mel-blue outline-none transition" 
                        placeholder="Seu nome"
                        />
                    </div>
                </div>

                <div className="relative">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Telefone</label>
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                        required name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-mel-blue/20 focus:border-mel-blue outline-none transition" 
                        placeholder="9XX XXX XXX"
                        type="tel"
                        />
                    </div>
                </div>

                 <div className="relative">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Endereço de Entrega</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <textarea 
                        required name="address" value={formData.address} onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-mel-blue/20 focus:border-mel-blue outline-none transition min-h-[80px] resize-none" 
                        placeholder="Bairro, Rua, Ponto de referência..."
                        />
                    </div>
                </div>
              </div>

              {/* IBAN Payment Info */}
              <div className="bg-mel-blue/5 border border-mel-blue/10 p-5 rounded-2xl">
                <h3 className="font-bold text-mel-blue flex items-center gap-2 mb-3">
                    <FileText size={18} />
                    Pagamento por Transferência
                </h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    Faça a transferência do valor total para o IBAN abaixo e aguarde nosso contato para envio do comprovativo.
                </p>
                <div className="bg-white p-3 rounded-xl border border-dashed border-mel-blue/30 text-center">
                    <p className="text-xs text-gray-400 uppercase">IBAN (BAI)</p>
                    <p className="font-mono font-bold text-lg text-gray-800 tracking-wider">AO06 0040 0000 1234 5678 9012 3</p>
                    <p className="text-xs text-gray-500 mt-1">Titular: MelKids Angola Lda.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto">
              <button 
                type="submit"
                className="w-full bg-mel-green hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transform transition active:scale-[0.98] text-lg flex items-center justify-center gap-2"
              >
                Confirmar Pedido
              </button>
            </div>
          </form>
        ) : (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido Realizado!</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed">
              Obrigado, <strong>{formData.name}</strong>! Entraremos em contato pelo telefone <strong>{formData.phone}</strong> para confirmar o pagamento e a entrega.
            </p>
            <button 
              onClick={onClose}
              className="bg-mel-blue text-white font-bold py-3 px-10 rounded-full hover:bg-blue-700 transition shadow-lg"
            >
              Voltar para Loja
            </button>
          </div>
        )}
      </div>
    </div>
  );
};