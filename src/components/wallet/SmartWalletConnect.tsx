import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignerStatus, useAuthenticate } from '@account-kit/react';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, LogIn } from 'lucide-react';
import { AuthMethodSelector } from './AuthMethodSelector';

export function SmartWalletConnect() {
  const { address, isConnected } = useSmartWallet();
  const { user: africoinUser } = useAuth();
  const { isInitializing, isAuthenticating: signerAuthenticating } = useSignerStatus();
  const { authenticate, isPending: isAuthenticating } = useAuthenticate();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const isLoading = isInitializing || signerAuthenticating || isAuthenticating;
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  const handleConnectWallet = () => {
    if (!africoinUser?.email) {
      setShowModal(false);
      navigate('/signup');
      return;
    }
    setError('');
    authenticate(
      { type: "passkey", email: africoinUser.email },
      {
        onSuccess: () => { setShowModal(false); navigate('/wallet'); },
        onError: (err) => setError(err.message || 'Failed to connect. Try again.'),
      }
    );
  };

  if (isConnected && address) {
    return (
      <Button onClick={() => navigate('/wallet')} variant="outline" className="border-orange-500/30 hover:bg-orange-50">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
        <Wallet className="w-4 h-4 mr-1 text-orange-500" />
        <span className="text-sm">{shortAddress}</span>
      </Button>
    );
  }

  if (isLoading && !showModal) {
    return (
      <Button disabled className="bg-gradient-to-r from-orange-500 to-amber-500">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (africoinUser && !isConnected) {
    return (
      <>
        <Button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
        <AuthMethodSelector
          open={showModal}
          onOpenChange={setShowModal}
          onAuthenticate={handleConnectWallet}
          isAuthenticating={isAuthenticating}
          error={error}
          title="Connect Your Wallet"
          description="Select your preferred authentication method"
        />
      </>
    );
  }

  return (
    <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
      <LogIn className="w-4 h-4 mr-2" />
      Sign In
    </Button>
  );
}
