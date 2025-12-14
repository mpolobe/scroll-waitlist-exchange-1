import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TrainTracker from '@/components/tracking/TrainTracker';
import LiveTrainStatus from '@/components/tracking/LiveTrainStatus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw } from 'lucide-react';

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

export default function TrainTracking() {
  const [searchParams] = useSearchParams();
  const [trainNumber, setTrainNumber] = useState(searchParams.get('train') || 'TR-101');
  const [searchInput, setSearchInput] = useState('');
  const [position, setPosition] = useState<TrainPosition | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTrainNumber(searchInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Live Train Tracking</h1>
          <p className="text-gray-600">Track your train in real-time with GPS updates every 30 seconds</p>
        </div>

        <Card className="p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Enter train number (e.g., TR-101)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="w-4 h-4 mr-2" />
              Track Train
            </Button>
          </form>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <TrainTracker 
              trainNumber={trainNumber}
              onPositionUpdate={setPosition}
            />
          </div>

          <div>
            {position && <LiveTrainStatus position={position} />}
            
            <Card className="p-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {lastUpdate.toLocaleTimeString()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Auto-refreshing every 30 seconds
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
