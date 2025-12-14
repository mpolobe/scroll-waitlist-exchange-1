import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OTPVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function OTPVerification({ email, onSuccess, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { verifyOTP, signInWithOTP } = useAuth();

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setIsLoading(true);
    setError('');
    const { error: verifyError } = await verifyOTP(email, otp);
    if (verifyError) {
      setError(verifyError.message || 'Invalid code. Please try again.');
      setIsLoading(false);
      return;
    }
    onSuccess();
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    const { error: resendError } = await signInWithOTP(email);
    setResendLoading(false);
    if (resendError) {
      setError(resendError.message || 'Failed to resend code');
    } else {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
        <ArrowLeft className="w-4 h-4" />Back
      </button>
      <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
        <div className="p-3 bg-orange-100 rounded-full">
          <Mail className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Check your email</p>
          <p className="text-sm text-gray-600">We sent a code to {email}</p>
        </div>
      </div>
      <div>
        <Label htmlFor="otp-code">Verification Code</Label>
        <Input id="otp-code" type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit code" className="mt-1 text-center text-2xl tracking-widest" maxLength={6} />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {resendSuccess && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />Code resent successfully
        </div>
      )}
      <Button onClick={handleVerify} disabled={isLoading || otp.length < 6}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Verify Code'}
      </Button>
      <div className="text-center">
        <button onClick={handleResend} disabled={resendLoading} className="text-sm text-orange-600 hover:text-orange-700 hover:underline disabled:opacity-50">
          {resendLoading ? 'Sending...' : "Didn't receive a code? Resend"}
        </button>
      </div>
    </div>
  );
}
