import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './auth/AuthModal';
import { Button } from './ui/button';
import { SmartWalletConnect } from './wallet/SmartWalletConnect';
import { User, LogOut, Menu, X, Shield, ChevronDown, Map, FileText, Presentation, Users } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const MarketingNav = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  const handleSignUp = () => {
    navigate('/signup');
    setMobileMenuOpen(false);
  };

  const handleSignIn = () => {
    navigate('/signup?tab=login');
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
            <Link to="/reviews" className="text-gray-700 hover:text-orange-500 transition text-sm font-medium">Reviews</Link>
            <Link to="/blog" className="text-gray-700 hover:text-orange-500 transition text-sm">Blog</Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-700 hover:text-orange-500 transition text-sm flex items-center gap-1">
                Promoter <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/social-handles" className="flex items-center gap-2 cursor-pointer">
                    <Users className="w-4 h-4" /> Social Handles
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/promoter" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="w-4 h-4" /> Social Templates
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/network-map" className="flex items-center gap-2 cursor-pointer">
                    <Map className="w-4 h-4" /> Network Map
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/press-kit" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="w-4 h-4" /> Press Kit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/investor-deck" className="flex items-center gap-2 cursor-pointer">
                    <Presentation className="w-4 h-4" /> Investor Deck
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/influencer-kit" className="flex items-center gap-2 cursor-pointer">
                    <Users className="w-4 h-4" /> Influencer Kit
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/railway-booking" className="text-gray-700 hover:text-orange-500 transition text-sm">Book Tickets</Link>
            <Link to="/wallet" className="text-gray-700 hover:text-orange-500 transition text-sm">Wallet</Link>
            <Link to="/staking" className="text-gray-700 hover:text-orange-500 transition text-sm font-medium">Staking</Link>
            <Link to="/ido" className="text-purple-600 hover:text-purple-700 transition text-sm font-semibold">🛡️ SENT IDO</Link>
            
            <a 
              href="https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold blink-blue">
                🚀 Buy AFC
              </Button>
            </a>
            
            <SmartWalletConnect />

            {user && (
              <>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                    <Shield className="h-4 w-4 mr-1" />Admin
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                  <User className="h-4 w-4 mr-1" />Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
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
            <Link to="/reviews" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium">Reviews</Link>
            <Link to="/blog" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Blog</Link>
            <Link to="/social-handles" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Social Handles</Link>
            <Link to="/promoter" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Social Templates</Link>
            <Link to="/network-map" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Network Map</Link>
            <Link to="/press-kit" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Press Kit</Link>
            <Link to="/investor-deck" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Investor Deck</Link>
            <Link to="/influencer-kit" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Influencer Kit</Link>
            <Link to="/railway-booking" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Book Tickets</Link>
            <Link to="/wallet" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Wallet</Link>
            <Link to="/staking" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium">Staking</Link>
            <Link to="/ido" className="block px-4 py-2 text-purple-600 hover:bg-purple-50 font-semibold">🛡️ SENT IDO</Link>
            <div className="px-4 py-2">
              <a 
                href="https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold blink-blue">
                  🚀 Buy AFC on Sui Mainnet
                </Button>
              </a>
            </div>
            {user ? (
              <>
                {isAdmin && (
                  <button onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Admin Dashboard</button>
                )}
                <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Dashboard</button>
                <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</button>
              </>
            ) : (
              <>
                <button onClick={handleSignIn} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Sign In</button>
                <Button onClick={handleSignUp} className="mx-4 w-[calc(100%-2rem)] bg-gradient-to-r from-orange-500 to-purple-600">Sign Up</Button>
              </>
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
