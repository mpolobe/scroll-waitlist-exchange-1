import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, ExternalLink } from 'lucide-react';

interface MagicLinkSentProps {
  email: string;
  onBack: () => void;
}

export function MagicLinkSent({ email, onBack }: MagicLinkSentProps) {
  const openEmailApp = () => {
    // Try to open default email app
    window.location.href = 'mailto:';
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
        <ArrowLeft className="w-4 h-4" />Back
      </button>
      
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-10 h-10 text-orange-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
        <p className="text-gray-600 mb-1">We sent a magic link to</p>
        <p className="font-semibold text-gray-900 mb-4">{email}</p>
        <p className="text-sm text-gray-500">
          Click the link in the email to sign in. The link will expire in 1 hour.
        </p>
      </div>

      <Button onClick={openEmailApp} variant="outline" className="w-full">
        <ExternalLink className="w-4 h-4 mr-2" />
        Open Email App
      </Button>

      <div className="text-center text-sm text-gray-500">
        <p>Didn't receive the email?</p>
        <p className="mt-1">Check your spam folder or <button onClick={onBack} className="text-orange-600 hover:underline">try again</button></p>
      </div>
    </div>
  );
}
