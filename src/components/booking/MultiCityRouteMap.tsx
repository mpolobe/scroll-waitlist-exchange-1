import { MapPin, ArrowRight } from 'lucide-react';

interface Stop {
  city: string;
  order: number;
}

interface MultiCityRouteMapProps {
  stops: Stop[];
}

export function MultiCityRouteMap({ stops }: MultiCityRouteMapProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Journey Route Map</h3>
      <div className="relative mb-6">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764291626142_cba5b203.webp" 
          alt="Route Map" 
          className="w-full h-64 object-cover rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <p className="text-sm font-semibold text-gray-700">
              {stops.length} Stop{stops.length > 1 ? 's' : ''} Journey
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        {stops.map((stop, index) => (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-green-500' : index === stops.length - 1 ? 'bg-red-500' : 'bg-blue-500'} text-white font-bold`}>
                {index + 1}
              </div>
              <MapPin className="h-4 w-4 text-gray-600 mt-1" />
              <p className="text-sm font-semibold mt-1">{stop.city}</p>
            </div>
            {index < stops.length - 1 && <ArrowRight className="h-5 w-5 text-gray-400 mx-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}
