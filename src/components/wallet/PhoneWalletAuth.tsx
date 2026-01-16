import { useNavigate } from 'react-router-dom';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, LogIn, CheckCircle } from 'lucide-react';

interface PhoneWalletAuthProps {
  onSuccess?: () => void;
  compact?: boolean;
  showAlchemy?: boolean;
}

export function PhoneWalletAuth({ onSuccess, compact = false }: PhoneWalletAuthProps) {
  const navigate = useNavigate();
  const { isConnected, address, connect } = useSmartWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  if (isConnected && address) {
    if (compact) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-400">
              {truncateAddress(address)}
            </span>
          </div>
        </div>
      );
    }

    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-500" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-sm text-orange-400 mb-2">Your Address</p>
            <code className="text-sm text-white bg-slate-900/50 px-2 py-1 rounded block overflow-hidden text-ellipsis">
              {address}
            </code>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-orange-500" />
          Connect Wallet
        </CardTitle>
        <CardDescription className="text-gray-400">
          Sign in to connect your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => navigate('/signup')}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In to Connect
        </Button>
        <p className="text-xs text-gray-500 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
}

export default PhoneWalletAuth;
