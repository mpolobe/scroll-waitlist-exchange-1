import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: any;
  userRecord: any;
  loading: boolean;
  isAdmin: boolean;
  adminRole: string | null;
  walletAddress: string | null;
  signUp: (email: string, password: string, fullName: string, country: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithOTP: (email: string) => Promise<any>;
  verifyOTP: (email: string, token: string) => Promise<any>;
  signInWithMagicLink: (email: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithGitHub: () => Promise<any>;
  signInWithFacebook: () => Promise<any>;
  signInWithApple: () => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
  refreshUserRecord: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRecord, setUserRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        // Sync OAuth profile if user signed in with OAuth
        syncOAuthProfile(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        // Sync OAuth profile on auth state change
        if (_event === 'SIGNED_IN') {
          await syncOAuthProfile(session.user);
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncOAuthProfile = async (user: User) => {
    // Check if user signed in with OAuth provider
    const provider = user.app_metadata?.provider;
    if (provider && ['google', 'github', 'facebook'].includes(provider)) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          await supabase.functions.invoke('sync-oauth-profile', {
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`
            }
          });
        }
      } catch (error) {
        console.log('Profile sync skipped:', error);
      }
    }
  };


  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    
    // Load user record with wallet address
    const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single();
    setUserRecord(userData);
    if (userData?.wallet_address) {
      setWalletAddress(userData.wallet_address);
    }
    
    // Check admin role
    const { data: roleData } = await supabase.from('admin_roles').select('role').eq('user_id', userId).single();
    if (roleData) {
      setIsAdmin(true);
      setAdminRole(roleData.role);
    } else {
      setIsAdmin(false);
      setAdminRole(null);
    }
  };

  const refreshUserRecord = async () => {
    if (user) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
      setUserRecord(userData);
      if (userData?.wallet_address) {
        setWalletAddress(userData.wallet_address);
      }
    }
  };



  const signUp = async (email: string, password: string, fullName: string, country: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      // Generate verification token
      const verificationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create user record with verification token
      await supabase.from('users').insert({ 
        id: data.user.id, 
        email, 
        full_name: fullName,
        country,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expires: expiresAt.toISOString()
      });

      // Send verification email (wrapped in try-catch as edge function may not be deployed)
      try {
        await supabase.functions.invoke('send-verification-email', {
          body: { email, fullName, verificationToken }
        });
      } catch (err) {
        console.log('Email sending skipped - edge function not available');
      }

    }
    return { data, error };
  };


  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithOTP = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });
    return { data, error };
  };

  const verifyOTP = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    return { data, error };
  };

  const signInWithMagicLink = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/wallet`,
        shouldCreateUser: true
      }
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { data, error };
  };

  const signInWithGitHub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { data, error };
  };

  const signInWithFacebook = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { data, error };
  };

  const signInWithApple = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { data, error };
  };




  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    // Use Supabase's built-in password reset with custom redirect
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // Send custom branded email
    if (!error) {
      try {
        const resetLink = `${window.location.origin}/reset-password`;
        await supabase.functions.invoke('send-password-reset-email', {
          body: { email, resetLink }
        });
      } catch (err) {
        console.log('Custom email skipped');
      }
    }

    return { data, error };
  };


  const updateProfile = async (data: any) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(data).eq('id', user.id);
    if (!error) await loadProfile(user.id);
    return { error };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      userRecord,
      loading,
      isAdmin,
      adminRole,
      walletAddress,
      signUp, 
      signIn,
      signInWithOTP,
      verifyOTP,
      signInWithMagicLink,
      signInWithGoogle,
      signInWithGitHub,
      signInWithFacebook,
      signInWithApple,
      signOut, 
      resetPassword, 
      updateProfile,
      refreshUserRecord
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
