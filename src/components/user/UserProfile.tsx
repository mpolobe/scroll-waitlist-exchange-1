import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

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

  useEffect(() => {
    const checkVerification = async () => {
      if (user) {
        const { data } = await supabase.from('users').select('email_verified').eq('id', user.id).single();
        setEmailVerified(data?.email_verified || false);
      }
    };
    checkVerification();
  }, [user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await updateProfile(formData);
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
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
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email} disabled />
          </div>

          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
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
