import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, useSignerStatus, useAccount, useAuthModal } from '@account-kit/react';
import { Wallet, ArrowLeft, Shield, Zap, Globe, Loader2, Coins, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const WalletAuth = () => {
  const navigate = useNavigate();
  const alchemyUser = useUser();
  const { isInitializing, isAuthenticating: signerAuthenticating } = useSignerStatus();
  const { account } = useAccount({ type: "ModularAccountV2" });
  const { user: africoinUser, loading: authLoading, walletAddress, refreshUserRecord } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [walletError, setWalletError] = useState('');

  useEffect(() => {
    const saveWallet = async () => {
      if (account?.address && africoinUser && !walletAddress) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.functions.invoke('save-wallet-address', {
              body: { walletAddress: account.address },
              headers: { Authorization: `Bearer ${session.access_token}` }
            });
            await refreshUserRecord();
          }
        } catch (err) { console.error('Failed to save wallet:', err); }
      }
    };
    saveWallet();
  }, [account?.address, africoinUser, walletAddress, refreshUserRecord]);

  useEffect(() => {
    if (alchemyUser && account?.address && !isInitializing && !signerAuthenticating) navigate('/wallet');
  }, [alchemyUser, account, isInitializing, signerAuthenticating, navigate]);

  const handleConnectWallet = () => {
    setWalletError('');
    openAuthModal();
  };

  const features = [
    { icon: Shield, title: 'Secure & Self-Custodial', desc: 'You control your keys' },
    { icon: Zap, title: 'Gas-Free Transactions', desc: 'We cover the gas fees' },
    { icon: Globe, title: 'Cross-Border Payments', desc: 'Send anywhere in Africa' },
  ];

  if (isInitializing || authLoading) {
    return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50"><div className="text-center"><Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" /><p className="text-gray-600">Initializing...</p></div></div>);
  }

  if (walletAddress && africoinUser) {
    return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50"><div className="text-center bg-white p-8 rounded-2xl shadow-xl"><CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /><h2 className="text-2xl font-bold mb-2">Wallet Connected</h2><p className="text-gray-600 mb-4">Your wallet is ready</p><p className="text-sm text-gray-500 font-mono mb-6">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</p><Link to="/wallet" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold">Go to Dashboard</Link></div></div>);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-orange-500 mb-8"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Link>
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <div className="space-y-8">
            <div className="flex items-center gap-3"><div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl"><Wallet className="w-8 h-8 text-white" /></div><h1 className="text-3xl font-bold text-gray-900">Africoin Wallet</h1></div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">Connect Your <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Smart Wallet</span></h2>
            <p className="text-xl text-gray-600">Choose Face ID, Touch ID, Passcode, OTP, Magic Link, or Social Login.</p>
            <div className="space-y-4">{features.map((f, i) => (<div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border"><div className="p-2 bg-orange-100 rounded-lg"><f.icon className="w-5 h-5 text-orange-600" /></div><div><h3 className="font-semibold text-gray-900">{f.title}</h3><p className="text-sm text-gray-500">{f.desc}</p></div></div>))}</div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Connect Wallet</h3>
                  <p className="text-sm text-gray-600 mt-2">Sign in with email or social login</p>
                </div>
                <div className="space-y-4">
                  <Button 
                    onClick={handleConnectWallet} 
                    className="w-full py-6 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </Button>
                  {walletError && <p className="text-red-500 text-sm text-center">{walletError}</p>}
                  <p className="text-center text-sm text-gray-500">
                    New to Africoin?{' '}
                    <Link to="/signup" className="text-orange-500 hover:underline font-medium">
                      Sign up
                    </Link>
                  </p>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      Supports email, Google, Facebook, and passkeys (Face ID, Touch ID, or device passcode)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletAuth;
