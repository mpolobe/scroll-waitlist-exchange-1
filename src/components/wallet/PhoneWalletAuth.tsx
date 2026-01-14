import { useState } from 'react';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { useAuthModal } from '@account-kit/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Shield, Loader2, CheckCircle, Wallet, Copy, ExternalLink, Mail, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhoneWalletAuthProps {
  onSuccess?: () => void;
  compact?: boolean;
  showAlchemy?: boolean; // Show Alchemy option
}

export function PhoneWalletAuth({ onSuccess, compact = false, showAlchemy = true }: PhoneWalletAuthProps) {
  const { toast } = useToast();
  const {
    isConnected,
    isConnecting,
    authStep,
    authError,
    suiAddress,
    afcAddress,
    evmAddress,
    phoneNumber,
    walletType,
    isAlchemyAvailable,
    network,
    sendOTP,
    verifyOTP,
    disconnect,
    switchWalletType,
  } = useSmartWallet();

  // Alchemy auth modal - only use if available
  let openAuthModal: (() => void) | null = null;
  try {
    const authModal = useAuthModal();
    openAuthModal = authModal?.openAuthModal || null;
  } catch {
    // Alchemy not configured
  }

  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [countryCode, setCountryCode] = useState('+254'); // Default to Kenya

  const handleSendOTP = async () => {
    const fullPhone = `${countryCode}${phone.replace(/^0+/, '')}`;
    const success = await sendOTP(fullPhone);
    if (success && authStep === 'authenticated') {
      toast({
        title: 'Wallet Created',
        description: 'Your SUI and AFC wallets are ready.',
      });
      onSuccess?.();
    } else if (success) {
      toast({
        title: 'OTP Sent',
        description: `Verification code sent to ${fullPhone}`,
      });
    }
  };

  const handleVerifyOTP = async () => {
    const fullPhone = `${countryCode}${phone.replace(/^0+/, '')}`;
    const success = await verifyOTP(fullPhone, otpCode);
    if (success) {
      toast({
        title: 'Wallet Created',
        description: 'Your SUI and AFC wallets are ready.',
      });
      onSuccess?.();
    }
  };

  const copyAddress = (address: string, type: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: 'Copied',
      description: `${type} address copied to clipboard`,
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  // Connected state - show wallet info
  if (isConnected) {
    const displayAddress = walletType === 'alchemy' ? evmAddress : suiAddress;
    const explorerUrl = walletType === 'alchemy' 
      ? `${network.explorer}/address/${evmAddress}`
      : `https://suiscan.xyz/mainnet/account/${suiAddress}`;

    if (compact) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-400">
              {displayAddress ? truncateAddress(displayAddress) : 'Connected'}
            </span>
            {walletType === 'alchemy' && (
              <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                {network.name}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      );
    }

    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-500" />
            Your Wallets
          </CardTitle>
          <CardDescription className="text-gray-400">
            {walletType === 'alchemy' 
              ? `Connected via ${network.name}` 
              : `Connected via ${phoneNumber}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alchemy/Polygon Wallet */}
          {walletType === 'alchemy' && evmAddress && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-400">
                  {network.name} Wallet (AFRC)
                </span>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm text-white bg-slate-900/50 px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                  {evmAddress}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyAddress(evmAddress, 'Polygon')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* SUI Wallet */}
          {walletType === 'phone' && suiAddress && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-400">SUI Wallet</span>
                <a
                  href={`https://suiscan.xyz/mainnet/account/${suiAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm text-white bg-slate-900/50 px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                  {suiAddress}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyAddress(suiAddress, 'SUI')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* AFC Wallet (from phone) */}
          {walletType === 'phone' && afcAddress && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-400">AFC Wallet (EVM)</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm text-white bg-slate-900/50 px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                  {afcAddress}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyAddress(afcAddress, 'AFC')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
            onClick={disconnect}
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  // OTP verification step
  if (authStep === 'otp') {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Verify Phone Number
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter the 6-digit code sent to your phone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-gray-300">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="bg-slate-900/50 border-slate-600 text-white text-center text-2xl tracking-widest"
            />
          </div>

          {authError && (
            <p className="text-sm text-red-400">{authError}</p>
          )}

          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleVerifyOTP}
            disabled={isConnecting || otpCode.length !== 6}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify & Create Wallet
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-gray-400"
            onClick={() => {
              const fullPhone = `${countryCode}${phone.replace(/^0+/, '')}`;
              sendOTP(fullPhone);
            }}
            disabled={isConnecting}
          >
            Resend Code
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Wallet selection / Phone input step
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-orange-500" />
          Connect Wallet
        </CardTitle>
        <CardDescription className="text-gray-400">
          Choose how to connect your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAlchemy && isAlchemyAvailable ? (
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
              <TabsTrigger value="email" className="data-[state=active]:bg-purple-500/20">
                <Mail className="w-4 h-4 mr-2" />
                Email/Social
              </TabsTrigger>
              <TabsTrigger value="phone" className="data-[state=active]:bg-orange-500/20">
                <Smartphone className="w-4 h-4 mr-2" />
                Phone (SMS)
              </TabsTrigger>
            </TabsList>

            {/* Email/Social Login (Alchemy) */}
            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="text-sm font-medium text-purple-400 mb-2">
                  Polygon Mainnet (AFRC)
                </h4>
                <p className="text-xs text-gray-400 mb-4">
                  Connect with email or social accounts. Gas fees sponsored for railway operations.
                </p>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => openAuthModal?.()}
                  disabled={!openAuthModal}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Connect with Email
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Powered by Alchemy Account Kit
              </p>
            </TabsContent>

            {/* Phone Login (SUI) */}
            <TabsContent value="phone" className="space-y-4 mt-4">
              <PhoneInputForm
                phone={phone}
                setPhone={setPhone}
                countryCode={countryCode}
                setCountryCode={setCountryCode}
                authError={authError}
                isConnecting={isConnecting}
                onSubmit={handleSendOTP}
              />
            </TabsContent>
          </Tabs>
        ) : (
          // Phone-only mode (when Alchemy not configured)
          <PhoneInputForm
            phone={phone}
            setPhone={setPhone}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            authError={authError}
            isConnecting={isConnecting}
            onSubmit={handleSendOTP}
          />
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Extracted phone input form component
function PhoneInputForm({
  phone,
  setPhone,
  countryCode,
  setCountryCode,
  authError,
  isConnecting,
  onSubmit,
}: {
  phone: string;
  setPhone: (value: string) => void;
  countryCode: string;
  setCountryCode: (value: string) => void;
  authError: string | null;
  isConnecting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h4 className="text-sm font-medium text-blue-400 mb-2">
          SUI Network (AFC)
        </h4>
        <p className="text-xs text-gray-400 mb-4">
          Create wallets linked to your mobile number via SMS verification.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-slate-900/50 border border-slate-600 text-white rounded-md px-3 py-2"
          >
            <option value="+254">🇰🇪 +254</option>
            <option value="+255">🇹🇿 +255</option>
            <option value="+256">🇺🇬 +256</option>
            <option value="+260">🇿🇲 +260</option>
            <option value="+263">🇿🇼 +263</option>
            <option value="+234">🇳🇬 +234</option>
            <option value="+233">🇬🇭 +233</option>
            <option value="+27">🇿🇦 +27</option>
            <option value="+251">🇪🇹 +251</option>
            <option value="+250">🇷🇼 +250</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
          </select>
          <Input
            id="phone"
            type="tel"
            placeholder="712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            className="bg-slate-900/50 border-slate-600 text-white flex-1"
          />
        </div>
        <p className="text-xs text-gray-500">
          We'll send a verification code via SMS
        </p>
      </div>

      {authError && (
        <p className="text-sm text-red-400">{authError}</p>
      )}

      <Button
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        onClick={onSubmit}
        disabled={isConnecting || phone.length < 8}
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Phone className="w-4 h-4 mr-2" />
            Send Verification Code
          </>
        )}
      </Button>
    </div>
  );
}

export default PhoneWalletAuth;
