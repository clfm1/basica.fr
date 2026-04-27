import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ShoppingCart, Disc, CheckCircle2, ShieldHalf, Wrench, UserCheck, ArrowRight } from 'lucide-react';

export default function Hero() {
  const [showFitnessModal, setShowFitnessModal] = useState(false);
  const [showGamingModal, setShowGamingModal] = useState(false);

  return (
    <section className="relative w-full py-12 px-4 overflow-hidden">
      {/* Modals */}
      <AnimatePresence>
        {showFitnessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFitnessModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c080e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white font-sans">Nos Abonnements</h3>
                  <button onClick={() => setShowFitnessModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                    <CheckCircle2 size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="grid gap-4">
                  <a href="#shop" onClick={() => setShowFitnessModal(false)} className="group p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-500/50 transition-all flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Basic-Fit</h4>
                      <p className="text-sm text-zinc-500">Abonnement annuel ou mensuel à prix réduit.</p>
                    </div>
                    <ArrowRight className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="#shop" onClick={() => setShowFitnessModal(false)} className="group p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-500/50 transition-all flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Fitness Park</h4>
                      <p className="text-sm text-zinc-500">Accès premium et pass toutes options.</p>
                    </div>
                    <ArrowRight className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showGamingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGamingModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c080e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white font-sans">Gaming & Monnaie</h3>
                  <button onClick={() => setShowGamingModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                    <CheckCircle2 size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="grid gap-4">
                  <a href="#shop" onClick={() => setShowGamingModal(false)} className="group p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-500/50 transition-all flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Comptes Jeux</h4>
                      <p className="text-sm text-zinc-500">Comptes Fortnite, Valorant et plus encore.</p>
                    </div>
                    <ArrowRight className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="#shop" onClick={() => setShowGamingModal(false)} className="group p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-500/50 transition-all flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Monnaie de Jeu</h4>
                      <p className="text-sm text-zinc-500">V-Bucks, Points Valorant et Coins.</p>
                    </div>
                    <ArrowRight className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-[1200px] mx-auto relative group">
        {/* Accent Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-orange-400 via-orange-500 to-orange-900 shadow-[0_0_18px_rgba(255,112,0,0.85),0_0_55px_rgba(255,112,0,0.55)] before:content-[''] before:absolute before:-inset-x-[10px] before:-inset-y-[14px] before:bg-gradient-to-b before:from-orange-500/55 before:via-orange-500/45 before:to-orange-900/20 before:blur-2xl before:opacity-95 before:pointer-events-none" />

        <div className="grid lg:grid-cols-[1fr_430px] gap-11 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="relative pl-8">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(255,112,0,0.85)] animate-pulse" />
              <span className="text-xs uppercase tracking-[0.16em] text-zinc-400 font-medium">
                SÉANCE DE SPORT · COMPTES JEUX · MONNAIE
              </span>
            </div>

            <h1 className="text-[clamp(2.4rem,4.5vw,4rem)] font-extrabold leading-[1.05] tracking-tight mb-4">
              Optimisez votre<br />
              <span className="text-orange-500">Sport & Gaming.</span>
            </h1>

            <p className="text-[15px] sm:text-base leading-relaxed text-zinc-400 max-w-xl mb-6">
              Le meilleur shop d'abonnements Basic-Fit & Fitness Park. Nous vendons
              également des comptes Fortnite, Valorant et de la monnaie de jeu
              au meilleur prix. Livraison instantanée, paiement sécurisé et support 24/7.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-4 text-left">
              <button 
                onClick={() => setShowFitnessModal(true)}
                className="p-3.5 rounded-2xl bg-zinc-950/90 border border-white/5 backdrop-blur-md transition-all hover:border-orange-500/50 group"
              >
                <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.18em] uppercase text-white mb-1.5">
                  <Wrench size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                  Abonnements
                </div>
                <div className="text-sm text-zinc-300">Basic-Fit · Fitness Park · Pass</div>
              </button>
              <button 
                onClick={() => setShowGamingModal(true)}
                className="p-3.5 rounded-2xl bg-zinc-950/90 border border-white/5 backdrop-blur-md transition-all hover:border-orange-500/50 group"
              >
                <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.18em] uppercase text-white mb-1.5">
                  <UserCheck size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                  Gaming & Monnaie
                </div>
                <div className="text-sm text-zinc-300">Fortnite · Valorant · V-Bucks · VP</div>
              </button>
            </div>

            <ul className="space-y-2.5 mb-6">
              {[
                "Abonnements Basic-Fit & Fitness Park à prix réduit.",
                "Comptes Fortnite & Valorant de haute qualité.",
                "Monnaie de jeux (V-Bucks, Points Valorant) sécurisée."
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                  <CheckCircle2 size={18} className="text-orange-500 shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <a href="#shop" className="relative group/btn inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-bold bg-gradient-to-b from-[#ff8c00] via-[#FF7000] to-[#994300] text-white shadow-[0_18px_38px_rgba(255,112,0,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_52px_rgba(255,112,0,0.30)] active:scale-95">
                <ShoppingCart size={18} />
                <span>Voir le shop Fitness & Gaming</span>
              </a>
              <a href="https://discord.gg/basico" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-bold bg-zinc-950/80 border border-white/10 text-white transition-all hover:bg-zinc-900 hover:border-white/20 hover:-translate-y-0.5 active:scale-95">
                <Disc size={18} />
                <span>Join Discord support</span>
              </a>
            </div>
          </div>

          {/* Right Column - Stats Panel */}
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-orange-500/10 blur-[42px] rounded-full opacity-60" />
            
            <motion.div 
              whileHover={{ y: -4 }}
              className="relative z-10 p-5 rounded-[22px] bg-zinc-950/90 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.85)] backdrop-blur-xl group/panel overflow-hidden"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/panel:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl border border-white/10 bg-gradient-to-t from-black to-zinc-900 overflow-hidden flex-shrink-0">
                    <img src="/logo.png" alt="Basico Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-base uppercase tracking-tight">Basico</h3>
                    <p className="text-xs text-zinc-500">Le meilleur shop Fitness & Gaming</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-black/90 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Boutique en ligne
                </div>
              </div>

              <div className="p-4 rounded-[18px] bg-gradient-to-br from-orange-500 via-orange-900 to-black border border-orange-500/50 shadow-inner mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-950/80 border border-white/10 text-[9px] font-black tracking-widest uppercase text-zinc-300 mb-2">FITNESS & ACCOUNTS</span>
                <p className="text-white text-sm font-bold">Accès immédiat 24/7</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                  <p className="text-[10px] uppercase text-zinc-500 font-bold mb-0.5">Livraison</p>
                  <p className="text-sm font-bold">Instant</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                  <p className="text-[10px] uppercase text-zinc-500 font-bold mb-0.5">Garantie</p>
                  <p className="text-sm font-bold">À Vie</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
