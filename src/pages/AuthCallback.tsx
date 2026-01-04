import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeZkLogin } from '@/lib/zkLogin';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing login...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Extract ID Token from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');

        if (!idToken) {
          // Try query params if hash is empty
          const queryParams = new URLSearchParams(window.location.search);
          const idTokenQuery = queryParams.get('id_token');
          if (!idTokenQuery) throw new Error('No ID token found in URL');
        }

        setStatus('Generating Zero Knowledge Proof...');
        
        // 2. Generate zkLogin Proof (Sui)
        // Note: In a real app, we would wait for this, but for demo we might mock it or let it run
        // We'll try to run it but catch errors gracefully if the prover service is not reachable
        try {
          const { zkProof, ephemeralPrivateKey } = await completeZkLogin(idToken!);
          console.log('ZkLogin Proof generated:', zkProof);
          // Store proof/key in context or local storage for the wallet to use
          localStorage.setItem('sui_zk_proof', JSON.stringify(zkProof));
          localStorage.setItem('sui_ephemeral_key', ephemeralPrivateKey);
        } catch (zkError) {
          console.warn('ZkLogin generation failed (expected in demo without prover):', zkError);
          // Continue to app login even if zkLogin fails in this demo environment
        }

        setStatus('Signing in to Africoin...');

        // 3. Sign in to Supabase with the ID Token
        const { data, error: signInError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken!,
        });

        if (signInError) throw signInError;

        setStatus('Redirecting...');
        setTimeout(() => navigate('/wallet'), 1000);

      } catch (err: any) {
        console.error('Login callback error:', err);
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
          <button onClick={() => navigate('/signup')} className="text-orange-600 hover:underline">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Credentials</h2>
        <p className="text-gray-600">{status}</p>
      </Card>
    </div>
  );
}
