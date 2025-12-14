import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Chrome, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SocialLoginButtonsProps {
  onError?: (error: string) => void;
}

export function SocialLoginButtons({ onError }: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { signInWithGoogle, signInWithApple, signInWithFacebook } = useAuth();

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    setLoadingProvider(provider);
    try {
      let result;
      if (provider === 'google') result = await signInWithGoogle();
      else if (provider === 'apple') result = await signInWithApple();
      else result = await signInWithFacebook();
      
      if (result.error) {
        onError?.(result.error.message || `Failed to sign in with ${provider}`);
      }
    } catch (err: any) {
      onError?.(err.message || 'An error occurred');
    }
    setLoadingProvider(null);
  };

  const FacebookIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const AppleIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={!!loadingProvider}
          className="flex items-center justify-center gap-2">
          {loadingProvider === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5" />}
        </Button>
        <Button variant="outline" onClick={() => handleSocialLogin('apple')} disabled={!!loadingProvider}
          className="flex items-center justify-center gap-2">
          {loadingProvider === 'apple' ? <Loader2 className="w-5 h-5 animate-spin" /> : <AppleIcon />}
        </Button>
        <Button variant="outline" onClick={() => handleSocialLogin('facebook')} disabled={!!loadingProvider}
          className="flex items-center justify-center gap-2 text-blue-600">
          {loadingProvider === 'facebook' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FacebookIcon />}
        </Button>
      </div>
    </div>
  );
}
