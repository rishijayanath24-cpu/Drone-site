'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { getSiteStats, type SiteStats } from '@/lib/api';

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1800;
    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * ease);
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value]);

  return <>{decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}</>;
}

const defaultStats: SiteStats = {
  total_drones: 5,
  available_drones: 5,
  total_rentals: 0,
  total_reviews: 0,
  avg_rating: 0,
  total_hours_flown: 0,
};

export default function StatsSection() {
  const [stats, setStats] = useState<SiteStats>(defaultStats);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    getSiteStats().then(setStats).catch(console.error);
  }, []);

  const items = [
    { label: 'Drones in Fleet', value: stats.total_drones, suffix: '+', decimals: 0 },
    { label: 'Total Rentals', value: stats.total_rentals, suffix: '+', decimals: 0 },
    { label: 'Hours Flown', value: stats.total_hours_flown, suffix: 'h', decimals: 1 },
    { label: 'Avg Rating', value: stats.avg_rating || 5.0, suffix: '★', decimals: 1 },
  ];

  return (
    <section className="py-24 bg-[#0a0a0a] border-y border-white/5" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-bold text-white mb-2 tabular-nums">
                {isInView ? <AnimatedNumber value={item.value} decimals={item.decimals} /> : '0'}
                <span className="text-[#0071e3]">{item.suffix}</span>
              </p>
              <p className="text-[#86868b] text-sm font-medium tracking-wide">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
