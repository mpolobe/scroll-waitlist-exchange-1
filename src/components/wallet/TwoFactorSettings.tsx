import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Shield, Smartphone, Mail, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function TwoFactorSettings() {
  const { user } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupStep, setSetupStep] = useState<'method' | 'verify' | 'complete'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'app'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnable2FA = () => {
    setShowSetupModal(true);
    setSetupStep('method');
    setError('');
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    // Simulate API call to disable 2FA
    await new Promise(r => setTimeout(r, 1000));
    setIs2FAEnabled(false);
    setIsLoading(false);
  };

  const handleSelectMethod = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (selectedMethod === 'email' && user?.email) {
        await supabase.functions.invoke('send-2fa-code', {
          body: { email: user.email, action: 'setup' }
        });
      }
      setSetupStep('verify');
    } catch (err) {
      setError('Failed to send verification code');
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setIsLoading(true);
    setError('');
    // Simulate verification
    await new Promise(r => setTimeout(r, 1500));
    setIs2FAEnabled(true);
    setSetupStep('complete');
    setIsLoading(false);
  };

  const closeModal = () => {
    setShowSetupModal(false);
    setSetupStep('method');
    setVerificationCode('');
    setError('');
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500">Add an extra layer of security</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {is2FAEnabled ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
            <span className={is2FAEnabled ? 'text-green-700' : 'text-amber-700'}>
              {is2FAEnabled ? '2FA is enabled' : '2FA is not enabled'}
            </span>
          </div>
          <Switch checked={is2FAEnabled} onCheckedChange={is2FAEnabled ? handleDisable2FA : handleEnable2FA} disabled={isLoading} />
        </div>
        {is2FAEnabled && (
          <p className="text-sm text-gray-500 mt-3">
            You'll be asked for a verification code when signing in from a new device.
          </p>
        )}
      </Card>

      <Dialog open={showSetupModal} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>Secure your account with an additional verification step</DialogDescription>
          </DialogHeader>
          {setupStep === 'method' && (
            <div className="space-y-4 py-4">
              <button onClick={() => setSelectedMethod('email')} className={`w-full p-4 rounded-lg border-2 flex items-center gap-4 transition ${selectedMethod === 'email' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <Mail className="w-6 h-6 text-purple-600" />
                <div className="text-left"><p className="font-medium">Email Verification</p><p className="text-sm text-gray-500">Receive codes via email</p></div>
              </button>
              <button onClick={() => setSelectedMethod('app')} className={`w-full p-4 rounded-lg border-2 flex items-center gap-4 transition ${selectedMethod === 'app' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <Smartphone className="w-6 h-6 text-purple-600" />
                <div className="text-left"><p className="font-medium">Authenticator App</p><p className="text-sm text-gray-500">Use Google Authenticator or similar</p></div>
              </button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button onClick={handleSelectMethod} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-orange-600">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
              </Button>
            </div>
          )}
          {setupStep === 'verify' && (
            <div className="space-y-4 py-4">
              <p className="text-center text-gray-600">Enter the 6-digit code {selectedMethod === 'email' ? `sent to ${user?.email}` : 'from your authenticator app'}</p>
              <div><Label>Verification Code</Label><Input type="text" maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="mt-1 text-center text-2xl tracking-widest" /></div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button onClick={handleVerifyCode} disabled={isLoading || verificationCode.length !== 6} className="w-full bg-gradient-to-r from-purple-500 to-orange-600">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Enable'}
              </Button>
            </div>
          )}
          {setupStep === 'complete' && (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">2FA Enabled!</h3>
              <p className="text-gray-600 mb-4">Your account is now more secure</p>
              <Button onClick={closeModal} className="bg-gradient-to-r from-purple-500 to-orange-600">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
