import { useNavigate } from 'react-router-dom';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, LogIn, CheckCircle } from 'lucide-react';

interface WalletConnectionFlowProps {
  onSuccess?: () => void;
}

export function WalletConnectionFlow({ onSuccess }: WalletConnectionFlowProps) {
  const navigate = useNavigate();
  const { isConnected, address } = useSmartWallet();

  if (isConnected && address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Your wallet is connected: {address.slice(0, 8)}...{address.slice(-6)}
          </p>
          <Button onClick={() => navigate('/wallet')} className="w-full">
            Go to Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-orange-500" />
          Connect Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Sign in to connect your wallet
        </p>
        <Button onClick={() => navigate('/signup')} className="w-full">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </CardContent>
    </Card>
  );
}

export default WalletConnectionFlow;
