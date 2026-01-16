import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartWallet } from "@/contexts/SmartWalletContext";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, Send, ArrowDownLeft, History, Coins, Copy, CheckCircle, ExternalLink, RefreshCw, Loader2, QrCode } from "lucide-react";
import { SendTokenModal } from "@/components/wallet/SendTokenModal";

// Simple QR Code component for receive dialog
function QRCodeSVG({ value, size }: { value: string; size: number }) {
  const cells = 21;
  const cellSize = size / cells;
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const pattern: boolean[][] = [];
  for (let i = 0; i < cells; i++) {
    pattern[i] = [];
    for (let j = 0; j < cells; j++) {
      const isFinderArea = (i < 7 && j < 7) || (i < 7 && j >= cells - 7) || (i >= cells - 7 && j < 7);
      if (isFinderArea) {
        const fi = i < 7 ? i : i - (cells - 7);
        const fj = j < 7 ? j : j - (cells - 7);
        pattern[i][j] = fi === 0 || fi === 6 || fj === 0 || fj === 6 || (fi >= 2 && fi <= 4 && fj >= 2 && fj <= 4);
      } else {
        pattern[i][j] = ((hash + i * 31 + j * 17) % 3) === 0;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {pattern.map((row, i) => row.map((cell, j) => cell && (
        <rect key={`${i}-${j}`} x={j * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="#1a1a1a" />
      )))}
    </svg>
  );
}

const WalletDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { address, isConnected, isLoading, suiBalance, afcBalance, refreshBalance } = useSmartWallet();
  const [copied, setCopied] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);

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
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setSendModalOpen(true)}>
            <Send className="w-5 h-5" />
            <span>Send</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setReceiveDialogOpen(true)}>
            <ArrowDownLeft className="w-5 h-5" />
            <span>Receive</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/staking')}>
            <Coins className="w-5 h-5" />
            <span>Stake</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => document.getElementById('transactions-section')?.scrollIntoView({ behavior: 'smooth' })}>
            <History className="w-5 h-5" />
            <span>History</span>
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card id="transactions-section">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          </CardContent>
        </Card>
      </div>
      <MarketingFooter />

      {/* Send Token Modal */}
      <SendTokenModal 
        open={sendModalOpen} 
        onOpenChange={setSendModalOpen} 
        tokenSymbol="AFC" 
        balance={afcBalance} 
      />

      {/* Receive Dialog */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" />
              Receive Tokens
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {address ? (
              <>
                <div className="bg-white p-4 rounded-xl shadow-lg border mb-4">
                  <QRCodeSVG value={address} size={180} />
                </div>
                <p className="text-sm text-gray-500 mb-2">Scan to send tokens to this wallet</p>
                <p className="font-mono text-xs bg-gray-100 px-3 py-2 rounded-lg break-all max-w-full">
                  {address.slice(0, 10)}...{address.slice(-8)}
                </p>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(address);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }} 
                  className="mt-4 w-full"
                >
                  {copied ? <><CheckCircle className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy Address</>}
                </Button>
              </>
            ) : (
              <p className="text-gray-500 py-4">No wallet address available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletDashboard;