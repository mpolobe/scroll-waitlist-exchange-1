import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Loader2 } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const [checkingOAuth, setCheckingOAuth] = useState(false);

  useEffect(() => {
    // Check if this is an OAuth callback (token in URL hash)
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token') || hash.includes('error'))) {
      setCheckingOAuth(true);
      // Supabase's onAuthStateChange will handle the token
      // Give it a moment to process, then redirect to wallet after OAuth login
      const timer = setTimeout(() => {
        setCheckingOAuth(false);
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        // Only redirect to wallet after OAuth callback
        navigate('/wallet');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  // Show loading state during OAuth callback processing
  if (checkingOAuth || (loading && window.location.hash.includes('access_token'))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900">Signing you in...</h2>
          <p className="text-gray-600 mt-2">Please wait while we complete your authentication</p>
        </div>
      </div>
    );
  }

  return <AppLayout />;
};

export default Index;
