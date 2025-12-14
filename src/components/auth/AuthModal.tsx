import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticate } from '@account-kit/react';
import { useToast } from '@/hooks/use-toast';
import { Coins, Loader2, Wallet, Mail, Link2 } from 'lucide-react';
import { AuthMethodSelector, AuthMethod } from '@/components/wallet/AuthMethodSelector';
import { SocialLoginButtons } from './SocialLoginButtons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'otp' | 'magiclink'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [showAuthSelector, setShowAuthSelector] = useState(false);
  const [walletError, setWalletError] = useState('');
  const { signIn, signUp, resetPassword, signInWithOTP, verifyOTP, signInWithMagicLink, signInWithGoogle, signInWithApple, signInWithFacebook } = useAuth();
  const { authenticate, isPending: isAuthenticating } = useAuthenticate();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuthMethodSelect = async (method: AuthMethod) => {
    setWalletError('');
    if (['faceid', 'touchid', 'passcode'].includes(method)) {
      authenticate({ type: "passkey", email }, {
        onSuccess: () => { setShowAuthSelector(false); onClose(); navigate('/wallet'); },
        onError: (err) => setWalletError(err.message || 'Failed to connect.'),
      });
    } else if (method === 'google') await signInWithGoogle();
    else if (method === 'apple') await signInWithApple();
    else if (method === 'facebook') await signInWithFacebook();
  };

  const handleOTPRequest = async () => {
    if (!email) { toast({ title: 'Error', description: 'Please enter your email', variant: 'destructive' }); return; }
    setLoading(true);
    const { error } = await signInWithOTP(email);
    setLoading(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setMode('otp');
    toast({ title: 'Code sent!', description: 'Check your email for the verification code' });
  };

  const handleOTPVerify = async () => {
    setLoading(true);
    const { error } = await verifyOTP(email, otp);
    setLoading(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Success!', description: 'Now connect your wallet' });
    setShowWalletConnect(true);
  };

  const handleMagicLink = async () => {
    if (!email) { toast({ title: 'Error', description: 'Please enter your email', variant: 'destructive' }); return; }
    setLoading(true);
    const { error } = await signInWithMagicLink(email);
    setLoading(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setMode('magiclink');
    toast({ title: 'Link sent!', description: 'Check your email for the magic link' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: 'Welcome back!' }); setLoading(false); setShowWalletConnect(true);
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName, '');
        if (error) throw error;
        toast({ title: 'Account created!' }); setLoading(false); setShowWalletConnect(true);
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast({ title: 'Email sent!' }); setMode('login'); setLoading(false);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' }); setLoading(false);
    }
  };

  if (showWalletConnect) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-6">
            <Wallet className="w-16 h-16 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 text-center mb-4">Choose your authentication method</p>
            <Button onClick={() => setShowAuthSelector(true)} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 mb-3">
              <Wallet className="w-4 h-4 mr-2" />Connect Wallet
            </Button>
            <button onClick={() => { onClose(); navigate('/wallet'); }} className="text-sm text-orange-600 hover:underline font-medium">Skip to connect</button>

          </div>
          <AuthMethodSelector open={showAuthSelector} onOpenChange={setShowAuthSelector} onSelectMethod={handleAuthMethodSelect} isAuthenticating={isAuthenticating} error={walletError} showPasskeyOnly />
        </DialogContent>
      </Dialog>
    );
  }

  if (mode === 'otp') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Enter Verification Code</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">We sent a code to {email}</p>
            <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit code" className="text-center text-2xl tracking-widest" maxLength={6} />
            <Button onClick={handleOTPVerify} disabled={loading || otp.length < 6} className="w-full bg-gradient-to-r from-orange-500 to-amber-500">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
            </Button>
            <button onClick={() => setMode('login')} className="w-full text-sm text-gray-500 hover:underline">Back to login</button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (mode === 'magiclink') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <Mail className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Check your email</h3>
            <p className="text-gray-600 mb-4">We sent a magic link to {email}</p>
            <button onClick={() => setMode('login')} className="text-sm text-orange-600 hover:underline">Back to login</button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg"><Coins className="w-5 h-5 text-white" /></div>
            <DialogTitle className="text-xl">{mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {mode === 'signup' && (<div><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" required /></div>)}
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
          {mode !== 'reset' && (<div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required /></div>)}
          <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </Button>
          {mode !== 'reset' && (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleOTPRequest} disabled={loading} className="flex-1 text-sm"><Mail className="w-4 h-4 mr-1" />OTP</Button>
              <Button type="button" variant="outline" onClick={handleMagicLink} disabled={loading} className="flex-1 text-sm"><Link2 className="w-4 h-4 mr-1" />Magic Link</Button>
            </div>
          )}
          {mode !== 'reset' && <SocialLoginButtons onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })} />}
          <div className="text-center text-sm space-y-2 pt-2">
            {mode === 'login' && (<><button type="button" onClick={() => setMode('reset')} className="text-orange-600 hover:underline">Forgot password?</button><div className="text-gray-600">Don't have an account? <button type="button" onClick={() => setMode('signup')} className="text-orange-600 hover:underline font-medium">Sign up</button></div></>)}
            {mode !== 'login' && <button type="button" onClick={() => setMode('login')} className="text-orange-600 hover:underline">Back to sign in</button>}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
