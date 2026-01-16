import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, UserPlus, CheckCircle, Wallet, Mail, Link2 } from 'lucide-react';
import { OTPVerification } from './OTPVerification';
import { MagicLinkSent } from './MagicLinkSent';
import { SocialLoginButtons } from './SocialLoginButtons';

type SignupView = 'form' | 'otp' | 'magiclink' | 'wallet';

export default function SignupWithWallet() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupView, setSignupView] = useState<SignupView>('form');
  const { signUp, signInWithOTP, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !fullName) { setError('Please fill in all required fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    const { error: signUpError } = await signUp(email, password, fullName, referralCode, phone);
    
    if (signUpError) { setError(signUpError.message); setIsLoading(false); return; }
    setIsLoading(false);
    setSignupView('wallet');
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

  if (signupView === 'otp') {
    return <OTPVerification email={email} onSuccess={() => { setSignupView('wallet'); }} onBack={() => setSignupView('form')} />;
  }

  if (signupView === 'magiclink') {
    return <MagicLinkSent email={email} onBack={() => setSignupView('form')} />;
  }

  if (signupView === 'wallet') {
    return (
      <div className="text-center py-8">
        <Mail className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email!</h3>
        <p className="text-gray-600 mb-2">We've sent a confirmation link to:</p>
        <p className="font-semibold text-gray-900 mb-4">{email}</p>
        <p className="text-sm text-gray-500 mb-6">Click the link in the email to verify your account and get started.</p>
        <Button onClick={() => navigate('/signup?tab=login')} variant="outline" className="w-full">
          Back to Sign In
        </Button>
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
        <Label htmlFor="signup-phone">Phone Number (optional)</Label>
        <Input id="signup-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" className="mt-1" />
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
