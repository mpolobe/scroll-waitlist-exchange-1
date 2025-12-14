import { africanCities } from '@/data/africanCities';

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance);
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Calculate distance between two cities by their value
export function getDistanceBetweenCities(fromCity: string, toCity: string): number {
  const from = africanCities.find(city => city.value === fromCity);
  const to = africanCities.find(city => city.value === toCity);
  
  if (!from || !to) return 0;
  
  return calculateDistance(from.lat, from.lng, to.lat, to.lng);
}

// Calculate travel time based on distance and average train speed
// Average speeds: Express (120 km/h), Standard (80 km/h), Economy (60 km/h)
export function calculateTravelTime(distanceKm: number, trainClass: string = 'standard'): string {
  const speeds: Record<string, number> = {
    express: 120,
    standard: 80,
    economy: 60,
    first: 120,
    business: 100,
  };
  
  const speed = speeds[trainClass.toLowerCase()] || 80;
  const hours = distanceKm / speed;
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours === 0) {
    return `${minutes}min`;
  } else if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h ${minutes}min`;
  }
}

// Format distance for display
export function formatDistance(km: number): string {
  return `${km.toLocaleString()} km`;
}
