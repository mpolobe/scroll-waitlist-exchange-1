import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import RailwayApiManagement from '@/components/merchant/RailwayApiManagement';

export default function RailwayApi() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-grow bg-gradient-to-br from-blue-50 to-purple-50 pt-16">
        <RailwayApiManagement />
      </main>
      <MarketingFooter />
    </div>
  );
}
