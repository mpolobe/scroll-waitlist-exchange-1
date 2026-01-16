/**
 * OAuth Consent Page
 * 
 * This page handles the OAuth 2.1 authorization flow for third-party applications
 * (railway operators, partners, etc.) that want to integrate with Africoin/Africa Railways.
 * 
 * Flow:
 * 1. Third-party app redirects user here with authorization_id
 * 2. User authenticates if not logged in
 * 3. User sees consent screen with requested permissions
 * 4. User approves or denies access
 * 5. User is redirected back to third-party app
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, Check, X, AlertTriangle, Train, Wallet, User, Mail } from 'lucide-react';
import MarketingNav from '@/components/MarketingNav';

interface AuthorizationDetails {
  client: {
    id: string;
    name: string;
    logo_url?: string;
  };
  redirect_uri: string;
  scopes: string[];
  state?: string;
}

const SCOPE_DESCRIPTIONS: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  openid: {
    label: 'OpenID',
    description: 'Verify your identity',
    icon: <Shield className="w-5 h-5" />
  },
  email: {
    label: 'Email',
    description: 'View your email address',
    icon: <Mail className="w-5 h-5" />
  },
  profile: {
    label: 'Profile',
    description: 'View your name and profile information',
    icon: <User className="w-5 h-5" />
  },
  phone: {
    label: 'Phone',
    description: 'View your phone number',
    icon: <User className="w-5 h-5" />
  },
  'railway:read': {
    label: 'Railway Data',
    description: 'View your railway bookings and tickets',
    icon: <Train className="w-5 h-5" />
  },
  'railway:write': {
    label: 'Railway Booking',
    description: 'Create and manage railway bookings on your behalf',
    icon: <Train className="w-5 h-5" />
  },
  'wallet:read': {
    label: 'Wallet Balance',
    description: 'View your AFC token balance',
    icon: <Wallet className="w-5 h-5" />
  },
  'wallet:transfer': {
    label: 'Wallet Transfers',
    description: 'Transfer AFC tokens on your behalf',
    icon: <Wallet className="w-5 h-5" />
  }
};

export default function OAuthConsent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [authDetails, setAuthDetails] = useState<AuthorizationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorizationId = searchParams.get('authorization_id');

  useEffect(() => {
    if (authLoading) return;

    if (!authorizationId) {
      setError('Missing authorization_id parameter');
      setLoading(false);
      return;
    }

    // If user is not logged in, redirect to login
    if (!user) {
      navigate(`/signup?tab=login&redirect=/oauth/consent?authorization_id=${authorizationId}`);
      return;
    }

    // Fetch authorization details
    fetchAuthorizationDetails();
  }, [authorizationId, user, authLoading]);

  const fetchAuthorizationDetails = async () => {
    try {
      // @ts-ignore - OAuth methods may not be in types yet
      const { data, error } = await supabase.auth.oauth?.getAuthorizationDetails(authorizationId);
      
      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Invalid authorization request');
      }

      setAuthDetails(data);
    } catch (err: any) {
      console.error('Failed to get authorization details:', err);
      setError(err.message || 'Failed to load authorization details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      // @ts-ignore - OAuth methods may not be in types yet
      const { data, error } = await supabase.auth.oauth?.approveAuthorization(authorizationId);
      
      if (error) {
        throw error;
      }

      // Redirect back to the client application
      window.location.href = data.redirect_to;
    } catch (err: any) {
      console.error('Failed to approve authorization:', err);
      setError(err.message || 'Failed to approve authorization');
      setProcessing(false);
    }
  };

  const handleDeny = async () => {
    setProcessing(true);
    try {
      // @ts-ignore - OAuth methods may not be in types yet
      const { data, error } = await supabase.auth.oauth?.denyAuthorization(authorizationId);
      
      if (error) {
        throw error;
      }

      // Redirect back to the client application with error
      window.location.href = data.redirect_to;
    } catch (err: any) {
      console.error('Failed to deny authorization:', err);
      setError(err.message || 'Failed to deny authorization');
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
          <p className="mt-4 text-gray-600">Loading authorization request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
        <MarketingNav />
        <div className="flex items-center justify-center pt-24 px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-center text-red-600">Authorization Error</CardTitle>
              <CardDescription className="text-center">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!authDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <MarketingNav />
      <div className="flex items-center justify-center pt-24 px-4 pb-12">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              {authDetails.client.logo_url ? (
                <img 
                  src={authDetails.client.logo_url} 
                  alt={authDetails.client.name}
                  className="w-16 h-16 rounded-lg"
                />
              ) : (
                <div className="p-4 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">Authorize {authDetails.client.name}</CardTitle>
            <CardDescription>
              This application is requesting access to your Africoin account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Signed in as</p>
              <p className="font-medium">{user?.email || user?.phone}</p>
            </div>

            {/* Requested Permissions */}
            <div>
              <h3 className="font-semibold mb-3">This app will be able to:</h3>
              <div className="space-y-3">
                {authDetails.scopes.map((scope) => {
                  const scopeInfo = SCOPE_DESCRIPTIONS[scope] || {
                    label: scope,
                    description: `Access to ${scope}`,
                    icon: <Shield className="w-5 h-5" />
                  };
                  
                  return (
                    <div key={scope} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="text-orange-600 mt-0.5">
                        {scopeInfo.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{scopeInfo.label}</p>
                        <p className="text-sm text-gray-600">{scopeInfo.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Security Notice</p>
                  <p className="text-blue-700">
                    Only authorize applications you trust. You can revoke access at any time from your account settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Redirect URI */}
            <div className="text-xs text-gray-500">
              <p>You will be redirected to:</p>
              <p className="font-mono break-all">{authDetails.redirect_uri}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDeny}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Deny
                  </>
                )}
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600"
                onClick={handleApprove}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Authorize
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
