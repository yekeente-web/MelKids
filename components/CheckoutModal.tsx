import React, { useState } from 'react';
import { X, Smartphone, MapPin, User, FileText, MessageCircle } from 'lucide-react';
import { UserDetails, CartItem, StoreConfig } from '../types';
import { dataService } from '../services/dataService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  clearCart: () => void;
  storeConfig: StoreConfig;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, clearCart, storeConfig }) => {
  const [formData, setFormData] = useState<UserDetails>({
    name: '',
    phone: '',
    address: ''
  });

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Save Order to Admin History
    const orderId = `#${Math.floor(Math.random() * 10000)}`;
    
    await dataService.saveOrder({
      id: orderId,
      date: new Date().toISOString(),
      customer: formData,
      items: cart,
      total: total,
      status: 'pending'
    });

    // 2. Format the message for WhatsApp
    const itemsList = cart.map(item => 
      `• ${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toLocaleString('pt-AO')} Kz`
    ).join('\n');

    const message = `*Novo Pedido - ${storeConfig.storeName}* 🧸\n` +
      `*Pedido:* ${orderId}\n\n` +
      `*Dados do Cliente:*\n` +
      `👤 Nome: ${formData.name}\n` +
      `📱 Telefone: ${formData.phone}\n` +
      `📍 Endereço: ${formData.address}\n\n` +
      `*Itens do Pedido:*\n${itemsList}\n\n` +
      `*Total a Pagar: ${total.toLocaleString('pt-AO')} Kz*\n\n` +
      `--------------------------------\n` +
      `ℹ️ _Pagamento por transferência._\n` +
      `_Envio o comprovativo em seguida!_ 👇`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${storeConfig.whatsappNumber}?text=${encodedMessage}`;

    // 3. Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // 4. Clear cart and close
    clearCart();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="bg-white p-6 border-b flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Finalizar Pedido</h2>
                <p className="text-xs text-gray-500">Enviar pedido via WhatsApp</p>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                <span className="text-gray-600 text-sm font-medium">{cart.length} itens no carrinho</span>
                <span className="font-bold text-mel-blue text-lg">{total.toLocaleString('pt-AO')} Kz</span>
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
                    Pagamento
                </h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    Ao confirmar, você será redirecionado para o WhatsApp. Envie o comprovativo de transferência para o IBAN abaixo:
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
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transform transition active:scale-[0.98] text-lg flex items-center justify-center gap-2"
              >
                <MessageCircle size={24} />
                Confirmar no WhatsApp
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};