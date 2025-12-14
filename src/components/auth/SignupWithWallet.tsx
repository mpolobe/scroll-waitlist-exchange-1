import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticate, useSignerStatus, useUser } from '@account-kit/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, UserPlus, CheckCircle, Wallet, Mail, Link2 } from 'lucide-react';
import { AuthMethodSelector, AuthMethod } from '../wallet/AuthMethodSelector';
import { OTPVerification } from './OTPVerification';
import { MagicLinkSent } from './MagicLinkSent';
import { SocialLoginButtons } from './SocialLoginButtons';

type SignupView = 'form' | 'otp' | 'magiclink' | 'wallet';

export default function SignupWithWallet() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupView, setSignupView] = useState<SignupView>('form');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [walletError, setWalletError] = useState('');
  const { signUp, signInWithOTP, signInWithMagicLink, signInWithGoogle, signInWithApple, signInWithFacebook } = useAuth();
  const navigate = useNavigate();
  
  const { authenticate, isPending: isAuthenticating } = useAuthenticate();
  const { isConnected: signerConnected } = useSignerStatus();
  const alchemyUser = useUser();

  useEffect(() => {
    if (signupView === 'wallet' && signerConnected && alchemyUser) {
      navigate('/wallet');
    }
  }, [signupView, signerConnected, alchemyUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !fullName) { setError('Please fill in all required fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    const { error: signUpError } = await signUp(email, password, fullName, referralCode);
    if (signUpError) { setError(signUpError.message); setIsLoading(false); return; }
    setIsLoading(false);
    setSignupView('wallet');
    setShowAuthModal(true);
  };

  const handleOTPSignup = async () => {
    if (!email) { setError('Please enter your email first'); return; }
    setIsLoading(true);
    const { error: otpError } = await signInWithOTP(email);
    setIsLoading(false);
    if (otpError) { setError(otpError.message); return; }
    setSignupView('otp');
  };

  const handleMagicLink = async () => {
    if (!email) { setError('Please enter your email first'); return; }
    setIsLoading(true);
    const { error: linkError } = await signInWithMagicLink(email);
    setIsLoading(false);
    if (linkError) { setError(linkError.message); return; }
    setSignupView('magiclink');
  };

  const handleAuthMethodSelect = async (method: AuthMethod) => {
    setWalletError('');
    if (['faceid', 'touchid', 'passcode'].includes(method)) {
      authenticate({ type: "passkey", email, createNew: true }, {
        onSuccess: () => { setShowAuthModal(false); navigate('/wallet'); },
        onError: (err) => setWalletError(err.message || 'Failed to create wallet.'),
      });
    } else if (method === 'otp') { setShowAuthModal(false); handleOTPSignup(); }
    else if (method === 'magiclink') { setShowAuthModal(false); handleMagicLink(); }
    else if (method === 'google') await signInWithGoogle();
    else if (method === 'apple') await signInWithApple();
    else if (method === 'facebook') await signInWithFacebook();
  };

  if (signupView === 'otp') {
    return <OTPVerification email={email} onSuccess={() => { setSignupView('wallet'); setShowAuthModal(true); }} onBack={() => setSignupView('form')} />;
  }

  if (signupView === 'magiclink') {
    return <MagicLinkSent email={email} onBack={() => setSignupView('form')} />;
  }

  if (signupView === 'wallet') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h3>
        <p className="text-gray-600 mb-4">Now let's set up your Smart Wallet</p>
        <Button onClick={() => setShowAuthModal(true)} className="w-full bg-gradient-to-r from-orange-500 to-amber-500">
          <Wallet className="w-4 h-4 mr-2" />Create Wallet
        </Button>
        <button onClick={() => navigate('/wallet')} className="mt-3 text-sm text-orange-600 hover:underline font-medium">Skip to connect</button>

        <AuthMethodSelector open={showAuthModal} onOpenChange={setShowAuthModal} onSelectMethod={handleAuthMethodSelect}
          isAuthenticating={isAuthenticating} error={walletError} title="Create Your Wallet" description="Choose your authentication method" showPasskeyOnly />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
        <UserPlus className="w-5 h-5 text-green-600" />
        <span className="text-sm text-green-800">Create your Africoin account</span>
      </div>
      <div>
        <Label htmlFor="signup-name">Full Name *</Label>
        <Input id="signup-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="signup-email">Email *</Label>
        <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="signup-password">Password *</Label>
        <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (min 6 chars)" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="signup-referral">Referral Code (optional)</Label>
        <Input id="signup-referral" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="Enter referral code" className="mt-1" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-emerald-600">
        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Account...</> : 'Create Account'}
      </Button>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={handleOTPSignup} disabled={isLoading} className="flex-1 text-sm">
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
