import React from 'react';

const TrustIndicators = () => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Trusted Across Africa</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-600 mb-2">$2.5B+</div>
            <p className="text-gray-600">Transaction Volume</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-600 mb-2">500K+</div>
            <p className="text-gray-600">Active Users</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-600 mb-2">99.9%</div>
            <p className="text-gray-600">Uptime</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-center mb-6">Security & Compliance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-white rounded-lg">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm font-semibold">256-bit Encryption</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-sm font-semibold">KYC Verified</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="text-3xl mb-2">🛡️</div>
              <p className="text-sm font-semibold">GDPR Compliant</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="text-3xl mb-2">🏦</div>
              <p className="text-sm font-semibold">Regulated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustIndicators;
