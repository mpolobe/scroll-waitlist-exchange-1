import { UserDashboard as Dashboard } from '@/components/user/UserDashboard';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />
      <div className="pt-20">
        <Dashboard />
      </div>
      <MarketingFooter />
    </div>
  );
}
