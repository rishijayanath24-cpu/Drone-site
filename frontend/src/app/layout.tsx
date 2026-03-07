import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DroneRent — Aerial Excellence on Demand',
  description: 'Rent professional drones for photography, surveying, agriculture and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-[#f5f5f7] antialiased">{children}</body>
    </html>
  );
}
