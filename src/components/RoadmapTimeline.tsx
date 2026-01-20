import React from 'react';
import { CheckCircle, Circle, Rocket, Users, Train, Globe, Building, Coins } from 'lucide-react';

const RoadmapTimeline = () => {
  const phases = [
    {
      quarter: 'Q1 2026',
      title: 'Foundation',
      status: 'current',
      icon: Rocket,
      items: [
        { text: 'SENT Token IDO on PinkSale', done: true },
        { text: 'Sentinel Network launch', done: true },
        { text: '2,000+ track workers onboarded', done: true },
        { text: 'Mobile app release (Android)', done: true },
        { text: 'QuickSwap DEX listing', done: false }
      ]
    },
    {
      quarter: 'Q2 2026',
      title: 'Expansion',
      status: 'upcoming',
      icon: Users,
      items: [
        { text: 'AFC token launch on Sui', done: false },
        { text: 'First railway corridor operational', done: false },
        { text: 'Partnership with TAZARA', done: false },
        { text: 'iOS app release', done: false },
        { text: 'Staking platform launch', done: false }
      ]
    },
    {
      quarter: 'Q3 2026',
      title: 'Integration',
      status: 'upcoming',
      icon: Train,
      items: [
        { text: 'Nile Valley Corridor construction', done: false },
        { text: 'AFRC rewards token launch', done: false },
        { text: 'Cross-border payment integration', done: false },
        { text: 'Cargo tracking system', done: false },
        { text: '10,000 Sentinels milestone', done: false }
      ]
    },
    {
      quarter: 'Q4 2026',
      title: 'Scale',
      status: 'upcoming',
      icon: Globe,
      items: [
        { text: 'West African Coastal corridor', done: false },
        { text: 'CEX listings (Tier 2)', done: false },
        { text: 'Governance DAO launch', done: false },
        { text: '1M passengers milestone', done: false },
        { text: 'Revenue sharing activation', done: false }
      ]
    },
    {
      quarter: '2027-2030',
      title: 'Continental Network',
      status: 'future',
      icon: Building,
      items: [
        { text: 'All 7 corridors operational', done: false },
        { text: '54 capitals connected', done: false },
        { text: '25,000+ km of track', done: false },
        { text: '50M annual passengers', done: false },
        { text: 'Full decentralization', done: false }
      ]
    }
  ];

  return (
    <section id="roadmap" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium mb-4">
            Roadmap
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Building Africa's Future
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A clear path from token launch to continental railway network
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-orange-500 transform md:-translate-x-1/2"></div>

          <div className="space-y-12">
            {phases.map((phase, index) => (
              <div 
                key={phase.quarter}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-8 h-8 transform -translate-x-1/2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    phase.status === 'current' 
                      ? 'bg-cyan-500 ring-4 ring-cyan-500/30' 
                      : phase.status === 'upcoming'
                      ? 'bg-slate-700 border-2 border-slate-500'
                      : 'bg-slate-800 border-2 border-slate-600'
                  }`}>
                    <phase.icon className={`w-4 h-4 ${
                      phase.status === 'current' ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                </div>

                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-1/2 ${
                  index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'
                }`}>
                  <div className={`bg-slate-800/50 backdrop-blur-sm border rounded-2xl p-6 ${
                    phase.status === 'current' 
                      ? 'border-cyan-500/50' 
                      : 'border-slate-700'
                  }`}>
                    <div className={`flex items-center gap-3 mb-4 ${
                      index % 2 === 0 ? 'md:justify-end' : ''
                    }`}>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        phase.status === 'current'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-slate-700 text-gray-400'
                      }`}>
                        {phase.quarter}
                      </span>
                      {phase.status === 'current' && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-4">{phase.title}</h3>
                    
                    <ul className={`space-y-2 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                      {phase.items.map((item, i) => (
                        <li 
                          key={i} 
                          className={`flex items-center gap-2 text-sm ${
                            index % 2 === 0 ? 'md:flex-row-reverse' : ''
                          }`}
                        >
                          {item.done ? (
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          )}
                          <span className={item.done ? 'text-gray-300' : 'text-gray-500'}>
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapTimeline;
