'use client';

import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import DroneListingSection from '@/components/DroneListingSection';
import BookingForm from '@/components/BookingForm';
import ReviewsSection from '@/components/ReviewsSection';
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function HomePage() {
  const [selectedDroneId, setSelectedDroneId] = useState<number | null>(null);

  const handleBookDrone = (droneId: number) => {
    setSelectedDroneId(droneId);
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DroneListingSection onBookDrone={handleBookDrone} />
      <BookingForm preselectedDroneId={selectedDroneId} />
      <ReviewsSection />
      <Footer />
    </main>
  );
}
