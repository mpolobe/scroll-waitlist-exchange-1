import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ExternalLink, Shield, TrendingUp, Users } from 'lucide-react';

const MarketingHero = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/signup');
  };

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJoinIDO = () => {
    window.open('https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08', '_blank');
  };

  const handleDownloadApp = () => {
    window.open('https://drive.google.com/file/d/1-z4k7waB7O6pfuPMMHmfX-xqMfCYLAlJ/view?usp=drivesdk', '_blank');
  };


  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764284354412_ee702195.webp)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-orange-900/80 to-purple-900/90"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764284353488_fc5a167b.webp" 
            alt="Africa Railways" 
            className="h-16 w-16"
          />
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white">Africa Railways</h2>
            <p className="text-orange-300 text-sm">Powered by Africoin</p>
          </div>
        </div>
        
        {/* IDO Banner */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/30 to-pink-500/30 border border-orange-400/50 rounded-full px-5 py-2 mb-8 backdrop-blur-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
          <span className="text-orange-100 font-semibold text-sm">$SENT IDO LIVE ON PINKSALE</span>
          <ExternalLink className="w-4 h-4 text-orange-300" />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Blockchain Infrastructure<br />
          <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">for African Railways</span>
        </h1>
        
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-300">
          Connecting 54 nations through high-speed rail with integrated digital payments, 
          safety monitoring, and transparent governance. Join 2,000+ Sentinels securing Africa's infrastructure.
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-bold text-orange-400">10B</div>
            <div className="text-sm text-gray-300">Total Supply</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-bold text-green-400">720</div>
            <div className="text-sm text-gray-300">Days Locked</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-bold text-cyan-400">54</div>
            <div className="text-sm text-gray-300">Nations</div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button 
            onClick={handleJoinIDO}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition shadow-xl flex items-center justify-center gap-2"
          >
            Join $SENT IDO on PinkSale
            <ExternalLink className="w-5 h-5" />
          </button>

          <button 
            onClick={() => navigate('/reviews')}
            className="bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition shadow-xl"
          >
            Read Token Reviews
          </button>

          <button 
            onClick={scrollToFeatures}
            className="bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition"
          >
            Learn More
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span>Audited Contract</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span>Polygon Network</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            <span>2,000+ Sentinels</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingHero;
