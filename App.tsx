import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, Filter, Smile, Instagram, MessageCircle, Mail } from 'lucide-react';
import { Product, CartItem, Category, StoreConfig } from './types';
import { ProductCard } from './components/ProductCard';
import { ProductDetails } from './components/ProductDetails';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AssistantChat } from './components/AssistantChat';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { dataService } from './services/dataService';

const App: React.FC = () => {
  // Routing Check
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // App Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({
    storeName: 'MelKids',
    logoUrl: '',
    whatsappNumber: ''
  });
  const [loadingData, setLoadingData] = useState(true);

  // UI State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialization
  useEffect(() => {
    // Check Route
    if (window.location.pathname === '/ad') {
      setIsAdminRoute(true);
      return;
    }

    const loadData = async () => {
      setLoadingData(true);
      try {
        const [prods, conf, cats] = await Promise.all([
          dataService.getProducts(),
          dataService.getConfig(),
          dataService.getCategories()
        ]);
        setProducts(prods);
        setStoreConfig(conf);
        
        // Ensure 'Todos' is always first
        const safeCats = cats.filter(c => c !== 'Todos');
        setCategories(['Todos', ...safeCats]);

      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'Todos') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.description.toLowerCase().includes(lowerQ)
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, products]);

  // Cart Logic
  const addToCart = (product: Product) => {
    if (product.soldOut) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // If Admin Route, render Dashboard
  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  // Loading Screen
  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mel-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-mel-blue font-bold animate-pulse">Carregando a lojinha...</p>
        </div>
      </div>
    );
  }

  // Render Store
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-500 hover:text-mel-blue transition"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={26} />
            </button>

            {/* Logo */}
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={() => {setSelectedCategory('Todos'); window.scrollTo({top:0, behavior: 'smooth'})}}
            >
               <img 
                 src={storeConfig.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/e/e4/Melkids_Logo.png"} 
                 alt={storeConfig.storeName}
                 className="h-10 md:h-12 object-contain"
                 onError={(e) => {
                   const target = e.target as HTMLImageElement;
                   target.style.display = 'none';
                   const parent = target.parentElement;
                   if (parent) {
                     parent.innerHTML = '<span class="text-3xl font-extrabold tracking-tight text-mel-blue">mel<span class="text-mel-green">K</span><span class="text-mel-orange">i</span><span class="text-mel-pink">d</span><span class="text-mel-cyan">s</span></span>';
                   }
                 }}
               />
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-xl relative group">
              <input 
                type="text" 
                placeholder="O que seu pequeno precisa hoje?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-gray-50 group-hover:bg-white focus:bg-white focus:border-mel-blue focus:ring-4 focus:ring-mel-blue/10 transition-all outline-none text-sm font-medium placeholder:text-gray-400"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-mel-blue transition" size={20} />
            </div>

            {/* Cart Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 text-gray-600 hover:bg-mel-blue hover:text-white rounded-full transition-all duration-300 group"
            >
              <ShoppingCart size={26} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-mel-pink text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          
          {/* Mobile Search */}
          <div className={`md:hidden mt-4 relative overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-mel-blue/20"
            />
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Categories Nav */}
          <nav className={`mt-6 pb-2 overflow-x-auto scrollbar-hide flex gap-3 ${isMobileMenuOpen ? 'flex-wrap' : 'whitespace-nowrap'}`}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 select-none
                  ${selectedCategory === cat 
                    ? 'bg-mel-blue text-white shadow-lg shadow-mel-blue/30 transform scale-105' 
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100 hover:border-gray-200'}
                `}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {selectedCategory === 'Todos' && !searchQuery && (
        <div className="relative overflow-hidden bg-mel-cyan/10 py-16 px-4 mb-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-mel-cyan/20 to-transparent pointer-events-none"></div>
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
            <div className="md:w-1/2 mb-10 md:mb-0 space-y-6">
              <span className="inline-block bg-white text-mel-orange font-bold px-4 py-1.5 rounded-full text-sm shadow-sm mb-2 transform rotate-1">
                Nova Coleção 2024 🚀
              </span>
              <h1 className="text-5xl md:text-6xl font-black leading-[1.1] text-mel-blue">
                {storeConfig.storeName}<br/>
                <span className="text-mel-pink">Angola</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Descubra roupas, calçados e acessórios que acompanham o ritmo das crianças. Tudo em Kwanzas com entrega rápida.
              </p>
              <button 
                onClick={() => {
                  const el = document.getElementById('products-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-mel-blue text-white font-bold px-10 py-4 rounded-full shadow-xl shadow-mel-blue/30 hover:bg-blue-700 transition transform hover:-translate-y-1"
              >
                Começar a Comprar
              </button>
            </div>
            <div className="md:w-1/2 flex justify-center perspective-1000">
               <div className="relative w-72 h-72 md:w-96 md:h-96 group cursor-pointer">
                 <div className="absolute inset-0 bg-mel-yellow rounded-[3rem] transform rotate-6 opacity-80 transition group-hover:rotate-12"></div>
                 <div className="absolute inset-0 bg-mel-pink rounded-[3rem] transform -rotate-3 opacity-80 transition group-hover:-rotate-6"></div>
                 <img 
                   src="https://picsum.photos/seed/kidshappy/800/800" 
                   alt="Happy Kid" 
                   className="absolute inset-0 w-full h-full object-cover rounded-[3rem] shadow-2xl transform transition duration-500 group-hover:scale-105 border-4 border-white"
                 />
                 
                 <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                    <div className="bg-mel-green text-white p-2 rounded-full">
                        <Smile size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">Clientes Felizes</p>
                        <p className="text-xs text-gray-500">+ 1000 mamães satisfeitas</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main id="products-grid" className="container mx-auto px-4 pb-20 flex-grow">
        
        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {selectedCategory === 'Todos' ? 'Populares' : selectedCategory}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
                {filteredProducts.length} produtos encontrados
            </p>
          </div>
          <div className="hidden md:block h-px bg-gray-200 flex-1 mx-6"></div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={setSelectedProduct} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Filter size={64} className="mx-auto text-gray-200 mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Ops! Nenhum produto.</h3>
            <p className="text-gray-400 mb-6">Não encontramos nada com esses filtros.</p>
            <button 
              onClick={() => {setSelectedCategory('Todos'); setSearchQuery('');}}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition"
            >
              Limpar Busca
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <h4 className="text-2xl font-extrabold text-mel-blue">{storeConfig.storeName}<span className="text-mel-orange">.</span></h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sua loja favorita de moda infantil em Angola. Trazendo cor, alegria e qualidade para o dia a dia das crianças.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                📍 Luanda - Kilamba
            </div>
          </div>
          <div>
            <h5 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Ajuda</h5>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><button className="hover:text-mel-blue transition text-left">Como Comprar</button></li>
              <li><button className="hover:text-mel-blue transition text-left">Entregas em Luanda</button></li>
              <li><button className="hover:text-mel-blue transition text-left">Trocas e Devoluções</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Contato</h5>
             <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <MessageCircle size={16} className="text-green-500" /> 
                <a href={`https://wa.me/${storeConfig.whatsappNumber}`} target="_blank" rel="noreferrer" className="hover:text-mel-blue transition font-bold text-gray-700">WhatsApp Oficial</a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram size={16} className="text-pink-500" />
                <a href="#" className="hover:text-mel-blue transition">@melkids.ao</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-mel-blue" />
                <a href="mailto:contato@melkids.ao" className="hover:text-mel-blue transition">contato@melkids.ao</a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Pagamento</h5>
            <div className="p-4 border rounded-xl bg-gray-50 text-center">
                <p className="text-xs text-gray-500 mb-2">Aceitamos Transferência</p>
                <div className="font-bold text-gray-700">IBAN / Multicaixa</div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2024 {storeConfig.storeName} Angola. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Overlays */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        clearCart={clearCart}
        storeConfig={storeConfig}
      />

      <ProductDetails 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={addToCart}
      />

      <AssistantChat />
    </div>
  );
};

export default App;