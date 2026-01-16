import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Wallet, LogIn } from 'lucide-react';

export function SmartWalletConnect() {
  const { address, isConnected } = useSmartWallet();
  const { user: africoinUser } = useAuth();
  const navigate = useNavigate();

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  if (isConnected && address) {
    return (
      <Button onClick={() => navigate('/wallet')} variant="outline" className="border-orange-500/30 hover:bg-orange-50">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
        <Wallet className="w-4 h-4 mr-1 text-orange-500" />
        <span className="text-sm">{shortAddress}</span>
      </Button>
    );
  }

  if (africoinUser && !isConnected) {
    return (
      <Button onClick={() => navigate('/wallet')} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
      <LogIn className="w-4 h-4 mr-2" />
      Sign In
    </Button>
  );
}
