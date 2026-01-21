import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Train, MapPin, Clock, Users, Leaf, 
  ChevronRight, Play, Pause, Info, Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MarketingNav from '@/components/MarketingNav';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for different corridor colors
const createCustomIcon = (color: string, isActive: boolean = false) => {
  const size = isActive ? 16 : 12;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 ${isActive ? '15px' : '8px'} ${color}, 0 2px 4px rgba(0,0,0,0.3);
        ${isActive ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Train icon for animated markers
const createTrainIcon = (color: string) => {
  return L.divIcon({
    className: 'train-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 2px solid white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px ${color}, 0 4px 8px rgba(0,0,0,0.4);
        animation: trainPulse 0.8s ease-in-out infinite;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Route data with real coordinates (lat, lng)
const corridors = [
  {
    id: 'nile-valley',
    name: 'Nile Valley Corridor',
    tagline: 'Follow the Nile at 250 km/h',
    color: '#FF6B00',
    distance: '4,500 km',
    population: '130M',
    launchYear: '2026-2028',
    cities: [
      { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
      { name: 'Khartoum', country: 'Sudan', lat: 15.5007, lng: 32.5599 },
      { name: 'Addis Ababa', country: 'Ethiopia', lat: 9.0320, lng: 38.7469 },
      { name: 'Kampala', country: 'Uganda', lat: 0.3476, lng: 32.5825 },
      { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219 }
    ]
  },
  {
    id: 'west-african',
    name: 'West African Coastal',
    tagline: 'Connecting the Atlantic Coast',
    color: '#32CD32',
    distance: '4,200 km',
    population: '200M',
    launchYear: '2026-2028',
    cities: [
      { name: 'Dakar', country: 'Senegal', lat: 14.7167, lng: -17.4677 },
      { name: 'Bamako', country: 'Mali', lat: 12.6392, lng: -8.0029 },
      { name: 'Ouagadougou', country: 'Burkina Faso', lat: 12.3714, lng: -1.5197 },
      { name: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.1870 },
      { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 }
    ]
  },
  {
    id: 'maghreb',
    name: 'Maghreb Express',
    tagline: 'North Africa United',
    color: '#DC143C',
    distance: '3,200 km',
    population: '100M',
    launchYear: '2027-2029',
    cities: [
      { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lng: -7.5898 },
      { name: 'Rabat', country: 'Morocco', lat: 34.0209, lng: -6.8416 },
      { name: 'Algiers', country: 'Algeria', lat: 36.7538, lng: 3.0588 },
      { name: 'Tunis', country: 'Tunisia', lat: 36.8065, lng: 10.1815 },
      { name: 'Tripoli', country: 'Libya', lat: 32.8872, lng: 13.1913 }
    ]
  },
  {
    id: 'indian-ocean',
    name: 'Indian Ocean Arc',
    tagline: 'East Coast Connection',
    color: '#00CED1',
    distance: '2,800 km',
    population: '80M',
    launchYear: '2027-2029',
    cities: [
      { name: 'Mombasa', country: 'Kenya', lat: -4.0435, lng: 39.6682 },
      { name: 'Dar es Salaam', country: 'Tanzania', lat: -6.7924, lng: 39.2083 },
      { name: 'Maputo', country: 'Mozambique', lat: -25.9692, lng: 32.5732 },
      { name: 'Durban', country: 'South Africa', lat: -29.8587, lng: 31.0218 }
    ]
  },
  {
    id: 'sahel',
    name: 'Sahel Crosslink',
    tagline: 'Bridging the Sahel',
    color: '#FFD700',
    distance: '3,100 km',
    population: '90M',
    launchYear: '2028-2030',
    cities: [
      { name: 'Niamey', country: 'Niger', lat: 13.5137, lng: 2.1098 },
      { name: "N'Djamena", country: 'Chad', lat: 12.1348, lng: 15.0557 },
      { name: 'Khartoum', country: 'Sudan', lat: 15.5007, lng: 32.5599 }
    ]
  },
  {
    id: 'congo-basin',
    name: 'Congo Basin Network',
    tagline: 'Opening the Heart of Africa',
    color: '#1E90FF',
    distance: '2,600 km',
    population: '120M',
    launchYear: '2028-2030',
    cities: [
      { name: 'Kinshasa', country: 'DRC', lat: -4.4419, lng: 15.2663 },
      { name: 'Brazzaville', country: 'Congo', lat: -4.2634, lng: 15.2429 },
      { name: 'Luanda', country: 'Angola', lat: -8.8390, lng: 13.2894 },
      { name: 'Libreville', country: 'Gabon', lat: 0.4162, lng: 9.4673 }
    ]
  },
  {
    id: 'southern-cross',
    name: 'Southern Cross',
    tagline: 'The Southern Powerhouse',
    color: '#FF69B4',
    distance: '3,800 km',
    population: '150M',
    launchYear: '2029-2031',
    cities: [
      { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241 },
      { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473 },
      { name: 'Gaborone', country: 'Botswana', lat: -24.6282, lng: 25.9231 },
      { name: 'Harare', country: 'Zimbabwe', lat: -17.8252, lng: 31.0335 },
      { name: 'Lusaka', country: 'Zambia', lat: -15.3875, lng: 28.3228 }
    ]
  }
];

// Component to handle map view changes
function MapController({ selectedCorridor }: { selectedCorridor: string | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedCorridor) {
      const corridor = corridors.find(c => c.id === selectedCorridor);
      if (corridor && corridor.cities.length > 0) {
        const bounds = L.latLngBounds(
          corridor.cities.map(city => [city.lat, city.lng] as [number, number])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
      }
    } else {
      // Reset to Africa view
      map.setView([5, 20], 3);
    }
  }, [selectedCorridor, map]);
  
  return null;
}

// Animated train component
function AnimatedTrain({ corridor, isAnimating }: { corridor: typeof corridors[0], isAnimating: boolean }) {
  const [position, setPosition] = useState(0);
  
  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setPosition(prev => (prev + 0.5) % 100);
    }, 50);
    
    return () => clearInterval(interval);
  }, [isAnimating]);
  
  if (!isAnimating || corridor.cities.length < 2) return null;
  
  // Calculate position along the route
  const totalSegments = corridor.cities.length - 1;
  const progressAlongRoute = (position / 100) * totalSegments;
  const currentSegment = Math.floor(progressAlongRoute);
  const segmentProgress = progressAlongRoute - currentSegment;
  
  if (currentSegment >= totalSegments) return null;
  
  const startCity = corridor.cities[currentSegment];
  const endCity = corridor.cities[currentSegment + 1];
  
  const lat = startCity.lat + (endCity.lat - startCity.lat) * segmentProgress;
  const lng = startCity.lng + (endCity.lng - startCity.lng) * segmentProgress;
  
  return (
    <Marker
      position={[lat, lng]}
      icon={createTrainIcon(corridor.color)}
    />
  );
}

export default function NetworkMap() {
  const [selectedCorridor, setSelectedCorridor] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const selectedRoute = corridors.find(c => c.id === selectedCorridor);

  // Africa center coordinates
  const africaCenter: [number, number] = [5, 20];
  const defaultZoom = 3;

  return (
    <div className="min-h-screen bg-slate-900">
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.8; }
        }
        @keyframes trainPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .leaflet-container {
          background: #0f172a;
        }
        .custom-marker, .train-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          background: #1e293b;
          color: white;
          border-radius: 8px;
          border: 1px solid #334155;
        }
        .leaflet-popup-tip {
          background: #1e293b;
        }
        .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>
      
      <MarketingNav />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white pt-32 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-cyan-500/20 text-cyan-300 mb-4">Interactive Map</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Africa Rail <span className="text-cyan-400">Network Map</span>
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              Explore 7 corridors connecting 54 capitals across the continent
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className={`${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-slate-900' : 'lg:col-span-2'}`}>
            <Card className="bg-slate-800 border-slate-700 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  Sentinel Network
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAnimating(!isAnimating)}
                    className="border-slate-600 text-slate-300"
                  >
                    {isAnimating ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    {isAnimating ? 'Pause' : 'Animate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="border-slate-600 text-slate-300"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className={`relative ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[500px]'}`}>
                  <MapContainer
                    center={africaCenter}
                    zoom={defaultZoom}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    
                    <MapController selectedCorridor={selectedCorridor} />
                    
                    {/* Route lines */}
                    {corridors.map((corridor) => (
                      <Polyline
                        key={corridor.id}
                        positions={corridor.cities.map(city => [city.lat, city.lng] as [number, number])}
                        pathOptions={{
                          color: corridor.color,
                          weight: selectedCorridor === corridor.id ? 5 : 3,
                          opacity: selectedCorridor === null || selectedCorridor === corridor.id ? 0.9 : 0.3,
                          dashArray: selectedCorridor === corridor.id ? undefined : '10, 5',
                        }}
                        eventHandlers={{
                          click: () => setSelectedCorridor(selectedCorridor === corridor.id ? null : corridor.id),
                        }}
                      />
                    ))}
                    
                    {/* City markers */}
                    {corridors.map((corridor) => (
                      corridor.cities.map((city) => (
                        <Marker
                          key={`${corridor.id}-${city.name}`}
                          position={[city.lat, city.lng]}
                          icon={createCustomIcon(
                            corridor.color,
                            selectedCorridor === corridor.id
                          )}
                          eventHandlers={{
                            click: () => setSelectedCorridor(corridor.id),
                          }}
                        >
                          <Popup>
                            <div className="text-center">
                              <div className="font-bold text-lg">{city.name}</div>
                              <div className="text-gray-400 text-sm">{city.country}</div>
                              <div className="mt-2 text-xs" style={{ color: corridor.color }}>
                                {corridor.name}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))
                    ))}
                    
                    {/* Animated trains */}
                    {corridors.map((corridor) => (
                      (selectedCorridor === null || selectedCorridor === corridor.id) && (
                        <AnimatedTrain
                          key={`train-${corridor.id}`}
                          corridor={corridor}
                          isAnimating={isAnimating}
                        />
                      )
                    ))}
                  </MapContainer>
                  
                  {/* Legend overlay */}
                  <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 z-[1000]">
                    <div className="text-xs text-gray-400 mb-2">Corridors</div>
                    <div className="space-y-1">
                      {corridors.slice(0, 4).map((corridor) => (
                        <div
                          key={corridor.id}
                          className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded transition-colors ${
                            selectedCorridor === corridor.id ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                          }`}
                          onClick={() => setSelectedCorridor(selectedCorridor === corridor.id ? null : corridor.id)}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: corridor.color }}
                          />
                          <span className="text-xs text-gray-300">{corridor.name.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className={`space-y-6 ${isFullscreen ? 'hidden' : ''}`}>
            {/* Selected Route Info */}
            {selectedRoute ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedRoute.color }}
                    />
                    <CardTitle className="text-white">{selectedRoute.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400 italic">{selectedRoute.tagline}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs">Distance</div>
                      <div className="text-white font-bold">{selectedRoute.distance}</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs">Population</div>
                      <div className="text-white font-bold">{selectedRoute.population}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-2">Launch Timeline</div>
                    <div className="text-cyan-400 font-bold">{selectedRoute.launchYear}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-xs mb-2">Stations</div>
                    <div className="space-y-2">
                      {selectedRoute.cities.map((city) => (
                        <div key={city.name} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: selectedRoute.color }}
                          />
                          <span className="text-white text-sm">{city.name}</span>
                          <span className="text-gray-500 text-xs">({city.country})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300"
                    onClick={() => setSelectedCorridor(null)}
                  >
                    View All Routes
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-cyan-400" />
                    Select a Corridor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Click on any route line or city marker to view details about that corridor.
                  </p>
                  <div className="space-y-2">
                    {corridors.map((corridor) => (
                      <div
                        key={corridor.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedCorridor(corridor.id)}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: corridor.color }}
                        />
                        <div className="flex-1">
                          <div className="text-white text-sm">{corridor.name}</div>
                          <div className="text-gray-500 text-xs">{corridor.distance}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Network Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Train className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold">24,200 km</div>
                    <div className="text-gray-400 text-xs">Total Track Length</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold">870M+</div>
                    <div className="text-gray-400 text-xs">Population Served</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold">54</div>
                    <div className="text-gray-400 text-xs">Connected Capitals</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold">100%</div>
                    <div className="text-gray-400 text-xs">Electric Powered</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Launch Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { year: '2026-2028', corridors: ['Nile Valley', 'West African'] },
                    { year: '2027-2029', corridors: ['Maghreb', 'Indian Ocean'] },
                    { year: '2028-2030', corridors: ['Sahel', 'Congo Basin'] },
                    { year: '2029-2031', corridors: ['Southern Cross'] },
                  ].map((phase, index) => (
                    <div key={phase.year} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-cyan-500" />
                        {index < 3 && <div className="w-0.5 h-full bg-slate-700 flex-1" />}
                      </div>
                      <div className="pb-4">
                        <div className="text-cyan-400 font-bold text-sm">{phase.year}</div>
                        <div className="text-gray-400 text-xs">
                          {phase.corridors.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
