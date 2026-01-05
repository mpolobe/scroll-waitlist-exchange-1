import { Card } from '@/components/ui/card';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';

export function WalletBalance() {
  const { balance, isConnected, isLoadingBalances, tokens } = useSmartWallet();
  const { walletAddress, user } = useAuth();

  // Case 1: Regular User (Sui Wallet)
  if (!isConnected && walletAddress) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium">Sui Wallet (Mainnet)</span>
          </div>
          <TrendingUp className="h-5 w-5" />
        </div>
        
        <div className="space-y-1">
          <div className="text-4xl font-bold">0.00 AFRC</div>
          <div className="text-blue-100 flex items-center gap-1">
            <span>$0.00 USD</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-400/30">
          <p className="text-xs text-blue-100 truncate">
            {walletAddress}
          </p>
        </div>
      </Card>
    );
  }

  // Case 2: Not Connected (and no Sui wallet)
  if (!isConnected && !walletAddress) {
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

  if (isLoadingBalances && tokens.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading balance...</span>
        </div>
      </Card>
    );
  }

  // Get ETH balance for display
  const ethToken = tokens.find(t => t.symbol === 'ETH');
  const ethBalance = ethToken?.balance || '0';

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          <span className="text-sm font-medium">Total Balance</span>
        </div>
        <TrendingUp className="h-5 w-5" />
      </div>
      
      <div className="space-y-1">
        <div className="text-4xl font-bold">{ethBalance} ETH</div>
        <div className="text-orange-100 flex items-center gap-1">
          <span>${balance} USD (estimated)</span>
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-orange-400/30">
        <p className="text-xs text-orange-100">
          Sepolia Testnet • {tokens.length} token{tokens.length !== 1 ? 's' : ''} detected
        </p>
      </div>
    </Card>
  );
}
