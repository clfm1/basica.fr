import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, CreditCard, Apple, Globe, ArrowLeft, Check, Ticket, Info } from 'lucide-react';

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === id);
  
  const [email, setEmail] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!product) {
      navigate('/');
    }
  }, [product, navigate]);

  if (!product) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          userEmail: email
        })
      });

      const data = await response.json();
      if (response.ok && data.url) {
        // Redirect directly to Stripe Checkout URL
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      alert(`Erreur : ${err.message}`);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 selection:bg-orange-600/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#080307] p-10 rounded-[32px] border border-emerald-500/30 text-center space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
        >
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Paiement Réussi !</h2>
          <p className="text-zinc-400 font-medium">Votre commande pour <span className="text-white">{product.name}</span> a été confirmée. Vous allez être redirigé vers votre compte...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Retour</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form Column */}
          <div className="flex-1 space-y-8">
            <header className="space-y-2">
              <h1 className="text-4xl font-black text-white uppercase tracking-tight">Paiement</h1>
              <p className="text-zinc-500 font-medium flex items-center gap-2">
                <Lock size={14} className="text-emerald-500" />
                Transaction 100% sécurisée et cryptée
              </p>
            </header>

            <form onSubmit={handlePayment} className="space-y-6">
              <div className="space-y-6 p-8 rounded-[32px] bg-[#080307] border border-white/5 shadow-2xl">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px]">01</span>
                    Billing Contact
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">First Name *</label>
                      <input 
                        required
                        type="text"
                        placeholder="Adam"
                        className="w-full h-14 bg-black border border-white/10 rounded-full px-6 text-sm font-bold focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Last Name *</label>
                      <input 
                        required
                        type="text"
                        placeholder="Calof"
                        className="w-full h-14 bg-black border border-white/10 rounded-full px-6 text-sm font-bold focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Country / Region *</label>
                    <select 
                      required
                      className="w-full h-14 bg-black border border-white/10 rounded-full px-6 text-sm font-bold focus:border-orange-500 outline-none transition-all appearance-none text-white"
                      defaultValue="Spain"
                    >
                      <option value="Spain">Spain</option>
                      <option value="France">France</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="USA">USA</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Email address *</label>
                    <input 
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full h-14 bg-black border border-white/10 rounded-full px-6 text-sm font-bold focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="h-[1px] bg-white/5 w-full" />

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px]">02</span>
                    Méthode de paiement
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      className="group relative p-6 rounded-3xl border-2 border-orange-500 bg-orange-500/5 text-white transition-all overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-3">
                        <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500">
                          <CreditCard size={24} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black uppercase tracking-widest mb-0.5">Stripe</div>
                          <div className="text-[10px] text-zinc-500 font-bold">Carte de crédit / Débit</div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.open('https://discord.gg/votre-serveur', '_blank')}
                      className="group relative p-6 rounded-3xl border-2 border-white/5 bg-white/[0.02] text-zinc-500 hover:border-[#5865F2]/50 hover:bg-[#5865F2]/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#5865F2]">
                          <Globe size={24} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black uppercase tracking-widest mb-0.5 group-hover:text-white transition-colors">PayPal</div>
                          <div className="text-[10px] text-zinc-600 font-bold group-hover:text-[#5865F2] transition-colors">Via Discord Support</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">
                         Ouvrir Ticket sur Discord →
                      </div>
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl bg-orange-600/5 border border-orange-600/20 space-y-3">
                    <div className="flex items-center gap-2 text-orange-500 text-xs font-black uppercase tracking-widest">
                      <ShieldCheck size={16} />
                      Paiement sécurisé par Stripe
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                      Vous allez être redirigé vers la page de paiement sécurisée de Stripe pour finaliser votre achat. Vos données sont cryptées et nous n'y avons pas accès.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full h-16 rounded-full bg-orange-600 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-[0_12px_24px_rgba(255,112,0,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    Payer {product.price}€ maintenant
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-8 py-4 opacity-50 grayscale hover:grayscale-0 transition-all">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="w-full lg:w-[380px] space-y-6">
            <div className="p-8 rounded-[32px] bg-[#080307] border border-white/5 shadow-2xl space-y-6 sticky top-32">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Résumé de la commande</h3>
              
              <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">{product.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{product.categories[0]}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-sm font-black text-white">{product.price}€</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-bold">Sous-total</span>
                  <span className="text-white font-black">{product.price}€</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-bold">Frais de service</span>
                  <span className="text-emerald-500 font-black">GRATUIT</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between">
                  <span className="text-sm font-black text-white uppercase tracking-widest">Total</span>
                  <span className="text-xl font-black text-orange-500">{product.price}€</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-600/5 border border-orange-600/20 space-y-2">
                <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                  <Info size={14} />
                  Note importante
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                  Votre licence sera délivrée instantanément dans votre espace client après confirmation du paiement.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 text-emerald-500/70">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Garantie satisfait ou remboursé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
