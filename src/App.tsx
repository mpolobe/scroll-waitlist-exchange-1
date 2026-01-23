import React, { Component, ErrorInfo, ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SuiWalletProvider } from "@/contexts/SuiWalletContext";
import { SmartWalletProvider } from "@/contexts/SmartWalletContext";
import { AppProvider } from "@/contexts/AppContext";
import { ThirdwebWrapper } from "@/contexts/ThirdwebContext";
import { Toaster } from "@/components/ui/toaster";

// Error Boundary to catch and display runtime errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
          <h1 style={{ color: "#dc2626" }}>Something went wrong</h1>
          <p style={{ color: "#666" }}>An error occurred:</p>
          <pre style={{ background: "#f3f4f6", padding: "12px", borderRadius: "8px", overflow: "auto", fontSize: "14px" }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ background: "#f3f4f6", padding: "12px", borderRadius: "8px", overflow: "auto", fontSize: "12px", color: "#666", marginTop: "8px" }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: "16px", padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Pages
import Index from "@/pages/Index";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Reviews from "@/pages/Reviews";
import ReviewDetail from "@/pages/ReviewDetail";
import Promoter from "@/pages/Promoter";
import SocialHandles from "@/pages/SocialHandles";
import PressKit from "@/pages/PressKit";
import NetworkMap from "@/pages/NetworkMap";
import InvestorDeck from "@/pages/InvestorDeck";
import InfluencerKit from "@/pages/InfluencerKit";
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
import SentIdo from "@/pages/SentIdo";
import Airdrop from "@/pages/Airdrop";
import AirdropHelp from "@/pages/AirdropHelp";
import AirdropAdminDashboard from "@/pages/admin/Dashboard";

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThirdwebWrapper>
          <AuthProvider>
            <SuiWalletProvider>
              <SmartWalletProvider>
                <AppProvider>
                  <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/reviews/:id" element={<ReviewDetail />} />
                <Route path="/promoter" element={<Promoter />} />
                <Route path="/social-handles" element={<SocialHandles />} />
                <Route path="/press-kit" element={<PressKit />} />
                <Route path="/network-map" element={<NetworkMap />} />
                <Route path="/investor-deck" element={<InvestorDeck />} />
                <Route path="/influencer-kit" element={<InfluencerKit />} />
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
                <Route path="/ido" element={<SentIdo />} />
                <Route path="/sent-ido" element={<SentIdo />} />
                <Route path="/airdrop" element={<Airdrop />} />
                <Route path="/airdrop/help" element={<AirdropHelp />} />
                <Route path="/airdrop/admin" element={<AirdropAdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              </AppProvider>
            </SmartWalletProvider>
          </SuiWalletProvider>
        </AuthProvider>
        </ThirdwebWrapper>
      </Router>
    </ErrorBoundary>
  );
}