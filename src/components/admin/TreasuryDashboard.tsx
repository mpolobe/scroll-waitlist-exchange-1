import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { Building2, TrendingUp, Wallet, ArrowUpRight, Lock } from 'lucide-react';

export function TreasuryDashboard() {
  const { balance, address, tokens, isConnected } = useSmartWallet();

  // Mock data for "Bonded" assets (RWA)
  const bondedAssets = [
    { id: 'BOND-2026-A', name: 'Lobito Expansion Bond A', value: '5,000,000', yield: '8.5%' },
    { id: 'BOND-2026-B', name: 'Rolling Stock Lease B', value: '2,500,000', yield: '7.2%' },
  ];

  const totalBondValue = 7500000;

  if (!isConnected) {
    return (
      <Card className="bg-slate-900 text-white border-slate-800">
        <CardContent className="pt-6 text-center">
          <Lock className="h-12 w-12 mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold">Treasury Access Restricted</h3>
          <p className="text-slate-400">Connect Admin Wallet to view Treasury status.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liquid Treasury (Polygon) */}
        <Card className="bg-gradient-to-br from-purple-900 to-slate-900 text-white border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Liquid Treasury (Polygon)</CardTitle>
            <Wallet className="h-4 w-4 text-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance}</div>
            <p className="text-xs text-purple-300 mt-1">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <div className="mt-4 space-y-2">
              {tokens.slice(0, 3).map((token, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{token.symbol}</span>
                  <span>{token.balance}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tokenized Infrastructure (RWA) */}
        <Card className="bg-gradient-to-br from-blue-900 to-slate-900 text-white border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Tokenized Infrastructure</CardTitle>
            <Building2 className="h-4 w-4 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBondValue.toLocaleString()}</div>
            <p className="text-xs text-blue-300 mt-1">Active Railway Bonds</p>
            <div className="mt-4 space-y-2">
              {bondedAssets.map((bond) => (
                <div key={bond.id} className="flex justify-between text-sm border-b border-blue-800/50 pb-1">
                  <span className="truncate max-w-[120px]">{bond.name}</span>
                  <span className="text-green-400">{bond.yield} APY</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Bridge (Sui -> Polygon) */}
        <Card className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white border-emerald-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-200">Revenue Bridge (24h)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450 AFRC</div>
            <p className="text-xs text-emerald-300 mt-1">Bridged from Sui Utility Layer</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Freight Yield</span>
                <span>8,200 AFRC</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Passenger Yield</span>
                <span>4,250 AFRC</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
