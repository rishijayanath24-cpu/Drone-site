'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { getReviews, createReview, getDrones, type Review, type Drone } from '@/lib/api';

function StarRating({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onRate?.(star)}
          onMouseEnter={() => onRate && setHovered(star)}
          onMouseLeave={() => onRate && setHovered(0)}
          className={`text-2xl transition-transform ${onRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${
            star <= (hovered || rating) ? 'text-yellow-400' : 'text-white/15'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ drone: '', name: '', email: '', rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    getReviews().then(setReviews).catch(console.error);
    getDrones().then(setDrones).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.drone || !form.name || !form.email || !form.rating || !form.comment) return;
    setSubmitting(true);
    try {
      const review = await createReview({
        drone: parseInt(form.drone),
        name: form.name,
        email: form.email,
        rating: form.rating,
        comment: form.comment,
      });
      setReviews(prev => [review, ...prev]);
      setForm({ drone: '', name: '', email: '', rating: 0, comment: '' });
      setShowForm(false);
      setToast('Review submitted! Thank you.');
      setTimeout(() => setToast(''), 3500);
    } catch {
      setToast('Failed to submit review.');
      setTimeout(() => setToast(''), 3500);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <section id="reviews" className="py-32 bg-[#111111]" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
        >
          <div>
            <p className="text-[#0071e3] text-sm font-semibold tracking-widest uppercase mb-4">Reviews</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              What pilots are saying.
            </h2>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="shrink-0 border border-white/20 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-colors text-sm"
          >
            {showForm ? 'Cancel' : '+ Write a Review'}
          </button>
        </motion.div>

        {/* Review form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#1d1d1f] rounded-3xl p-8 mb-10 border border-white/5 overflow-hidden"
            >
              <h3 className="text-white font-semibold text-lg mb-6">Share your experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text" placeholder="Your name" value={form.name} required
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-white/30 transition-colors"
                />
                <input
                  type="email" placeholder="Your email" value={form.email} required
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <select
                value={form.drone} required
                onChange={e => setForm(f => ({ ...f, drone: e.target.value }))}
                className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors mb-4 appearance-none"
              >
                <option value="" className="bg-[#2a2a2c]">Select drone you flew…</option>
                {drones.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#2a2a2c]">{d.name}</option>
                ))}
              </select>
              <div className="mb-4">
                <p className="text-sm text-[#86868b] mb-2">Rating</p>
                <StarRating rating={form.rating} onRate={r => setForm(f => ({ ...f, rating: r }))} />
              </div>
              <textarea
                placeholder="Tell us about your experience…" value={form.comment} required rows={3}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-white/30 transition-colors resize-none mb-5"
              />
              <button
                type="submit" disabled={submitting || form.rating === 0}
                className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-[#e8e8e8] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Reviews grid */}
        {reviews.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="text-center text-[#86868b] py-16"
          >
            No reviews yet. Be the first to share your experience!
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="bg-[#1d1d1f] rounded-2xl p-6 border border-white/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold">{review.name}</p>
                    <p className="text-[#0071e3] text-xs mt-0.5">{review.drone_name}</p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-[#86868b] text-sm leading-relaxed mb-3">"{review.comment}"</p>
                <p className="text-[#444] text-xs">{formatDate(review.created_at)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-2xl font-medium shadow-2xl z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
