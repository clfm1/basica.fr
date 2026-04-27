import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, User, Menu, X, Disc, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // Close menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'My Account', href: '/my-account', mobileOnly: true },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Refund Policy', href: '/refund' },
  ];

  return (
    <>
      <nav className="relative w-full text-white bg-black z-[999] font-sans border-b border-white/5">
        <div className="max-w-[1520px] mx-auto px-5 h-[90px] lg:h-[100px] flex items-center justify-between gap-4">
          {/* Brand */}
          <Link 
            to="/" 
            onClick={handleNavClick}
            className="flex items-center gap-3 transition-colors group"
          >
            <img 
              src="/logo.png" 
              alt="Basico Logo" 
              className="w-14 h-14 rounded-full object-cover border border-orange-900 group-hover:border-orange-500 group-hover:shadow-[0_0_18px_rgba(255,112,0,0.55)] transition-all" 
            />
            <div className="flex flex-col">
              <motion.span 
                animate={{ 
                  backgroundPosition: ["0% 50%", "200% 50%"] 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="font-black text-2xl tracking-tighter bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400 bg-[length:200%_auto] bg-clip-text text-transparent"
              >
                BASICO
              </motion.span>
              <span className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-[0.2em]">Meilleur shop Fitness & Gaming</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-3 mx-4">
            <Link 
              to="/" 
              onClick={handleNavClick}
              className="rounded-full px-5.5 py-2.5 text-[0.95rem] bg-orange-600/80 border border-orange-500 hover:bg-orange-500 hover:shadow-[0_0_18px_rgba(255,112,0,0.45)] transition-all"
            >
              Home
            </Link>
            <div className="relative group/dropdown">
              <button className="flex items-center gap-1.5 rounded-full px-5.5 py-2.5 text-[0.95rem] text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent transition-all">
                Legal <ChevronDown size={14} />
              </button>
              <div className="absolute top-full left-0 mt-2 min-w-[200px] rounded-xl border border-orange-900 bg-black/95 shadow-2xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible group-hover/dropdown:translate-y-0 translate-y-2 transition-all p-1.5 z-50">
                <Link 
                  to="/terms" 
                  onClick={handleNavClick}
                  className="block px-4 py-2.5 text-[0.9rem] text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Terms & Conditions
                </Link>
                <Link 
                  to="/privacy" 
                  onClick={handleNavClick}
                  className="block px-4 py-2.5 text-[0.9rem] text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/refund" 
                  onClick={handleNavClick}
                  className="block px-4 py-2.5 text-[0.9rem] text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <Link 
              to="/my-account" 
              onClick={handleNavClick}
              className="hidden lg:flex w-10 h-10 rounded-full bg-zinc-900 border border-white/10 items-center justify-center text-gray-400 hover:text-white hover:bg-zinc-800 hover:border-white/20 transition-all"
            >
              <User size={18} />
            </Link>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-zinc-800 hover:border-white/20 transition-all relative"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1.5 rounded-full bg-white text-black text-[11px] font-extrabold flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

            <a href="https://discord.gg/basico" target="_blank" rel="noopener noreferrer" className="hidden lg:flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-orange-600/80 border border-orange-500 hover:bg-orange-500 hover:shadow-[0_0_18px_rgba(255,112,0,0.45)] transition-all group">
              <Disc size={18} className="group-hover:rotate-[360deg] transition-transform duration-700" />
              <span className="font-medium text-[0.95rem]">Join Discord</span>
            </a>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-gray-200"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-black overflow-hidden border-t border-orange-900/30 px-5"
            >
              <div className="py-2 space-y-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.href} 
                    onClick={handleNavClick}
                    className="block py-3 text-[0.95rem] text-gray-300 border-b border-orange-900/20 last:border-0 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <a 
                  href="https://discord.gg/basico" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block py-3 text-[0.95rem] text-gray-300 hover:text-white transition-colors"
                >
                  Join Discord
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow Line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500/80 to-transparent shadow-[0_0_8px_rgba(255,112,0,0.4)] pointer-events-none" />
      </nav>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-[420px] h-full bg-[#050505] border-l border-white/10 shadow-[-18px_0_50px_rgba(0,0,0,0.5)] z-[99999] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-extrabold tracking-tight">Shopping Cart</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 rounded-full bg-zinc-900/50 border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cartCount === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative text-zinc-100">
                      <ShoppingCart size={48} />
                      <span className="absolute -top-1 -right-2 min-w-[20px] h-[20px] rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">0</span>
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-widest text-white">Shopping Cart</h3>
                    <p className="text-zinc-400 text-lg">No products in the cart.</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-all border border-white/5 active:scale-95"
                    >
                      Return To Shop
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart items would go here */}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
