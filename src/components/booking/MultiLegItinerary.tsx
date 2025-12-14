import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Train, ArrowRight, AlertCircle, Navigation } from 'lucide-react';
import { getDistanceBetweenCities, formatDistance, calculateTravelTime } from '@/lib/distanceCalculator';


interface Leg {
  id: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  trainNumber: string;
  transferTime?: string;
}

interface MultiLegItineraryProps {
  legs: Leg[];
  onSelect: () => void;
}

export function MultiLegItinerary({ legs, onSelect }: MultiLegItineraryProps) {
  const totalPrice = legs.reduce((sum, leg) => sum + leg.price, 0);
  const totalDistance = legs.reduce((sum, leg) => sum + getDistanceBetweenCities(leg.from, leg.to), 0);
  const totalDuration = calculateTravelTime(totalDistance, 'standard');

  return (
    <Card className="p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{legs[0].from} → {legs[legs.length - 1].to}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>{legs.length} leg{legs.length > 1 ? 's' : ''}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              {formatDistance(totalDistance)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {totalDuration}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{totalPrice} AFC</p>
          <p className="text-sm text-gray-600">per passenger</p>
        </div>
      </div>
      <div className="space-y-4 mb-4">
        {legs.map((leg, index) => {
          const legDistance = getDistanceBetweenCities(leg.from, leg.to);
          const legTime = calculateTravelTime(legDistance, 'standard');
          return (
            <div key={leg.id}>
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                <Train className="h-6 w-6 text-blue-600" />
                <div className="flex-1">
                  <p className="font-semibold">{leg.trainNumber}: {leg.from} → {leg.to}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{leg.departure} - {leg.arrival}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {formatDistance(legDistance)}
                    </span>
                    <span>•</span>
                    <span>Est. {legTime}</span>
                  </div>
                </div>
                <p className="font-semibold">{leg.price} AFC</p>
              </div>
              {leg.transferTime && index < legs.length - 1 && (
                <div className="flex items-center gap-2 py-2 px-4 text-sm text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Transfer time: {leg.transferTime}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Button onClick={onSelect} className="w-full bg-gradient-to-r from-blue-600 to-orange-500">
        Select This Journey
      </Button>
    </Card>
  );
}

