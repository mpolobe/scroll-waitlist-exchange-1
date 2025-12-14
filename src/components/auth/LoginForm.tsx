import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticate, useSignerStatus, useUser } from '@account-kit/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, LogIn, CheckCircle, Wallet, Mail, Link2 } from 'lucide-react';
import { AuthMethodSelector, AuthMethod } from '../wallet/AuthMethodSelector';
import { OTPVerification } from './OTPVerification';
import { MagicLinkSent } from './MagicLinkSent';
import { SocialLoginButtons } from './SocialLoginButtons';

type AuthView = 'form' | 'otp' | 'magiclink' | 'wallet';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('form');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [walletError, setWalletError] = useState('');
  const { signIn, signInWithOTP, signInWithMagicLink, signInWithGoogle, signInWithApple, signInWithFacebook } = useAuth();
  const navigate = useNavigate();
  
  const { authenticate, isPending: isAuthenticating } = useAuthenticate();
  const { isConnected: signerConnected } = useSignerStatus();
  const alchemyUser = useUser();

  useEffect(() => {
    if (authView === 'wallet' && signerConnected && alchemyUser) {
      navigate('/wallet');
    }
  }, [authView, signerConnected, alchemyUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) { setError(signInError.message); setIsLoading(false); return; }
    setIsLoading(false);
    setAuthView('wallet');
    setShowAuthModal(true);
  };

  const handleOTPLogin = async () => {
    if (!email) { setError('Please enter your email first'); return; }
    setIsLoading(true);
    const { error: otpError } = await signInWithOTP(email);
    setIsLoading(false);
    if (otpError) { setError(otpError.message); return; }
    setAuthView('otp');
  };

  const handleMagicLink = async () => {
    if (!email) { setError('Please enter your email first'); return; }
    setIsLoading(true);
    const { error: linkError } = await signInWithMagicLink(email);
    setIsLoading(false);
    if (linkError) { setError(linkError.message); return; }
    setAuthView('magiclink');
  };

  const handleAuthMethodSelect = async (method: AuthMethod) => {
    setWalletError('');
    if (['faceid', 'touchid', 'passcode'].includes(method)) {
      authenticate({ type: "passkey", email }, {
        onSuccess: () => { setShowAuthModal(false); navigate('/wallet'); },
        onError: (err) => setWalletError(err.message || 'Failed to connect wallet.'),
      });
    } else if (method === 'otp') { setShowAuthModal(false); handleOTPLogin(); }
    else if (method === 'magiclink') { setShowAuthModal(false); handleMagicLink(); }
    else if (method === 'google') await signInWithGoogle();
    else if (method === 'apple') await signInWithApple();
    else if (method === 'facebook') await signInWithFacebook();
  };

  if (authView === 'otp') {
    return <OTPVerification email={email} onSuccess={() => { setAuthView('wallet'); setShowAuthModal(true); }} onBack={() => setAuthView('form')} />;
  }

  if (authView === 'magiclink') {
    return <MagicLinkSent email={email} onBack={() => setAuthView('form')} />;
  }

  if (authView === 'wallet') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome Back!</h3>
        <p className="text-gray-600 mb-4">Connect your Smart Wallet to continue</p>
        <Button onClick={() => setShowAuthModal(true)} className="w-full bg-gradient-to-r from-orange-500 to-amber-500">
          <Wallet className="w-4 h-4 mr-2" />Connect Wallet
        </Button>
        <button onClick={() => navigate('/wallet')} className="mt-3 text-sm text-orange-600 hover:underline font-medium">Skip to connect</button>

        <AuthMethodSelector open={showAuthModal} onOpenChange={setShowAuthModal} onSelectMethod={handleAuthMethodSelect}
          isAuthenticating={isAuthenticating} error={walletError} title="Connect Wallet" description="Choose your authentication method" showPasskeyOnly />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
        <LogIn className="w-5 h-5 text-purple-600" />
        <span className="text-sm text-purple-800">Sign in to access your account</span>
      </div>
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="mt-1" />
      </div>
      <div className="text-right">
        <button type="button" onClick={() => navigate('/reset-password')} className="text-sm text-orange-600 hover:underline">Forgot password?</button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-orange-600">
        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
      </Button>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={handleOTPLogin} disabled={isLoading} className="flex-1 text-sm">
          <Mail className="w-4 h-4 mr-1" />OTP
        </Button>
        <Button type="button" variant="outline" onClick={handleMagicLink} disabled={isLoading} className="flex-1 text-sm">
          <Link2 className="w-4 h-4 mr-1" />Magic Link
        </Button>
      </div>
      <SocialLoginButtons onError={setError} />
    </form>
  );
}
