import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function SuiWalletCard() {
  const { user, walletAddress } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Use actual wallet address from auth context
  const displayAddress = walletAddress || 'No wallet connected';

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Africa Railways Wallet</h3>
            <p className={`text-sm font-medium ${walletAddress ? 'text-blue-600' : 'text-gray-400'}`}>
              Sui Network • {walletAddress ? 'Connected' : 'Not Connected'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
          <ExternalLink className="w-4 h-4 mr-2" />
          View Explorer
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sui Address</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 p-3 bg-white rounded-lg border border-blue-100 text-sm font-mono text-gray-600 break-all">
              {displayAddress}
            </code>
            {walletAddress && (
              <Button variant="ghost" size="icon" onClick={copyAddress} className="shrink-0">
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">AFRC Balance</p>
            <p className="text-2xl font-bold text-gray-900">1,250.00</p>
            <p className="text-xs text-green-600 mt-1">≈ $1,250.00 USD</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">SUI Balance</p>
            <p className="text-2xl font-bold text-gray-900">15.50</p>
            <p className="text-xs text-green-600 mt-1">≈ $24.80 USD</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-100/50 p-3 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          Linked to your Africa Railways account ({user?.email})
        </div>
      </div>
    </Card>
  );
}
