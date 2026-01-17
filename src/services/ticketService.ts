/**
 * Ticket Service with NFT Generation
 * 
 * Based on Africa Railways ticketService.js
 * Handles ticket booking and NFT souvenir creation
 */

import { supabase } from '@/lib/supabase';
import { capitalStations, getStationByName } from '@/data/capitalStations';

// African-themed artwork for NFT souvenirs
const AFRICAN_ARTWORK: Record<string, {
  image: string;
  theme: string;
  colors: string[];
  culture: string;
}> = {
  'dar': {
    image: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=400',
    theme: 'Indian Ocean Sunrise',
    colors: ['#FF6B35', '#F7931E', '#1E3A5F'],
    culture: 'Swahili Coast',
  },
  'nairobi': {
    image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400',
    theme: 'Safari Gateway',
    colors: ['#8B4513', '#228B22', '#FFD700'],
    culture: 'Maasai Heritage',
  },
  'cairo': {
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400',
    theme: 'Ancient Wonders',
    colors: ['#C4A35A', '#8B7355', '#1E3A5F'],
    culture: 'Pharaonic Legacy',
  },
  'cape_town': {
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400',
    theme: 'Table Mountain',
    colors: ['#2C3E50', '#3498DB', '#27AE60'],
    culture: 'Rainbow Nation',
  },
  'lusaka': {
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400',
    theme: 'Capital City',
    colors: ['#2C3E50', '#E74C3C', '#27AE60'],
    culture: 'Urban Zambia',
  },
  'accra': {
    image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=400',
    theme: 'Gold Coast',
    colors: ['#FFD700', '#006B3F', '#CE1126'],
    culture: 'Ashanti Kingdom',
  },
  'addis_ababa': {
    image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400',
    theme: 'Highland Capital',
    colors: ['#009639', '#FCDD09', '#DA121A'],
    culture: 'Ethiopian Heritage',
  },
  'default': {
    image: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=400',
    theme: 'African Journey',
    colors: ['#FFB800', '#FF6B35', '#1A1A2E'],
    culture: 'Pan-African',
  },
};

// Sample ticket prices (USD)
export const TICKET_PRICES: Record<string, { economy: number; business: number; first: number }> = {
  'default': { economy: 25, business: 45, first: 75 },
  'short': { economy: 15, business: 30, first: 50 },
  'medium': { economy: 35, business: 60, first: 100 },
  'long': { economy: 50, business: 90, first: 150 },
};

// Helper functions
const generateId = (prefix = 'TKT'): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const generateSeat = (ticketClass: string): string => {
  const car = ticketClass === 'first' ? 1 : ticketClass === 'business' ? 2 : Math.floor(Math.random() * 3) + 3;
  const seat = Math.floor(Math.random() * 40) + 1;
  const row = String.fromCharCode(65 + Math.floor(Math.random() * 4));
  return `Car ${car}, Seat ${seat}${row}`;
};

const getArtworkForRoute = (route: string): typeof AFRICAN_ARTWORK['default'] => {
  const routeLower = route.toLowerCase();
  for (const [key, artwork] of Object.entries(AFRICAN_ARTWORK)) {
    if (key !== 'default' && routeLower.includes(key)) {
      return artwork;
    }
  }
  return AFRICAN_ARTWORK.default;
};

const calculateDistance = (from: string, to: string): number => {
  const fromStation = getStationByName(from);
  const toStation = getStationByName(to);
  
  if (!fromStation?.coordinates || !toStation?.coordinates) {
    return 500; // Default distance
  }
  
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (toStation.coordinates.lat - fromStation.coordinates.lat) * Math.PI / 180;
  const dLng = (toStation.coordinates.lng - fromStation.coordinates.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(fromStation.coordinates.lat * Math.PI / 180) * 
    Math.cos(toStation.coordinates.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const getPriceCategory = (distance: number): 'short' | 'medium' | 'long' | 'default' => {
  if (distance < 300) return 'short';
  if (distance < 800) return 'medium';
  if (distance > 800) return 'long';
  return 'default';
};

export interface BookingData {
  route: string;
  from: string;
  to: string;
  train?: string;
  date: string;
  departureTime?: string;
  arrivalTime?: string;
  class: 'economy' | 'business' | 'first';
  passengers?: number;
  isReturnTrip?: boolean;
  priceUSD: number;
  priceLocal?: number;
  localCurrency?: string;
  paymentMethod?: string;
  passengerName?: string;
  passengerPhone?: string;
  userId?: string;
}

export interface Ticket {
  id: string;
  booking_ref: string;
  ticket_id: string;
  nft_id: string;
  passenger_name: string;
  passenger_phone: string;
  route: string;
  from_station: string;
  to_station: string;
  travel_date: string;
  departure_time: string;
  arrival_time: string;
  train: string;
  class: string;
  seat: string;
  passengers: number;
  is_return_trip: boolean;
  base_price_usd: number;
  total_price_usd: number;
  local_currency: string;
  total_price_local: number;
  total_price_afrc: number;
  payment_method: string;
  booking_status: string;
  payment_status: string;
  qr_data: string;
  distance_km: number;
  created_at: string;
}

export interface NFTSouvenir {
  id: string;
  souvenir_id: string;
  ticket_id: string;
  booking_id: string;
  name: string;
  description: string;
  route: string;
  travel_date: string;
  class: string;
  theme: string;
  culture: string;
  image_url: string;
  colors: string[];
  status: string;
  rarity: string;
  created_at: string;
  token_id?: string;
  contract_address?: string;
  blockchain?: string;
}

/**
 * Create a new ticket booking with NFT souvenir
 */
export const createBooking = async (bookingData: BookingData): Promise<{ ticket: Ticket; nft: NFTSouvenir }> => {
  const ticketId = generateId('TKT');
  const nftId = generateId('NFT');
  const bookingRef = generateId('BKG');
  const artwork = getArtworkForRoute(bookingData.route);
  const distance = calculateDistance(bookingData.from, bookingData.to);
  
  // Create ticket object
  const ticket: Ticket = {
    id: ticketId,
    booking_ref: bookingRef,
    ticket_id: ticketId,
    nft_id: nftId,
    
    // Passenger
    passenger_name: bookingData.passengerName || 'Passenger',
    passenger_phone: bookingData.passengerPhone || '',
    
    // Journey
    route: bookingData.route,
    from_station: bookingData.from,
    to_station: bookingData.to,
    travel_date: bookingData.date,
    departure_time: bookingData.departureTime || '08:00',
    arrival_time: bookingData.arrivalTime || '18:00',
    train: bookingData.train || 'Africa Express',
    
    // Ticket details
    class: bookingData.class,
    seat: generateSeat(bookingData.class),
    passengers: bookingData.passengers || 1,
    is_return_trip: bookingData.isReturnTrip || false,
    
    // Pricing
    base_price_usd: bookingData.priceUSD,
    total_price_usd: bookingData.priceUSD,
    local_currency: bookingData.localCurrency || 'USD',
    total_price_local: bookingData.priceLocal || bookingData.priceUSD,
    total_price_afrc: bookingData.priceUSD,
    payment_method: bookingData.paymentMethod || 'afrc',
    
    // Status
    booking_status: 'confirmed',
    payment_status: 'completed',
    
    // Distance
    distance_km: distance,
    
    // QR code data
    qr_data: JSON.stringify({
      ticketId,
      route: bookingData.route,
      date: bookingData.date,
      class: bookingData.class,
      seat: generateSeat(bookingData.class),
    }),
    
    // Timestamps
    created_at: new Date().toISOString(),
  };

  // Create NFT souvenir
  const nft: NFTSouvenir = {
    id: nftId,
    souvenir_id: generateId('SOU'),
    ticket_id: ticketId,
    booking_id: ticketId,
    
    name: `${ticket.train} - ${ticket.class.charAt(0).toUpperCase() + ticket.class.slice(1)} Class`,
    description: `Commemorative NFT for your journey: ${bookingData.route}. Celebrating ${artwork.culture} heritage.`,
    
    route: bookingData.route,
    travel_date: bookingData.date,
    class: bookingData.class,
    
    // Artwork
    theme: artwork.theme,
    culture: artwork.culture,
    image_url: artwork.image,
    colors: artwork.colors,
    
    // Status
    status: 'minted',
    rarity: 'Unique',
    
    // Blockchain (placeholder - would be set after actual minting)
    blockchain: 'Sui',
    
    created_at: new Date().toISOString(),
  };

  // Try to save to Supabase (non-blocking)
  try {
    if (bookingData.userId) {
      await supabase.from('bookings').insert({
        ...ticket,
        user_id: bookingData.userId,
      });
      
      await supabase.from('nft_souvenirs').insert({
        ...nft,
        user_id: bookingData.userId,
      });
    }
  } catch (error) {
    console.warn('Failed to save booking to database:', error);
  }

  return { ticket, nft };
};

/**
 * Get ticket price based on route
 */
export const getTicketPrice = (from: string, to: string, ticketClass: 'economy' | 'business' | 'first'): number => {
  const distance = calculateDistance(from, to);
  const category = getPriceCategory(distance);
  return TICKET_PRICES[category][ticketClass];
};

/**
 * Validate a ticket by QR data
 */
export const validateTicket = async (qrData: string): Promise<{ valid: boolean; ticket?: Ticket; error?: string }> => {
  try {
    const data = JSON.parse(qrData);
    
    // Try to fetch from database
    const { data: ticket, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('ticket_id', data.ticketId)
      .single();
    
    if (error || !ticket) {
      return { valid: false, error: 'Ticket not found' };
    }
    
    if (ticket.booking_status === 'used') {
      return { valid: false, error: 'Ticket already used', ticket };
    }
    
    if (ticket.booking_status === 'cancelled') {
      return { valid: false, error: 'Ticket cancelled', ticket };
    }
    
    // Check date
    const ticketDate = new Date(ticket.travel_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    ticketDate.setHours(0, 0, 0, 0);
    
    if (ticketDate < today) {
      return { valid: false, error: 'Ticket date has passed', ticket };
    }
    
    return { valid: true, ticket };
  } catch {
    return { valid: false, error: 'Invalid QR code' };
  }
};

/**
 * Get user's tickets
 */
export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return [];
  }
};

/**
 * Get user's NFT souvenirs
 */
export const getUserNFTs = async (userId: string): Promise<NFTSouvenir[]> => {
  try {
    const { data, error } = await supabase
      .from('nft_souvenirs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch NFTs:', error);
    return [];
  }
};

export default {
  createBooking,
  getTicketPrice,
  validateTicket,
  getUserTickets,
  getUserNFTs,
  TICKET_PRICES,
};
