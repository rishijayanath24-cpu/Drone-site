'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Fleet', href: '#fleet' },
  { label: 'Rent', href: '#booking' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'History', href: '/history' },
  { label: 'Admin', href: '/admin' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-xl tracking-tight">
          DroneRent
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <li key={link.label}>
              {link.href.startsWith('/') ? (
                <Link
                  href={link.href}
                  className="text-sm text-[#86868b] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  onClick={e => handleScroll(e, link.href)}
                  className="text-sm text-[#86868b] hover:text-white transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <a
          href="#booking"
          onClick={e => handleScroll(e, '#booking')}
          className="hidden md:block bg-white text-black text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#e0e0e0] transition-colors"
        >
          Rent Now
        </a>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          <div className={`w-5 h-0.5 bg-white transition-all mb-1 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`w-5 h-0.5 bg-white transition-all mb-1 ${menuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black/95 border-t border-white/5 px-6 py-4"
        >
          {links.map(link => (
            <div key={link.label} className="py-3 border-b border-white/5">
              {link.href.startsWith('/') ? (
                <Link href={link.href} className="text-white text-base" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  onClick={e => handleScroll(e, link.href)}
                  className="text-white text-base"
                >
                  {link.label}
                </a>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
}
