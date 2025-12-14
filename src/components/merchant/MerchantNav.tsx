import React from 'react';
import { Button } from '@/components/ui/button';

interface MerchantNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const MerchantNav = ({ activeTab, setActiveTab, onLogout }: MerchantNavProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'api-docs', label: 'API Docs' },
    { id: 'integration', label: 'Integration Guides' },
    { id: 'sandbox', label: 'Sandbox' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              Africoin Merchant
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg transition ${activeTab === tab.id ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {tab.label}
              </button>
            ))}
            <Button onClick={onLogout} variant="outline" size="sm">Logout</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MerchantNav;
