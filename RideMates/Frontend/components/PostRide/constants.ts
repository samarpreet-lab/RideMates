// constants.ts
export const VEHICLE_TYPES = [
    { id: 'bike', label: 'Bike', icon: 'two-wheeler' as const, defaultMileage: 45 },
    { id: 'car', label: 'Car', icon: 'directions-car' as const, defaultMileage: 15 },
];

export const FUEL_TYPES = [
    { id: 'petrol', label: 'Petrol' },
    { id: 'diesel', label: 'Diesel' },
    { id: 'cng', label: 'CNG' },
    { id: 'electric', label: 'Electric' },
];

export const FUEL_RATES: Record<string, number> = {
    petrol: 105,
    diesel: 92,
    cng: 80,
    electric: 5,
};

export const VEHICLE_MULTIPLIERS: Record<string, number> = {
    bike: 1.2,
    car: 1.5,
};

/** Local hub coordinates for hybrid geocoding */
export const HUB_COORDS: Record<string, { lat: number; lng: number }> = {
    'LPU Main Gate': { lat: 31.2538, lng: 75.7027 },
    'Law Gate': { lat: 31.2490, lng: 75.7005 },
    'Admin Block': { lat: 31.2522, lng: 75.7015 },
    'BH1': { lat: 31.2545, lng: 75.7012 },
    'BH2': { lat: 31.2548, lng: 75.7020 },
    'GH1': { lat: 31.2530, lng: 75.6998 },
    'GH2': { lat: 31.2532, lng: 75.7005 },
    'Central Library': { lat: 31.2510, lng: 75.7035 },
    'Food Court': { lat: 31.2530, lng: 75.7042 },
    'Sports Complex': { lat: 31.2515, lng: 75.6990 },
    'Hostel Blocks': { lat: 31.2545, lng: 75.7012 },
    'Phagwara': { lat: 31.2240, lng: 75.7708 },
    'Jalandhar Station': { lat: 31.3260, lng: 75.5762 },
    'Ludhiana': { lat: 30.9010, lng: 75.8573 },
    'Amritsar': { lat: 31.6340, lng: 74.8723 },
    'Nakodar': { lat: 31.1260, lng: 75.4740 },
    'Kapurthala': { lat: 31.3805, lng: 75.3820 },
};

export const CAMPUS_HUBS = [
    { id: 'maingate', label: 'LPU Main Gate', subtitle: 'Main Entrance', icon: 'home' as const },
    { id: 'lawgate', label: 'Law Gate', subtitle: 'Law Avenue', icon: 'door-front' as const },
    { id: 'admin', label: 'Admin Block', subtitle: 'Administration', icon: 'business' as const },
    { id: 'bh1', label: 'BH1', subtitle: 'Boys Hostel 1', icon: 'hotel' as const },
    { id: 'gh1', label: 'GH1', subtitle: 'Girls Hostel 1', icon: 'hotel' as const },
    { id: 'lib', label: 'Central Library', subtitle: 'Knowledge Hub', icon: 'local-library' as const },
    { id: 'foodcourt', label: 'Food Court', subtitle: 'Uni-zone Food', icon: 'restaurant' as const },
];

export const OUTSIDE_HUBS = [
    { id: 'phagwara', label: 'Phagwara', subtitle: 'Bus Stand', icon: 'directions-bus' as const },
    { id: 'jalandhar', label: 'Jalandhar Station', subtitle: 'Railway Station', icon: 'train' as const },
    { id: 'ludhiana', label: 'Ludhiana', subtitle: 'City', icon: 'location-city' as const },
    { id: 'amritsar', label: 'Amritsar', subtitle: 'City', icon: 'location-city' as const },
    { id: 'nakodar', label: 'Nakodar', subtitle: 'Town', icon: 'directions' as const },
    { id: 'kapurthala', label: 'Kapurthala', subtitle: 'City', icon: 'directions' as const },
];

export const ALL_HUBS = [...CAMPUS_HUBS, ...OUTSIDE_HUBS];
