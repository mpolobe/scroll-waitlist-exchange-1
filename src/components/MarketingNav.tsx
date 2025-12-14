import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './auth/AuthModal';
import { Button } from './ui/button';
import { SmartWalletConnect } from './wallet/SmartWalletConnect';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MarketingNav = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    navigate('/');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSignIn = () => {
    navigate('/signup');
    setMobileMenuOpen(false);
  };


  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <img src="https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764284353488_fc5a167b.webp" alt="Africoin" className="h-10 w-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">Africoin</span>
          </div>
          
          <div className="hidden md:flex space-x-6 items-center">
            <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-orange-500 transition text-sm">Features</button>
            <button onClick={() => scrollToSection('rates')} className="text-gray-700 hover:text-orange-500 transition text-sm">Rates</button>
            <a href="/blog" className="text-gray-700 hover:text-orange-500 transition text-sm">Blog</a>
            <a href="/merchant" className="text-gray-700 hover:text-orange-500 transition text-sm">Merchant</a>
            <a href="/railway-booking" className="text-gray-700 hover:text-orange-500 transition text-sm">Book Tickets</a>
            <a href="/wallet" className="text-gray-700 hover:text-orange-500 transition text-sm">Wallet</a>
            
            <SmartWalletConnect />

            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                  <User className="h-4 w-4 mr-1" />Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button onClick={handleSignIn} size="sm" className="bg-gradient-to-r from-orange-500 to-purple-600">Sign In</Button>
            )}
          </div>


          <div className="md:hidden flex items-center gap-2">
            <SmartWalletConnect />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Features</button>
            <button onClick={() => scrollToSection('rates')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Exchange Rates</button>
            <a href="/blog" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Blog</a>
            <a href="/merchant" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Merchant Portal</a>
            <a href="/railway-booking" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Book Tickets</a>
            <a href="/wallet" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Wallet</a>
            {user ? (
              <>
                <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Dashboard</button>
                <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</button>
              </>
            ) : (
              <Button onClick={handleSignIn} className="mx-4 w-[calc(100%-2rem)] bg-gradient-to-r from-orange-500 to-purple-600">Sign In</Button>
            )}
          </div>
        )}

      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </nav>
  );
};

export default MarketingNav;
export { MarketingNav };
