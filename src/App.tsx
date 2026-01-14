import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AlchemyAccountProvider } from "@account-kit/react";
import { alchemyConfig, isAlchemyConfigured } from "@/lib/alchemyConfig";
import { SmartWalletProvider } from "@/contexts/SmartWalletContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GeminiChatbot } from "@/components/ai/GeminiChatbot";
import React from "react";

// Error boundary to catch initialization errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: 'system-ui' }}>
          <h1>Something went wrong</h1>
          <p style={{ color: '#666' }}>{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: 10, padding: '8px 16px', cursor: 'pointer' }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import Index from "./pages/Index";
import MerchantPortal from "./pages/MerchantPortal";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import UserDashboard from "./pages/UserDashboard";
import Signup from "./pages/Signup";
import VerifyEmailSent from "./pages/VerifyEmailSent";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import RailwayApi from "./pages/RailwayApi";
import NotFound from "./pages/NotFound";
import RailwayIntegration from "./pages/RailwayIntegration";
import Partners from "./pages/Partners";
import RailwayBooking from "./pages/RailwayBooking";
import TrainTracking from "./pages/TrainTracking";
import ContactUs from "./pages/ContactUs";
import WalletDashboard from "./pages/WalletDashboard";
import WalletAuth from "./pages/WalletAuth";
import AfricaRailwaysDemo from "./pages/AfricaRailwaysDemo";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Compliance from "./pages/Compliance";
import Staking from "./pages/Staking";

const queryClient = new QueryClient();

// Wrapper for Alchemy provider - only renders if configured
const AlchemyWrapper = ({ children }: { children: React.ReactNode }) => {
  if (isAlchemyConfigured && alchemyConfig) {
    return (
      <AlchemyAccountProvider config={alchemyConfig} queryClient={queryClient}>
        {children}
      </AlchemyAccountProvider>
    );
  }
  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AlchemyWrapper>
          <AuthProvider>
            <SmartWalletProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <HashRouter>
              <Routes>
              <Route path="/" element={<Index />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/merchant" element={<MerchantPortal />} />
                <Route path="/railway-api" element={<RailwayApi />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/railway" element={<RailwayIntegration />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/railway-booking" element={<RailwayBooking />} />
                <Route path="/train-tracking" element={<TrainTracking />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/wallet" element={<WalletDashboard />} />
                <Route path="/wallet-auth" element={<WalletAuth />} />
                <Route path="/africa-railways-demo" element={<AfricaRailwaysDemo />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/staking" element={<Staking />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <GeminiChatbot />
              </HashRouter>
              </TooltipProvider>
            </SmartWalletProvider>
          </AuthProvider>
        </AlchemyWrapper>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
