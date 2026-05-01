import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, ShieldCheck, Zap, Lock, CreditCard, ChevronDown, Check, Star, Users, Flame } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

const reviewNames = [
  "Mehdi L.", "Camille R.", "Nolan D.", "Sarah M.", "Alex T.", "Inès B.", "Thomas V.", "Lina P.",
  "Yanis K.", "Emma G.", "Romain C.", "Clara N.", "Sofiane A.", "Julie P.", "Mathis B.", "Nora H.",
  "Hugo F.", "Léa S.", "Adam V.", "Manon J.", "Ilyes R.", "Chloé M.", "Noah D.", "Amel K.",
  "Lucas P.", "Maya L.", "Enzo G.", "Eva T.", "Samir B.", "Zoé C.", "Maxime R.", "Alicia F.",
  "Kévin M.", "Louna V.", "Ethan S.", "Myriam N.", "Antoine D.", "Jade B.", "Bilal H.", "Anaïs G.",
];

const reviewTexts = [
  "Bien reçu, ça marche.",
  "Parfait, rien à dire.",
  "Nickel.",
  "Simple et efficace.",
  "Correct pour le prix.",
  "Très bien.",
  "Pas mal du tout.",
  "Franchement bien.",
  "Reçu vite, tout est bon.",
  "Ça fonctionne comme prévu.",
  "Petit délai, mais au final c'est bon.",
  "J'ai attendu un peu, mais rien de grave.",
  "Support un peu lent au début, puis réponse claire.",
  "J'ai dû relancer une fois, mais ça marche maintenant.",
  "Activation pas instantanée chez moi, sinon très bien.",
  "Au début je pensais que ça n'avait pas marché, mais il fallait juste attendre.",
  "Le message d'activation est arrivé plus tard que prévu, mais tout est conforme.",
  "Bonne expérience, je recommande.",
  "C'est carré.",
  "Rien à signaler.",
  "Je suis satisfait.",
  "Ça fait le taf.",
  "Prix intéressant.",
  "Aucun souci pour l'instant.",
  "Commande reçue dans la journée.",
  "J'avais un doute, mais finalement tout est ok.",
  "Le support m'a aidé rapidement.",
  "Propre.",
  "Très correct.",
  "Je reprendrai sûrement.",
  "Un peu stressé au début, mais finalement nickel.",
  "Les infos étaient claires.",
  "Pas parfait sur le délai, mais bon service.",
  "Ça reste une bonne affaire.",
  "Tout est activé.",
  "Livraison correcte.",
  "Très bon rapport qualité prix.",
  "Agréablement surpris.",
  "RAS, ça marche.",
  "Bien mieux que ce que je pensais.",
];

const verifiedReviews = Array.from({ length: 200 }, (_, index) => {
  const createdAt = new Date(2026, 3, 24);
  createdAt.setDate(createdAt.getDate() - index);

  return {
    name: reviewNames[index % reviewNames.length],
    date: `Avis créé le ${createdAt.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    text: reviewTexts[(index * 7) % reviewTexts.length],
  };
});

const getRandomReviewIndex = (currentIndex?: number) => {
  const nextIndex = Math.floor(Math.random() * verifiedReviews.length);
  return verifiedReviews.length > 1 && nextIndex === currentIndex
    ? (nextIndex + 1) % verifiedReviews.length
    : nextIndex;
};

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [viewingCount, setViewingCount] = useState(12);
  const [soldCount, setSoldCount] = useState(14);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(() => getRandomReviewIndex());

  useEffect(() => {
    // Simul social proof updates
    const interval = setInterval(() => {
      setViewingCount(prev => Math.max(8, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setReviewIndex(prev => getRandomReviewIndex(prev));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const originalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const currentReview = verifiedReviews[reviewIndex];

  return (
    <div
      className="relative w-full max-w-6xl mx-auto bg-[#080307] rounded-[24px] border border-[#4a1119] shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden"
    >
      {/* Close Button / Back Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/50 border border-white/10 text-white/50 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>

      <div className="flex flex-col lg:flex-row h-full">
          {/* Left Column: Gallery & Social Proof */}
          <div className="w-full lg:w-[60%] p-6 lg:p-8 space-y-6">
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#4a1119] bg-[#120509] group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            </div>

            {/* Social Proof */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative p-5 rounded-2xl bg-[#120509] border border-[#4a1119] overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Users size={20} className="text-white/70" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-black">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#dc2626]" />
                      {viewingCount} personnes regardent
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">En ce moment sur cette page</div>
                  </div>
                </div>
              </div>

              <div className="relative p-5 rounded-2xl bg-[#120509] border border-[#4a1119] overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Flame size={20} className="text-white/70" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-black">
                      <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse shadow-[0_0_8px_#16a34a]" />
                      <span className="text-green-500">{soldCount} vendus</span> en 5 heures
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Achats récents</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Rotator */}
            <div className="p-6 rounded-2xl bg-[#120509] border border-[#4a1119] space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                  Client Vérifié
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-white">{currentReview.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{currentReview.date}</div>
                </div>
              </div>
              <motion.p
                key={currentReview.text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="min-h-[44px] text-sm font-bold leading-relaxed text-white/90"
              >
                "{currentReview.text}"
              </motion.p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-500 text-amber-500" />)}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Avis {reviewIndex + 1} / {verifiedReviews.length}
                </div>
                <button
                  onClick={() => setReviewIndex(prev => getRandomReviewIndex(prev))}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/70 transition-colors hover:border-red-500/50 hover:text-white"
                >
                  Avis aléatoire
                </button>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-500 font-semibold">
                <ShieldCheck size={14} />
                Approuvé par +10,000 clients
              </div>
            </div>

            {/* Tabs for large screens */}
            <div className="hidden lg:block space-y-4">
              <div className="flex gap-4 border-b border-white/5">
                <button 
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 text-xs font-black uppercase tracking-widest transition-colors relative ${activeTab === 'description' ? 'text-white' : 'text-zinc-500'}`}
                >
                  Description
                  {activeTab === 'description' && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 shadow-[0_0_12px_#dc2626]" />
                  )}
                </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-zinc-400 leading-relaxed">{product.description}</p>
                {product.features && (
                  <ul className="grid grid-cols-2 gap-2 mt-4 list-none p-0">
                    {product.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-zinc-100 text-xs font-bold">
                        <Check size={14} className="text-red-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Buy Box */}
          <div className="w-full lg:w-[40%] p-6 lg:p-8 lg:border-l border-white/5 bg-[#090306]">
            <div className="sticky top-0 space-y-6">
              <header>
                <div className="flex items-center gap-2 mb-3">
                  {product.categories.map(c => (
                    <span key={c} className="text-[10px] font-black uppercase tracking-widest text-red-500">{c}</span>
                  ))}
                </div>
                <h1 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">{product.name}</h1>
              </header>

              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#120509] border border-[#4a1119]">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Prix actuel</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-white">{currentPrice}€</span>
                    {originalPrice && (
                      <s className="text-sm font-bold text-red-500/70">{originalPrice}€</s>
                    )}
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-wider">
                  En Stock
                </div>
              </div>

              {/* Variant Selector */}
              {product.variants && (
                <div className="space-y-3 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Options d'abonnement</label>
                  <div className="relative">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full h-14 rounded-full px-6 flex items-center justify-between bg-black border border-white/10 text-sm font-bold hover:border-red-500/50 transition-all shadow-2xl"
                    >
                      <span className="truncate">{selectedVariant?.label || 'Choisir une option'}</span>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 w-full mt-2 py-2 rounded-2xl bg-[#0d070c] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,1)] z-[100]"
                      >
                        {product.variants.map((v) => (
                          <button
                            key={v.label}
                            onClick={() => {
                              setSelectedVariant(v);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-6 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left ${selectedVariant?.label === v.label ? 'text-red-500 bg-white/5' : 'text-white/80'}`}
                          >
                            <span className="text-xs font-bold">{v.label}</span>
                            <span className="text-xs font-black">{v.price}€</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Quantité</label>
                <div className="flex items-center w-fit rounded-full border border-white/10 bg-black overflow-hidden h-12">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-full flex items-center justify-center hover:bg-white/5 transition-colors text-white font-bold"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-14 h-full text-center bg-transparent text-sm font-black text-white outline-none"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-full flex items-center justify-center hover:bg-white/5 transition-colors text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button className="group relative h-14 rounded-2xl bg-zinc-950 border border-white/5 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-900 hover:border-white/20 transition-all flex items-center justify-center gap-2.5 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  {/* Subtle glass effect highlight */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
                  
                  {/* Animated background glow */}
                  <div className="absolute -inset-2 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                  
                  <ShoppingCart size={18} className="relative z-10 text-zinc-500 group-hover:text-white transition-all duration-300 group-hover:-translate-y-0.5" />
                  <span className="relative z-10 text-zinc-500 group-hover:text-white transition-colors duration-300">Panier</span>
                </button>
                <button 
                  onClick={() => {
                    const params = selectedVariant
                      ? `?variant=${encodeURIComponent(selectedVariant.label)}&price=${selectedVariant.price}`
                      : '';
                    navigate(`/checkout/${product.id}${params}`);
                  }}
                  className="group relative h-14 rounded-2xl bg-orange-600 text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2.5 overflow-hidden shadow-[0_15px_35px_rgba(234,88,12,0.4)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CreditCard size={18} className="relative z-10 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10">Acheter</span>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-20 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shine" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: <CreditCard size={18} />, title: "Paiement", sub: "Sécurisé" },
                  { icon: <Zap size={18} />, title: "Contenu", sub: "Numérique" },
                  { icon: <Lock size={18} />, title: "Commande", sub: "Protégée" }
                ].map((badge, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl bg-gradient-to-br from-[#1c0505] to-[#0d0202] border border-red-500/20 flex flex-col items-center justify-center text-center p-2 group hover:scale-105 transition-transform cursor-default">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                    <div className="text-red-500 mb-1 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                      {badge.icon}
                    </div>
                    <div className="text-[10px] font-black text-white uppercase leading-tight">{badge.title}</div>
                    <div className="h-[1px] w-6 bg-red-500/30 my-1" />
                    <div className="text-[8px] font-bold text-zinc-500 uppercase">{badge.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
