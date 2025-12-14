import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Mail, CheckCircle } from 'lucide-react';

const VerifyEmailSent = () => {
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResend = async () => {
    setResending(true);
    setMessage('');
    
    // Get current user email from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email) {
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const verificationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await supabase.from('users').update({
        verification_token: verificationToken,
        verification_token_expires: expiresAt.toISOString()
      }).eq('id', user.id);

      try {
        await supabase.functions.invoke('send-verification-email', {
          body: { 
            email: user.email, 
            fullName: userData?.full_name || 'User',
            verificationToken 
          }
        });
        setMessage('Verification email resent successfully!');
      } catch (err) {
        setMessage('Email sending is currently unavailable. Please try again later.');
      }


    }
    
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <Mail className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600">
            We've sent a verification link to your email address. Please click the link to verify your account.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <CheckCircle className="w-5 h-5 text-blue-600 inline mr-2" />
          <span className="text-sm text-blue-800">
            The verification link will expire in 24 hours
          </span>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800">{message}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleResend}
            disabled={resending}
            variant="outline"
            className="w-full"
          >
            {resending ? 'Resending...' : 'Resend Verification Email'}
          </Button>

          <Button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-orange-500 to-purple-600"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailSent;
