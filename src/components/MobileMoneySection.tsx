import React from 'react';

const MobileMoneySection = () => {
  const providers = [
    'M-Pesa', 'MTN Mobile Money', 'Airtel Money', 'Orange Money',
    'Vodacom M-Pesa', 'Tigo Pesa', 'Ecocash', 'Wave',
    'Chipper Cash', 'Flutterwave', 'Paystack', 'Cellulant',
    'YoUganda', 'GCash', 'Mobicash', 'Mpamba'
  ];

  return (
    <div id="integration" className="py-20 bg-gradient-to-br from-orange-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Seamless Mobile Money Integration</h2>
            <p className="text-lg text-gray-700 mb-6">
              Connect your existing mobile money account and start using Africoin instantly. 
              We support all major providers across the continent.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <span>Instant deposits from your mobile money wallet</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <span>Withdraw to any mobile money account in seconds</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <span>No additional verification required</span>
              </li>
            </ul>
          </div>
          
          <div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold mb-6 text-center">Supported Providers</h3>
              <div className="grid grid-cols-2 gap-4">
                {providers.map((provider, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-gradient-to-br from-orange-100 to-purple-100 rounded-lg text-center font-semibold text-sm hover:shadow-md transition"
                  >
                    {provider}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMoneySection;
