'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { getDrones, createRental, getDroneAvailability, type Drone, type AvailabilitySlot } from '@/lib/api';

interface Props {
  preselectedDroneId: number | null;
}

function AvailabilityCalendar({ slots }: { slots: AvailabilitySlot[] }) {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const isBooked = (day: Date) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return slots.some(slot => {
      const slotStart = new Date(slot.start);
      // If active with no end, assume it extends indefinitely
      const slotEnd = slot.end ? new Date(slot.end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return slotStart < dayEnd && slotEnd > dayStart;
    });
  };

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="mt-3 bg-[#222] rounded-xl p-4 border border-white/8">
      <p className="text-xs text-[#86868b] mb-3 font-medium">Availability — next 14 days</p>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => {
          const booked = isBooked(day);
          return (
            <div
              key={i}
              className={`text-center py-2 rounded-lg text-xs font-medium ${
                booked
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-green-500/15 text-green-400'
              }`}
            >
              <div className="text-[9px] opacity-60 mb-0.5">{dayNames[day.getDay()]}</div>
              <div>{day.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-5 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-green-500/60" />
          <span className="text-[10px] text-[#86868b]">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-red-500/60" />
          <span className="text-[10px] text-[#86868b]">Booked</span>
        </div>
      </div>
    </div>
  );
}

export default function BookingForm({ preselectedDroneId }: Props) {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    drone: '',
    start_time: '',
    end_time: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[] | null>(null);
  const [loadingAvail, setLoadingAvail] = useState(false);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    getDrones().then(setDrones).catch(console.error);
  }, []);

  useEffect(() => {
    if (preselectedDroneId !== null) {
      setForm(f => ({ ...f, drone: String(preselectedDroneId) }));
    }
  }, [preselectedDroneId]);

  // Fetch availability when drone changes
  useEffect(() => {
    if (!form.drone) {
      setAvailability(null);
      return;
    }
    setLoadingAvail(true);
    getDroneAvailability(parseInt(form.drone))
      .then(setAvailability)
      .catch(() => setAvailability(null))
      .finally(() => setLoadingAvail(false));
  }, [form.drone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.drone || !form.start_time) return;
    setLoading(true);
    try {
      await createRental({
        name: form.name,
        email: form.email,
        drone: parseInt(form.drone),
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : undefined,
      });
      setToast({ msg: 'Drone booked! Check your history for updates.', type: 'success' });
      setForm({ name: '', email: '', drone: '', start_time: '', end_time: '' });
      setAvailability(null);
      getDrones().then(setDrones).catch(console.error);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      let display = 'Something went wrong. Please try again.';
      try {
        const parsed = JSON.parse(msg);
        if (parsed.drone) display = `Drone: ${parsed.drone[0]}`;
        else if (parsed.non_field_errors) display = parsed.non_field_errors[0];
      } catch {}
      setToast({ msg: display, type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const availableDrones = drones.filter(d => d.is_available);

  return (
    <section id="booking" className="py-32 bg-[#111111]" ref={ref}>
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="text-[#0071e3] text-sm font-semibold tracking-widest uppercase mb-4">Book a Drone</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-5">
            Ready to take flight?
          </h2>
          <p className="text-[#86868b] text-lg">
            Fill in your details and we'll have a drone at your door today.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-[#1d1d1f] rounded-3xl p-8 md:p-10 border border-white/5 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-[#86868b] mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Alex Johnson"
              required
              className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-[#555] focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#86868b] mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="alex@example.com"
              required
              className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-[#555] focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#86868b] mb-2">Select Drone</label>
            <select
              name="drone"
              value={form.drone}
              onChange={handleChange}
              required
              className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
            >
              <option value="" className="bg-[#2a2a2c]">Choose a drone…</option>
              {availableDrones.map(d => (
                <option key={d.id} value={d.id} className="bg-[#2a2a2c]">
                  {d.name} — ${d.price_per_hour}/hr
                </option>
              ))}
            </select>
            {availableDrones.length === 0 && (
              <p className="text-[#86868b] text-xs mt-2">No drones available right now. Check back soon.</p>
            )}

            {/* Availability calendar */}
            <AnimatePresence>
              {form.drone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {loadingAvail ? (
                    <div className="mt-3 bg-[#222] rounded-xl p-4 border border-white/8">
                      <p className="text-xs text-[#555] animate-pulse">Loading availability…</p>
                    </div>
                  ) : availability !== null ? (
                    <AvailabilityCalendar slots={availability} />
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#86868b] mb-2">Start Time</label>
              <input
                type="datetime-local"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#86868b] mb-2">
                End Time <span className="text-[#555] font-normal">(optional)</span>
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                min={form.start_time || new Date().toISOString().slice(0, 16)}
                className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 transition-colors"
              />
              <p className="text-[#555] text-xs mt-1.5">Schedule a return time in advance</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || availableDrones.length === 0}
            className="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-[#e8e8e8] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Booking…' : 'Confirm Booking'}
          </button>
        </motion.form>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-2xl font-medium shadow-2xl z-50 text-sm whitespace-nowrap ${
              toast.type === 'success' ? 'bg-white text-black' : 'bg-red-500 text-white'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
