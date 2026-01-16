import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SuiWalletProvider } from "@/contexts/SuiWalletContext";
import { SmartWalletProvider } from "@/contexts/SmartWalletContext";
import { AppProvider } from "@/contexts/AppContext";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Index from "@/pages/Index";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import MerchantPortal from "@/pages/MerchantPortal";
import RailwayBooking from "@/pages/RailwayBooking";
import WalletDashboard from "@/pages/WalletDashboard";
import Staking from "@/pages/Staking";
import Signup from "@/pages/Signup";
import AdminDashboard from "@/pages/AdminDashboard";
import UserDashboard from "@/pages/UserDashboard";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CookiePolicy from "@/pages/CookiePolicy";
import ContactUs from "@/pages/ContactUs";
import Partners from "@/pages/Partners";
import TrainTracking from "@/pages/TrainTracking";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import VerifyEmailSent from "@/pages/VerifyEmailSent";
import AuthCallback from "@/pages/AuthCallback";
import OAuthConsent from "@/pages/OAuthConsent";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SuiWalletProvider>
          <SmartWalletProvider>
            <AppProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/merchant" element={<MerchantPortal />} />
              <Route path="/railway-booking" element={<RailwayBooking />} />
              <Route path="/wallet" element={<WalletDashboard />} />
              <Route path="/staking" element={<Staking />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/tracking" element={<TrainTracking />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/oauth/consent" element={<OAuthConsent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            </AppProvider>
          </SmartWalletProvider>
        </SuiWalletProvider>
      </AuthProvider>
    </Router>
  );
}