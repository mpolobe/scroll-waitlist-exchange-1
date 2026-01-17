import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Train, MapPin, CalendarIcon, Users, CreditCard, 
  Loader2, CheckCircle, Ticket, Image, ArrowRight,
  Clock, Navigation
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { capitalStations, type CapitalStation } from '@/data/capitalStations';
import { createBooking, getTicketPrice, type Ticket as TicketType, type NFTSouvenir } from '@/services/ticketService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type BookingStep = 'route' | 'details' | 'payment' | 'confirmation';
type TicketClass = 'economy' | 'business' | 'first';

export function CapitalCityTicketBooking() {
  const { user } = useAuth();
  const [step, setStep] = useState<BookingStep>('route');
  const [isLoading, setIsLoading] = useState(false);
  
  // Route selection
  const [fromStation, setFromStation] = useState<string>('');
  const [toStation, setToStation] = useState<string>('');
  const [date, setDate] = useState<Date>();
  
  // Ticket details
  const [ticketClass, setTicketClass] = useState<TicketClass>('economy');
  const [passengers, setPassengers] = useState(1);
  const [isReturnTrip, setIsReturnTrip] = useState(false);
  
  // Passenger info
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  
  // Booking result
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [nft, setNft] = useState<NFTSouvenir | null>(null);
  
  // Price calculation
  const [price, setPrice] = useState(0);
  
  useEffect(() => {
    if (fromStation && toStation) {
      const basePrice = getTicketPrice(fromStation, toStation, ticketClass);
      const totalPrice = basePrice * passengers * (isReturnTrip ? 2 : 1);
      setPrice(totalPrice);
    }
  }, [fromStation, toStation, ticketClass, passengers, isReturnTrip]);

  const getStationDisplay = (stationName: string): string => {
    const station = capitalStations.find(s => s.name === stationName);
    return station ? `${station.name}, ${station.country}` : stationName;
  };

  const handleRouteSubmit = () => {
    if (!fromStation || !toStation || !date) {
      toast.error('Please fill in all route details');
      return;
    }
    if (fromStation === toStation) {
      toast.error('Origin and destination must be different');
      return;
    }
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    if (!passengerName) {
      toast.error('Please enter passenger name');
      return;
    }
    setStep('payment');
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const route = `${fromStation} → ${toStation}`;
      const result = await createBooking({
        route,
        from: fromStation,
        to: toStation,
        date: format(date!, 'yyyy-MM-dd'),
        class: ticketClass,
        passengers,
        isReturnTrip,
        priceUSD: price,
        passengerName,
        passengerPhone,
        userId: user?.id,
      });
      
      setTicket(result.ticket);
      setNft(result.nft);
      setStep('confirmation');
      toast.success('Ticket booked and NFT minted!');
    } catch (error: any) {
      toast.error(error.message || 'Booking failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetBooking = () => {
    setStep('route');
    setFromStation('');
    setToStation('');
    setDate(undefined);
    setTicketClass('economy');
    setPassengers(1);
    setIsReturnTrip(false);
    setPassengerName('');
    setPassengerPhone('');
    setTicket(null);
    setNft(null);
  };

  const today = new Date();

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {(['route', 'details', 'payment', 'confirmation'] as BookingStep[]).map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
              step === s ? "bg-orange-500 text-white" :
              (['route', 'details', 'payment', 'confirmation'].indexOf(step) > i) 
                ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
            )}>
              {(['route', 'details', 'payment', 'confirmation'].indexOf(step) > i) 
                ? <CheckCircle className="w-5 h-5" /> : i + 1}
            </div>
            {i < 3 && <div className={cn(
              "w-16 h-1 mx-2",
              (['route', 'details', 'payment', 'confirmation'].indexOf(step) > i) 
                ? "bg-green-500" : "bg-gray-200"
            )} />}
          </div>
        ))}
      </div>

      {/* Step 1: Route Selection */}
      {step === 'route' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Train className="w-6 h-6 text-orange-500" />
              Select Your Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" /> From (Capital City)
                </Label>
                <Select value={fromStation} onValueChange={setFromStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure city" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {capitalStations.map((station) => (
                      <SelectItem key={station.id} value={station.name}>
                        {station.name}, {station.country} ({station.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" /> To (Capital City)
                </Label>
                <Select value={toStation} onValueChange={setToStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination city" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {capitalStations
                      .filter(s => s.name !== fromStation)
                      .map((station) => (
                        <SelectItem key={station.id} value={station.name}>
                          {station.name}, {station.country} ({station.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4" /> Travel Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d < today}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" /> Passengers
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={passengers}
                  onChange={(e) => setPassengers(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                />
              </div>

              <div>
                <Label className="mb-2 block">Return Trip?</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!isReturnTrip ? "default" : "outline"}
                    onClick={() => setIsReturnTrip(false)}
                    className="flex-1"
                  >
                    One Way
                  </Button>
                  <Button
                    type="button"
                    variant={isReturnTrip ? "default" : "outline"}
                    onClick={() => setIsReturnTrip(true)}
                    className="flex-1"
                  >
                    Return
                  </Button>
                </div>
              </div>
            </div>

            <Button onClick={handleRouteSubmit} className="w-full bg-orange-500 hover:bg-orange-600">
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Ticket Details */}
      {step === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-6 h-6 text-orange-500" />
              Ticket Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Route Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-semibold">{getStationDisplay(fromStation)}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-orange-500" />
                <div className="text-right">
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-semibold">{getStationDisplay(toStation)}</p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {date && format(date, 'EEEE, MMMM d, yyyy')} • {passengers} passenger(s)
                {isReturnTrip && ' • Return trip'}
              </div>
            </div>

            {/* Class Selection */}
            <div>
              <Label className="mb-3 block">Select Class</Label>
              <Tabs value={ticketClass} onValueChange={(v) => setTicketClass(v as TicketClass)}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="economy">Economy</TabsTrigger>
                  <TabsTrigger value="business">Business</TabsTrigger>
                  <TabsTrigger value="first">First Class</TabsTrigger>
                </TabsList>
                <TabsContent value="economy" className="mt-4">
                  <Card className="border-2 border-orange-200">
                    <CardContent className="pt-4">
                      <p className="font-semibold">Economy Class</p>
                      <p className="text-sm text-gray-600">Standard seating, basic amenities</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="business" className="mt-4">
                  <Card className="border-2 border-blue-200">
                    <CardContent className="pt-4">
                      <p className="font-semibold">Business Class</p>
                      <p className="text-sm text-gray-600">Extra legroom, meal service, priority boarding</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="first" className="mt-4">
                  <Card className="border-2 border-purple-200">
                    <CardContent className="pt-4">
                      <p className="font-semibold">First Class</p>
                      <p className="text-sm text-gray-600">Private cabin, premium dining, lounge access</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Passenger Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Passenger Name *</Label>
                <Input
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="Full name as on ID"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('route')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleDetailsSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">
                Continue to Payment <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment */}
      {step === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-orange-500" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span>{fromStation} → {toStation}</span>
                <span>{ticketClass.charAt(0).toUpperCase() + ticketClass.slice(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Date</span>
                <span>{date && format(date, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Passengers</span>
                <span>{passengers}</span>
              </div>
              {isReturnTrip && (
                <div className="flex justify-between text-sm">
                  <span>Trip Type</span>
                  <Badge>Return</Badge>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-600">{price} AFRC</span>
              </div>
            </div>

            {/* NFT Info */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">NFT Ticket Included</span>
              </div>
              <p className="text-sm text-purple-700">
                Your ticket includes a unique NFT souvenir commemorating your journey.
                This digital collectible will be minted on the Sui blockchain.
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handlePayment} 
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay {price} AFRC</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {step === 'confirmation' && ticket && nft && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                <p className="text-gray-600">Your ticket and NFT have been created</p>
              </div>

              {/* Ticket Details */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Booking Reference</p>
                    <p className="font-mono font-bold text-lg">{ticket.booking_ref}</p>
                  </div>
                  <Badge className="bg-green-500">Confirmed</Badge>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Route</p>
                    <p className="font-semibold">{ticket.route}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold">{ticket.travel_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-semibold capitalize">{ticket.class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Seat</p>
                    <p className="font-semibold">{ticket.seat}</p>
                  </div>
                </div>
              </div>

              {/* NFT Card */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-lg text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Image className="w-5 h-5" />
                  <span className="font-semibold">NFT Souvenir Minted</span>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <img 
                    src={nft.image_url} 
                    alt={nft.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-bold text-lg">{nft.name}</h3>
                  <p className="text-sm opacity-90">{nft.description}</p>
                  <div className="mt-3 flex gap-2">
                    <Badge variant="secondary">{nft.theme}</Badge>
                    <Badge variant="secondary">{nft.culture}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={resetBooking} className="w-full">
            Book Another Ticket
          </Button>
        </div>
      )}
    </div>
  );
}
