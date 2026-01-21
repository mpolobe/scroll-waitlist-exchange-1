import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing login...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for OAuth tokens in URL hash (standard Supabase OAuth flow)
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        
        // Handle error from OAuth provider
        const errorParam = searchParams.get('error') || new URLSearchParams(hash.substring(1)).get('error');
        if (errorParam) {
          const errorDescription = searchParams.get('error_description') || 
            new URLSearchParams(hash.substring(1)).get('error_description') || 
            'Authentication was cancelled or failed';
          throw new Error(errorDescription);
        }

        setStatus('Verifying authentication...');

        // For standard OAuth flow, Supabase automatically handles the token exchange
        // when the page loads. We just need to wait for the session to be established.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          setStatus('Login successful! Redirecting...');
          
          // Clear the hash/params from URL
          window.history.replaceState(null, '', window.location.pathname);
          
          // Redirect to dashboard
          setTimeout(() => navigate('/dashboard'), 500);
          return;
        }

        // If no session yet, the tokens might still be in the URL
        // Supabase client should auto-detect and exchange them
        if (hash && hash.includes('access_token')) {
          setStatus('Exchanging tokens...');
          
          // Wait a moment for Supabase to process the tokens
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check session again
          const { data: { session: newSession }, error: newError } = await supabase.auth.getSession();
          
          if (newError) throw newError;
          
          if (newSession) {
            setStatus('Login successful! Redirecting...');
            window.history.replaceState(null, '', window.location.pathname);
            setTimeout(() => navigate('/dashboard'), 500);
            return;
          }
        }

        // If we still don't have a session, something went wrong
        throw new Error('Could not establish session. Please try signing in again.');

      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/signup')} 
            className="text-orange-600 hover:underline"
          >
            Return to Sign Up
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 max-w-md w-full text-center">
        <Loader2 className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Signing You In</h2>
        <p className="text-gray-600">{status}</p>
      </Card>
    </div>
  );
}
