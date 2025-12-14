import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Train, MapPin } from 'lucide-react';

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
  trainNumber: string;
  onPositionUpdate?: (position: TrainPosition) => void;
}

export default function TrainTracker({ trainNumber, onPositionUpdate }: Props) {
  const [position, setPosition] = useState<TrainPosition | null>(null);
  const [stations] = useState([
    { name: 'Nairobi', lat: -1.286389, lng: 36.817223 },
    { name: 'Nakuru', lat: -0.303099, lng: 36.080025 },
    { name: 'Kisumu', lat: -0.091702, lng: 34.767956 },
  ]);

  useEffect(() => {
    const fetchPosition = async () => {
      // Simulate real-time position updates
      const mockPosition: TrainPosition = {
        train_number: trainNumber,
        route: 'Nairobi - Kisumu',
        current_location: {
          lat: -0.8 + Math.random() * 0.2,
          lng: 36.2 + Math.random() * 0.3,
          name: 'En route to Nakuru'
        },
        next_station: 'Nakuru',
        estimated_arrival: new Date(Date.now() + 45 * 60000).toISOString(),
        delay_minutes: Math.floor(Math.random() * 10),
        platform: '2A',
        status: Math.random() > 0.3 ? 'on_time' : 'delayed',
        speed_kmh: 80 + Math.floor(Math.random() * 40)
      };
      setPosition(mockPosition);
      onPositionUpdate?.(mockPosition);
    };

    fetchPosition();
    const interval = setInterval(fetchPosition, 30000);
    return () => clearInterval(interval);
  }, [trainNumber, onPositionUpdate]);

  if (!position) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <div className="relative h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764291906909_37f691de.webp"
          alt="Route map"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        
        {stations.map((station, idx) => (
          <div
            key={station.name}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${20 + idx * 35}%`,
              top: `${50 + (idx % 2 === 0 ? -10 : 10)}%`
            }}
          >
            <div className="flex flex-col items-center">
              <MapPin className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium mt-1">{station.name}</span>
            </div>
          </div>
        ))}

        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ left: '45%', top: '55%' }}
        >
          <div className="bg-green-500 rounded-full p-3 shadow-lg">
            <Train className="w-6 h-6 text-white" />
          </div>
          <Badge className="mt-2 bg-green-500">{position.speed_kmh} km/h</Badge>
        </div>
      </div>
    </Card>
  );
}
