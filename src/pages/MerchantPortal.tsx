import React, { useState } from 'react';
import MerchantNav from '@/components/merchant/MerchantNav';
import MerchantDashboard from '@/components/merchant/MerchantDashboard';
import ApiDocs from '@/components/merchant/ApiDocs';
import IntegrationGuides from '@/components/merchant/IntegrationGuides';
import SandboxEnvironment from '@/components/merchant/SandboxEnvironment';
import MerchantAuth from '@/components/merchant/MerchantAuth';

const MerchantPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <MerchantAuth onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MerchantNav activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsAuthenticated(false)} />
      <div className="pt-16">
        {activeTab === 'dashboard' && <MerchantDashboard />}
        {activeTab === 'api-docs' && <ApiDocs />}
        {activeTab === 'integration' && <IntegrationGuides />}
        {activeTab === 'sandbox' && <SandboxEnvironment />}
      </div>
    </div>
  );
};

export default MerchantPortal;
