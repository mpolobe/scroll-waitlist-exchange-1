import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, Mail, MapPin, Award, Navigation, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getDistanceBetweenCities, formatDistance, calculateTravelTime } from '@/lib/distanceCalculator';





interface BookingConfirmationProps {
  bookingId: string;
  route: any;
  seats: string[];
  date: string;
  totalPrice: number;
  adults?: number;
  children?: number;
}


export function BookingConfirmation({ bookingId, route, seats, date, totalPrice, adults, children }: BookingConfirmationProps) {

  const navigate = useNavigate();
  const { user } = useAuth();
  const [pointsEarned, setPointsEarned] = useState(0);
  const isMultiLeg = route.legs && route.legs.length > 0;
  const trainNumber = isMultiLeg ? route.legs[0].trainNumber : route.trainNumber;
  
  // Calculate distance and travel time
  let totalDistance = 0;
  let estimatedTime = '';
  
  if (isMultiLeg) {
    // Calculate total distance for multi-leg journey
    route.legs.forEach((leg: any) => {
      totalDistance += getDistanceBetweenCities(leg.from, leg.to);
    });
    estimatedTime = calculateTravelTime(totalDistance, 'standard');
  } else {
    totalDistance = getDistanceBetweenCities(route.from, route.to);
    estimatedTime = calculateTravelTime(totalDistance, 'standard');
  }
  
  useEffect(() => {
    if (user) {
      awardLoyaltyPoints();
    }
  }, [user, totalPrice]);

  const awardLoyaltyPoints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('loyalty-award-points', {
        body: {
          userId: user.id,
          afcAmount: totalPrice,
          bookingReference: bookingId
        }
      });

      if (data && !error) {
        setPointsEarned(data.pointsEarned);
        if (data.tierUpgrade) {
          toast.success(`Congratulations! You've been upgraded to ${data.newTier} tier!`, {
            duration: 5000
          });
        }
      }
    } catch (err) {
      console.error('Failed to award points:', err);
    }
  };


  const handleDownload = () => alert('Ticket downloaded successfully!');
  
  const handleEmail = async () => {
    if (!user) {
      toast.error('Please log in to receive email confirmation');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          email: user.email,
          bookingReference: bookingId,
          passengerName: user.user_metadata?.full_name || user.email,
          departure: isMultiLeg ? route.legs[0].from : route.from,
          arrival: isMultiLeg ? route.legs[route.legs.length - 1].to : route.to,
          departureDate: date,
          departureTime: isMultiLeg ? route.legs[0].departure : route.departure,
          trainClass: 'Standard',
          seatNumber: seats.join(', '),
          price: totalPrice,
          distance: formatDistance(totalDistance),
          travelTime: estimatedTime
        }
      });

      if (error) throw error;
      toast.success('Confirmation email sent successfully!');
    } catch (err) {
      console.error('Failed to send email:', err);
      toast.error('Failed to send confirmation email');
    }
  };
  
  const handleTrackTrain = () => navigate(`/train-tracking?train=${trainNumber}`);



  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600">Your railway ticket has been booked successfully</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 rounded-lg mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-40 h-40 bg-white border-4 border-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="grid grid-cols-8 gap-1 mb-2">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">Booking ID: {bookingId}</p>
        </div>

        {pointsEarned > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-6 border border-purple-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Loyalty Points Earned!</span>
            </div>
            <p className="text-center text-2xl font-bold text-purple-600">{pointsEarned} Points</p>
            <p className="text-center text-sm text-gray-600 mt-1">
              Keep traveling to unlock more rewards and tier benefits!
            </p>
          </div>
        )}


        <div className="space-y-3 mb-6">
          {isMultiLeg ? (
            <>
              <div className="font-semibold mb-2">Multi-City Journey</div>
              {route.legs.map((leg: any) => {
                const legDistance = getDistanceBetweenCities(leg.from, leg.to);
                const legTime = calculateTravelTime(legDistance, 'standard');
                return (
                  <div key={leg.id} className="bg-gray-50 p-3 rounded text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{leg.from} → {leg.to}</span>
                      <span className="text-gray-600">{leg.trainNumber}</span>
                    </div>
                    <div className="text-gray-600 text-xs flex items-center gap-3">
                      <span>{leg.departure} - {leg.arrival}</span>
                      <span className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        {formatDistance(legDistance)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {legTime}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-blue-900">Total Journey</span>
                  <div className="flex items-center gap-3 text-blue-700">
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {formatDistance(totalDistance)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {estimatedTime}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between"><span className="text-gray-600">Route:</span><span className="font-semibold">{route.from} → {route.to}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Train:</span><span className="font-semibold">{route.trainNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Departure:</span><span className="font-semibold">{route.departure}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-semibold flex items-center gap-1">
                  <Navigation className="h-4 w-4 text-blue-600" />
                  {formatDistance(totalDistance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est. Travel Time:</span>
                <span className="font-semibold flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  {estimatedTime}
                </span>
              </div>
            </>

          )}
          <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-semibold">{date}</span></div>
          {adults !== undefined && children !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">Passengers:</span>
              <span className="font-semibold">
                {adults} Adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
              </span>
            </div>
          )}
          <div className="flex justify-between"><span className="text-gray-600">Seats:</span><span className="font-semibold">{seats.join(', ')}</span></div>
          
          {/* Pricing Breakdown */}
          <Separator className="my-3" />
          <div className="bg-gray-50 p-3 rounded space-y-2">
            {adults !== undefined && children !== undefined ? (
              <>
                {adults > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Adult Tickets ({adults}x)</span>
                    <span>{route.price * adults} AFC</span>
                  </div>
                )}
                {children > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Child Tickets ({children}x)</span>
                      <span>{route.price * 0.5 * children} AFC</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Savings (50% child discount)</span>
                      <span>-{route.price * 0.5 * children} AFC</span>
                    </div>
                  </>
                )}
              </>
            ) : null}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee</span>
              <span>5 AFC</span>
            </div>
          </div>
          <div className="flex justify-between"><span className="text-gray-600">Total Paid:</span><span className="font-semibold text-orange-600">{totalPrice} AFC</span></div>


        </div>

        <div className="flex gap-3 mb-4">
          <Button onClick={handleDownload} variant="outline" className="flex-1"><Download className="mr-2 h-4 w-4" /> Download</Button>
          <Button onClick={handleEmail} variant="outline" className="flex-1"><Mail className="mr-2 h-4 w-4" /> Email</Button>
        </div>
        <Button onClick={handleTrackTrain} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
          <MapPin className="mr-2 h-4 w-4" /> Track Train Live
        </Button>
      </Card>
    </div>

  );
}

