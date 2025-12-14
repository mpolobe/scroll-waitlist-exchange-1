import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Smartphone, ScanFace, Fingerprint, KeyRound, Mail, Link2, Chrome } from 'lucide-react';

export type AuthMethod = 'faceid' | 'touchid' | 'passcode' | 'otp' | 'magiclink' | 'google' | 'apple' | 'facebook';
export type PasskeyMethod = 'faceid' | 'touchid' | 'passcode';

interface AuthMethodSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMethod: (method: AuthMethod) => void;
  isAuthenticating: boolean;
  error?: string;
  title?: string;
  description?: string;
  showPasskeyOnly?: boolean;
}

const passkeyMethods = [
  { id: 'faceid' as AuthMethod, icon: ScanFace, label: 'Face ID', desc: 'Use facial recognition' },
  { id: 'touchid' as AuthMethod, icon: Fingerprint, label: 'Touch ID', desc: 'Use your fingerprint' },
  { id: 'passcode' as AuthMethod, icon: KeyRound, label: 'Passcode', desc: 'Use device passcode' },
];

const otherMethods = [
  { id: 'otp' as AuthMethod, icon: Mail, label: 'Email OTP', desc: 'Get a code via email' },
  { id: 'magiclink' as AuthMethod, icon: Link2, label: 'Magic Link', desc: 'Sign in via email link' },
];

const socialMethods = [
  { id: 'google' as AuthMethod, icon: Chrome, label: 'Google', desc: 'Continue with Google' },
  { id: 'apple' as AuthMethod, icon: Smartphone, label: 'Apple', desc: 'Continue with Apple' },
  { id: 'facebook' as AuthMethod, icon: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, label: 'Facebook', desc: 'Continue with Facebook' },
];

export function AuthMethodSelector({
  open, onOpenChange, onSelectMethod, isAuthenticating, error,
  title = "Choose Authentication", description = "Select how you'd like to sign in",
  showPasskeyOnly = false
}: AuthMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null);

  const handleContinue = () => {
    if (selectedMethod) onSelectMethod(selectedMethod);
  };

  const renderMethodButton = (method: typeof passkeyMethods[0]) => (
    <button key={method.id} onClick={() => setSelectedMethod(method.id)} disabled={isAuthenticating}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
        selectedMethod === method.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
      } ${isAuthenticating ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className={`p-2 rounded-full ${selectedMethod === method.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
        {typeof method.icon === 'function' ? <method.icon /> : <method.icon className="w-5 h-5" />}
      </div>
      <div className="text-left flex-1">
        <p className="font-semibold text-gray-900 text-sm">{method.label}</p>
        <p className="text-xs text-gray-500">{method.desc}</p>
      </div>
      {selectedMethod === method.id && (
        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-orange-500" />{title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Device Authentication</p>
            <div className="space-y-2">{passkeyMethods.map(renderMethodButton)}</div>
          </div>
          {!showPasskeyOnly && (
            <>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Email Options</p>
                <div className="space-y-2">{otherMethods.map(renderMethodButton)}</div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Social Login</p>
                <div className="space-y-2">{socialMethods.map(renderMethodButton)}</div>
              </div>
            </>
          )}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button onClick={handleContinue} disabled={!selectedMethod || isAuthenticating}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
            {isAuthenticating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Authenticating...</> : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
