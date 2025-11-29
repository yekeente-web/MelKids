
import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Settings, Plus, Edit2, Trash2, Save, Image, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { Product, Order, StoreConfig } from '../../types';
import { dataService } from '../../services/dataService';

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<StoreConfig>({
      storeName: '',
      logoUrl: '',
      whatsappNumber: ''
  });

  // Editing State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    // Load Data
    setProducts(dataService.getProducts());
    setOrders(dataService.getOrders());
    setConfig(dataService.getConfig());
  }, [isAuthenticated]); // Reload when authed

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct.name) {
      const updatedList = dataService.saveProduct(editingProduct as Product);
      setProducts(updatedList);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const updatedList = dataService.deleteProduct(id);
      setProducts(updatedList);
    }
  };

  const handleSaveConfig = () => {
    dataService.saveConfig(config);
    alert('Configurações salvas!');
    window.location.reload(); // Reload to apply changes globally
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-mel-blue">Admin MelKids</h1>
            <p className="text-gray-500">Acesso restrito</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-mel-blue"
              placeholder="Senha de administrador"
            />
            <button type="submit" className="w-full bg-mel-blue text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                 <div className="bg-mel-blue text-white p-2 rounded-lg font-bold">MK</div>
                 <h1 className="font-bold text-gray-800 text-lg hidden sm:block">Painel Administrativo</h1>
            </div>
            <button onClick={() => window.location.href = '/'} className="text-sm text-gray-500 hover:text-mel-blue mr-4">
                Ir para Loja
            </button>
        </div>
      </header>

      <div className="flex flex-1 container mx-auto px-4 py-8 gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
            <button 
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'products' ? 'bg-mel-blue text-white shadow-lg shadow-mel-blue/20' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
                <Package size={20} /> Produtos
            </button>
            <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'orders' ? 'bg-mel-blue text-white shadow-lg shadow-mel-blue/20' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
                <ShoppingBag size={20} /> Pedidos <span className="ml-auto bg-white/20 text-xs px-2 py-0.5 rounded-full">{orders.length}</span>
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'settings' ? 'bg-mel-blue text-white shadow-lg shadow-mel-blue/20' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
                <Settings size={20} /> Configurações
            </button>
             <button 
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 mt-8"
            >
                <LogOut size={20} /> Sair
            </button>
        </aside>

        {/* Content */}
        <main className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            
            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Produtos</h2>
                        <button 
                            onClick={() => setEditingProduct({ id: 0, name: '', price: 0, category: 'Roupas', description: '', image: '', isNew: true, soldOut: false })}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                        >
                            <Plus size={20} /> Novo Produto
                        </button>
                    </div>

                    {/* Edit Modal / Form Overlay */}
                    {editingProduct && (
                        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                                <h3 className="text-xl font-bold mb-6">{editingProduct.id === 0 ? 'Adicionar Produto' : 'Editar Produto'}</h3>
                                <form onSubmit={handleSaveProduct} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                                            <input required className="w-full p-3 border rounded-lg bg-gray-50" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preço (Kz)</label>
                                            <input type="number" required className="w-full p-3 border rounded-lg bg-gray-50" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                                            <select className="w-full p-3 border rounded-lg bg-gray-50" value={editingProduct.category || 'Roupas'} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                                                <option value="Roupas">Roupas</option>
                                                <option value="Calçados">Calçados</option>
                                                <option value="Bebê">Bebê</option>
                                                <option value="Acessórios">Acessórios</option>
                                                <option value="Outros">Outros</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL da Imagem</label>
                                            <div className="flex gap-2">
                                                <input required className="w-full p-3 border rounded-lg bg-gray-50" value={editingProduct.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="https://..." />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                                        <textarea className="w-full p-3 border rounded-lg bg-gray-50 h-24" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                                    </div>

                                    <div className="flex gap-6 p-4 bg-gray-50 rounded-lg">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={editingProduct.isNew || false} onChange={e => setEditingProduct({...editingProduct, isNew: e.target.checked})} className="w-5 h-5 accent-mel-blue" />
                                            <span className="font-medium">Marcar como "Novo"</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={editingProduct.soldOut || false} onChange={e => setEditingProduct({...editingProduct, soldOut: e.target.checked})} className="w-5 h-5 accent-red-500" />
                                            <span className="font-medium text-red-500">Esgotado</span>
                                        </label>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <button type="button" onClick={() => setEditingProduct(null)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                                        <button type="submit" className="px-6 py-2 bg-mel-blue text-white font-bold rounded-lg hover:bg-blue-700">Salvar Produto</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-400 text-xs uppercase border-b">
                                    <th className="py-3 font-bold">Imagem</th>
                                    <th className="py-3 font-bold">Nome</th>
                                    <th className="py-3 font-bold">Categoria</th>
                                    <th className="py-3 font-bold">Preço</th>
                                    <th className="py-3 font-bold">Status</th>
                                    <th className="py-3 font-bold text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition group">
                                        <td className="py-3 pr-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                                <img src={p.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="py-3 font-medium text-gray-800">{p.name}</td>
                                        <td className="py-3">
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{p.category}</span>
                                        </td>
                                        <td className="py-3 font-bold text-gray-600">Kz {p.price.toLocaleString('pt-AO')}</td>
                                        <td className="py-3">
                                            {p.soldOut ? (
                                                <span className="text-red-500 text-xs font-bold uppercase border border-red-200 bg-red-50 px-2 py-1 rounded">Esgotado</span>
                                            ) : (
                                                <span className="text-green-500 text-xs font-bold uppercase border border-green-200 bg-green-50 px-2 py-1 rounded">Em Estoque</span>
                                            )}
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setEditingProduct(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                 <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Histórico de Pedidos</h2>
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <p className="text-gray-400">Nenhum pedido registrado ainda.</p>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="border rounded-xl p-4 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">{order.customer.name}</h3>
                                            <p className="text-sm text-gray-500">{order.customer.phone} • {order.customer.address}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-mel-blue">Kz {order.total.toLocaleString('pt-AO')}</span>
                                            <span className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-gray-600">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span>Kz {(item.price * item.quantity).toLocaleString('pt-AO')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                 </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
                <div className="space-y-6 max-w-xl">
                    <h2 className="text-2xl font-bold text-gray-800">Configurações da Loja</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Loja</label>
                            <input 
                                value={config.storeName}
                                onChange={e => setConfig({...config, storeName: e.target.value})}
                                className="w-full p-3 border rounded-xl"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Número do WhatsApp (com código do país, sem +)</label>
                            <input 
                                value={config.whatsappNumber}
                                onChange={e => setConfig({...config, whatsappNumber: e.target.value})}
                                className="w-full p-3 border rounded-xl"
                                placeholder="244932853435"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">URL do Logotipo</label>
                            <input 
                                value={config.logoUrl}
                                onChange={e => setConfig({...config, logoUrl: e.target.value})}
                                className="w-full p-3 border rounded-xl"
                            />
                            {config.logoUrl && (
                                <div className="mt-4 p-4 border rounded-xl bg-gray-50 text-center">
                                    <p className="text-xs text-gray-400 mb-2">Pré-visualização</p>
                                    <img src={config.logoUrl} className="h-16 mx-auto object-contain" />
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleSaveConfig}
                            className="w-full bg-mel-blue text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 transition flex items-center justify-center gap-2"
                        >
                            <Save size={20} /> Salvar Alterações
                        </button>
                    </div>
                </div>
            )}

        </main>
      </div>
    </div>
  );
};
