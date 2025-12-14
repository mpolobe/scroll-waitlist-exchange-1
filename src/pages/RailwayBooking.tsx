import { useState } from 'react';
import { RouteSearchForm } from '@/components/booking/RouteSearchForm';
import { MultiCitySearchForm } from '@/components/booking/MultiCitySearchForm';
import { MultiCityRouteMap } from '@/components/booking/MultiCityRouteMap';
import { MultiLegItinerary } from '@/components/booking/MultiLegItinerary';
import { RouteResultCard } from '@/components/booking/RouteResultCard';
import { SeatSelectionMap } from '@/components/booking/SeatSelectionMap';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const mockRoutes = [
  { id: '1', from: 'Nairobi', to: 'Mombasa', departure: '08:00', arrival: '14:30', duration: '6h 30m', price: 150, available: 45, trainNumber: 'ARN-101' },
  { id: '2', from: 'Nairobi', to: 'Mombasa', departure: '14:00', arrival: '20:30', duration: '6h 30m', price: 150, available: 32, trainNumber: 'ARN-102' },
  { id: '3', from: 'Nairobi', to: 'Mombasa', departure: '20:00', arrival: '02:30', duration: '6h 30m', price: 120, available: 28, trainNumber: 'ARN-103' },
];

const mockMultiCityRoutes = {
  'Nairobi-Nakuru-Kisumu': [
    [
      { id: '1', from: 'Nairobi', to: 'Nakuru', departure: '08:00', arrival: '10:30', duration: '2h 30m', price: 50, trainNumber: 'ARN-201', transferTime: '45 min' },
      { id: '2', from: 'Nakuru', to: 'Kisumu', departure: '11:15', arrival: '15:00', duration: '3h 45m', price: 80, trainNumber: 'ARN-202' },
    ],
    [
      { id: '3', from: 'Nairobi', to: 'Nakuru', departure: '14:00', arrival: '16:30', duration: '2h 30m', price: 50, trainNumber: 'ARN-203', transferTime: '1h 15min' },
      { id: '4', from: 'Nakuru', to: 'Kisumu', departure: '17:45', arrival: '21:30', duration: '3h 45m', price: 80, trainNumber: 'ARN-204' },
    ],
  ],
  'Nairobi-Nakuru-Eldoret': [
    [
      { id: '5', from: 'Nairobi', to: 'Nakuru', departure: '09:00', arrival: '11:30', duration: '2h 30m', price: 50, trainNumber: 'ARN-205', transferTime: '30 min' },
      { id: '6', from: 'Nakuru', to: 'Eldoret', departure: '12:00', arrival: '15:30', duration: '3h 30m', price: 75, trainNumber: 'ARN-206' },
    ],
  ],
};



export default function RailwayBooking() {
  const [step, setStep] = useState(1);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingId, setBookingId] = useState('');
  const [isMultiCity, setIsMultiCity] = useState(false);
  const [multiCityStops, setMultiCityStops] = useState<any[]>([]);
  const [multiCityLegs, setMultiCityLegs] = useState<any[]>([]);

  const handleSearch = (from: string, to: string, date: string, adults: number, children: number) => {
    setSearchParams({ from, to, date, adults, children, passengers: adults + children });
    setRoutes(mockRoutes);
    setIsMultiCity(false);
    setStep(2);
  };


  const handleMultiCitySearch = (stops: any[], date: string, passengers: number) => {
    setMultiCityStops(stops);
    setSearchParams({ stops, date, passengers });
    
    // Generate route key from stops
    const routeKey = stops.map(s => s.city).join('-');
    const availableRoutes = mockMultiCityRoutes[routeKey] || [mockMultiCityRoutes['Nairobi-Nakuru-Kisumu'][0]];
    
    setMultiCityLegs(availableRoutes[0]);
    setIsMultiCity(true);
    setStep(2);
  };


  const handleRouteSelect = (route: any) => {
    setSelectedRoute(route);
    setStep(3);
  };

  const handleMultiCitySelect = () => {
    setSelectedRoute({ legs: multiCityLegs, price: multiCityLegs.reduce((sum, leg) => sum + leg.price, 0) });
    setStep(3);
  };

  const handleSeatToggle = (seat: string) => {
    setSelectedSeats(prev => prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]);
  };

  const handleSeatsConfirm = () => setStep(4);

  const handlePayment = () => {
    setBookingId(`ARN-${Date.now()}`);
    setStep(5);
  };

  // Calculate total price with child discount
  const calculateTotalPrice = () => {
    if (!selectedRoute) return 0;
    
    const basePrice = selectedRoute.price || 0;
    const adults = searchParams?.adults || 0;
    const children = searchParams?.children || 0;
    
    // If we have adult/children counts, calculate accordingly
    if (adults > 0 || children > 0) {
      const adultPrice = basePrice * adults;
      const childPrice = basePrice * 0.5 * children; // 50% discount for children
      return adultPrice + childPrice + 5; // +5 for service fee
    }
    
    // Fallback to seat count if no passenger breakdown
    return (basePrice * selectedSeats.length) + 5;
  };

  const totalPrice = calculateTotalPrice();


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Railway Tickets</h1>
          <p className="text-xl">Fast, secure, and easy booking with Africoin</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {step === 1 && (
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
              <TabsTrigger value="single">Single Route</TabsTrigger>
              <TabsTrigger value="multi">Multi-City</TabsTrigger>
            </TabsList>
            <TabsContent value="single">
              <RouteSearchForm onSearch={handleSearch} />
            </TabsContent>
            <TabsContent value="multi">
              <MultiCitySearchForm onSearch={handleMultiCitySearch} />
            </TabsContent>
          </Tabs>
        )}
        {step === 2 && !isMultiCity && (
          <div className="space-y-4 mt-8">
            {routes.map(route => <RouteResultCard key={route.id} route={route} onSelect={handleRouteSelect} />)}
          </div>
        )}
        {step === 2 && isMultiCity && (
          <div className="space-y-6 mt-8">
            <MultiCityRouteMap stops={multiCityStops} />
            <MultiLegItinerary legs={multiCityLegs} onSelect={handleMultiCitySelect} />
          </div>
        )}
        {step === 3 && <SeatSelectionMap totalSeats={40} selectedSeats={selectedSeats} onSeatToggle={handleSeatToggle} onConfirm={handleSeatsConfirm} />}
        {step === 4 && <BookingSummary route={selectedRoute} seats={selectedSeats} date={searchParams.date} totalPrice={totalPrice} adults={searchParams.adults} children={searchParams.children} onConfirm={handlePayment} onBack={() => setStep(3)} />}
        {step === 5 && <BookingConfirmation bookingId={bookingId} route={selectedRoute} seats={selectedSeats} date={searchParams.date} totalPrice={totalPrice} adults={searchParams.adults} children={searchParams.children} />}

      </div>
    </div>
  );
}

