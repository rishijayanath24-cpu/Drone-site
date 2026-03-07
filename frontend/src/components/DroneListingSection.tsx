'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getDrones, type Drone } from '@/lib/api';

interface Props {
  onBookDrone: (droneId: number) => void;
}

function Lightbox({
  drone,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  drone: Drone;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const allImages = [
    { image_url: drone.image_url || 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800&q=80', caption: drone.name },
    ...drone.images,
  ];
  const current = allImages[index] ?? allImages[0];
  const total = allImages.length;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center px-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl leading-none transition-colors"
      >
        ×
      </button>

      <div className="relative w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
        <Image
          src={current.image_url}
          alt={current.caption || drone.name}
          fill
          className="object-contain"
          sizes="(max-width: 1200px) 100vw, 900px"
        />
      </div>

      {current.caption && (
        <p className="text-white/60 text-sm mt-4">{current.caption}</p>
      )}

      {total > 1 && (
        <div className="flex items-center gap-6 mt-5" onClick={e => e.stopPropagation()}>
          <button
            onClick={onPrev}
            className="text-white/60 hover:text-white text-2xl transition-colors px-3 py-1"
          >
            ‹
          </button>
          <span className="text-white/40 text-sm tabular-nums">{index + 1} / {total}</span>
          <button
            onClick={onNext}
            className="text-white/60 hover:text-white text-2xl transition-colors px-3 py-1"
          >
            ›
          </button>
        </div>
      )}

      {total > 1 && (
        <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => {/* handled via onPrev/onNext from parent */}}
              className={`w-10 h-6 rounded overflow-hidden border-2 transition-colors ${
                i === index ? 'border-white' : 'border-transparent opacity-50'
              }`}
            >
              <Image src={img.image_url} alt="" fill className="object-cover" sizes="40px" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CompareModal({ drones, onClose }: { drones: Drone[]; onClose: () => void }) {
  const rows: { label: string; key: keyof Drone | 'status' }[] = [
    { label: 'Model', key: 'model' },
    { label: 'Price / hr', key: 'price_per_hour' },
    { label: 'Status', key: 'status' },
    { label: 'Description', key: 'description' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center px-4 py-10 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl bg-[#111] rounded-3xl border border-white/10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <h2 className="text-white font-bold text-xl">Side-by-Side Comparison</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl leading-none transition-colors">×</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-left text-[#86868b] text-sm font-medium w-32">—</th>
                {drones.map(d => (
                  <th key={d.id} className="px-6 py-4 text-left">
                    <div className="relative h-28 rounded-xl overflow-hidden mb-3">
                      <Image
                        src={d.image_url || 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=400'}
                        alt={d.name}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </div>
                    <p className="text-white font-semibold">{d.name}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-4 text-[#86868b] text-sm font-medium">{row.label}</td>
                  {drones.map(d => (
                    <td key={d.id} className="px-6 py-4 text-white text-sm align-top">
                      {row.key === 'price_per_hour' && `$${d.price_per_hour}/hr`}
                      {row.key === 'status' && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          d.is_available
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {d.is_available ? 'Available' : 'Rented'}
                        </span>
                      )}
                      {row.key !== 'price_per_hour' && row.key !== 'status' && String(d[row.key as keyof Drone])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DroneListingSection({ onBookDrone }: Props) {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ drone: Drone; index: number } | null>(null);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    getDrones()
      .then(setDrones)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleCompare = (droneId: number) => {
    setCompareIds(prev => {
      if (prev.includes(droneId)) return prev.filter(id => id !== droneId);
      if (prev.length >= 3) return prev;
      return [...prev, droneId];
    });
  };

  const openLightbox = (drone: Drone, index = 0) => setLightbox({ drone, index });

  const moveLightbox = (dir: 1 | -1) => {
    if (!lightbox) return;
    const total = 1 + lightbox.drone.images.length;
    setLightbox(prev => prev ? { ...prev, index: (prev.index + dir + total) % total } : null);
  };

  const compareDrones = drones.filter(d => compareIds.includes(d.id));

  return (
    <section id="fleet" className="py-32 bg-[#0a0a0a]" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-[#0071e3] text-sm font-semibold tracking-widest uppercase mb-4">Our Fleet</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-5">
            Choose your drone.
          </h2>
          <p className="text-[#86868b] text-lg max-w-2xl mx-auto">
            From beginner-friendly minis to cinema-grade beasts — every drone is fully insured and ready to fly.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#111] rounded-3xl h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drones.map((drone, i) => {
              const isCompared = compareIds.includes(drone.id);
              const galleryImages = drone.images ?? [];

              return (
                <motion.div
                  key={drone.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className={`bg-[#111111] rounded-3xl overflow-hidden border transition-colors group cursor-default ${
                    isCompared ? 'border-[#0071e3]/50' : 'border-white/5'
                  }`}
                >
                  {/* Main Image */}
                  <div
                    className="relative h-52 overflow-hidden cursor-pointer"
                    onClick={() => openLightbox(drone, 0)}
                  >
                    <Image
                      src={drone.image_url || 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800&q=80'}
                      alt={drone.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />

                    {/* Gallery count badge */}
                    {galleryImages.length > 0 && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 text-white/70">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="text-white/70 text-xs">{galleryImages.length + 1}</span>
                      </div>
                    )}

                    <span
                      className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full ${
                        drone.is_available
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {drone.is_available ? 'Available' : 'Rented'}
                    </span>
                  </div>

                  {/* Gallery thumbnails */}
                  {galleryImages.length > 0 && (
                    <div className="flex gap-1.5 px-4 pt-3">
                      {galleryImages.slice(0, 3).map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => openLightbox(drone, idx + 1)}
                          className="relative flex-1 h-12 rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <Image src={img.image_url} alt={img.caption || ''} fill className="object-cover" sizes="80px" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-6 pt-4">
                    <h3 className="text-white font-semibold text-xl mb-1">{drone.name}</h3>
                    <p className="text-[#0071e3] text-sm font-medium mb-3">{drone.model}</p>
                    <p className="text-[#86868b] text-sm leading-relaxed mb-5 line-clamp-2">{drone.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold text-white">${drone.price_per_hour}</span>
                        <span className="text-[#86868b] text-sm"> / hr</span>
                      </div>
                      <button
                        onClick={() => onBookDrone(drone.id)}
                        disabled={!drone.is_available}
                        className="bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#e0e0e0] transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        Book Now
                      </button>
                    </div>

                    {/* Compare toggle */}
                    <button
                      onClick={() => toggleCompare(drone.id)}
                      className={`w-full text-xs py-2 rounded-xl border transition-colors font-medium ${
                        isCompared
                          ? 'border-[#0071e3]/50 text-[#0071e3] bg-[#0071e3]/10'
                          : 'border-white/10 text-[#86868b] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {isCompared ? '✓ Added to Compare' : '+ Compare'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compare bar */}
      <AnimatePresence>
        {compareIds.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#1d1d1f] border border-white/15 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              {compareDrones.map(d => (
                <span key={d.id} className="text-white text-sm font-medium">{d.name.split(' ').slice(0, 2).join(' ')}</span>
              )).reduce<React.ReactNode[]>((acc, el, i) => i === 0 ? [el] : [...acc, <span key={`sep-${i}`} className="text-[#555]">vs</span>, el], [])}
            </div>
            <button
              onClick={() => setShowCompare(true)}
              className="bg-white text-black font-semibold text-sm px-5 py-2 rounded-xl hover:bg-[#e8e8e8] transition-colors"
            >
              Compare
            </button>
            <button
              onClick={() => setCompareIds([])}
              className="text-[#555] hover:text-white transition-colors text-lg leading-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            drone={lightbox.drone}
            index={lightbox.index}
            onClose={() => setLightbox(null)}
            onPrev={() => moveLightbox(-1)}
            onNext={() => moveLightbox(1)}
          />
        )}
      </AnimatePresence>

      {/* Compare modal */}
      <AnimatePresence>
        {showCompare && (
          <CompareModal drones={compareDrones} onClose={() => setShowCompare(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}
