import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import SignupWithWallet from '@/components/auth/SignupWithWallet';
import LoginForm from '@/components/auth/LoginForm';
import { PhoneLoginForm } from '@/components/auth/PhoneLoginForm';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { Shield, Zap, Wallet, UserPlus, LogIn, Smartphone } from 'lucide-react';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'login' ? 'login' : 'signup';
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>(defaultTab);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google'>('email');

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      
      <main className="flex-grow bg-gradient-to-br from-orange-50 to-purple-50 py-12 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
              {activeTab === 'signup' ? 'Join Africoin Today' : 'Welcome Back'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {activeTab === 'signup' 
                ? 'Create your account and get a secure smart wallet automatically' 
                : 'Sign in to access your Africoin wallet and services'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Get</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                    <div className="p-2 bg-orange-500 rounded-lg"><Wallet className="w-5 h-5 text-white" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Smart Wallet Created Automatically</h3>
                      <p className="text-sm text-gray-600 mt-1">Your Alchemy-powered smart wallet is created when you sign up.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="p-2 bg-purple-500 rounded-lg"><Zap className="w-5 h-5 text-white" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Gas-Free Transactions</h3>
                      <p className="text-sm text-gray-600 mt-1">We sponsor your gas fees so you can send and receive without paying network costs.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="p-2 bg-green-500 rounded-lg"><Shield className="w-5 h-5 text-white" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Self-Custodial Security</h3>
                      <p className="text-sm text-gray-600 mt-1">You control your keys. Your wallet is secured by Alchemy's Account Kit.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 border">
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button onClick={() => setActiveTab('signup')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'signup' ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  <UserPlus className="w-4 h-4" />Sign Up
                </button>
                <button onClick={() => setActiveTab('login')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'login' ? 'bg-white shadow text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  <LogIn className="w-4 h-4" />Sign In
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                  onClick={() => setAuthMethod('email')}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    authMethod === 'email'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Email
                </button>
                <button
                  onClick={() => setAuthMethod('phone')}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    authMethod === 'phone'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  OTP
                </button>
                <button
                  onClick={() => setAuthMethod('google')}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    authMethod === 'google'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
              </div>
              
              {authMethod === 'phone' ? (
                <PhoneLoginForm mode={activeTab} onBack={() => setAuthMethod('email')} />
              ) : authMethod === 'google' ? (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {activeTab === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Quick and secure authentication using your Google account
                    </p>
                    <SocialLoginButtons />
                  </div>
                  <button 
                    onClick={() => setAuthMethod('email')} 
                    className="text-sm text-gray-600 hover:text-gray-900 w-full text-center"
                  >
                    ← Back to other options
                  </button>
                </div>
              ) : (
                activeTab === 'signup' ? <SignupWithWallet /> : <LoginForm />
              )}
              
              <p className="text-center text-sm text-gray-600 mt-6">
                {activeTab === 'signup' ? (
                  <>Already have an account? <button onClick={() => setActiveTab('login')} className="text-purple-600 hover:text-purple-700 font-semibold">Sign In</button></>
                ) : (
                  <>Don't have an account? <button onClick={() => setActiveTab('signup')} className="text-orange-600 hover:text-orange-700 font-semibold">Sign Up</button></>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
};

export default Signup;
