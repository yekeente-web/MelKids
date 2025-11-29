
import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Settings, Plus, Edit2, Trash2, Save, LogOut, List, UploadCloud, AlertTriangle, ExternalLink, CheckCircle2, XCircle, FileInput, Image as ImageIcon } from 'lucide-react';
import { Product, Order, StoreConfig } from '../../types';
import { dataService } from '../../services/dataService';
import { getConfigStatus } from '../../services/firebase';

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings' | 'categories'>('products');
  
  // Config Status
  const configStatus = getConfigStatus();
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [config, setConfig] = useState<StoreConfig>({
      storeName: '',
      logoUrl: '',
      whatsappNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Editing State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Bulk Import State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [p, o, c, cats] = await Promise.all([
            dataService.getProducts(),
            dataService.getOrders(),
            dataService.getConfig(),
            dataService.getCategories()
        ]);
        setProducts(p);
        setOrders(o);
        setConfig(c);
        setCategories(cats.filter(c => c !== 'Todos')); 
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct.name) {
      await dataService.saveProduct(editingProduct as Product);
      await fetchData(); 
      setEditingProduct(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
        // Validation Size
        if (file.size > 5 * 1024 * 1024) {
            alert("A imagem é muito grande! Máximo 5MB.");
            return;
        }

        setIsUploading(true);
        try {
            const url = await dataService.uploadImage(file, 'products');
            setEditingProduct({ ...editingProduct, image: url });
        } catch (error: any) {
            alert(error.message || 'Erro ao enviar imagem.');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) {
              alert("A imagem é muito grande! Máximo 5MB.");
              return;
          }

          setIsUploadingLogo(true);
          try {
              const url = await dataService.uploadImage(file, 'logos');
              setConfig({ ...config, logoUrl: url });
          } catch (error: any) {
              alert("Erro ao enviar logo: " + error.message);
          } finally {
              setIsUploadingLogo(false);
          }
      }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await dataService.deleteProduct(id);
      await fetchData();
    }
  };

  const handleSaveConfig = async () => {
    await dataService.saveConfig(config);
    alert('Configurações salvas!');
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const updated = [...categories, newCategoryName.trim()];
    await dataService.saveCategories(updated);
    setCategories(updated);
    setNewCategoryName('');
  };

  const handleDeleteCategory = async (cat: string) => {
    if (confirm(`Remover categoria "${cat}"?`)) {
        const updated = categories.filter(c => c !== cat);
        await dataService.saveCategories(updated);
        setCategories(updated);
    }
  };

  const handleBulkImport = async () => {
      try {
          const parsed = JSON.parse(bulkJson);
          if (!Array.isArray(parsed)) throw new Error("O JSON deve ser uma lista []");
          
          setIsLoading(true);
          await dataService.importProductsBatch(parsed);
          alert(`${parsed.length} produtos importados com sucesso!`);
          setBulkJson('');
          setIsBulkModalOpen(false);
          await fetchData();
      } catch (error: any) {
          alert("Erro na importação: " + error.message);
      } finally {
          setIsLoading(false);
      }
  };

  // ------------------------------------------------------------------
  // CONFIG SETUP WIZARD
  // ------------------------------------------------------------------
  if (isAuthenticated && !configStatus.isConfigured) {
      return (
          <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
              <div className="bg-white max-w-2xl w-full p-8 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-3 mb-6 text-red-500">
                      <AlertTriangle size={32} />
                      <h1 className="text-2xl font-bold">Configuração Necessária</h1>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                      Para que o Painel Admin funcione e salve os dados de verdade, você precisa conectar o <b>Google Firebase</b>.
                  </p>
                  <div className="bg-gray-100 p-4 rounded-xl mb-6 font-mono text-xs overflow-x-auto">
                      {configStatus.envVars.map((v, i) => (
                          <div key={i} className={`flex justify-between py-1 border-b border-gray-200 last:border-0 ${!v.val ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                              <span>{v.key}</span>
                              <span>{v.val ? 'OK' : 'FALTANDO'}</span>
                          </div>
                      ))}
                  </div>
                  <button onClick={() => window.location.reload()} className="w-full bg-mel-blue text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition">
                      Já adicionei, recarregar página
                  </button>
              </div>
          </div>
      )
  }

  // ------------------------------------------------------------------
  // LOGIN SCREEN
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // DASHBOARD MAIN
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                 <div className="bg-mel-blue text-white p-2 rounded-lg font-bold">MK</div>
                 <h1 className="font-bold text-gray-800 text-lg hidden sm:block">Painel Administrativo</h1>
                 <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 size={12}/> Online
                 </span>
            </div>
            <div className="flex items-center gap-4">
                {isLoading && <span className="text-xs text-mel-blue animate-pulse">Sincronizando...</span>}
                <button onClick={() => window.location.href = '/'} className="text-sm text-gray-500 hover:text-mel-blue mr-4">
                    Ir para Loja
                </button>
            </div>
        </div>
      </header>

      <div className="flex flex-1 container mx-auto px-4 py-8 gap-8 flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
            <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'products' ? 'bg-mel-blue text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                <Package size={20} /> Produtos
            </button>
            <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'categories' ? 'bg-mel-blue text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                <List size={20} /> Categorias
            </button>
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'orders' ? 'bg-mel-blue text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                <ShoppingBag size={20} /> Pedidos <span className="ml-auto bg-white/20 text-xs px-2 py-0.5 rounded-full">{orders.length}</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'settings' ? 'bg-mel-blue text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                <Settings size={20} /> Configurações
            </button>
             <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 mt-8">
                <LogOut size={20} /> Sair
            </button>
        </aside>

        {/* Content */}
        <main className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            
            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Produtos</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setIsBulkModalOpen(true)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                                <FileInput size={20} /> Importar em Massa
                            </button>
                            <button onClick={() => setEditingProduct({ id: 0, name: '', price: 0, category: categories[0] || 'Roupas', description: '', image: '', isNew: true, soldOut: false })} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                                <Plus size={20} /> Novo Produto
                            </button>
                        </div>
                    </div>

                    {/* Bulk Import Modal */}
                    {isBulkModalOpen && (
                        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold">Importação em Massa (JSON)</h3>
                                    <button onClick={() => setIsBulkModalOpen(false)}><XCircle className="text-gray-400 hover:text-gray-600" /></button>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">Cole aqui uma lista JSON de produtos. Exemplo:</p>
                                <pre className="bg-gray-100 p-3 rounded-lg text-xs text-gray-600 mb-4 overflow-x-auto">
{`[
  {
    "name": "Produto Exemplo",
    "price": 5000,
    "category": "Roupas",
    "description": "Descrição do produto...",
    "image": "https://link-da-imagem.com/foto.jpg"
  }
]`}
                                </pre>
                                <textarea className="flex-1 p-4 border rounded-xl bg-gray-50 font-mono text-sm mb-4 h-64" placeholder="Cole seu JSON aqui..." value={bulkJson} onChange={e => setBulkJson(e.target.value)}/>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setIsBulkModalOpen(false)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                                    <button onClick={handleBulkImport} className="px-6 py-2 bg-mel-blue text-white font-bold rounded-lg hover:bg-blue-700">Importar Produtos</button>
                                </div>
                            </div>
                        </div>
                    )}

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
                                            <select className="w-full p-3 border rounded-lg bg-gray-50" value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagem do Produto</label>
                                            <div className="flex flex-col gap-2">
                                                {editingProduct.image && (
                                                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border">
                                                        <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => setEditingProduct({...editingProduct, image: ''})} className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 shadow-sm"><Trash2 size={16} /></button>
                                                    </div>
                                                )}
                                                {!editingProduct.image && (
                                                    <label className={`w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition ${isUploading ? 'bg-gray-100 border-gray-300' : 'border-mel-blue/30 hover:bg-mel-blue/5'}`}>
                                                        {isUploading ? (
                                                            <div className="flex flex-col items-center"><div className="w-8 h-8 border-4 border-mel-blue border-t-transparent rounded-full animate-spin mb-2"></div><span className="text-xs text-gray-500">Enviando...</span></div>
                                                        ) : (
                                                            <><UploadCloud className="text-mel-blue mb-2" size={32} /><span className="text-sm font-bold text-gray-600">Clique para enviar foto</span><span className="text-xs text-gray-400 mt-1">PNG, JPG (Máx 5MB)</span></>
                                                        )}
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                                    </label>
                                                )}
                                                <input className="w-full p-2 text-xs border rounded bg-gray-50 text-gray-400" value={editingProduct.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="Ou cole o link da imagem aqui..." />
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
                                        <button type="submit" disabled={isUploading} className="px-6 py-2 bg-mel-blue text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                            {isUploading ? 'Aguarde...' : 'Salvar Produto'}
                                        </button>
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
                                        <td className="py-3 font-bold text-gray-600">{p.price.toLocaleString('pt-AO')} Kz</td>
                                        <td className="py-3">
                                            {p.soldOut ? <span className="text-red-500 text-xs font-bold uppercase border border-red-200 bg-red-50 px-2 py-1 rounded">Esgotado</span> : <span className="text-green-500 text-xs font-bold uppercase border border-green-200 bg-green-50 px-2 py-1 rounded">Em Estoque</span>}
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

            {/* CATEGORIES TAB */}
             {activeTab === 'categories' && (
                <div className="space-y-6 max-w-xl">
                    <h2 className="text-2xl font-bold text-gray-800">Gerenciar Categorias</h2>
                    <form onSubmit={handleAddCategory} className="flex gap-2">
                        <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nova Categoria..." className="flex-1 p-3 border rounded-xl" />
                        <button type="submit" disabled={!newCategoryName.trim()} className="bg-mel-blue text-white px-6 rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50">Adicionar</button>
                    </form>
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <div key={cat} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="font-bold text-gray-700">{cat}</span>
                                <button onClick={() => handleDeleteCategory(cat)} className="text-red-400 hover:text-red-600 p-2 hover:bg-white rounded-lg transition"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                 <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Histórico de Pedidos</h2>
                    <div className="space-y-4">
                        {orders.length === 0 ? <p className="text-gray-400">Nenhum pedido registrado ainda.</p> : orders.map(order => (
                            <div key={order.id} className="border rounded-xl p-4 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg">{order.customer.name}</h3>
                                        <p className="text-sm text-gray-500">{order.customer.phone} • {order.customer.address}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-mel-blue">{order.total.toLocaleString('pt-AO')} Kz</span>
                                        <span className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-gray-600"><span>{item.quantity}x {item.name}</span><span>{(item.price * item.quantity).toLocaleString('pt-AO')} Kz</span></div>
                                    ))}
                                </div>
                            </div>
                        ))}
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
                            <input value={config.storeName} onChange={e => setConfig({...config, storeName: e.target.value})} className="w-full p-3 border rounded-xl" />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Número do WhatsApp (com código do país, sem +)</label>
                            <input value={config.whatsappNumber} onChange={e => setConfig({...config, whatsappNumber: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="244932853435" />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Logotipo da Loja</label>
                            
                            {/* Logo Upload UI */}
                            <div className="flex items-start gap-4 mb-2">
                                {config.logoUrl ? (
                                    <div className="relative w-24 h-24 bg-white border rounded-xl p-2">
                                        <img src={config.logoUrl} className="w-full h-full object-contain" />
                                        <button onClick={() => setConfig({...config, logoUrl: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><XCircle size={16}/></button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border-2 border-dashed">
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <label className={`block w-full border-2 border-dashed border-mel-blue/30 rounded-xl p-4 text-center cursor-pointer hover:bg-mel-blue/5 transition ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {isUploadingLogo ? (
                                            <span className="text-sm font-bold text-mel-blue animate-pulse">Enviando...</span>
                                        ) : (
                                            <>
                                                <UploadCloud className="mx-auto text-mel-blue mb-1" size={24} />
                                                <span className="text-sm font-bold text-gray-600 block">Clique para enviar novo logo</span>
                                                <span className="text-xs text-gray-400">Max 5MB (PNG/JPG)</span>
                                            </>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                                    </label>
                                    <div className="mt-2 text-center text-gray-400 text-xs font-bold">OU</div>
                                    <input 
                                        className="w-full mt-2 p-2 text-sm border rounded-lg bg-gray-50"
                                        placeholder="Cole o link da imagem (URL)"
                                        value={config.logoUrl}
                                        onChange={e => setConfig({...config, logoUrl: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSaveConfig} className="w-full bg-mel-blue text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 transition flex items-center justify-center gap-2">
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
