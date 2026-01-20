import { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Download, Maximize2,
  TrendingUp, Users, Globe, Leaf, DollarSign, Shield,
  Building, Train, Calendar, Target, BarChart3, PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MarketingNav from '@/components/MarketingNav';

const slides = [
  {
    id: 1,
    type: 'title',
    title: 'Africa Continental Rail Network',
    subtitle: 'Investor Presentation 2026',
    tagline: 'Connecting Africa, One Track at a Time'
  },
  {
    id: 2,
    type: 'opportunity',
    title: 'The Opportunity',
    points: [
      { icon: Globe, text: 'Africa\'s intra-continental trade is just 15% of total trade – lowest globally' },
      { icon: Users, text: '1.4 billion people across 54 countries with limited connectivity' },
      { icon: TrendingUp, text: 'AfCFTA creates $3.4 trillion economic bloc requiring infrastructure' },
      { icon: Target, text: 'First-mover advantage in continent-wide rail network' }
    ]
  },
  {
    id: 3,
    type: 'solution',
    title: 'Our Solution',
    stats: [
      { value: '25,000+', label: 'Kilometers of Track', icon: Train },
      { value: '54', label: 'Capitals Connected', icon: Globe },
      { value: '250', label: 'km/h Max Speed', icon: TrendingUp },
      { value: '7', label: 'Major Corridors', icon: Target }
    ],
    description: 'A unified high-speed rail network connecting every African capital by 2035'
  },
  {
    id: 4,
    type: 'corridors',
    title: 'Seven Strategic Corridors',
    corridors: [
      { name: 'Nile Valley', distance: '4,500 km', year: '2026-28', color: '#FF6B00' },
      { name: 'West African Coastal', distance: '4,200 km', year: '2026-28', color: '#32CD32' },
      { name: 'Maghreb Express', distance: '3,200 km', year: '2027-29', color: '#DC143C' },
      { name: 'Indian Ocean Arc', distance: '2,800 km', year: '2027-29', color: '#00CED1' },
      { name: 'Sahel Crosslink', distance: '3,100 km', year: '2028-30', color: '#FFD700' },
      { name: 'Congo Basin', distance: '2,600 km', year: '2028-30', color: '#1E90FF' },
      { name: 'Southern Cross', distance: '3,800 km', year: '2029-31', color: '#FF69B4' }
    ]
  },
  {
    id: 5,
    type: 'financials',
    title: 'Financial Overview',
    metrics: [
      { label: 'Total Project Cost', value: '$85B', subtext: 'Over 10 years' },
      { label: 'Phase 1 Investment', value: '$15B', subtext: '2026-2028' },
      { label: 'Projected Revenue (2035)', value: '$12B', subtext: 'Annual' },
      { label: 'Economic Multiplier', value: '4:1', subtext: 'GDP impact' }
    ]
  },
  {
    id: 6,
    type: 'revenue',
    title: 'Revenue Streams',
    streams: [
      { name: 'Passenger Services', percentage: 45, value: '$5.4B' },
      { name: 'Freight & Logistics', percentage: 30, value: '$3.6B' },
      { name: 'Station Development', percentage: 15, value: '$1.8B' },
      { name: 'Ancillary Services', percentage: 10, value: '$1.2B' }
    ]
  },
  {
    id: 7,
    type: 'impact',
    title: 'Economic & Social Impact',
    impacts: [
      { icon: Users, value: '2M+', label: 'Jobs Created', desc: 'Construction & operations' },
      { icon: TrendingUp, value: '50%', label: 'Trade Increase', desc: 'Intra-African commerce' },
      { icon: DollarSign, value: '$100B', label: 'Economic Impact', desc: 'By 2035' },
      { icon: Leaf, value: '60%', label: 'CO₂ Reduction', desc: 'vs. road/air travel' }
    ]
  },
  {
    id: 8,
    type: 'timeline',
    title: 'Implementation Timeline',
    phases: [
      { year: '2026', phase: 'Phase 1', desc: 'Nile Valley & West African corridors', progress: 100 },
      { year: '2027', phase: 'Phase 2', desc: 'Maghreb & Indian Ocean expansion', progress: 75 },
      { year: '2028', phase: 'Phase 3', desc: 'First passenger services', progress: 50 },
      { year: '2029', phase: 'Phase 4', desc: 'Sahel & Congo Basin networks', progress: 25 },
      { year: '2030-35', phase: 'Phase 5', desc: 'Full network completion', progress: 10 }
    ]
  },
  {
    id: 9,
    type: 'partners',
    title: 'Strategic Partners',
    categories: [
      { 
        name: 'Development Finance', 
        partners: ['African Development Bank', 'World Bank/IFC', 'European Investment Bank', 'China Development Bank']
      },
      { 
        name: 'Government Partners', 
        partners: ['African Union', '54 Member States', 'Regional Economic Communities']
      },
      { 
        name: 'Technology Partners', 
        partners: ['Global Rail Manufacturers', 'Signaling Systems Providers', 'Digital Infrastructure']
      }
    ]
  },
  {
    id: 10,
    type: 'risks',
    title: 'Risk Mitigation',
    risks: [
      { risk: 'Political Instability', mitigation: 'Multi-lateral agreements, phased approach, diversified corridors', level: 'Medium' },
      { risk: 'Construction Delays', mitigation: 'Experienced contractors, buffer timelines, modular construction', level: 'Medium' },
      { risk: 'Currency Fluctuation', mitigation: 'Multi-currency financing, hedging strategies, local procurement', level: 'Low' },
      { risk: 'Demand Risk', mitigation: 'Conservative projections, flexible capacity, freight diversification', level: 'Low' }
    ]
  },
  {
    id: 11,
    type: 'investment',
    title: 'Investment Structure',
    tiers: [
      { name: 'Sovereign Wealth', min: '$500M+', benefits: ['Board representation', 'Corridor naming rights', 'Priority procurement'], color: 'from-yellow-500 to-orange-500' },
      { name: 'Institutional', min: '$100M+', benefits: ['Advisory committee seat', 'Quarterly briefings', 'Co-investment rights'], color: 'from-purple-500 to-pink-500' },
      { name: 'Strategic Corporate', min: '$25M+', benefits: ['Partnership opportunities', 'Technology integration', 'Brand association'], color: 'from-blue-500 to-cyan-500' }
    ]
  },
  {
    id: 12,
    type: 'cta',
    title: 'Join Us in Building Africa\'s Future',
    contact: {
      email: 'investors@africarailways.com',
      phone: '+251 XXX XXX XXX',
      website: 'africarailways.com/investors'
    },
    nextSteps: [
      'Schedule investor presentation',
      'Review detailed prospectus',
      'Site visit to construction zones',
      'Due diligence process'
    ]
  }
];

export default function InvestorDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const slide = slides[currentSlide];

  const renderSlide = () => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Badge className="bg-cyan-500/20 text-cyan-300 mb-6 text-lg px-4 py-2">Confidential</Badge>
            <h1 className="text-6xl font-bold text-white mb-4">{slide.title}</h1>
            <p className="text-3xl text-cyan-400 mb-8">{slide.subtitle}</p>
            <p className="text-xl text-slate-400 italic">{slide.tagline}</p>
            <div className="mt-12 flex gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">54</p>
                <p className="text-slate-400">Countries</p>
              </div>
              <div className="w-px bg-slate-600" />
              <div className="text-center">
                <p className="text-4xl font-bold text-white">25K+</p>
                <p className="text-slate-400">Kilometers</p>
              </div>
              <div className="w-px bg-slate-600" />
              <div className="text-center">
                <p className="text-4xl font-bold text-white">$100B</p>
                <p className="text-slate-400">Impact</p>
              </div>
            </div>
          </div>
        );

      case 'opportunity':
        return (
          <div className="h-full p-12">
            <h2 className="text-4xl font-bold text-white mb-12">{slide.title}</h2>
            <div className="grid grid-cols-2 gap-8">
              {slide.points?.map((point, i) => (
                <div key={i} className="flex items-start gap-4 bg-slate-800/50 p-6 rounded-xl">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    <point.icon className="w-8 h-8 text-cyan-400" />
                  </div>
                  <p className="text-xl text-slate-200">{point.text}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'solution':
        return (
          <div className="h-full p-12">
            <h2 className="text-4xl font-bold text-white mb-4">{slide.title}</h2>
            <p className="text-xl text-slate-400 mb-12">{slide.description}</p>
            <div className="grid grid-cols-4 gap-6">
              {slide.stats?.map((stat, i) => (
                <div key={i} className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl text-center border border-slate-700">
                  <stat.icon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <p className="text-5xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'corridors':
        return (
          <div className="h-full p-12">
            <h2 className="text-4xl font-bold text-white mb-8">{slide.title}</h2>
            <div className="grid grid-cols-2 gap-4">
              {slide.corridors?.map((corridor, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border-l-4"
                  style={{ borderColor: corridor.color }}
                >
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: corridor.color }}
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold">{corridor.name}</p>
                    <p className="text-slate-400 text-sm">{corridor.distance}</p>
                  </div>
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    {corridor.year}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        );

      case 'financials':
        return (
          <div className="h-full p-12">
            <h2 className="text-4xl font-bold text-white mb-12">{slide.title}</h2>
            <div className="grid grid-cols-2 gap-8">
              {slide.metrics?.map((metric, i) => (
                <div key={i} className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 p-8 rounded-xl border border-cyan-800/50">
                  <p className="text-slate-400 text-lg mb-2">{metric.label}</p>
                  <p className="text-5xl font-bold text-white mb-2">{metric.value}</p>
                  <p className="text-cyan-400">{metric.subtext}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div className="h-full p-12">
            <h2 className="text-4xl font-bold text-white mb-4">{slide.title}</h2>
            <p className="text-slate-400 mb-8">Projected Annual Revenue by 2035: $12B</p>
            <div className="space-y-6">
              {slide.streams?.map((stream, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-medium">{stream.name}</span>
                    <span className="text-cyan-400">{stream.value} ({stream.percentage}%)</span>
                  </div>
                  <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${stream.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'impact':
        return (
          <div className="h-full p-12">
            <h2 className="text-4xl font-bold text-white mb-12">{slide.title}</h2>
            <div className="grid grid-cols-4 gap-6">
              {slide.impacts?.map((impact, i) => (
                <div key={i} className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <impact.icon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{impact.value}</p>
                  <p className="text-cyan-400 font-medium mb-1">{impact.label}</p>
                  <p className="text-slate-500 text-sm">{impact.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="h-full p-12">
            <h2 className="text-4xl font-bold text-white mb-12">{slide.title}</h2>
            <div className="space-y-6">
              {slide.phases?.map((phase, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="w-24 text-right">
                    <p className="text-cyan-400 font-bold text-xl">{phase.year}</p>
                  </div>
                  <div className="w-4 h-4 bg-cyan-500 rounded-full flex-shrink-0" />
                  <div className="flex-1 bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-white font-semibold">{phase.phase}</p>
                      <Badge className={phase.progress === 100 ? 'bg-green-500' : 'bg-slate-600'}>
                        {phase.progress === 100 ? 'Active' : 'Planned'}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'partners':
        return (
          <div className="h-full p-12">
            <h2 className="text-4xl font-bold text-white mb-12">{slide.title}</h2>
            <div className="grid grid-cols-3 gap-8">
              {slide.categories?.map((cat, i) => (
                <div key={i} className="bg-slate-800/50 p-6 rounded-xl">
                  <h3 className="text-cyan-400 font-semibold mb-4 text-lg">{cat.name}</h3>
                  <ul className="space-y-3">
                    {cat.partners.map((partner, j) => (
                      <li key={j} className="flex items-center gap-2 text-slate-300">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                        {partner}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 'risks':
        return (
          <div className="h-full p-12">
            <h2 className="text-4xl font-bold text-white mb-12">{slide.title}</h2>
            <div className="space-y-4">
              {slide.risks?.map((item, i) => (
                <div key={i} className="bg-slate-800/50 p-6 rounded-xl flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <Badge className={item.level === 'Low' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {item.level} Risk
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-1">{item.risk}</p>
                    <p className="text-slate-400 text-sm">{item.mitigation}</p>
                  </div>
                  <Shield className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'investment':
        return (
          <div className="h-full p-12">
            <h2 className="text-4xl font-bold text-white mb-12">{slide.title}</h2>
            <div className="grid grid-cols-3 gap-6">
              {slide.tiers?.map((tier, i) => (
                <div key={i} className={`bg-gradient-to-br ${tier.color} p-1 rounded-xl`}>
                  <div className="bg-slate-900 p-6 rounded-xl h-full">
                    <h3 className="text-white font-bold text-xl mb-2">{tier.name}</h3>
                    <p className="text-3xl font-bold text-cyan-400 mb-4">{tier.min}</p>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, j) => (
                        <li key={j} className="flex items-center gap-2 text-slate-300 text-sm">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="text-left">
                <h3 className="text-cyan-400 font-semibold mb-4 text-xl">Contact Us</h3>
                <div className="space-y-2 text-slate-300">
                  <p>Email: {slide.contact?.email}</p>
                  <p>Phone: {slide.contact?.phone}</p>
                  <p>Web: {slide.contact?.website}</p>
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-cyan-400 font-semibold mb-4 text-xl">Next Steps</h3>
                <ul className="space-y-2">
                  {slide.nextSteps?.map((step, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300">
                      <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-lg px-8">
              Schedule Presentation
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {!isFullscreen && <MarketingNav />}
      
      <div className={`${isFullscreen ? '' : 'pt-24'} pb-8`}>
        <div className="container mx-auto px-4">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge className="bg-cyan-500/20 text-cyan-300">
                Slide {currentSlide + 1} of {slides.length}
              </Badge>
              <h1 className="text-xl font-bold text-white">Investor Presentation</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-600 text-slate-300"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="w-4 h-4 mr-2" /> {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            </div>
          </div>

          {/* Slide */}
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <CardContent className="p-0">
              <div 
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                style={{ aspectRatio: '16/9', minHeight: '500px' }}
              >
                {renderSlide()}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="border-slate-600 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>

            {/* Slide indicators */}
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentSlide ? 'bg-cyan-500 w-8' : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="border-slate-600 text-slate-300"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Thumbnail navigation */}
          <div className="mt-8 grid grid-cols-6 gap-4">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`p-3 rounded-lg text-left transition-all ${
                  i === currentSlide 
                    ? 'bg-cyan-500/20 ring-2 ring-cyan-500' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <p className="text-xs text-slate-400 mb-1">Slide {i + 1}</p>
                <p className="text-sm text-white font-medium truncate">{s.title}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
