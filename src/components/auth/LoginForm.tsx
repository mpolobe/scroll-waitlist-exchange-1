import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, LogIn, Mail, Link2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { OTPVerification } from './OTPVerification';
import { MagicLinkSent } from './MagicLinkSent';
import { SocialLoginButtons } from './SocialLoginButtons';

type LoginView = 'form' | 'otp' | 'magiclink';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginView, setLoginView] = useState<LoginView>('form');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const { signIn, signInWithOTP, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowResendVerification(false);
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true);
    const { error: signInError } = await signIn(email, password);
    setIsLoading(false);
    if (signInError) { 
      setError(signInError.message);
      // Check if error is about email not being verified
      if (signInError.message.toLowerCase().includes('email not confirmed') || 
          signInError.message.toLowerCase().includes('not verified') ||
          signInError.message.toLowerCase().includes('confirm your email')) {
        setShowResendVerification(true);
      }
      return; 
    }
    navigate('/wallet');
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setResendingVerification(true);
    try {
      // Use Supabase's resend confirmation email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });
      if (error) throw error;
      setError('');
      setShowResendVerification(false);
      alert('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleOTPLogin = async () => {
    if (!email) { setError('Please enter your email first'); return; }
    setIsLoading(true);
    const { error: otpError } = await signInWithOTP(email);
    setIsLoading(false);
    if (otpError) { setError(otpError.message); return; }
    setLoginView('otp');
  };

  const handleMagicLink = async () => {
    if (!email) { setError('Please enter your email first'); return; }
    setIsLoading(true);
    const { error: linkError } = await signInWithMagicLink(email);
    setIsLoading(false);
    if (linkError) { setError(linkError.message); return; }
    setLoginView('magiclink');
  };

  if (loginView === 'otp') {
    return <OTPVerification email={email} onSuccess={() => navigate('/wallet')} onBack={() => setLoginView('form')} />;
  }

  if (loginView === 'magiclink') {
    return <MagicLinkSent email={email} onBack={() => setLoginView('form')} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
        <LogIn className="w-5 h-5 text-purple-600" />
        <span className="text-sm text-purple-800">Sign in to your account</span>
      </div>
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="login-password">Password</Label>
        <div className="relative mt-1">
          <Input 
            id="login-password" 
            type={showPassword ? "text" : "password"} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password" 
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {error && (
        <div className="space-y-2">
          <p className="text-red-500 text-sm">{error}</p>
          {showResendVerification && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              {resendingVerification ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" />Resend Verification Email</>
              )}
            </Button>
          )}
        </div>
      )}
      <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600">
        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing In...</> : 'Sign In'}
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
      <div className="text-center">
        <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-purple-600 hover:underline">
          Forgot password?
        </button>
      </div>
    </form>
  );
}
