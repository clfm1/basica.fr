import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  ChevronRight, 
  PlusCircle, 
  Link, 
  Calendar, 
  Paperclip, 
  MessageSquare,
  MoreHorizontal,
  Plus
} from 'lucide-react';

export default function VideoShowcase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    let particles: Particle[] = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = -Math.random() * 0.5 - 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y < 0) {
          this.y = height;
          this.x = Math.random() * width;
        }
        if (this.x < 0 || this.x > width) {
          this.speedX *= -1;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    initParticles();
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-[#050505] text-white overflow-hidden py-24 selection:bg-white/20">
      {/* Particle Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0 opacity-60" 
      />

      {/* Simulated Light Beams */}
      <div 
        className="absolute top-[-10%] right-[10%] w-[60vw] h-[120vh] pointer-events-none z-0" 
        style={{ 
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)', 
          transform: 'rotate(-35deg)', 
          filter: 'blur(80px)', 
          transformOrigin: 'top center' 
        }}
      />
      <div 
        className="absolute top-[-5%] right-[20%] w-[30vw] h-[100vh] pointer-events-none z-0" 
        style={{ 
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)', 
          transform: 'rotate(-35deg)', 
          filter: 'blur(40px)', 
          transformOrigin: 'top center' 
        }}
      />

      <div className="relative z-10 container mx-auto px-6 sm:px-12 lg:px-24 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0">
        
        {/* Left Column: Copy */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full lg:w-5/12 flex flex-col items-start z-20"
        >
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm mb-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]"
          >
            <FileText size={16} className="text-white/70" />
            <span className="text-xs font-medium text-white/80 tracking-wide uppercase tracking-[0.1em]">Premium</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] text-white mb-6">
            Le meilleur shop <br/>
            <span className="font-serif italic font-normal text-white/90">— de 2026.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base text-white/50 max-w-sm leading-relaxed font-light">
            Plus de 9k de commandes réussies. Un shop extrêmement rapide avec une livraison instantanée et un support client d'exception.
          </p>
        </motion.div>

        {/* Right Column: 3D UI Composition */}
        <div className="w-full lg:w-7/12 relative h-[500px] sm:h-[600px] lg:h-[800px] flex items-center justify-center pointer-events-none" style={{ perspective: '1200px' }}>
          
          {/* 3D Transform Group */}
          <motion.div 
            animate={{ 
              rotateY: [-18, -16, -18],
              rotateX: [12, 13.5, 12],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative w-full max-w-[600px] aspect-square" 
            style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-18deg) rotateX(12deg) rotateZ(4deg)' }}
          >
            
            {/* Background Dashboard Layer */}
            <div 
              className="absolute inset-0 rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl overflow-hidden shadow-2xl"
              style={{ 
                transform: 'translateZ(-100px) scale(1.1)', 
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 48px -12px rgba(0,0,0,0.8)' 
              }}
            >
              <div className="h-16 border-b border-white/10 flex items-center px-6 gap-4 opacity-40">
                <span className="text-xs text-white/50">Catalogue</span>
                <ChevronRight size={12} className="text-white/30" />
                <span className="text-xs text-white/50">Catalogue Fitness & Gaming</span>
              </div>

              <div className="p-6 opacity-30 flex flex-col gap-6">
                <h2 className="text-xl font-medium text-white flex items-center gap-2">
                  Dashboard Revendeur <Link size={16} className="text-white/50" />
                </h2>
                
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">Commandes</span>
                      <PlusCircle size={16} className="text-white/50" />
                    </div>
                    <div className="h-32 rounded-xl border border-white/10 bg-white/[0.02]" />
                    <div className="h-24 rounded-xl border border-white/10 bg-white/[0.02]" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">Livrées</span>
                      <PlusCircle size={16} className="text-white/50" />
                    </div>
                    <div className="h-24 rounded-xl border border-white/10 bg-white/[0.02]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Foreground Cards */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6" style={{ transform: 'translateZ(50px)' }}>
              
              {/* Card 1: In Progress */}
              <motion.div 
                animate={{ y: [-30, -38, -30] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-[90%] sm:w-[420px] rounded-2xl bg-[#141414]/90 backdrop-blur-2xl border border-white/10 p-1 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7),_inset_0_1px_0_rgba(255,255,255,0.1)]"
                style={{ transform: 'translateX(20px) translateY(-30px)' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                  <span className="text-xs font-medium text-white/80">Produit Vedette</span>
                  <div className="flex items-center gap-2 text-white/40">
                    <Plus size={16} />
                    <MoreHorizontal size={16} />
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded bg-[#3A2A1D] text-[#FFA88A] text-[10px] font-medium tracking-wide font-black uppercase">Best Seller</div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/[0.05] bg-white/[0.02] text-xs text-white/60">
                      <Calendar size={14} />
                      Mis à jour
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base text-white font-medium mb-1.5 tracking-tight">Pass Fitness Premium</h3>
                    <p className="text-xs text-white/40 leading-relaxed font-light line-clamp-2">
                      Comptes Basic Fit & Fitness Park à prix réduit. Accès national, sans engagement et livraison instantanée.
                    </p>
                  </div>

                  <div className="mt-2">
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-white/40 to-white/80 rounded-full w-3/4" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1 pt-4 border-t border-white/[0.04]">
                    <div className="flex items-center -space-x-2">
                      <div className="w-6 h-6 rounded-full border-2 border-[#141414] bg-neutral-700 flex items-center justify-center text-[8px] text-white/80">JD</div>
                      <div className="w-6 h-6 rounded-full border-2 border-[#141414] bg-neutral-600 flex items-center justify-center text-[8px] text-white/80">AL</div>
                      <div className="w-6 h-6 rounded-full border-2 border-[#141414] bg-neutral-800 flex items-center justify-center text-[8px] text-white/50">+3</div>
                    </div>
                    <div className="flex items-center gap-3 text-white/40 text-xs">
                      <div className="flex items-center gap-1">
                        <Paperclip size={14} />
                        <span>4</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span>12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Secondary Task */}
              <motion.div 
                animate={{ y: [10, 16, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="w-[90%] sm:w-[420px] rounded-2xl bg-[#141414]/90 backdrop-blur-2xl border border-white/10 p-1 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7),_inset_0_1px_0_rgba(255,255,255,0.05)]"
                style={{ transform: 'translateX(-30px) translateY(10px)' }}
              >
                <div className="p-5 flex flex-col gap-4">
                  <div className="absolute top-4 right-4 text-white/30">
                    <MoreHorizontal size={16} />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded bg-[#1D2A3A] text-[#8AC1FF] text-[10px] font-medium tracking-wide uppercase">Nouveau</div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/[0.05] bg-white/[0.02] text-xs text-white/60">
                      <Calendar size={14} />
                      Stock: Illimité
                    </div>
                  </div>

                  <div className="pr-6">
                    <h3 className="text-base text-white font-medium mb-1.5 tracking-tight">Gaming & Monnaies</h3>
                    <p className="text-xs text-white/40 leading-relaxed font-light line-clamp-2">
                      Comptes Valorant, Fortnite et monnaies de jeux (V-Bucks, Robux). Le plein de ressources pour vos jeux préférés.
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-white/40 to-white/80 rounded-full w-[30%]" />
                    </div>
                    <span className="text-[10px] text-white/40 whitespace-nowrap">2 / 7</span>
                  </div>

                  <div className="flex items-center justify-between mt-1 pt-4 border-t border-white/[0.04]">
                    <div className="flex items-center -space-x-2">
                      <div className="w-6 h-6 rounded-full border-2 border-[#141414] bg-neutral-600 flex items-center justify-center text-[8px] text-white/80">MK</div>
                    </div>
                    <div className="flex items-center gap-3 text-white/40 text-xs">
                      <div className="flex items-center gap-1">
                        <Paperclip size={14} />
                        <span>1</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span>3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
