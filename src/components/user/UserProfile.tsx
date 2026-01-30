import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Mail, Phone, Loader2, Edit2, X } from 'lucide-react';

export function UserProfile() {
  const { user, profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    country: profile?.country || '',
    two_factor_enabled: profile?.two_factor_enabled || false,
  });
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  // Phone OTP verification state
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState(['', '', '', '', '', '']);
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const checkVerification = async () => {
      if (user) {
        const { data } = await supabase.from('users').select('email_verified').eq('id', user.id).single();
        setEmailVerified(data?.email_verified || false);
      }
    };
    checkVerification();
  }, [user]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        two_factor_enabled: profile.two_factor_enabled || false,
      });
    }
  }, [profile]);

  const handleResendVerification = async () => {
    setResending(true);
    const { data: userData } = await supabase.from('users').select('full_name').eq('id', user?.id).single();
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    await supabase.from('users').update({ verification_token: verificationToken, verification_token_expires: expiresAt.toISOString() }).eq('id', user?.id);
    await supabase.functions.invoke('send-verification-email', { body: { email: user?.email, fullName: userData?.full_name, verificationToken } });
    toast({ title: 'Verification email sent!' });
    setResending(false);
  };

  // Phone OTP functions
  const sendPhoneOTP = async () => {
    if (!newPhone) {
      toast({ title: 'Error', description: 'Please enter a phone number', variant: 'destructive' });
      return;
    }

    // Validate phone format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(newPhone)) {
      toast({ 
        title: 'Invalid phone format', 
        description: 'Please use E.164 format (e.g., +254712345678)', 
        variant: 'destructive' 
      });
      return;
    }

    setPhoneOtpLoading(true);
    setPhoneOtpError('');

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone })
      });

      const data = await response.json();

      if (data.success) {
        setShowPhoneOtp(true);
        setPhoneOtpCode(['', '', '', '', '', '']);
        toast({ title: 'OTP Sent', description: `Verification code sent to ${newPhone}` });
        // Focus first OTP input
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setPhoneOtpError(data.error || 'Failed to send OTP');
        toast({ title: 'Error', description: data.error || 'Failed to send OTP', variant: 'destructive' });
      }
    } catch (error) {
      setPhoneOtpError('Network error. Please try again.');
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' });
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...phoneOtpCode];
    newOtp[index] = value.slice(-1);
    setPhoneOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      verifyPhoneOTP(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !phoneOtpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyPhoneOTP = async (code?: string) => {
    const otpCode = code || phoneOtpCode.join('');
    
    if (otpCode.length !== 6) {
      setPhoneOtpError('Please enter all 6 digits');
      return;
    }

    setPhoneOtpLoading(true);
    setPhoneOtpError('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone, code: otpCode })
      });

      const data = await response.json();

      if (data.success) {
        // Update phone in profile
        const { error } = await updateProfile({ phone: newPhone });
        
        if (error) {
          setPhoneOtpError('Failed to update phone number');
          toast({ title: 'Error', description: 'Failed to update phone number', variant: 'destructive' });
        } else {
          // Also update in users table
          if (user) {
            await supabase.from('users').update({ phone: newPhone }).eq('id', user.id);
          }
          
          setFormData(prev => ({ ...prev, phone: newPhone }));
          setIsEditingPhone(false);
          setShowPhoneOtp(false);
          setNewPhone('');
          setPhoneOtpCode(['', '', '', '', '', '']);
          toast({ title: 'Success', description: 'Phone number updated successfully!' });
        }
      } else {
        setPhoneOtpError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setPhoneOtpError('Network error. Please try again.');
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const cancelPhoneEdit = () => {
    setIsEditingPhone(false);
    setShowPhoneOtp(false);
    setNewPhone('');
    setPhoneOtpCode(['', '', '', '', '', '']);
    setPhoneOtpError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Don't include phone in regular update - it requires OTP
    const { phone, ...dataWithoutPhone } = formData;
    const { error } = await updateProfile(dataWithoutPhone);
    
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      // Sync to users table
      if (user) {
        await supabase.from('users').update({
          full_name: formData.full_name,
          country: formData.country
        }).eq('id', user.id);
      }
      toast({ title: 'Profile updated successfully!' });
    }
  };

  const send2FACode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await supabase.functions.invoke('send-2fa-code', { body: { email: profile?.email, code } });
    toast({ title: '2FA code sent to your email' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Verification Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Label>Email Verification Status</Label>
              {emailVerified ? (
                <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
              ) : (
                <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Not Verified</Badge>
              )}
            </div>
            {!emailVerified && (
              <Button type="button" variant="outline" size="sm" onClick={handleResendVerification} disabled={resending}>
                <Mail className="w-4 h-4 mr-2" />{resending ? 'Sending...' : 'Resend Email'}
              </Button>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email} disabled />
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          {/* Phone with OTP Verification */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            {!isEditingPhone ? (
              <div className="flex items-center gap-2">
                <Input
                  id="phone"
                  value={formData.phone || 'Not set'}
                  disabled
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingPhone(true);
                    setNewPhone(formData.phone || '');
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </Button>
              </div>
            ) : !showPhoneOtp ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+254712345678"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={sendPhoneOTP}
                    disabled={phoneOtpLoading}
                    size="sm"
                  >
                    {phoneOtpLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-1" /> Send OTP
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelPhoneEdit}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your phone number in E.164 format (e.g., +254712345678)
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-center">
                  Enter the 6-digit code sent to <strong>{newPhone}</strong>
                </p>
                <div className="flex justify-center gap-2">
                  {phoneOtpCode.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold"
                      disabled={phoneOtpLoading}
                    />
                  ))}
                </div>
                {phoneOtpError && (
                  <p className="text-sm text-red-500 text-center">{phoneOtpError}</p>
                )}
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => verifyPhoneOTP()}
                    disabled={phoneOtpLoading || phoneOtpCode.join('').length !== 6}
                  >
                    {phoneOtpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={sendPhoneOTP}
                    disabled={phoneOtpLoading}
                  >
                    Resend Code
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelPhoneEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Country */}
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="2fa">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch
              id="2fa"
              checked={formData.two_factor_enabled}
              onCheckedChange={(checked) => {
                setFormData({ ...formData, two_factor_enabled: checked });
                if (checked) send2FACode();
              }}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
