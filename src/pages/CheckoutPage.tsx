import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, CreditCard, Globe, ArrowLeft, Check, Ticket, Info, AlertTriangle, Copy, ExternalLink, X } from 'lucide-react';

async function readApiJson(response: Response) {
  const responseText = await response.text();
  try {
    return responseText ? JSON.parse(responseText) : {};
  } catch {
    console.error('API response is not valid JSON:', responseText);
    throw new Error('Erreur serveur temporaire. Veuillez réessayer dans quelques instants.');
  }
}

function generatePaypalReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomPart = Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `BAS-${randomPart}`;
}

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const product = PRODUCTS.find(p => p.id === id);
  const selectedVariantLabel = searchParams.get('variant') || '';
  const selectedVariantPrice = Number(searchParams.get('price'));
  const checkoutBasePrice = Number.isFinite(selectedVariantPrice) ? selectedVariantPrice : product?.price || 0;
  
  const [email, setEmail] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPaypalModalOpen, setIsPaypalModalOpen] = useState(false);
  const [paypalReference] = useState(() => generatePaypalReference());

  useEffect(() => {
    if (!product) {
      navigate('/');
    }
  }, [product, navigate]);

  if (!product) return null;

  const discountAmount = appliedPromo ? Math.round(checkoutBasePrice * appliedPromo.percent) / 100 : 0;
  const finalPrice = Math.max(0, Math.round((checkoutBasePrice - discountAmount) * 100) / 100);

  const handleApplyPromo = () => {
    const normalizedCode = promoCode.trim().toUpperCase();
    const fitnessPromoProducts = ['basic-fit', 'fitness-park'];
    const promoCodes: Record<string, { percent: number; productIds: string[] }> = {
      FITNESS45: { percent: 45, productIds: fitnessPromoProducts },
    };

    if (!normalizedCode) {
      setAppliedPromo(null);
      setPromoMessage({ type: 'error', text: 'Entre un code promo.' });
      return;
    }

    const promo = promoCodes[normalizedCode];
    if (!promo) {
      setAppliedPromo(null);
      setPromoMessage({ type: 'error', text: 'Code promo invalide.' });
      return;
    }

    if (!promo.productIds.includes(product.id)) {
      setAppliedPromo(null);
      setPromoMessage({ type: 'error', text: 'Ce code est réservé aux abonnements Basic-Fit et Fitness Park.' });
      return;
    }

    if (!selectedVariantLabel.toLowerCase().includes('annuel')) {
      setAppliedPromo(null);
      setPromoMessage({ type: 'error', text: 'Ce code est valable uniquement sur les formules à l’année.' });
      return;
    }

    setAppliedPromo({ code: normalizedCode, percent: promo.percent });
    setPromoMessage({ type: 'success', text: `${promo.percent}% de réduction appliqués.` });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: selectedVariantLabel ? `${product.name} - ${selectedVariantLabel}` : product.name,
          price: checkoutBasePrice,
          finalPrice,
          promoCode: appliedPromo?.code || null,
          userEmail: email
        })
      });

      const data = await readApiJson(response);
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
                    Code promo
                  </h3>

                  <div className="rounded-[24px] border border-orange-500/20 bg-gradient-to-br from-orange-600/10 via-black/30 to-black p-4 shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Ticket className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value);
                            setPromoMessage(null);
                          }}
                          placeholder="FITNESS45"
                          className="w-full h-14 bg-black/70 border border-white/10 rounded-full pl-12 pr-5 text-sm font-black uppercase tracking-widest text-white placeholder:text-zinc-700 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="h-14 px-7 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-orange-100 transition-colors"
                      >
                        Appliquer
                      </button>
                    </div>

                    {promoMessage && (
                      <div className={`mt-3 text-xs font-bold ${promoMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {promoMessage.text}
                      </div>
                    )}

                    {appliedPromo && (
                      <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          {appliedPromo.code}
                        </span>
                        <span className="text-sm font-black text-emerald-400">-{discountAmount}€</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-[1px] bg-white/5 w-full" />

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px]">03</span>
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
                      onClick={() => setIsPaypalModalOpen(true)}
                      className="group relative p-6 rounded-3xl border-2 border-white/5 bg-white/[0.02] text-zinc-500 hover:border-[#5865F2]/50 hover:bg-[#5865F2]/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#5865F2]">
                          <Globe size={24} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black uppercase tracking-widest mb-0.5 group-hover:text-white transition-colors">PayPal</div>
                          <div className="text-[10px] text-zinc-600 font-bold group-hover:text-[#5865F2] transition-colors">Paiement manuel</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">
                         Voir les instructions
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

              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs font-medium leading-relaxed text-zinc-400">
                <input
                  required
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-black accent-orange-600"
                />
                <span>
                  J'approuve avoir lu et accepté les <a href="/terms" className="text-orange-500 hover:text-orange-400 underline underline-offset-4">Conditions Générales</a>, la <a href="/privacy" className="text-orange-500 hover:text-orange-400 underline underline-offset-4">Politique de Confidentialité</a> et la <a href="/refund" className="text-orange-500 hover:text-orange-400 underline underline-offset-4">Politique de Remboursement</a>.
                </span>
              </label>

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
                    Payer {finalPrice}€ maintenant
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
                  {selectedVariantLabel && (
                    <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-1">{selectedVariantLabel}</p>
                  )}
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{product.categories[0]}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-sm font-black text-white">{checkoutBasePrice}€</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-bold">Sous-total</span>
                  <span className="text-white font-black">{checkoutBasePrice}€</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-bold">Frais de service</span>
                  <span className="text-emerald-500 font-black">GRATUIT</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold">Code promo</span>
                    <span className="text-emerald-500 font-black">-{discountAmount}€</span>
                  </div>
                )}
                <div className="pt-3 border-t border-white/5 flex justify-between">
                  <span className="text-sm font-black text-white uppercase tracking-widest">Total</span>
                  <span className="text-xl font-black text-orange-500">{finalPrice}€</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-600/5 border border-orange-600/20 space-y-2">
                <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                  <Info size={14} />
                  Note importante
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                  Sauf mention expresse contraire, cette commande concerne le visuel numérique présenté sur la page produit.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 text-emerald-500/70">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Commande numérique sécurisée</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPaypalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg rounded-[28px] border border-orange-500/25 bg-[#080307] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
          >
            <button
              type="button"
              onClick={() => setIsPaypalModalOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:text-white"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <div className="space-y-5 pr-8">
              <div className="flex items-center gap-3 text-orange-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-white">Instructions PayPal</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">A suivre exactement</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/50 p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-zinc-500">Montant a envoyer</span>
                  <span className="text-2xl font-black text-orange-500">{finalPrice}&euro;</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-zinc-500">Destinataire PayPal</span>
                  <span className="text-sm font-black text-white">BasileBourdon</span>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4">
                <p className="text-xs font-bold leading-relaxed text-rose-100">
                  Le paiement doit etre envoye exclusivement en mode <span className="font-black text-white">Amis et proches</span>.
                  Si un autre mode est utilise, la commande ne pourra pas etre validee automatiquement et devra etre verifiee par le support.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold leading-relaxed text-zinc-400">
                  Dans la note du paiement PayPal, indiquez exactement ce code de commande :
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex min-h-14 flex-1 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 text-lg font-black tracking-[0.22em] text-white">
                    {paypalReference}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(paypalReference)}
                    className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-orange-100"
                  >
                    <Copy size={16} />
                    Copier
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => window.open('https://www.paypal.com/', '_blank', 'noopener,noreferrer')}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#0070ba] text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#005ea6]"
                >
                  <ExternalLink size={16} />
                  Ouvrir PayPal
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaypalModalOpen(false)}
                  className="h-14 rounded-full border border-white/10 px-6 text-xs font-black uppercase tracking-widest text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
                >
                  J'ai compris
                </button>
              </div>

              <p className="text-center text-[10px] font-medium leading-relaxed text-zinc-600">
                Une fois le paiement envoye avec le bon code en note, la confirmation se fera automatiquement.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
