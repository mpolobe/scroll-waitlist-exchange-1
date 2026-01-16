import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { isAlchemyConfigured } from "@/lib/alchemyConfig";
import { SmartWalletProvider } from "@/contexts/SmartWalletContext";
import Index from "@/pages/Index";
import WalletDashboard from "@/pages/WalletDashboard";

// Conditionally resolve AlchemyAccountProvider at runtime (if configured/package present)
let AlchemyAccountProvider: React.FC<{children: React.ReactNode}> = ({ children }) => <>{children}</>;
if (isAlchemyConfigured()) {
  try {
    // Only require if you are sure @account-kit/react is installed.
    AlchemyAccountProvider = require("@account-kit/react").AlchemyAccountProvider;
  } catch (err) {
    // Package not installed, fall back to passthrough
    console.warn("AlchemyAccountProvider unavailable:", err);
  }
}

export default function App() {
  return (
    <Router>
      <AlchemyAccountProvider>
        <SmartWalletProvider>
          {/* Your app routes and structure */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/wallet" element={<WalletDashboard />} />
            {/* ...additional routes as needed... */}
          </Routes>
        </SmartWalletProvider>
      </AlchemyAccountProvider>
    </Router>
  );
}