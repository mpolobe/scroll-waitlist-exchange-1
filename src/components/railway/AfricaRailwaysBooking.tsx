import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { africaRailwaysAPI, type RouteSearchParams, type BookingData } from '@/lib/africaRailwaysAPI';
import { Loader2, Train, Calendar, Users, MapPin } from 'lucide-react';

/**
 * Africa Railways Booking Component
 * 
 * Integrates with the real Africa Railways backend API
 * Replaces mock data with actual railway booking system
 */
export function AfricaRailwaysBooking() {
  const [searchParams, setSearchParams] = useState<RouteSearchParams>({
    from: '',
    to: '',
    date: '',
    passengers: 1,
  });
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchParams.from || !searchParams.to || !searchParams.date) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all search fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await africaRailwaysAPI.searchRoutes(searchParams);
      setRoutes(results.routes || []);
      
      if (results.routes?.length === 0) {
        toast({
          title: 'No Routes Found',
          description: 'No available routes for the selected criteria',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Search Failed',
        description: error.message || 'Failed to search routes',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleBooking = async (route: any) => {
    setIsBooking(true);
    try {
      const bookingData: BookingData = {
        routeId: route.id,
        from: searchParams.from,
        to: searchParams.to,
        departureDate: searchParams.date,
        passengers: {
          adults: searchParams.passengers,
          children: 0,
        },
        seats: [], // Will be selected in next step
        totalPrice: route.price * searchParams.passengers,
      };

      const booking = await africaRailwaysAPI.createBooking(bookingData);
      
      toast({
        title: 'Booking Created',
        description: `Booking ID: ${booking.id}`,
      });

      // Redirect to payment
      // navigate(`/payment/${booking.id}`);
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to create booking',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Train className="w-6 h-6 text-orange-500" />
          Search Africa Railways
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              From
            </Label>
            <Input
              id="from"
              value={searchParams.from}
              onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
              placeholder="Departure city"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="to" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              To
            </Label>
            <Input
              id="to"
              value={searchParams.to}
              onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
              placeholder="Destination city"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={searchParams.date}
              onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="passengers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Passengers
            </Label>
            <Input
              id="passengers"
              type="number"
              min="1"
              max="10"
              value={searchParams.passengers}
              onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="w-full mt-6 bg-gradient-to-r from-orange-500 to-amber-500"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            'Search Routes'
          )}
        </Button>
      </Card>

      {/* Search Results */}
      {routes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Available Routes</h3>
          {routes.map((route) => (
            <Card key={route.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div>
                      <p className="text-sm text-gray-500">Departure</p>
                      <p className="font-semibold">{route.departureTime}</p>
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                      <Train className="w-5 h-5 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Arrival</p>
                      <p className="font-semibold">{route.arrivalTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Train: {route.trainNumber}</span>
                    <span>Duration: {route.duration}</span>
                    <span>Available: {route.availableSeats} seats</span>
                  </div>
                </div>
                <div className="text-right ml-6">
                  <p className="text-2xl font-bold text-orange-600">
                    {route.price} AFRC
                  </p>
                  <Button
                    onClick={() => handleBooking(route)}
                    disabled={isBooking}
                    className="mt-2"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Book Now'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Integration Status */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div>
            <p className="font-semibold text-blue-900">Africa Railways Integration</p>
            <p className="text-sm text-blue-700 mt-1">
              This component connects to the real Africa Railways backend API.
              Configure your API key in .env.local to enable live bookings.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
