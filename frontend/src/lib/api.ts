const BASE = '/api';

export interface DroneImage {
  id: number;
  image_url: string;
  caption: string;
  order: number;
}

export interface Drone {
  id: number;
  name: string;
  model: string;
  image_url: string;
  price_per_hour: string;
  description: string;
  is_available: boolean;
  images: DroneImage[];
}

export interface Rental {
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
}

export async function getDrones(): Promise<Drone[]> {
  const res = await fetch(`${BASE}/drones/`);
  if (!res.ok) throw new Error('Failed to fetch drones');
  return res.json();
}

export async function createRental(data: {
  name: string;
  email: string;
  drone: number;
  start_time: string;
  end_time?: string;
}): Promise<Rental> {
  const res = await fetch(`${BASE}/rentals/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function getRentalHistory(email: string): Promise<Rental[]> {
  const res = await fetch(`${BASE}/rentals/history/?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error('Failed to fetch rental history');
  return res.json();
}

export async function returnDrone(rentalId: number): Promise<Rental> {
  const res = await fetch(`${BASE}/rentals/${rentalId}/return/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export interface Review {
  id: number;
  drone: number;
  drone_name: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface SiteStats {
  total_drones: number;
  available_drones: number;
  total_rentals: number;
  total_reviews: number;
  avg_rating: number;
  total_hours_flown: number;
}

export async function getReviews(droneId?: number): Promise<Review[]> {
  const url = droneId ? `${BASE}/reviews/?drone=${droneId}` : `${BASE}/reviews/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function createReview(data: {
  drone: number;
  name: string;
  email: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const res = await fetch(`${BASE}/reviews/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function getSiteStats(): Promise<SiteStats> {
  const res = await fetch(`${BASE}/stats/`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export interface AvailabilitySlot {
  start: string;
  end: string | null;
  status: 'active' | 'completed';
  renter: string;
}

export async function getDroneAvailability(droneId: number): Promise<AvailabilitySlot[]> {
  const res = await fetch(`${BASE}/drones/${droneId}/availability/`);
  if (!res.ok) throw new Error('Failed to fetch availability');
  return res.json();
}

export interface AdminStats {
  days: { date: string; bookings: number; revenue: number }[];
  top_drones: { name: string; rental_count: number }[];
  total_revenue: number;
}

export async function getAdminStats(password: string): Promise<AdminStats> {
  const res = await fetch(`${BASE}/admin/stats/?password=${encodeURIComponent(password)}`);
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Failed to fetch admin stats');
  return res.json();
}
