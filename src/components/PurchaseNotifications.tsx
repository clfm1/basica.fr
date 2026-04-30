import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

const BUYERS = [
  'Noa_92',
  'Client #4182',
  'M. D.',
  'Sacha.l',
  'Kylian77',
  'Lea-B',
  'A. Moreau',
  'yxNora',
  'Tom_Paris',
  'Client verifie',
];

type PurchaseToast = {
  id: number;
  product: Product;
  buyer: string;
};

const DISPLAY_TIME = 6500;
const MAX_DELAY = 5 * 60 * 1000;

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export default function PurchaseNotifications() {
  const products = useMemo(
    () => PRODUCTS.filter((product) => !product.categories.includes('currency')),
    []
  );
  const [notification, setNotification] = useState<PurchaseToast | null>(null);

  useEffect(() => {
    if (products.length === 0) return;

    let showTimer: number;
    let hideTimer: number;

    const scheduleNext = (delay = Math.random() * MAX_DELAY) => {
      showTimer = window.setTimeout(() => {
        setNotification({
          id: Date.now(),
          product: pickRandom(products),
          buyer: pickRandom(BUYERS),
        });

        hideTimer = window.setTimeout(() => {
          setNotification(null);
          scheduleNext();
        }, DISPLAY_TIME);
      }, delay);
    };

    scheduleNext(1200);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [products]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none w-[calc(100vw-2rem)] max-w-[360px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#070407]/95 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.75),0_0_26px_rgba(249,115,22,0.18)] backdrop-blur-xl"
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
            <img src={notification.product.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-orange-300/40 bg-orange-600 text-white shadow-lg">
              <ShoppingBag size={13} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-300">
              {notification.buyer} vient d'acheter
            </p>
            <p className="truncate text-sm font-black text-white">{notification.product.name}</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-sm font-extrabold text-orange-500">
                {notification.product.price}€
              </span>
              <span className="whitespace-nowrap text-[11px] font-medium text-zinc-400">
                maintenant
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
