import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, LogIn, CheckCircle } from 'lucide-react';

export default function WalletAuth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, address } = useSmartWallet();

  if (user && isConnected && address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
        <MarketingNav />
        <div className="max-w-md mx-auto px-4 py-24">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Wallet Connected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your wallet is ready to use.
              </p>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded mb-4 break-all">
                {address}
              </p>
              <Button onClick={() => navigate('/wallet')} className="w-full">
                Go to Wallet Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <MarketingNav />
      <div className="max-w-md mx-auto px-4 py-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-orange-500" />
              Connect Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Sign in to access your Africoin wallet
            </p>
            <Button 
              onClick={() => navigate('/signup')} 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In / Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
      <MarketingFooter />
    </div>
  );
}
