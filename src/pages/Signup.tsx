import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import SignupWithWallet from '@/components/auth/SignupWithWallet';
import LoginForm from '@/components/auth/LoginForm';
import { Shield, Zap, Wallet, UserPlus, LogIn } from 'lucide-react';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'login' ? 'login' : 'signup';
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>(defaultTab);

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
              
              {activeTab === 'signup' ? <SignupWithWallet /> : <LoginForm />}
              
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
