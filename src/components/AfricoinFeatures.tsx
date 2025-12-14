import React from 'react';

const AfricoinFeatures = () => {
  const features = [
    {
      title: 'Instant Transfers',
      description: 'Send money across Africa in seconds, not days. No more waiting for bank transfers.',
      icon: '⚡'
    },
    {
      title: 'Zero Fees',
      description: 'Keep more of your money. No hidden charges, no transfer fees, no surprises.',
      icon: '💰'
    },
    {
      title: 'Bank-Grade Security',
      description: 'Your funds are protected with military-grade encryption and multi-factor authentication.',
      icon: '🔒'
    },
    {
      title: 'Cross-Border Ready',
      description: 'Trade seamlessly across 54 African countries with one unified currency.',
      icon: '🌍'
    },
    {
      title: 'Mobile First',
      description: 'Works perfectly on any device. Access your wallet from anywhere, anytime.',
      icon: '📱'
    },
    {
      title: '24/7 Support',
      description: 'Get help whenever you need it. Our team is always ready to assist you.',
      icon: '💬'
    },
    {
      title: 'Low Volatility',
      description: 'Stable value backed by African economic growth and real-world utility.',
      icon: '📊'
    },
    {
      title: 'Easy Integration',
      description: 'Accept Africoin payments in your business with simple API integration.',
      icon: '🔌'
    }
  ];

  return (
    <div id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-4">Why Choose Africoin?</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Built for Africa, by Africans. Experience the future of digital currency designed for our continent.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl border-2 border-gray-100 hover:border-orange-500 hover:shadow-lg transition group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AfricoinFeatures;
