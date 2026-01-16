import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, AuthResponse } from '@supabase/supabase-js';
import { setupZkLogin } from '@/lib/zkLogin';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  country?: string;
  phone?: string;
}

interface UserRecord {
  id: string;
  email: string;
  full_name?: string;
  country?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  userRecord: UserRecord | null;
  loading: boolean;
  isAdmin: boolean;
  adminRole: string | null;
  walletAddress: string | null;
  signUp: (email: string, password: string, fullName: string, country: string, phone?: string) => Promise<AuthResponse>;
  signUpWithPhone: (phone: string, fullName: string, country: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signInWithPhone: (phone: string) => Promise<AuthResponse>;
  signInWithOTP: (email: string) => Promise<AuthResponse>;
  verifyOTP: (email: string, token: string) => Promise<AuthResponse>;
  verifyPhoneOTP: (phone: string, token: string) => Promise<AuthResponse>;
  signInWithMagicLink: (email: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signInWithGitHub: () => Promise<AuthResponse>;
  signInWithFacebook: () => Promise<AuthResponse>;
  signInWithApple: () => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ data: UserProfile | null; error: Error | null }>;
  refreshUserRecord: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);


  useEffect(() => {
    // Add timeout to prevent infinite loading if Supabase is unreachable
    const timeoutId = setTimeout(() => {
      console.warn('Auth session check timed out');
      setLoading(false);
    }, 5000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeoutId);
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
          syncOAuthProfile(session.user);
        }
        setLoading(false);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('Auth session error:', error);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
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
        // Profile sync failed - non-critical, continue
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



  const signUp = async (email: string, password: string, fullName: string, country: string, phone?: string) => {
    try {
      // Use Supabase's built-in email confirmation
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            country: country
          }
        }
      });
      
      if (error) {
        // Provide more helpful error messages
        if (error.message.includes('email') && error.message.includes('confirmation')) {
          return { 
            data, 
            error: { 
              ...error, 
              message: 'Account created but email confirmation could not be sent. Please try signing in or use OTP/Magic Link instead.' 
            } 
          };
        }
        return { data, error };
      }
      
      if (data.user) {
        // Create user record in our users table
        await supabase.from('users').insert({ 
          id: data.user.id, 
          email, 
          phone: phone || null,
          full_name: fullName,
          country,
          email_verified: false
        }).catch(err => {
          console.warn('Failed to create user record:', err);
        });
      }
      return { data, error };
    } catch (err: any) {
      return { 
        data: { user: null, session: null }, 
        error: { message: err.message || 'Signup failed. Please try again.' } 
      };
    }
  };


  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUpWithPhone = async (phone: string, fullName: string, country: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true }
    });
    
    if (!error && data) {
      // Store user info for after verification
      sessionStorage.setItem('pending_user_info', JSON.stringify({ phone, fullName, country }));
    }
    
    return { data, error };
  };

  const signInWithPhone = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: false }
    });
    return { data, error };
  };

  const verifyPhoneOTP = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    
    if (!error && data.user) {
      // Check/Create Sui Wallet
      let walletAddress: string | null = null;
      
      // Check existing
      const { data: existingUser } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', data.user.id)
        .single();
        
      if (existingUser?.wallet_address) {
        walletAddress = existingUser.wallet_address;
      } else {
        // Generate new Sui Keypair
        const kp = new Ed25519Keypair();
        walletAddress = kp.toSuiAddress();
        // Store private key locally
        localStorage.setItem(`sui_private_key_${data.user.id}`, kp.getSecretKey());
      }

      const pendingInfo = sessionStorage.getItem('pending_user_info');
      if (pendingInfo) {
        const { fullName, country } = JSON.parse(pendingInfo);
        await supabase.from('users').insert({
          id: data.user.id,
          phone,
          full_name: fullName,
          country,
          email_verified: false,
          wallet_address: walletAddress
        });
        sessionStorage.removeItem('pending_user_info');
      } else if (walletAddress && !existingUser?.wallet_address) {
        // Update existing user with new wallet
        await supabase.from('users').update({ wallet_address: walletAddress }).eq('id', data.user.id);
      }
      
      if (walletAddress) setWalletAddress(walletAddress);
    }
    
    return { data, error };
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

    if (!error && data.user) {
      // Check/Create Sui Wallet
      let walletAddress: string | null = null;
      
      // Check existing
      const { data: existingUser } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', data.user.id)
        .single();
        
      if (existingUser?.wallet_address) {
        walletAddress = existingUser.wallet_address;
      } else {
        // Generate new Sui Keypair
        const kp = new Ed25519Keypair();
        walletAddress = kp.toSuiAddress();
        // Store private key locally
        localStorage.setItem(`sui_private_key_${data.user.id}`, kp.getSecretKey());
        
        // Update user with new wallet
        await supabase.from('users').update({ wallet_address: walletAddress }).eq('id', data.user.id);
      }
      
      if (walletAddress) setWalletAddress(walletAddress);
    }

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
      options: { 
        redirectTo: `${window.location.origin}/`
      },
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
        // Custom email failed - using default Supabase email
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
      signUpWithPhone,
      signIn,
      signInWithPhone,
      signInWithOTP,
      verifyOTP,
      verifyPhoneOTP,
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
