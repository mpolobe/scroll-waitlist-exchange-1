import React from 'react';
import MarketingNav from './MarketingNav';
import MarketingHero from './MarketingHero';
import AfricoinFeatures from './AfricoinFeatures';
import ExchangeRates from './ExchangeRates';
import MobileMoneySection from './MobileMoneySection';
import RailwayIntegrationSection from './RailwayIntegrationSection';
import TrustIndicators from './TrustIndicators';
import MarketingCTA from './MarketingCTA';
import MarketingFooter from './MarketingFooter';


const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <div className="pt-16">
        <MarketingHero />
        <AfricoinFeatures />
        <ExchangeRates />
        <MobileMoneySection />
        <RailwayIntegrationSection />
        <TrustIndicators />
        <MarketingCTA />
        <MarketingFooter />
      </div>
    </div>

  );
};

export default AppLayout;
