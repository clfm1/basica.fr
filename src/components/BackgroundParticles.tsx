import { useEffect, useRef } from 'react';

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dots: any[] = [];
    let rafId: number;

    const cfg = {
      count: 200,
      color: "255, 112, 0", // Orange RGB
      minSize: 1.5,
      maxSize: 4.0,
      minSpeed: 0.35,
      maxSpeed: 1.2
    };

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function rand(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    function makeDot(spawnMode: 'preload' | 'top') {
      const y = spawnMode === 'preload' ? rand(-h, h) : rand(-h, 0);
      return {
        x: rand(0, w),
        y: y,
        r: rand(cfg.minSize, cfg.maxSize),
        v: rand(cfg.minSpeed, cfg.maxSpeed),
        a: rand(0.25, 0.9)
      };
    }

    function init() {
      resize();
      dots = [];
      for (let i = 0; i < cfg.count; i++) {
        dots.push(makeDot('preload'));
      }
    }

    function drawFrame() {
      ctx!.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.y += d.v;

        if (d.y > h + 10) {
          dots[i] = makeDot('top');
        }

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${cfg.color}, ${d.a})`;
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function tick() {
      drawFrame();
      rafId = requestAnimationFrame(tick);
    }

    init();
    tick();

    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[999999]"
      aria-hidden="true"
    />
  );
}
