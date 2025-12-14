import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MarketingFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };


  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764284353488_fc5a167b.webp" 
                alt="Africoin" 
                className="h-10 w-10"
              />
              <span className="text-xl font-bold">Africoin</span>
            </div>
            <p className="text-gray-400 text-sm">
              The future of African digital currency. Fast, secure, and accessible to everyone.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-white">Features</button></li>
              <li><button onClick={() => scrollToSection('rates')} className="hover:text-white">Exchange Rates</button></li>
              <li><button onClick={() => scrollToSection('integration')} className="hover:text-white">Integration</button></li>
              <li><button onClick={handleSignUp} className="hover:text-white">Sign Up</button></li>

            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="/blog" className="hover:text-white">Blog</a></li>
              <li><a href="/merchant" className="hover:text-white">Merchant Portal</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Press Kit</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>

            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Partners</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://africarailways.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Africa Railways</a></li>
            </ul>
          </div>




          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white">Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 Africoin. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default MarketingFooter;
export { MarketingFooter };

