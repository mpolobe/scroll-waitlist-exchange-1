import React from 'react';
import MarketingNav from './MarketingNav';
import MarketingHero from './MarketingHero';
import IDOProgressBanner, { TrustBadges } from './IDOProgressBanner';
import TokenomicsPreview from './TokenomicsPreview';
import AfricoinFeatures from './AfricoinFeatures';
import RailwayIntegrationSection from './RailwayIntegrationSection';
import RoadmapTimeline from './RoadmapTimeline';
import TrustIndicators from './TrustIndicators';
import FAQSection from './FAQSection';
import MarketingCTA from './MarketingCTA';
import MarketingFooter from './MarketingFooter';


const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <MarketingNav />
      <div className="pt-16">
        <IDOProgressBanner />
        <MarketingHero />
        <TrustBadges />
        <TokenomicsPreview />
        <AfricoinFeatures />
        <RailwayIntegrationSection />
        <RoadmapTimeline />
        <TrustIndicators />
        <FAQSection />
        <MarketingCTA />
        <MarketingFooter />
      </div>
    </div>
  );
};

export default AppLayout;
