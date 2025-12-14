import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { WalletAddressCard } from '@/components/wallet/WalletAddressCard';
import { TokenBalances } from '@/components/wallet/TokenBalances';
import { TransactionHistoryWallet } from '@/components/wallet/TransactionHistoryWallet';
import { SendTokenModal } from '@/components/wallet/SendTokenModal';
import { TwoFactorSettings } from '@/components/wallet/TwoFactorSettings';
import { AuthMethodSelector } from '@/components/wallet/AuthMethodSelector';
import { MarketingNav } from '@/components/MarketingNav';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Send, QrCode, LogOut, Copy, CheckCircle, Wallet, Shield, Settings, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { activeChain } from '@/lib/alchemyConfig';
import { useAuthenticate, useSignerStatus } from '@account-kit/react';

export default function WalletDashboard() {
  const { isConnected, balance, address, disconnect } = useSmartWallet();
  const { user, signOut } = useAuth();
  const { authenticate, isPending: isAuthenticating } = useAuthenticate();
  const { isInitializing } = useSignerStatus();
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('wallet');
  const [walletError, setWalletError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { if (!user) navigate('/signup?tab=login'); }, [user, navigate]);

  const handleConnectWallet = () => {
    if (!user?.email) return;
    setWalletError('');
    authenticate(
      { type: "passkey", email: user.email },
      {
        onSuccess: () => { setWalletError(''); setShowAuthModal(false); },
        onError: (err) => setWalletError(err.message || 'Failed to connect.'),
      }
    );
  };

  const copyAddress = () => {
    if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleLogout = async () => { disconnect(); await signOut(); navigate('/'); };

  if (!user) return null;
  const shortAddr = address ? `${address.slice(0, 10)}...${address.slice(-8)}` : '';
  const isPending = isInitializing || isAuthenticating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      <MarketingNav />
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-gray-600">Welcome back, {user.email}</p></div>
          <Button variant="outline" onClick={handleLogout} className="text-red-500 hover:bg-red-50"><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="wallet" className="gap-2"><Wallet className="w-4 h-4" />Wallet</TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Shield className="w-4 h-4" />Security</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" />Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="wallet">
            {isPending ? (
              <Card className="p-8 text-center"><Loader2 className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" /><h2 className="text-2xl font-bold mb-2">Connecting...</h2></Card>
            ) : !isConnected ? (
              <Card className="p-8 text-center">
                <Wallet className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                <p className="text-gray-600 mb-6">Choose your authentication method to connect</p>
                <Button onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-orange-500 to-amber-500"><Wallet className="w-4 h-4 mr-2" />Connect Wallet</Button>
                <AuthMethodSelector open={showAuthModal} onOpenChange={setShowAuthModal} onAuthenticate={handleConnectWallet} isAuthenticating={isAuthenticating} error={walletError} />
              </Card>
            ) : (
              <>
                <div className="flex gap-3 mb-6">
                  <Button onClick={() => setSendModalOpen(true)} className="bg-gradient-to-r from-orange-500 to-amber-500"><Send className="w-4 h-4 mr-2" />Send</Button>
                  <Button variant="outline" onClick={() => setReceiveModalOpen(true)}><QrCode className="w-4 h-4 mr-2" />Receive</Button>
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white"><p className="text-orange-100 mb-1">Total Balance</p><p className="text-4xl font-bold">${balance}</p><p className="text-orange-100 mt-2">On {activeChain.name}</p></Card>
                    <TokenBalances /><TransactionHistoryWallet />
                  </div>
                  <div className="space-y-6"><WalletAddressCard /><Card className="p-6"><h3 className="font-semibold mb-4">Quick Actions</h3><div className="space-y-3"><Button onClick={() => setSendModalOpen(true)} variant="outline" className="w-full justify-start"><Send className="w-4 h-4 mr-3" />Send</Button><Button onClick={() => setReceiveModalOpen(true)} variant="outline" className="w-full justify-start"><QrCode className="w-4 h-4 mr-3" />Receive</Button></div></Card></div>
                </div>
              </>
            )}
          </TabsContent>
          <TabsContent value="security"><div className="max-w-2xl space-y-6"><TwoFactorSettings /><Card className="p-6"><h3 className="font-semibold mb-2">Password</h3><p className="text-sm text-gray-500 mb-4">Change your account password</p><Button variant="outline" onClick={() => navigate('/reset-password')}>Change Password</Button></Card></div></TabsContent>
          <TabsContent value="settings"><div className="max-w-2xl"><Card className="p-6"><h3 className="font-semibold mb-4">Account Information</h3><div className="space-y-3"><div><span className="text-gray-500">Email:</span> <span className="ml-2">{user.email}</span></div>{address && <div><span className="text-gray-500">Wallet:</span> <span className="ml-2 font-mono text-sm">{shortAddr}</span></div>}</div></Card></div></TabsContent>
        </Tabs>
      </div>
      <MarketingFooter />
      <SendTokenModal open={sendModalOpen} onOpenChange={setSendModalOpen} />
      <Dialog open={receiveModalOpen} onOpenChange={setReceiveModalOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle className="text-center">Receive Tokens</DialogTitle></DialogHeader><div className="flex flex-col items-center py-6"><div className="bg-white p-4 rounded-xl shadow-lg border mb-4"><svg width="180" height="180" viewBox="0 0 180 180"><rect width="180" height="180" fill="white"/>{Array.from({length:20}).map((_,i)=>Array.from({length:20}).map((_,j)=>((i<7&&j<7)||(i<7&&j>=13)||(i>=13&&j<7)?((i%6===0||j%6===0||(i>=2&&i<=4&&j>=2&&j<=4))?<rect key={`${i}-${j}`} x={i*9} y={j*9} width={9} height={9} fill="#1a1a1a"/>:null):((i+j+(address?.charCodeAt(i%40)||0))%3===0?<rect key={`${i}-${j}`} x={i*9} y={j*9} width={9} height={9} fill="#1a1a1a"/>:null))))}</svg></div><p className="text-sm text-gray-500 mb-2">Scan to send tokens</p><p className="font-mono text-xs bg-gray-100 px-3 py-2 rounded-lg">{shortAddr}</p><Button onClick={copyAddress} className="mt-4 w-full">{copied?<><CheckCircle className="w-4 h-4 mr-2"/>Copied!</>:<><Copy className="w-4 h-4 mr-2"/>Copy Address</>}</Button></div></DialogContent>
      </Dialog>
    </div>
  );
}
