'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111111] border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold text-lg tracking-tight mb-1">DroneRent</p>
            <p className="text-[#555] text-sm">Aerial excellence on demand.</p>
          </div>

          <nav className="flex flex-wrap gap-6 justify-center">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Fleet', href: '#fleet' },
              { label: 'Book', href: '#booking' },
              { label: 'History', href: '/history' },
            ].map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-[#86868b] hover:text-white text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="text-[#555] text-sm">© {year} DroneRent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
