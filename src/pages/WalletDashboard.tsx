import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartWallet } from "@/contexts/SmartWalletContext";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Send, ArrowDownLeft, History, Coins, Copy, CheckCircle, ExternalLink, RefreshCw, Loader2 } from "lucide-react";

const WalletDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { address, isConnected, isLoading, suiBalance, afcBalance, refreshBalance } = useSmartWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
        <MarketingNav />
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <Wallet className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Wallet Dashboard</h1>
          <p className="text-gray-600 mb-6">Sign in to access your wallet</p>
          <Button 
            onClick={() => navigate('/signup')}
            className="bg-gradient-to-r from-orange-500 to-amber-500"
          >
            Sign In / Sign Up
          </Button>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <MarketingNav />
      <div className="max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Wallet className="w-8 h-8 text-orange-500" />
          Wallet Dashboard
        </h1>

        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-80">AFC Balance</p>
                <p className="text-4xl font-bold mt-1">{afcBalance} AFC</p>
                <p className="text-sm opacity-80 mt-2">SUI: {suiBalance}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshBalance}
                disabled={isLoading}
                className="text-white hover:bg-white/20"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
            {address && (
              <div className="mt-4 flex items-center gap-2">
                <p className="text-xs opacity-70 font-mono">
                  {address.slice(0, 10)}...{address.slice(-8)}
                </p>
                <button onClick={copyAddress} className="opacity-70 hover:opacity-100">
                  {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
                <a 
                  href={`https://suiscan.xyz/mainnet/account/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Get AFC Banner */}
        {parseFloat(afcBalance) === 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-blue-800 text-sm">
                <strong>Get AFC tokens</strong> to start using the Africoin ecosystem.{' '}
                <a 
                  href="https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Buy AFC on MovePump →
                </a>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Send className="w-5 h-5" />
            <span>Send</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <ArrowDownLeft className="w-5 h-5" />
            <span>Receive</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/staking')}>
            <Coins className="w-5 h-5" />
            <span>Stake</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <History className="w-5 h-5" />
            <span>History</span>
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          </CardContent>
        </Card>
      </div>
      <MarketingFooter />
    </div>
  );
};

export default WalletDashboard;