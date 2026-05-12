// =============================================================================
// components/Explore/constants.ts — Constants, Types & Helpers
// =============================================================================

// ─── Quick Select Lists ────────────────────────────────────────────────────

export const QUICK_ORIGINS = [
  { id: 'lpugate', label: 'LPU Main Gate', icon: 'home' as const },
  { id: 'admin', label: 'Admin Block', icon: 'business' as const },
  { id: 'hostel', label: 'Hostel Blocks', icon: 'hotel' as const },
  { id: 'phagwara', label: 'Phagwara', icon: 'location-city' as const },
  { id: 'jalandhar', label: 'Jalandhar Station', icon: 'train' as const },
];

export const QUICK_DESTINATIONS = [
  { id: 'phagwara', label: 'Phagwara', icon: 'location-city' as const },
  { id: 'jalandhar', label: 'Jalandhar Station', icon: 'train' as const },
  { id: 'ludhiana', label: 'Ludhiana', icon: 'location-city' as const },
  { id: 'amritsar', label: 'Amritsar', icon: 'location-city' as const },
  { id: 'nakodar', label: 'Nakodar', icon: 'directions' as const },
  { id: 'kapurthala', label: 'Kapurthala', icon: 'directions' as const },
];

// ─── Campus & Outside Hubs ─────────────────────────────────────────────────

export const CAMPUS_HUBS = [
  { id: 'maingate', label: 'LPU Main Gate', subtitle: 'Main Entrance & Security', icon: 'home' as const },
  { id: 'lawgate', label: 'Law Gate', subtitle: 'LPU Law Avenue Entrance', icon: 'door-front' as const },
  { id: 'bh1', label: 'BH1', subtitle: 'Boys Hostel 1', icon: 'hotel' as const },
  { id: 'bh2', label: 'BH2', subtitle: 'Boys Hostel 2', icon: 'hotel' as const },
  { id: 'gh1', label: 'GH1', subtitle: 'Girls Hostel 1', icon: 'hotel' as const },
  { id: 'gh2', label: 'GH2', subtitle: 'Girls Hostel 2', icon: 'hotel' as const },
  { id: 'admin', label: 'Admin Block', subtitle: 'University Administration', icon: 'business' as const },
  { id: 'lib', label: 'Central Library', subtitle: 'Knowledge Hub & LRC', icon: 'local-library' as const },
  { id: 'foodcourt', label: 'Food Court', subtitle: 'Uni-zone Food Area', icon: 'restaurant' as const },
  { id: 'sports', label: 'Sports Complex', subtitle: 'Gymnasium & Grounds', icon: 'sports' as const },
];

export const OUTSIDE_HUBS = [
  { id: 'phagwara', label: 'Phagwara', subtitle: 'Phagwara Bus Stand', icon: 'directions-bus' as const },
  { id: 'jalandhar', label: 'Jalandhar Station', subtitle: 'Railway Station', icon: 'train' as const },
  { id: 'ludhiana', label: 'Ludhiana', subtitle: 'Ludhiana City', icon: 'location-city' as const },
  { id: 'amritsar', label: 'Amritsar', subtitle: 'Amritsar City', icon: 'location-city' as const },
  { id: 'nakodar', label: 'Nakodar', subtitle: 'Nakodar Town', icon: 'directions' as const },
  { id: 'kapurthala', label: 'Kapurthala', subtitle: 'Kapurthala City', icon: 'directions' as const },
];

export const ALL_HUBS = [...CAMPUS_HUBS, ...OUTSIDE_HUBS];

// ─── Date Options ──────────────────────────────────────────────────────────

export const DATE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'pick', label: 'Pick Date' },
];

// ─── Map Constants ─────────────────────────────────────────────────────────

/** LPU Main Campus – Phagwara, Punjab, India */
export const LPU_REGION = {
  latitude: 31.2525,
  longitude: 75.7027,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

export const LPU_LANDMARKS = [
  { id: 'gate', title: 'LPU Main Gate', lat: 31.2538, lon: 75.7027, icon: 'home' as const, color: '#C24E00' },
  { id: 'admin', title: 'Admin Block', lat: 31.2522, lon: 75.7015, icon: 'business' as const, color: '#1976d2' },
  { id: 'lib', title: 'Central Library', lat: 31.2510, lon: 75.7035, icon: 'local-library' as const, color: '#388e3c' },
  { id: 'hostel', title: 'Hostel Blocks', lat: 31.2545, lon: 75.7012, icon: 'hotel' as const, color: '#7b1fa2' },
  { id: 'cafeteria', title: 'Food Court', lat: 31.2530, lon: 75.7042, icon: 'restaurant' as const, color: '#f44336' },
];

// ─── Types ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  gender: string;
  trust_score: number;
  current_streak: number;
  created_at: string;
}

export interface Ride {
  id: number;
  driver_id: number;
  origin_city: string;
  origin_lat: number;
  origin_lng: number;
  destination_city: string;
  dest_lat: number;
  dest_lng: number;
  distance_km: number;
  departure_time: string;
  available_seats: number;
  vehicle_type: 'car' | 'bike' | 'auto' | 'scooter';
  vehicle_mileage: number;
  fuel_type: string;
  base_price: number;
  driver_set_price: number;
  capped_price: number;
  is_emergency_route: boolean;
  is_women_only: boolean;
  instant_booking: boolean;
  status: string;
  driver_name: string;
  driver_email: string;
  driver_phone: string | null;
  driver_trust_score: number;
  completed_at: string | null;
  created_at: string;
  passengers?: {
    booking_id: number;
    passenger_id: number;
    passenger_name: string;
    passenger_email: string;
    passenger_phone: string | null;
    passenger_trust_score: number;
    seats_booked: number;
    price_paid: number;
    booking_status: string;
  }[];
}

// ─── Helper Functions ──────────────────────────────────────────────────────

export function getInitials(fullName: string): string {
  // Safely handle null, undefined, or empty names
  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return 'U'; // Default fallback initial
  }
  const parts = fullName.trim().split(' ').filter(p => p.length > 0);
  if (parts.length === 0) return 'U';
  if (parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0].slice(0, 2) || 'U').toUpperCase();
}

export function getFirstName(fullName: string): string {
  // Safely handle null, undefined, or empty names
  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return 'User'; // Default fallback name
  }
  const first = fullName.trim().split(/\s+/)[0];
  if (!first || first.length === 0) return 'User';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getTrustColor(score: number): string {
  // Safely handle invalid scores
  const validScore = typeof score === 'number' && !isNaN(score) ? score : 100;
  if (validScore >= 75) return '#3DAA6E';
  if (validScore >= 50) return '#D4960F';
  return '#D9622A';
}

export function getDateString(option: string, customDate?: Date): string | undefined {
  const now = new Date();
  if (option === 'today') {
    return now.toISOString().split('T')[0];
  }
  if (option === 'tomorrow') {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (option === 'pick' && customDate) {
    return customDate.toISOString().split('T')[0];
  }
  return undefined;
}

export function parseRideDateTime(dateValue: string | Date | undefined | null): Date | null {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }

  const raw = String(dateValue).trim();
  if (!raw) return null;

  // MySQL DATETIME without timezone: parse as local time explicitly.
  const mysqlLocal = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?$/
  );
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(raw);
  if (mysqlLocal && !hasTimezone) {
    const year = Number(mysqlLocal[1]);
    const month = Number(mysqlLocal[2]) - 1;
    const day = Number(mysqlLocal[3]);
    const hour = Number(mysqlLocal[4]);
    const minute = Number(mysqlLocal[5]);
    const second = Number(mysqlLocal[6] || '0');
    const localDate = new Date(year, month, day, hour, minute, second);
    return isNaN(localDate.getTime()) ? null : localDate;
  }

  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDepartureClock(dateValue: string | Date | undefined | null): string {
  const date = parseRideDateTime(dateValue);
  if (!date) return 'Time not set';

  const hours = date.getHours();
  const mins = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

export function formatDistanceKm(distanceKm: number | string | undefined | null): string {
  const value =
    typeof distanceKm === 'string' ? Number.parseFloat(distanceKm) : Number(distanceKm);

  if (!Number.isFinite(value) || value <= 0) {
    return '0.0 km';
  }

  return `${value.toFixed(1)} km`;
}

export function formatDepartureTime(dateValue: string | Date | undefined | null): string {
  const date = parseRideDateTime(dateValue);
  if (!date) return 'Time not set';

  const day = date.getDate();
  const month = date.getMonth();
  const hours = date.getHours();
  const mins = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[month]}, ${h}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

export function getVehicleIcon(type: string): string {
  switch (type) {
    case 'bike': return 'two-wheeler';
    case 'auto': return 'electric-rickshaw';
    default: return 'directions-car';
  }
}
