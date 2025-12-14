import React, { useState, useEffect } from 'react';

interface Rate {
  currency: string;
  code: string;
  rate: number;
  change: number;
}

const ExchangeRates = () => {
  const [rates, setRates] = useState<Rate[]>([
    { currency: 'Nigerian Naira', code: 'NGN', rate: 1650.50, change: 2.3 },
    { currency: 'Kenyan Shilling', code: 'KES', rate: 145.25, change: -0.8 },
    { currency: 'South African Rand', code: 'ZAR', rate: 18.75, change: 1.2 },
    { currency: 'Ghanaian Cedi', code: 'GHS', rate: 12.40, change: 0.5 },
    { currency: 'Ugandan Shilling', code: 'UGX', rate: 3720.00, change: -1.1 },
    { currency: 'Tanzanian Shilling', code: 'TZS', rate: 2580.00, change: 0.9 },
    { currency: 'Egyptian Pound', code: 'EGP', rate: 48.50, change: 1.8 },
    { currency: 'Moroccan Dirham', code: 'MAD', rate: 10.15, change: -0.3 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRates(prev => prev.map(rate => ({
        ...rate,
        rate: rate.rate + (Math.random() - 0.5) * 2,
        change: (Math.random() - 0.5) * 3
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="rates" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-4">Live Exchange Rates</h2>
        <p className="text-center text-gray-600 mb-12">Real-time rates across African currencies</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rates.map((rate) => (
            <div key={rate.code} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-500">{rate.currency}</p>
                  <p className="text-2xl font-bold">{rate.code}</p>
                </div>
                <span className={`text-sm font-semibold ${rate.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {rate.change >= 0 ? '↑' : '↓'} {Math.abs(rate.change).toFixed(1)}%
                </span>
              </div>
              <p className="text-3xl font-bold text-orange-600">{rate.rate.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-2">per 1 AFRC</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExchangeRates;
