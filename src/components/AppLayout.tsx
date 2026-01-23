import React from 'react';
import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900">
      <MarketingNav />
      <div className="pt-16">
        {children}
      </div>
      <MarketingFooter />
    </div>
  );
};

export default AppLayout;
