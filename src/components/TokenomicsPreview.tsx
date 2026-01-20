import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Lock, Users, TrendingUp, ExternalLink } from 'lucide-react';

const TokenomicsPreview = () => {
  const navigate = useNavigate();

  const tokens = [
    {
      symbol: '$SENT',
      name: 'Sentinel',
      network: 'Polygon',
      color: 'from-purple-500 to-pink-500',
      purpose: 'Governance & Investment',
      features: ['Voting rights', 'Revenue sharing', '720-day lock'],
      link: 'https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08',
      isLive: true
    },
    {
      symbol: '$AFC',
      name: 'Africoin',
      network: 'Sui',
      color: 'from-cyan-500 to-blue-500',
      purpose: 'Train Ticket Payments',
      features: ['Fast transactions', 'Low fees', 'Mobile-first'],
      link: '/reviews/afc-token-africoin',
      isLive: false
    },
    {
      symbol: '$AFRC',
      name: 'Railway Credits',
      network: 'Coming Soon',
      color: 'from-orange-500 to-yellow-500',
      purpose: 'Cargo & Freight Rewards',
      features: ['Shipping rewards', 'Freight discounts', 'Loyalty program'],
      link: '/reviews',
      isLive: false
    }
  ];

  const sentStats = [
    { label: 'Total Supply', value: '10B', icon: Coins },
    { label: 'Liquidity Lock', value: '720 Days', icon: Lock },
    { label: 'Sentinels', value: '2,000+', icon: Users },
    { label: 'Network', value: 'Polygon', icon: TrendingUp }
  ];

  return (
    <section id="tokenomics" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium mb-4">
            Token Ecosystem
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Three Tokens, One Mission
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A complete ecosystem powering Africa's railway infrastructure with payments, governance, and rewards.
          </p>
        </div>

        {/* Token Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tokens.map((token) => (
            <div 
              key={token.symbol}
              className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all group"
            >
              {token.isLive && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  IDO LIVE
                </div>
              )}
              
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${token.color} mb-4`}>
                <Coins className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-1">{token.symbol}</h3>
              <p className="text-gray-400 text-sm mb-2">{token.name}</p>
              <span className="inline-block px-2 py-0.5 bg-slate-700 text-gray-300 rounded text-xs mb-4">
                {token.network}
              </span>
              
              <p className="text-gray-300 font-medium mb-4">{token.purpose}</p>
              
              <ul className="space-y-2 mb-6">
                {token.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <a 
                href={token.link}
                target={token.link.startsWith('http') ? '_blank' : undefined}
                rel={token.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  if (!token.link.startsWith('http')) {
                    e.preventDefault();
                    navigate(token.link);
                  }
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  token.isLive 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {token.isLive ? 'Join IDO' : 'Learn More'}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* SENT Stats */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">$SENT Token Details</h3>
              <p className="text-gray-400">The governance token powering the Sentinel Network</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {sentStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-purple-500/30 flex flex-wrap items-center justify-center gap-4">
            <a 
              href="https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-pink-600 transition-all"
            >
              Join IDO on PinkSale
              <ExternalLink className="w-4 h-4" />
            </a>
            <button 
              onClick={() => navigate('/reviews/sent-token-sentinel-network')}
              className="inline-flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-slate-600 transition-all"
            >
              Read Full Review
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenomicsPreview;
