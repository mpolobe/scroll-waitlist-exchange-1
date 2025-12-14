import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const MarketingCTA = () => {
  const navigate = useNavigate();

  return (
    <div className="py-20 bg-gradient-to-br from-orange-500 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white mb-12">
          <h2 className="text-4xl font-bold mb-4">Join Africoin Today</h2>
          <p className="text-xl max-w-2xl mx-auto">
            Create your account and start experiencing the future of African digital currency.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto text-center">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-3xl font-bold text-orange-600">50K+</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">54</p>
              <p className="text-sm text-gray-600">Countries</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">$2M+</p>
              <p className="text-sm text-gray-600">Daily Volume</p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/signup')}
            className="w-full max-w-md bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white py-6 text-lg font-semibold"
          >
            Create Your Account
          </Button>

          <p className="text-center text-xs text-gray-500 mt-6">
            Join thousands of users already using Africoin across Africa
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketingCTA;
