import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface MerchantAuthProps {
  onAuthenticate: () => void;
}

const MerchantAuth = ({ onAuthenticate }: MerchantAuthProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ businessName: '', email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthenticate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Africoin Merchant Portal
          </h1>
          <p className="text-gray-600">{isSignup ? 'Create your merchant account' : 'Sign in to your account'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <Input placeholder="Business Name" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} required />
          )}
          <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <Input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-purple-600">{isSignup ? 'Sign Up' : 'Sign In'}</Button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignup(!isSignup)} className="text-orange-500 hover:underline">{isSignup ? 'Sign In' : 'Sign Up'}</button>
        </p>
      </Card>
    </div>
  );
};

export default MerchantAuth;
