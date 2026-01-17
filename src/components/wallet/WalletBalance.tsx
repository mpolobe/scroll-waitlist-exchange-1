import { Card } from '@/components/ui/card';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';

export function WalletBalance() {
  const { isConnected, isLoading, suiBalance, afcBalance, address } = useSmartWallet();
  const { walletAddress } = useAuth();

  const displayAddress = address || walletAddress;

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading balance...</span>
        </div>
      </Card>
    );
  }

  // Connected with wallet address
  if (isConnected || displayAddress) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium">Sui Wallet (Mainnet)</span>
          </div>
          <TrendingUp className="h-5 w-5" />
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="text-3xl font-bold">{afcBalance} AFC</div>
            <div className="text-blue-100 text-sm">Africoin Balance</div>
          </div>
          <div>
            <div className="text-xl font-semibold">{suiBalance} SUI</div>
            <div className="text-blue-100 text-sm flex items-center gap-1">
              <span>Network Gas</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        {displayAddress && (
          <div className="mt-4 pt-4 border-t border-blue-400/30">
            <p className="text-xs text-blue-100 truncate">
              {displayAddress}
            </p>
          </div>
        )}
      </Card>
    );
  }

  // Not connected
  return (
    <Card className="p-6 bg-gradient-to-br from-gray-400 to-gray-500 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          <span className="text-sm font-medium">Wallet Not Connected</span>
        </div>
      </div>
      <div className="text-2xl font-bold">Connect your wallet</div>
      <div className="text-gray-200 text-sm mt-1">Sign in to view your balance</div>
    </Card>
  );
}
