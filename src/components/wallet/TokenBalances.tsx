import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { RefreshCw, Coins, Loader2 } from 'lucide-react';

const tokenIcons: Record<string, React.ReactNode> = {
  AFC: <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs">AFC</div>,
  ETH: <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">ETH</div>,
  USDC: <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">$</div>,
};

export function TokenBalances() {
  const { tokens, isConnected, isLoadingBalances, refreshBalances } = useSmartWallet();

  const handleRefresh = async () => {
    await refreshBalances();
  };

  if (!isConnected) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Coins className="w-5 h-5 text-orange-500" />
          Token Balances
        </h3>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoadingBalances}>
          <RefreshCw className={`w-4 h-4 ${isLoadingBalances ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoadingBalances && tokens.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-500">Loading balances...</span>
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tokens found</p>
          <p className="text-sm mt-1">Your token balances will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token, index) => (
            <div key={`${token.symbol}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                {tokenIcons[token.symbol] || (
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {token.symbol.slice(0, 3)}
                  </div>
                )}
                <div>
                  <p className="font-medium">{token.name}</p>
                  <p className="text-sm text-gray-500">{token.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{token.balance}</p>
                <p className="text-sm text-gray-500">${token.usdValue}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500 text-center">
          {isLoadingBalances ? 'Fetching latest balances from Sepolia...' : 'Connected to Sepolia testnet. Click refresh for latest data.'}
        </p>
      </div>
    </Card>
  );
}
