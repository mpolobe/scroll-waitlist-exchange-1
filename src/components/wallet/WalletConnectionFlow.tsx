import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticate, useSignerStatus, useUser } from '@account-kit/react';
import { AuthMethodSelector, type AuthMethod } from './AuthMethodSelector';
import { Wallet, Shield, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface WalletConnectionFlowProps {
  onComplete?: () => void;
}

export function WalletConnectionFlow({ onComplete }: WalletConnectionFlowProps) {
  const [step, setStep] = useState<'intro' | 'auth' | 'success' | 'error'>('intro');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { user } = useAuth();
  const { authenticate, isPending } = useAuthenticate();
  const { isConnected } = useSignerStatus();
  const alchemyUser = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && alchemyUser) {
      setStep('success');
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          navigate('/wallet');
        }
      }, 2000);
    }
  }, [isConnected, alchemyUser, navigate, onComplete]);

  const handleStartConnection = () => {
    setShowAuthModal(true);
  };

  const handleAuthMethodSelect = async (method: AuthMethod) => {
    setError('');
    setIsAuthenticating(true);

    try {
      if (['faceid', 'touchid', 'passcode'].includes(method)) {
        // Use passkey authentication
        authenticate(
          {
            type: "passkey",
            email: user?.email || user?.phone || '',
            createNew: !isConnected
          },
          {
            onSuccess: () => {
              setShowAuthModal(false);
              setStep('success');
            },
            onError: (err) => {
              setError(err.message || 'Failed to authenticate wallet');
              setStep('error');
            }
          }
        );
      } else if (method === 'otp') {
        // Use email OTP
        authenticate(
          {
            type: "email",
            email: user?.email || ''
          },
          {
            onSuccess: () => {
              setShowAuthModal(false);
              setStep('success');
            },
            onError: (err) => {
              setError(err.message || 'Failed to authenticate wallet');
              setStep('error');
            }
          }
        );
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setStep('error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (step === 'success') {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Connected!</h2>
        <p className="text-gray-600 mb-4">
          Your smart wallet is now ready to use
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Redirecting to dashboard...
        </div>
      </Card>
    );
  }

  if (step === 'error') {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Failed</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => {
              setStep('intro');
              setError('');
            }}
            variant="outline"
          >
            Try Again
          </Button>
          <Button
            onClick={() => navigate('/wallet')}
            className="bg-gradient-to-r from-orange-500 to-amber-500"
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Smart Wallet
        </h2>
        <p className="text-gray-600">
          Secure your wallet with biometric authentication or passkey
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Enhanced Security</h3>
            <p className="text-xs text-gray-600 mt-1">
              Your wallet is protected by device-level security (Face ID, Touch ID, or passkey)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Self-Custodial</h3>
            <p className="text-xs text-gray-600 mt-1">
              You control your private keys. We never have access to your funds
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
          <Wallet className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Gas-Free Transactions</h3>
            <p className="text-xs text-gray-600 mt-1">
              We sponsor your gas fees so you can transact without paying network costs
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleStartConnection}
        disabled={isPending || isAuthenticating}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
      >
        {isPending || isAuthenticating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500 mt-4">
        By connecting, you agree to our Terms of Service and Privacy Policy
      </p>

      <AuthMethodSelector
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSelectMethod={handleAuthMethodSelect}
        isAuthenticating={isAuthenticating || isPending}
        error={error}
        title="Choose Authentication Method"
        description="Select how you'd like to secure your wallet"
        showPasskeyOnly
      />
    </Card>
  );
}
