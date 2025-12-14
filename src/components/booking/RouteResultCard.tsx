import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Train, Clock, MapPin, Navigation } from 'lucide-react';
import { getDistanceBetweenCities, formatDistance, calculateTravelTime } from '@/lib/distanceCalculator';


interface Route {
  id: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  available: number;
  trainNumber: string;
}

interface RouteResultCardProps {
  route: Route;
  onSelect: (route: Route) => void;
}

export function RouteResultCard({ route, onSelect }: RouteResultCardProps) {
  // Calculate distance and estimated travel time
  const distance = getDistanceBetweenCities(route.from, route.to);
  const estimatedTime = calculateTravelTime(distance, 'standard');
  
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Train className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-700">Train {route.trainNumber}</span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div>
              <p className="text-2xl font-bold">{route.departure}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="h-3 w-3" />{route.from}</p>
            </div>
            <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
              <Clock className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{route.arrival}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="h-3 w-3" />{route.to}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{route.duration}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              {formatDistance(distance)}
            </span>
            <span>•</span>
            <span>Est. {estimatedTime}</span>
            <span>•</span>
            <span>{route.available} seats available</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-orange-600">{route.price} AFC</p>
          <Button onClick={() => onSelect(route)} className="mt-2 bg-gradient-to-r from-blue-600 to-orange-500">Select</Button>
        </div>
      </div>
    </Card>
  );
}

