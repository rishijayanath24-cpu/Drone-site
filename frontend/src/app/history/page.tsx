'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getRentalHistory, returnDrone } from '@/lib/api';

interface Rental {
  id: number;
  name: string;
  email: string;
  drone: number;
  drone_name: string;
  drone_model: string;
  start_time: string;
  end_time: string | null;
  total_cost: string;
  returned: boolean;
  created_at: string;
  drone_price_per_hour?: string;
}

function LiveCostMeter({ startTime, pricePerHour }: { startTime: string; pricePerHour: number }) {
  const [cost, setCost] = useState(0);
  const [elapsed, setElapsed] = useState('');
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const tick = () => {
      const now = Date.now();
      const diffMs = Math.max(0, now - start);
      const hours = diffMs / 3600000;
      setCost(hours * pricePerHour);
      const totalSecs = Math.floor(diffMs / 1000);
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      setElapsed(
        h > 0
          ? `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
          : `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [startTime, pricePerHour]);

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-green-400 text-xs font-semibold tracking-wide uppercase">Live Meter</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[#86868b] text-xs mb-1">Currently due</p>
          <p className="text-3xl font-bold text-white tabular-nums">${cost.toFixed(4)}</p>
        </div>
        <div className="text-right">
          <p className="text-[#86868b] text-xs mb-1">Time elapsed</p>
          <p className="text-white font-mono text-sm tabular-nums">{elapsed}</p>
        </div>
      </div>
      <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [email, setEmail] = useState('');
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [returning, setReturning] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const data = await getRentalHistory(email.trim());
      setRentals(data);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (rentalId: number) => {
    setReturning(rentalId);
    try {
      const updated = await returnDrone(rentalId);
      setRentals(prev => prev.map(r => (r.id === rentalId ? { ...r, ...updated } : r)));
      setToast('Drone returned successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('Failed to return drone. Try again.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setReturning(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const activeRentals = rentals.filter(r => !r.returned);
  const pastRentals = rentals.filter(r => r.returned);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f7]">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl bg-black/60 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white font-semibold text-lg tracking-tight">DroneRent</Link>
          <Link href="/" className="text-sm text-[#86868b] hover:text-white transition-colors">← Back to Home</Link>
        </div>
      </nav>

      <div className="pt-28 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Rental History</h1>
          <p className="text-[#86868b] text-lg">Track active rentals with a live cost meter and view past flights.</p>
        </motion.div>

        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-3 max-w-lg mx-auto mb-16"
        >
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" required
            className="flex-1 bg-[#1d1d1f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-white/30 transition-colors"
          />
          <button type="submit" disabled={loading}
            className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-[#f0f0f0] transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </motion.form>

        <AnimatePresence>
          {searched && rentals.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center text-[#86868b] text-lg"
            >
              No rentals found for <span className="text-white">{email}</span>.
            </motion.p>
          )}

          {rentals.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {activeRentals.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Active Rentals
                  </h2>
                  <div className="space-y-4">
                    {activeRentals.map((rental, i) => (
                      <motion.div key={rental.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="bg-[#111111] border border-green-500/15 rounded-2xl p-6"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-white text-lg">{rental.drone_name}</h3>
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">Active</span>
                            </div>
                            <p className="text-[#86868b] text-sm">{rental.drone_model}</p>
                            <p className="text-[#555] text-xs mt-1">Started {formatDate(rental.start_time)}</p>
                            <LiveCostMeter
                              startTime={rental.start_time}
                              pricePerHour={parseFloat(rental.drone_price_per_hour ?? '0')}
                            />
                          </div>
                          <button
                            onClick={() => handleReturn(rental.id)}
                            disabled={returning === rental.id}
                            className="shrink-0 bg-white text-black font-semibold px-5 py-2.5 rounded-xl hover:bg-[#f0f0f0] transition-colors disabled:opacity-50 text-sm"
                          >
                            {returning === rental.id ? 'Returning…' : 'Return Drone'}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {pastRentals.length > 0 && (
                <div>
                  <h2 className="text-white font-semibold text-xl mb-4">Past Rentals</h2>
                  <div className="space-y-3">
                    {pastRentals.map((rental, i) => (
                      <motion.div key={rental.id}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-[#111111] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-white">{rental.drone_name}</h3>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-[#86868b]">Returned</span>
                          </div>
                          <p className="text-[#555] text-xs">
                            {formatDate(rental.start_time)} → {rental.end_time ? formatDate(rental.end_time) : '—'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-white font-bold text-lg">${parseFloat(rental.total_cost).toFixed(2)}</p>
                          <p className="text-[#555] text-xs">total charged</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-2xl font-medium shadow-2xl z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
