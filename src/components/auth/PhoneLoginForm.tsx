import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { otpService } from '@/lib/otpService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Smartphone, ArrowLeft, CheckCircle } from 'lucide-react';

interface PhoneLoginFormProps {
  mode: 'login' | 'signup';
  onBack?: () => void;
}

export function PhoneLoginForm({ mode, onBack }: PhoneLoginFormProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useCustomOTP, setUseCustomOTP] = useState(false);
  
  const { signInWithPhone, signUpWithPhone, verifyPhoneOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if custom OTP service (Africa's Talking / Twilio) is configured
    setUseCustomOTP(otpService.isConfigured());
  }, []);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Add + prefix if not present
    if (cleaned && !value.startsWith('+')) {
      return '+' + cleaned;
    }
    return value;
  };

  const validatePhoneNumber = (phone: string) => {
    // Basic validation: must start with + and have at least 10 digits
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formattedPhone = formatPhoneNumber(phone);
    
    if (!validatePhoneNumber(formattedPhone)) {
      setError('Please enter a valid phone number with country code (e.g., +254712345678)');
      return;
    }

    if (mode === 'signup' && (!fullName || !country)) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      if (useCustomOTP) {
        // Use Africa's Talking / Twilio
        const result = await otpService.sendOTP(formattedPhone);
        
        if (result.success) {
          setStep('otp');
          setPhone(formattedPhone);
          setSuccess(`Code sent via ${result.provider === 'africas-talking' ? "Africa's Talking" : 'Twilio'}`);
        } else {
          setError(result.error || 'Failed to send OTP');
        }
      } else {
        // Fallback to Supabase phone auth
        let result;
        if (mode === 'signup') {
          result = await signUpWithPhone(formattedPhone, fullName, country);
        } else {
          result = await signInWithPhone(formattedPhone);
        }

        if (result.error) {
          setError(result.error.message);
        } else {
          setStep('otp');
          setPhone(formattedPhone);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const { error: verifyError } = await verifyPhoneOTP(phone, otp);
      
      if (verifyError) {
        setError(verifyError.message);
      } else {
        // Redirect to wallet connection
        navigate('/wallet');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await signInWithPhone(phone);
      if (result.error) {
        setError(result.error.message);
      } else {
        setError('');
        // Show success message
        setTimeout(() => setError(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-800">
            Enter the 6-digit code sent to {phone}
          </span>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="mt-1 text-center text-2xl tracking-widest"
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-purple-500 to-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Change number
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Resend code
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
        <Smartphone className="w-5 h-5 text-purple-600" />
        <span className="text-sm text-purple-800">
          {mode === 'signup' ? 'Create account with phone number' : 'Sign in with phone number'}
        </span>
      </div>

      {mode === 'signup' && (
        <>
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Enter your country"
              className="mt-1"
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1234567890"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Include country code (e.g., +1 for US, +254 for Kenya)
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-orange-600"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending code...
          </>
        ) : (
          'Send Verification Code'
        )}
      </Button>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to other options
        </button>
      )}
    </form>
  );
}
