import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Train, Calendar, Users, CreditCard } from 'lucide-react';

interface BookingSummaryProps {
  route: any;
  seats: string[];
  date: string;
  totalPrice: number;
  adults?: number;
  children?: number;
  onConfirm: () => void;
  onBack: () => void;
}


export function BookingSummary({ route, seats, date, totalPrice, adults, children, onConfirm, onBack }: BookingSummaryProps) {

  const isMultiLeg = route.legs && route.legs.length > 0;
  
  return (
    <Card className="p-6">
      <h3 className="text-2xl font-bold mb-6">Booking Summary</h3>
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <Train className="h-5 w-5 text-blue-600 mt-1" />
          <div className="flex-1">
            <p className="font-semibold">Route</p>
            {isMultiLeg ? (
              <div className="space-y-2">
                {route.legs.map((leg: any, idx: number) => (
                  <div key={leg.id} className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">{leg.from} → {leg.to}</p>
                    <p className="text-sm text-gray-500">Train {leg.trainNumber} • {leg.departure} - {leg.arrival}</p>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="text-gray-600">{route.from} → {route.to}</p>
                <p className="text-sm text-gray-500">Train {route.trainNumber}</p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <p className="font-semibold">Date & Time</p>
            <p className="text-gray-600">{date}</p>
            {!isMultiLeg && <p className="text-sm text-gray-500">Departure: {route.departure}</p>}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <p className="font-semibold">Passengers</p>
            {adults !== undefined && children !== undefined ? (
              <p className="text-gray-600">
                {adults} Adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
              </p>
            ) : (
              <p className="text-gray-600">{seats.length} Passenger{seats.length !== 1 ? 's' : ''}</p>
            )}
            <p className="text-sm text-gray-500">Seats: {seats.join(', ')}</p>
          </div>
        </div>

      </div>
      <Separator className="my-4" />
      <div className="space-y-2 mb-6">
        {adults !== undefined && children !== undefined ? (
          <>
            {adults > 0 && (
              <div className="flex justify-between">
                <span>Adult Tickets ({adults}x @ {route.price} AFC)</span>
                <span>{route.price * adults} AFC</span>
              </div>
            )}
            {children > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Child Tickets ({children}x @ {route.price * 0.5} AFC)</span>
                  <span>{route.price * 0.5 * children} AFC</span>
                </div>
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Child Discount (50% off)</span>
                  <span>-{route.price * 0.5 * children} AFC</span>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex justify-between">
            <span>Ticket Price ({seats.length}x)</span>
            <span>{route.price * seats.length} AFC</span>
          </div>
        )}
        <div className="flex justify-between"><span>Service Fee</span><span>5 AFC</span></div>
        <Separator className="my-2" />
        <div className="flex justify-between text-xl font-bold"><span>Total</span><span className="text-orange-600">{totalPrice} AFC</span></div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">Back</Button>
        <Button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500">
          <CreditCard className="mr-2 h-4 w-4" /> Pay with Africoin
        </Button>
      </div>
    </Card>
  );
}

