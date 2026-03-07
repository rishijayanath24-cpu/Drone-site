'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';
import { getAdminStats, type AdminStats } from '@/lib/api';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await getAdminStats(password);
      setStats(data);
      setAuthed(true);
    } catch (err) {
      if (err instanceof Error && err.message === 'UNAUTHORIZED') {
        setError('Incorrect password. Try: droneadmin2024');
      } else {
        setError('Failed to load stats. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-10">
            <p className="text-[#0071e3] text-sm font-semibold tracking-widest uppercase mb-3">Admin</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-[#86868b] text-sm mt-2">Enter the admin password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="bg-[#111] rounded-3xl p-8 border border-white/5 space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
              className="w-full bg-[#1d1d1f] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-[#555] focus:outline-none focus:border-white/30 transition-colors"
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-[#e8e8e8] transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6">
            <Link href="/" className="text-[#86868b] text-sm hover:text-white transition-colors">
              ← Back to site
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  const totalBookings = stats!.days.reduce((s, d) => s + d.bookings, 0);
  const peakDay = stats!.days.reduce((a, b) => a.revenue > b.revenue ? a : b, { date: '—', revenue: 0, bookings: 0 });

  const tooltipStyle = {
    background: '#1d1d1f',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 12,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f7]">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl bg-black/60 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold text-lg">Admin Dashboard</span>
            <span className="text-xs bg-[#0071e3]/20 text-[#0071e3] px-2 py-0.5 rounded-full font-medium">Live</span>
          </div>
          <Link href="/" className="text-sm text-[#86868b] hover:text-white transition-colors">
            ← Back to Site
          </Link>
        </div>
      </nav>

      <div className="pt-28 pb-24 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Revenue', value: `$${stats!.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'all time' },
              { label: 'Total Bookings', value: totalBookings, sub: 'last 30 days' },
              { label: 'Top Drone', value: stats!.top_drones[0]?.name.split(' ').slice(0, 2).join(' ') || '—', sub: 'most rented' },
              { label: 'Peak Day', value: peakDay.date === '—' ? '—' : peakDay.date, sub: `$${peakDay.revenue} revenue` },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-[#111] rounded-2xl p-5 border border-white/5"
              >
                <p className="text-[#86868b] text-xs mb-1">{card.label}</p>
                <p className="text-white font-bold text-lg truncate">{String(card.value)}</p>
                <p className="text-[#555] text-xs mt-0.5">{card.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Revenue line chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111] rounded-3xl p-6 border border-white/5 mb-6"
          >
            <h2 className="text-white font-semibold text-lg mb-1">Revenue</h2>
            <p className="text-[#86868b] text-sm mb-6">Daily revenue from completed rentals (last 30 days)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats!.days} margin={{ left: 0, right: 8 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#555', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: '#555', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `$${v}`}
                  width={45}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0071e3"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#0071e3' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bookings bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#111] rounded-3xl p-6 border border-white/5"
            >
              <h2 className="text-white font-semibold text-lg mb-1">Daily Bookings</h2>
              <p className="text-[#86868b] text-sm mb-6">Number of new bookings per day</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats!.days} margin={{ left: 0, right: 4 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#555', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={6}
                  />
                  <YAxis
                    tick={{ fill: '#555', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={25}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [v, 'Bookings']}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="bookings" fill="#0071e3" radius={[3, 3, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top drones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-[#111] rounded-3xl p-6 border border-white/5"
            >
              <h2 className="text-white font-semibold text-lg mb-1">Most Rented</h2>
              <p className="text-[#86868b] text-sm mb-6">Top drones by total rental count</p>
              {stats!.top_drones.length === 0 ? (
                <p className="text-[#555] text-sm">No rentals yet.</p>
              ) : (
                <div className="space-y-4">
                  {stats!.top_drones.map((d, i) => {
                    const maxCount = stats!.top_drones[0]?.rental_count || 1;
                    const pct = maxCount > 0 ? (d.rental_count / maxCount) * 100 : 0;
                    return (
                      <div key={d.name}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm text-white font-medium">{d.name}</span>
                          <span className="text-xs text-[#86868b] tabular-nums">
                            {d.rental_count} rental{d.rental_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#0071e3] to-[#34aadc] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
