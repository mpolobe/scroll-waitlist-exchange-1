import { useState } from 'react';
import { 
  Train, MapPin, Clock, Users, Leaf, 
  ChevronRight, Play, Pause, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MarketingNav from '@/components/MarketingNav';

// Route data with coordinates (simplified for SVG positioning)
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
      { name: 'Cairo', country: 'Egypt', x: 580, y: 180 },
      { name: 'Khartoum', country: 'Sudan', x: 560, y: 280 },
      { name: 'Addis Ababa', country: 'Ethiopia', x: 620, y: 350 },
      { name: 'Nairobi', country: 'Kenya', x: 600, y: 430 },
      { name: 'Kampala', country: 'Uganda', x: 550, y: 400 }
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
      { name: 'Dakar', country: 'Senegal', x: 180, y: 260 },
      { name: 'Bamako', country: 'Mali', x: 260, y: 280 },
      { name: 'Ouagadougou', country: 'Burkina Faso', x: 310, y: 290 },
      { name: 'Niamey', country: 'Niger', x: 350, y: 270 },
      { name: "N'Djamena", country: 'Chad', x: 430, y: 280 }
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
      { name: 'Rabat', country: 'Morocco', x: 260, y: 140 },
      { name: 'Algiers', country: 'Algeria', x: 350, y: 130 },
      { name: 'Tunis', country: 'Tunisia', x: 410, y: 130 },
      { name: 'Tripoli', country: 'Libya', x: 470, y: 140 },
      { name: 'Nouakchott', country: 'Mauritania', x: 200, y: 210 }
    ]
  },
  {
    id: 'indian-ocean',
    name: 'Indian Ocean Arc',
    tagline: 'Island Nations Connected',
    color: '#00CED1',
    distance: '2,800 km',
    population: '80M',
    launchYear: '2027-2029',
    cities: [
      { name: 'Nairobi', country: 'Kenya', x: 600, y: 430 },
      { name: 'Dodoma', country: 'Tanzania', x: 590, y: 480 },
      { name: 'Antananarivo', country: 'Madagascar', x: 700, y: 540 },
      { name: 'Djibouti', country: 'Djibouti', x: 660, y: 320 }
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
      { name: 'Bamako', country: 'Mali', x: 260, y: 280 },
      { name: 'Niamey', country: 'Niger', x: 350, y: 270 },
      { name: "N'Djamena", country: 'Chad', x: 430, y: 280 },
      { name: 'Khartoum', country: 'Sudan', x: 560, y: 280 }
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
      { name: 'Kinshasa', country: 'DRC', x: 430, y: 450 },
      { name: 'Brazzaville', country: 'Congo', x: 435, y: 455 },
      { name: 'Luanda', country: 'Angola', x: 380, y: 500 },
      { name: 'Libreville', country: 'Gabon', x: 370, y: 400 }
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
      { name: 'Cape Town', country: 'South Africa', x: 420, y: 680 },
      { name: 'Windhoek', country: 'Namibia', x: 410, y: 580 },
      { name: 'Gaborone', country: 'Botswana', x: 480, y: 580 },
      { name: 'Harare', country: 'Zimbabwe', x: 530, y: 540 },
      { name: 'Lusaka', country: 'Zambia', x: 510, y: 510 },
      { name: 'Lilongwe', country: 'Malawi', x: 570, y: 500 }
    ]
  }
];

export default function NetworkMap() {
  const [selectedCorridor, setSelectedCorridor] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const selectedRoute = corridors.find(c => c.id === selectedCorridor);

  // Generate path string for a corridor
  const generatePath = (cities: { x: number; y: number }[]) => {
    if (cities.length < 2) return '';
    return cities.map((city, i) => 
      `${i === 0 ? 'M' : 'L'} ${city.x} ${city.y}`
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-slate-900">
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
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Continental Network</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAnimating(!isAnimating)}
                  className="border-slate-600 text-slate-300"
                >
                  {isAnimating ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                  {isAnimating ? 'Pause' : 'Animate'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                  {/* Pulsing background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-blue-900/20 animate-pulse" style={{ animationDuration: '4s' }} />
                  
                  <svg 
                    viewBox="0 0 800 750" 
                    className="w-full h-auto relative z-10"
                    style={{ maxHeight: '600px' }}
                  >
                    {/* Definitions for gradients and filters */}
                    <defs>
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                      <linearGradient id="africaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e3a5f" />
                        <stop offset="50%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    
                    {/* Detailed Africa continent outline */}
                    <path
                      d="M380 60 L420 55 L460 60 L500 70 L540 85 L575 105 L600 130 L620 160 L635 195 L645 230 L655 270 L665 310 L670 350 L668 390 L660 430 L645 470 L625 510 L600 545 L570 575 L535 600 L500 620 L465 635 L430 645 L400 650 L370 645 L340 635 L310 620 L285 600 L265 575 L250 545 L240 510 L235 470 L232 430 L230 390 L228 350 L225 310 L220 270 L210 230 L195 195 L185 165 L180 140 L185 115 L200 95 L225 80 L260 70 L300 62 L340 58 L380 60 M575 105 L590 115 L610 140 L625 170 L640 210 L650 250 L658 295 L662 340 L660 385 L652 430 L638 475 L618 515 L592 550 L560 580 L525 605 L485 625 L445 640 L405 648 L365 645 L325 635 L290 618 L260 595 L235 565 L218 530 L205 490 L198 445 L195 400 L195 355 L198 310 L205 265 L218 225 L238 190 L265 160 L298 138 L335 122 L375 112 L415 108 L455 110 L495 118 L530 132 L560 152 L585 178"
                      fill="url(#africaGradient)"
                      stroke="url(#borderGradient)"
                      strokeWidth="2"
                      className="drop-shadow-lg"
                    >
                      <animate attributeName="stroke-opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
                    </path>
                    
                    {/* Country borders (simplified internal lines) */}
                    <g stroke="#334155" strokeWidth="0.5" fill="none" opacity="0.5">
                      <path d="M350 130 L400 180 L450 160" />
                      <path d="M280 250 L350 280 L420 260 L500 290" />
                      <path d="M400 350 L480 380 L520 420" />
                      <path d="M320 400 L380 450 L440 480" />
                      <path d="M380 520 L450 560 L520 540" />
                    </g>
                    
                    {/* Grid lines */}
                    {[100, 200, 300, 400, 500, 600, 700].map(y => (
                      <line key={`h-${y}`} x1="100" y1={y} x2="700" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="5,5" />
                    ))}
                    {[200, 300, 400, 500, 600].map(x => (
                      <line key={`v-${x}`} x1={x} y1="100" x2={x} y2="700" stroke="#334155" strokeWidth="0.5" strokeDasharray="5,5" />
                    ))}

                    {/* Route lines */}
                    {corridors.map((corridor, corridorIndex) => (
                      <g key={corridor.id}>
                        {/* Outer glow effect */}
                        <path
                          d={generatePath(corridor.cities)}
                          fill="none"
                          stroke={corridor.color}
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={selectedCorridor === corridor.id ? 0.3 : 0.05}
                          filter="url(#glow)"
                          className="transition-opacity duration-500"
                        />
                        {/* Background track */}
                        <path
                          d={generatePath(corridor.cities)}
                          fill="none"
                          stroke={corridor.color}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={selectedCorridor === corridor.id ? 0.5 : 0.15}
                          className="transition-opacity duration-300"
                        />
                        {/* Main animated line with dash effect */}
                        <path
                          d={generatePath(corridor.cities)}
                          fill="none"
                          stroke={corridor.color}
                          strokeWidth={selectedCorridor === corridor.id ? 4 : 2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray={selectedCorridor === corridor.id ? "none" : "8 4"}
                          opacity={selectedCorridor === null || selectedCorridor === corridor.id ? 1 : 0.25}
                          className="transition-all duration-300 cursor-pointer"
                          onClick={() => setSelectedCorridor(selectedCorridor === corridor.id ? null : corridor.id)}
                        >
                          {isAnimating && (
                            <animate 
                              attributeName="stroke-dashoffset" 
                              values="0;24" 
                              dur="1s" 
                              repeatCount="indefinite" 
                            />
                          )}
                        </path>
                        {/* Animated train with trail */}
                        {isAnimating && (selectedCorridor === null || selectedCorridor === corridor.id) && (
                          <g>
                            {/* Train glow */}
                            <circle r="10" fill={corridor.color} opacity="0.3" filter="url(#glow)">
                              <animateMotion
                                dur={`${4 + corridorIndex * 0.5}s`}
                                repeatCount="indefinite"
                                path={generatePath(corridor.cities)}
                              />
                            </circle>
                            {/* Train body */}
                            <circle r="6" fill={corridor.color}>
                              <animateMotion
                                dur={`${4 + corridorIndex * 0.5}s`}
                                repeatCount="indefinite"
                                path={generatePath(corridor.cities)}
                              />
                              <animate attributeName="r" values="5;7;5" dur="0.5s" repeatCount="indefinite" />
                            </circle>
                            {/* Train center */}
                            <circle r="3" fill="white">
                              <animateMotion
                                dur={`${4 + corridorIndex * 0.5}s`}
                                repeatCount="indefinite"
                                path={generatePath(corridor.cities)}
                              />
                            </circle>
                          </g>
                        )}
                      </g>
                    ))}

                    {/* City markers */}
                    {corridors.map((corridor) => 
                      corridor.cities.map((city) => (
                        <g 
                          key={`${corridor.id}-${city.name}`}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredCity(city.name)}
                          onMouseLeave={() => setHoveredCity(null)}
                          onClick={() => setSelectedCorridor(selectedCorridor === corridor.id ? null : corridor.id)}
                        >
                          {/* Pulsing outer ring */}
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r="14"
                            fill="none"
                            stroke={corridor.color}
                            strokeWidth="2"
                            opacity={selectedCorridor === corridor.id || hoveredCity === city.name ? 0.6 : 0}
                            className="transition-opacity duration-300"
                          >
                            {isAnimating && (
                              <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                            )}
                            {isAnimating && (
                              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                            )}
                          </circle>
                          {/* Glow effect */}
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r={hoveredCity === city.name ? 14 : 10}
                            fill={corridor.color}
                            opacity={selectedCorridor === null || selectedCorridor === corridor.id ? 0.25 : 0.08}
                            filter="url(#glow)"
                            className="transition-all duration-200"
                          />
                          {/* Outer ring */}
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r={hoveredCity === city.name ? 10 : 7}
                            fill={corridor.color}
                            opacity={selectedCorridor === null || selectedCorridor === corridor.id ? 0.4 : 0.15}
                            className="transition-all duration-200"
                          />
                          {/* Inner dot */}
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r={hoveredCity === city.name ? 6 : 4}
                            fill={corridor.color}
                            opacity={selectedCorridor === null || selectedCorridor === corridor.id ? 1 : 0.35}
                            className="transition-all duration-200"
                          />
                          {/* White center */}
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r={hoveredCity === city.name ? 2.5 : 1.5}
                            fill="white"
                            opacity={selectedCorridor === null || selectedCorridor === corridor.id ? 0.9 : 0.3}
                            className="transition-all duration-200"
                          />
                          {/* City label with improved styling */}
                          {(hoveredCity === city.name || selectedCorridor === corridor.id) && (
                            <g className="pointer-events-none">
                              <rect
                                x={city.x + 12}
                                y={city.y - 14}
                                width={city.name.length * 7.5 + 16}
                                height="28"
                                rx="6"
                                fill="#0f172a"
                                stroke={corridor.color}
                                strokeWidth="1.5"
                                opacity="0.95"
                              />
                              <text
                                x={city.x + 20}
                                y={city.y + 5}
                                fill="white"
                                fontSize="12"
                                fontWeight="600"
                                fontFamily="system-ui, sans-serif"
                              >
                                {city.name}
                              </text>
                            </g>
                          )}
                        </g>
                      ))
                    )}

                    {/* Legend */}
                    <g transform="translate(80, 600)">
                      <rect x="0" y="0" width="240" height="130" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1.5" opacity="0.95" />
                      <text x="15" y="25" fill="white" fontSize="14" fontWeight="700">Rail Corridors</text>
                      <line x1="15" y1="35" x2="225" y2="35" stroke="#334155" strokeWidth="1" />
                      {corridors.map((c, i) => (
                        <g 
                          key={c.id} 
                          transform={`translate(15, ${50 + i * 11})`}
                          className="cursor-pointer"
                          onClick={() => setSelectedCorridor(selectedCorridor === c.id ? null : c.id)}
                          opacity={selectedCorridor === null || selectedCorridor === c.id ? 1 : 0.4}
                        >
                          <circle cx="6" cy="0" r="4" fill={c.color}>
                            {isAnimating && selectedCorridor === c.id && (
                              <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite" />
                            )}
                          </circle>
                          <text x="18" y="4" fill={selectedCorridor === c.id ? "white" : "#94a3b8"} fontSize="10" fontWeight={selectedCorridor === c.id ? "600" : "400"}>
                            {c.name}
                          </text>
                          <text x="180" y="4" fill="#64748b" fontSize="9" textAnchor="end">{c.distance}</text>
                        </g>
                      ))}
                    </g>
                    
                    {/* Network stats badge */}
                    <g transform="translate(560, 620)">
                      <rect x="0" y="0" width="160" height="80" rx="10" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" opacity="0.95" />
                      <text x="80" y="22" fill="#06b6d4" fontSize="11" fontWeight="600" textAnchor="middle">NETWORK STATS</text>
                      <text x="80" y="42" fill="white" fontSize="20" fontWeight="700" textAnchor="middle">25,000+ km</text>
                      <text x="80" y="60" fill="#64748b" fontSize="10" textAnchor="middle">54 Capitals • 7 Corridors</text>
                      <text x="80" y="72" fill="#22c55e" fontSize="9" textAnchor="middle">● LIVE TRACKING</text>
                    </g>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Route selector */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Select Corridor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {corridors.map((corridor) => (
                  <button
                    key={corridor.id}
                    onClick={() => setSelectedCorridor(selectedCorridor === corridor.id ? null : corridor.id)}
                    className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                      selectedCorridor === corridor.id 
                        ? 'bg-slate-700 ring-2' 
                        : 'bg-slate-900 hover:bg-slate-700'
                    }`}
                    style={{ 
                      ringColor: selectedCorridor === corridor.id ? corridor.color : 'transparent' 
                    }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: corridor.color }}
                    />
                    <div className="text-left flex-1">
                      <p className="text-white text-sm font-medium">{corridor.name}</p>
                      <p className="text-slate-400 text-xs">{corridor.launchYear}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${
                      selectedCorridor === corridor.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Selected route details */}
            {selectedRoute && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedRoute.color }}
                    />
                    <CardTitle className="text-white">{selectedRoute.name}</CardTitle>
                  </div>
                  <p className="text-slate-400 text-sm">{selectedRoute.tagline}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-3 rounded-lg">
                      <Train className="w-5 h-5 text-cyan-400 mb-1" />
                      <p className="text-white font-bold">{selectedRoute.distance}</p>
                      <p className="text-slate-400 text-xs">Total Distance</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg">
                      <Users className="w-5 h-5 text-green-400 mb-1" />
                      <p className="text-white font-bold">{selectedRoute.population}</p>
                      <p className="text-slate-400 text-xs">People Served</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-400 mb-1" />
                      <p className="text-white font-bold">{selectedRoute.launchYear}</p>
                      <p className="text-slate-400 text-xs">Launch Period</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg">
                      <MapPin className="w-5 h-5 text-pink-400 mb-1" />
                      <p className="text-white font-bold">{selectedRoute.cities.length}</p>
                      <p className="text-slate-400 text-xs">Major Stations</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-2">Route Stations:</p>
                    <div className="space-y-2">
                      {selectedRoute.cities.map((city, i) => (
                        <div key={city.name} className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: selectedRoute.color }}
                          />
                          <span className="text-white text-sm">{city.name}</span>
                          <span className="text-slate-500 text-xs">({city.country})</span>
                          {i < selectedRoute.cities.length - 1 && (
                            <div className="flex-1 border-t border-dashed border-slate-600 mx-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Network stats */}
            <Card className="bg-gradient-to-br from-cyan-900 to-blue-900 border-0">
              <CardContent className="p-6">
                <h3 className="text-white font-bold mb-4">Network Totals</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-cyan-200">Total Distance</span>
                    <span className="text-white font-bold">25,000+ km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-200">Capitals Connected</span>
                    <span className="text-white font-bold">54</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-200">Max Speed</span>
                    <span className="text-white font-bold">250 km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-200">Jobs Created</span>
                    <span className="text-white font-bold">2M+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-200">CO₂ Reduction</span>
                    <span className="text-white font-bold">60%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timeline section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Construction Timeline</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-cyan-500 to-blue-500" />
            <div className="space-y-8">
              {[
                { year: '2026', title: 'Phase 1 Launch', desc: 'Nile Valley & West African Coastal corridors begin construction' },
                { year: '2027', title: 'Expansion', desc: 'Maghreb Express & Indian Ocean Arc projects commence' },
                { year: '2028', title: 'First Services', desc: 'Inaugural passenger services on completed sections' },
                { year: '2029', title: 'Integration', desc: 'Major corridors complete, multi-country journeys available' },
                { year: '2030', title: 'Network Effect', desc: '15,000+ km operational, 20M annual passengers' },
                { year: '2035', title: 'Full Network', desc: 'All 54 capitals connected, continental unity achieved' }
              ].map((item, i) => (
                <div key={item.year} className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <Card className="bg-slate-800 border-slate-700 inline-block">
                      <CardContent className="p-4">
                        <p className="text-cyan-400 font-bold">{item.year}</p>
                        <p className="text-white font-semibold">{item.title}</p>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-4 h-4 bg-cyan-500 rounded-full border-4 border-slate-900 z-10" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
