import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, MapPin, Gauge } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TrainPosition {
  train_number: string;
  route: string;
  current_location: { lat: number; lng: number; name: string };
  next_station: string;
  estimated_arrival: string;
  delay_minutes: number;
  platform: string;
  status: string;
  speed_kmh: number;
}

interface Props {
  position: TrainPosition;
}

export default function LiveTrainStatus({ position }: Props) {
  const arrivalTime = new Date(position.estimated_arrival);
  const isDelayed = position.delay_minutes > 0;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Train {position.train_number}</h3>
          <Badge variant={isDelayed ? 'destructive' : 'default'}>
            {isDelayed ? 'Delayed' : 'On Time'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Current Location</p>
              <p className="font-semibold">{position.current_location.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Next Station</p>
              <p className="font-semibold">{position.next_station}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Gauge className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Current Speed</p>
              <p className="font-semibold">{position.speed_kmh} km/h</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Platform</p>
              <p className="font-semibold">{position.platform}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">Estimated Arrival</p>
          <p className="text-lg font-bold text-blue-600">
            {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </Card>

      {isDelayed && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Train is delayed by {position.delay_minutes} minutes due to operational reasons.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
