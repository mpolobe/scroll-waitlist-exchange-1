import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AlchemyAccountProvider } from "@account-kit/react";
import { alchemyConfig } from "@/lib/alchemyConfig";
import { SmartWalletProvider } from "@/contexts/SmartWalletContext";
import { GeminiChatbot } from "@/components/ai/GeminiChatbot";
import Index from "./pages/Index";
import MerchantPortal from "./pages/MerchantPortal";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import UserDashboard from "./pages/UserDashboard";
import Signup from "./pages/Signup";
import VerifyEmailSent from "./pages/VerifyEmailSent";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import RailwayIntegration from "./pages/RailwayIntegration";
import Partners from "./pages/Partners";
import RailwayBooking from "./pages/RailwayBooking";
import TrainTracking from "./pages/TrainTracking";
import ContactUs from "./pages/ContactUs";
import WalletDashboard from "./pages/WalletDashboard";
import WalletAuth from "./pages/WalletAuth";
import AfricaRailwaysDemo from "./pages/AfricaRailwaysDemo";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider config={alchemyConfig} queryClient={queryClient}>
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
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/merchant" element={<MerchantPortal />} />
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
                <Route path="*" element={<NotFound />} />
              </Routes>
              <GeminiChatbot />
            </HashRouter>
          </TooltipProvider>
        </SmartWalletProvider>
      </AlchemyAccountProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
