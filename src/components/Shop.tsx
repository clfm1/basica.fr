import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, Filter, ShoppingCart, LayoutGrid, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS, CATEGORIES } from '../constants';
import { Product, Category } from '../types';

export default function Shop() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModalCategory, setActiveModalCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const perPage = 15;

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (selectedCategory) {
      result = result.filter(p => p.categories.includes(selectedCategory));
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      if (priceRange === '50+') {
        result = result.filter(p => p.price >= 50);
      } else {
        result = result.filter(p => p.price >= min && p.price <= (max || Infinity));
      }
    }

    result.sort((a, b) => {
      if (a.pin !== b.pin) return b.pin - a.pin;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return b.popularity - a.popularity;
    });

    return result;
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const mainItems = useMemo(() => {
    const items: (Product | Category)[] = [];
    
    // 1. If we have a selected category, check if it has subcategories
    if (selectedCategory) {
      const subCats = CATEGORIES.filter(c => c.parentId === selectedCategory);
      if (subCats.length > 0) {
        // Return only subcategories
        return subCats;
      }
      // If no subcategories, show products for this category
      return filteredProducts.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // 2. Default view: show only top-level categories
    if (!selectedCategory && !searchQuery) {
      return CATEGORIES.filter(c => !c.parentId);
    }

    // 3. Search view: show filtered products
    return filteredProducts;
  }, [filteredProducts, selectedCategory, searchQuery]);

  const paginatedItems = mainItems.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(mainItems.length / perPage);

  const currentCategoryName = useMemo(() => {
    if (!selectedCategory) return 'Boutique';
    return CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Produits';
  }, [selectedCategory]);

  const modalSubCategories = useMemo(() => {
    if (!activeModalCategory) return [];
    return CATEGORIES.filter(c => c.parentId === activeModalCategory.id);
  }, [activeModalCategory]);

  const modalProducts = useMemo(() => {
    if (!activeModalCategory) return [];
    return PRODUCTS.filter(p => p.categories.includes(activeModalCategory.id));
  }, [activeModalCategory]);

  return (
    <section id="shop" className="relative py-14">
      <div className="max-w-[1520px] mx-auto px-6 grid lg:grid-cols-[1fr_300px] gap-9 items-start">
        
        {/* Main Content */}
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs text-zinc-500 uppercase tracking-wider">
            <span>Showing {Math.min(paginatedItems.length, (currentPage - 1) * perPage + 1)}–{Math.min(mainItems.length, currentPage * perPage)} of {mainItems.length} items</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          <div>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black uppercase tracking-widest relative pb-2 inline-block">
              {currentCategoryName}
              <div className="absolute bottom-0 left-0 w-24 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_16px_rgba(255,112,0,0.6)]" />
            </h2>
            {selectedCategory && (
              <button 
                onClick={() => {
                  const parentId = CATEGORIES.find(c => c.id === selectedCategory)?.parentId || '';
                  setSelectedCategory(parentId);
                }}
                className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-white/30 transition-all text-zinc-400 hover:text-white"
              >
                ← Retour
              </button>
            )}
          </div>
          <p className="mt-2.5 text-zinc-400 text-sm">Parcourez tous nos abonnements, comptes et services en un seul endroit.</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((item) => {
            const isCategory = 'productCount' in item;
            return (
              <motion.div 
                layout
                key={item.id}
                className="flex flex-col h-full rounded-[20px] overflow-hidden bg-[#050309] border border-white/5 shadow-[0_18px_42px_rgba(0,0,0,0.9)] hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(0,0,0,1),0_0_36px_rgba(255,112,0,0.35)] hover:border-white/20 transition-all group"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {!isCategory && (item as Product).badge && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2.5 py-1 rounded-full bg-orange-600/70 text-[10px] text-white border border-white/10 shadow-lg backdrop-blur-sm">
                        {(item as Product).badge}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col p-4 bg-[#090303]">
                  <div className="flex-1 space-y-1">
                    <h5 className="font-black text-[0.98rem] uppercase tracking-[0.04em] leading-tight line-clamp-2">{item.name}</h5>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between gap-2.5">
                    {isCategory ? (
                      <button 
                        onClick={() => {
                          setSelectedCategory(item.id);
                          document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group/btn relative flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:border-white/30 transition-all shadow-xl overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        <ExternalLink size={14} className="relative z-10 text-zinc-400 group-hover/btn:text-white transition-colors" />
                        <span className="relative z-10 text-zinc-300 group-hover/btn:text-white transition-colors">Découvrir</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="group/btn relative flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl bg-orange-600 border border-orange-400/50 text-xs font-black uppercase tracking-widest text-white transition-all shadow-[0_10px_20px_rgba(249,115,22,0.3)] overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        <ShoppingCart size={14} className="relative z-10 group-hover/btn:scale-110 transition-transform" />
                        <span className="relative z-10">Acheter</span>
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-20 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover/btn:animate-shine" />
                      </button>
                    )}

                      <div className="text-right">
                        <span className="block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                          {isCategory ? "Produits" : "À partir de"}
                        </span>
                        <div className="text-orange-500 font-extrabold flex items-baseline gap-1.5">
                          {isCategory ? (
                              <span>{(item as Category).productCount}</span>
                          ) : (
                            <>
                              <span>{(item as Product).price}€</span>
                              {(item as Product).originalPrice && (
                                <s className="text-[10px] text-zinc-500">{(item as Product).originalPrice}€</s>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap gap-2.5 mt-5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button 
                  key={p}
                  onClick={() => {
                    setCurrentPage(p);
                    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-2 rounded-full border text-xs font-medium transition-all ${p === currentPage ? 'bg-black border-orange-500/50 shadow-[0_0_18px_rgba(255,112,0,0.18)]' : 'bg-black/50 border-white/10 hover:border-white/30'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="p-4 rounded-[20px] bg-zinc-950 border border-white/10 shadow-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(255,112,0,0.8)]" />
              Search
            </p>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Rechercher un produit..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-full px-4 pr-11 bg-zinc-900/80 border border-white/15 text-white text-sm outline-none focus:border-orange-500/50 transition-colors"
              />
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            </div>
          </div>

          <div className="p-4 rounded-[20px] bg-zinc-950 border border-white/10 shadow-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(255,112,0,0.8)]" />
              Filtres
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Catégorie</label>
                <div className="relative">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-11 rounded-xl px-4 bg-zinc-900/80 border border-white/15 text-white text-xs outline-none appearance-none"
                  >
                    <option value="">Toutes les catégories</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Tranche de prix</label>
                <div className="relative">
                  <select 
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full h-11 rounded-xl px-4 bg-zinc-900/80 border border-white/15 text-white text-xs outline-none appearance-none"
                  >
                    <option value="">Tout</option>
                    <option value="0-25">0 – 25€</option>
                    <option value="25-50">25 – 50€</option>
                    <option value="50-100">50 – 100€</option>
                    <option value="100+">100€+</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Trier par</label>
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-11 rounded-xl px-4 bg-zinc-900/80 border border-white/15 text-white text-xs outline-none appearance-none"
                  >
                    <option value="popular">Les plus populaires</option>
                    <option value="price_asc">Prix : Croissant</option>
                    <option value="price_desc">Prix : Décroissant</option>
                    <option value="name_asc">Nom A–Z</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {activeModalCategory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalCategory(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000000]"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-[1180px] h-fit max-h-[90vh] rounded-2xl overflow-hidden border border-orange-500/50 shadow-2xl bg-zinc-950 z-[1000001] flex flex-col"
            >
              <div className="relative p-6 flex flex-col">
                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-white">CATÉGORIE — PRODUITS</h2>
                    <p className="text-xs text-zinc-400 mt-2">Choisissez le produit exact dont vous avez besoin dans <strong className="text-orange-500">{activeModalCategory.name}</strong>.</p>
                  </div>
                  <button onClick={() => setActiveModalCategory(null)} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 overflow-y-auto max-h-[60vh] p-2">
                  {modalSubCategories.length > 0 ? modalSubCategories.map(subCat => (
                    <div key={subCat.id} className="bg-[#090303] rounded-2xl border border-white/10 overflow-hidden flex flex-col hover:border-orange-500/50 transition-colors group">
                      <div className="aspect-[16/10] bg-zinc-900 overflow-hidden">
                        <img src={subCat.image} alt={subCat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 leading-tight">{subCat.name}</h3>
                        <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                            <button 
                              onClick={() => {
                                setSelectedCategory(subCat.id);
                                setActiveModalCategory(null);
                                document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="group/btn relative px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white hover:border-white/30 transition-all overflow-hidden shadow-lg"
                            >
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                              <span className="relative z-10">Voir tout</span>
                            </button>
                            <div className="text-right">
                              <span className="block text-[9px] text-zinc-500 uppercase">Produits</span>
                              <span className="text-orange-500 font-extrabold">{subCat.productCount}</span>
                            </div>
                        </div>
                      </div>
                    </div>
                  )) : modalProducts.length > 0 ? modalProducts.map(p => (
                    <div key={p.id} className="bg-[#090303] rounded-2xl border border-white/10 overflow-hidden flex flex-col hover:border-orange-500/50 transition-colors">
                      <div className="aspect-[16/10] bg-zinc-900">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 leading-tight">{p.name}</h3>
                        <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                            <button 
                              onClick={() => {
                                navigate(`/product/${p.id}`);
                              }}
                              className="group/btn relative px-5 py-2 rounded-xl bg-orange-600 border border-orange-400/50 text-[10px] font-black uppercase tracking-widest text-white transition-all overflow-hidden shadow-lg"
                            >
                              <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                              <span className="relative z-10">Acheter</span>
                              <div className="absolute top-0 -inset-full h-full w-1/2 z-20 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover/btn:animate-shine" />
                            </button>
                            <div className="text-right">
                              <span className="block text-[9px] text-zinc-500 uppercase">À partir de</span>
                              <span className="text-orange-500 font-black">{p.price}€</span>
                            </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center text-zinc-500">Aucun produit trouvé dans cette catégorie.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
