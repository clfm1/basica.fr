import { useEffect, useState, useRef, ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { Smile, Box, Layers } from 'lucide-react';

interface StatProps {
  icon: ReactNode;
  value: number;
  suffix?: string;
  label: string;
}

function StatCard({ icon, value, suffix = "", label }: StatProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      let startTime: number | null = null;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const currentCount = Math.floor(progress * end);
        setCount(currentCount);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="group relative rounded-3xl border border-orange-500/30 bg-black overflow-hidden perspective-1000">
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6 flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-br from-zinc-950 to-black transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,112,0,0.15)]">
        <div className="relative mb-2">
          <div className="absolute inset-0 bg-orange-500/40 blur-xl rounded-full" />
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-b from-orange-400 via-orange-500 to-orange-900 border border-white/10 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,112,0,0.4)] group-hover:scale-110 group-hover:-rotate-3 transition-all">
            {icon}
          </div>
        </div>
        
        <div className="text-3xl font-black tracking-tight text-white group-hover:tracking-wider transition-[letter-spacing]">
          {count.toLocaleString()}{suffix}
        </div>
        
        <div className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase group-hover:text-zinc-300 transition-colors">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function Accomplishments() {
  return (
    <section className="relative w-full py-16 px-4">
      <div className="max-w-[1200px] mx-auto text-center">
        <header className="mb-10">
          <h2 className="text-3xl font-black tracking-[0.14em] uppercase inline-block relative pb-2 mb-3">
            NOS RÉALISATIONS
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_16px_rgba(255,112,0,0.6)]" />
          </h2>
          <p className="text-[15px] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Des résultats concrets pour nos clients — satisfaction garantie, commandes livrées instantanément, 
            et un support toujours à votre écoute.
          </p>
        </header>

        <div className="grid sm:grid-cols-3 gap-6">
          <StatCard 
            icon={<Smile size={24} />} 
            value={100} 
            suffix="%" 
            label="Satisfaction Client" 
          />
          <StatCard 
            icon={<Box size={24} />} 
            value={15000} 
            suffix="+" 
            label="Commandes Terminées" 
          />
          <StatCard 
            icon={<Layers size={24} />} 
            value={15} 
            suffix="+" 
            label="Produits Disponibles" 
          />
        </div>
      </div>
    </section>
  );
}
