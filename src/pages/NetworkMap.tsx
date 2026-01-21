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
                    
                    {/* Africa continent - realistic outline */}
                    <path
                      d="M320,80 L340,75 L365,72 L390,70 L420,72 L450,78 L480,88 L505,100 L525,115 L540,132 L552,150 L562,170 L570,192 L576,215 L580,240 L582,268 L583,298 L582,330 L578,362 L572,395 L564,428 L554,460 L542,490 L528,518 L512,544 L494,568 L474,590 L452,610 L428,628 L402,644 L375,658 L348,670 L322,678 L298,682 L276,680 L258,672 L244,658 L234,640 L228,618 L226,594 L228,568 L234,542 L244,518 L258,496 L276,478 L298,464 L322,454 L348,448 L375,446 L402,448 L428,454 L452,464 L474,478 L494,496 L512,518 L528,542 L542,568 L554,594 L564,618 L572,640 L578,658 L582,672 L583,680 L582,682 L578,678 L572,670 L564,658 L554,644 L542,628 L528,610 L512,590 L494,568 L474,544 L452,518 L428,490 L402,460 L375,428 L348,395 L322,362 L298,330 L276,298 L258,268 L244,240 L234,215 L228,192 L226,170 L228,150 L234,132 L244,115 L258,100 L276,88 L298,78 L320,72 Z M180,180 L200,165 L225,155 L252,150 L280,152 L305,160 L325,175 L340,195 L348,220 L350,248 L345,278 L335,305 L320,328 L300,348 L278,362 L255,370 L232,372 L212,368 L195,358 L182,342 L175,322 L172,300 L175,278 L182,258 L195,240 L212,225 L232,215 L255,210 L278,212 L300,220 L320,235 L335,255 L345,280 L350,308 L348,338 L340,365 L325,388 L305,405 L280,418 L252,425 L225,428 L200,425 L180,418 L165,405 L155,388 L150,365 L152,338 L160,308 L175,280 L195,255 L220,235 L248,220 L278,212 L308,210 L335,215 L358,228 L375,248 L388,275 L395,308 L396,345 L392,385 L382,425 L368,462 L350,498 L328,530 L304,558 L278,582 L252,602 L228,618 L208,630 L192,638 L182,642 L178,640 L180,632 L188,618 L202,598 L222,572 L248,542 L278,508 L312,472 L348,435 L385,398 L420,362 L452,328 L480,298 L502,272 L518,252 L528,238 L532,232 L530,235 L522,248 L508,270 L490,298 L468,332 L444,370 L418,410 L392,450 L368,488 L348,522 L332,552 L322,575 L318,592 L320,602 L328,605 L342,600 L362,588 L388,570 L418,548 L450,522 L482,495 L512,468 L538,442 L560,420 L576,402 L588,390 L594,385 L596,388 L592,398 L582,418 L568,445 L550,478 L530,515 L508,552 L486,588 L464,620 L444,648 L426,670 L412,688 L402,700 L398,705 L400,702 L408,692 L422,675 L442,652 L466,625 L492,595 L518,565 L542,535 L562,508 L578,485 L590,468 L598,458 L602,455 L600,460 L592,475 L578,500 L560,532 L538,568 L514,605 L490,640 L468,672 L450,698 L438,718 L432,730 L432,735 L438,732 L450,722 L468,705 L490,682 L514,655 L538,628 L560,602 L578,580 L592,565 L602,558 L608,560 L610,570 L608,588 L600,615 L588,648 L572,685 L554,722 L536,755 L520,782 L508,802 L502,815 L502,820 L508,818 L520,808 L538,792 L560,772 L584,750 L608,730 L630,715 L648,708 L662,710 L672,720 L678,738 L680,762 L678,790 L672,820 L662,848 L648,872 L630,892 L608,908 L584,918 L560,922 L538,920 L520,912 L508,898 L502,880 L502,858 L508,835 L520,812 L538,792 L560,778 L584,770 L608,770 L630,778 L648,795 L662,820 L672,852 L678,890 L680,932"
                      fill="url(#africaGradient)"
                      stroke="url(#borderGradient)"
                      strokeWidth="2"
                      className="drop-shadow-2xl"
                      transform="translate(80, 20) scale(0.82)"
                    >
                      <animate attributeName="stroke-opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite" />
                    </path>
                    
                    {/* Simplified Africa silhouette overlay for better recognition */}
                    <path
                      d="M300,100 L350,90 L400,85 L450,90 L500,100 L540,120 L575,150 L600,190 L618,240 L628,300 L632,360 L628,420 L618,480 L600,535 L575,585 L540,630 L500,665 L450,690 L400,705 L350,710 L300,705 L260,690 L230,665 L210,630 L200,585 L198,535 L205,480 L220,420 L242,360 L270,300 L300,250 L325,210 L340,180 L345,160 L340,145 L325,135 L300,130 L275,135 L255,150 L242,175 L238,205 L245,240 L260,275 L282,305 L310,330 L342,348 L375,358 L405,360 L432,355 L455,342 L472,322 L482,298 L485,272 L480,248 L468,228 L450,215 L428,210 L405,215 L385,230 L372,255 L368,285 L375,318 L392,350 L418,378 L450,400 L485,415 L520,422 L552,420 L580,410 L602,392 L618,368 L628,340 L632,310 L630,282 L622,258 L608,240 L590,230 L570,228 L552,238 L540,258 L535,285 L540,318 L555,352 L580,385 L612,412 L648,432 L685,445 L720,450"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      opacity="0.2"
                      filter="url(#glow)"
                    />
                    
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
