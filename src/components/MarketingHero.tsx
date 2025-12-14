import React from 'react';
import { useNavigate } from 'react-router-dom';

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


  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764284354412_ee702195.webp)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 to-purple-600/80"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764284353488_fc5a167b.webp" 
          alt="Africoin" 
          className="h-24 w-24 mx-auto mb-6 animate-pulse"
        />
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          The Future of African Currency
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
          Send money across Africa instantly with zero fees. Join thousands embracing the digital currency revolution.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleSignUp}
            className="bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition shadow-xl"
          >
            Sign Up
          </button>

          <button 
            onClick={scrollToFeatures}
            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketingHero;
