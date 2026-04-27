import { Disc, Bolt, Lock, Headset } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="rm-footer" className="relative w-full text-white bg-black border-t border-white/5 pt-14 pb-6 px-10 overflow-hidden isolate">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-95">
        <div className="absolute left-[16%] top-[22%] w-[700px] h-[320px] bg-orange-600/20 blur-[100px] rounded-full" />
        <div className="absolute right-[14%] top-[12%] w-[620px] h-[280px] bg-orange-600/15 blur-[100px] rounded-full" />
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[900px] h-[360px] bg-orange-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.55fr_1fr_1fr_1fr] gap-8 md:gap-12 items-start mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="relative w-16 h-16 rounded-3xl border border-white/15 overflow-hidden shadow-2xl transition-transform hover:scale-105 active:scale-95 group bg-gradient-to-t from-black to-zinc-900"
              >
                <div className="absolute inset-0 bg-orange-600/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover relative z-10" />
              </Link>
              <div>
                <p className="font-black text-lg tracking-tight leading-none mb-1.5">Basico</p>
                <p className="text-xs text-zinc-400">Abonnements fitness & gaming instantanés.</p>
              </div>
            </div>
            
            <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
              Le meilleur shop pour vos abonnements Basic-Fit, Fitness Park et vos comptes Fortnite/Valorant. Livraison instantanée, paiements sécurisés et support Discord 24/7.
            </p>

            <a href="https://discord.gg/basico" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-900/50 border border-white/10 text-white text-sm hover:border-orange-500/50 hover:bg-zinc-800 transition-all backdrop-blur-md">
              <Disc size={18} className="text-orange-500" />
              <span>Discord server</span>
            </a>
          </div>

          {/* Nav Col */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.18em] relative pb-2 inline-block">
              Navigation
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-orange-600" />
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link 
                to="/" 
                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-orange-500 group-hover:shadow-[0_0_8px_rgba(255,112,0,0.6)] transition-all" />
                Home
              </Link>
              <Link 
                to="/#shop" 
                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-orange-500 group-hover:shadow-[0_0_8px_rgba(255,112,0,0.6)] transition-all" />
                Shop
              </Link>
            </div>
          </div>

          {/* Support Col */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.18em] relative pb-2 inline-block">
              Support
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-orange-600" />
            </h4>
            <div className="flex flex-col gap-2.5">
              <a 
                href="https://discord.gg/basico" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-orange-500 group-hover:shadow-[0_0_8px_rgba(255,112,0,0.6)] transition-all" />
                Discord server
              </a>
              <Link 
                to="/my-account" 
                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-orange-500 group-hover:shadow-[0_0_8px_rgba(255,112,0,0.6)] transition-all" />
                My account
              </Link>
            </div>
          </div>

          {/* Legal Col */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.18em] relative pb-2 inline-block">
              Legal
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-orange-600" />
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link 
                to="/terms" 
                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-orange-500 group-hover:shadow-[0_0_8px_rgba(255,112,0,0.6)] transition-all" />
                Terms & Conditions
              </Link>
              <Link 
                to="/privacy" 
                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-orange-500 group-hover:shadow-[0_0_8px_rgba(255,112,0,0.6)] transition-all" />
                Privacy Policy
              </Link>
              <Link 
                to="/refund" 
                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-orange-500 group-hover:shadow-[0_0_8px_rgba(255,112,0,0.6)] transition-all" />
                Refund Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5 text-zinc-500 text-xs">
          <p>© {currentYear} Basico. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-white/5 backdrop-blur-sm">
              <Bolt size={14} className="text-orange-500" /> Livraison instantanée
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-white/5 backdrop-blur-sm">
              <Lock size={14} className="text-orange-500" /> Paiement sécurisé
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-white/5 backdrop-blur-sm">
              <Headset size={14} className="text-orange-500" /> Support Discord
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
