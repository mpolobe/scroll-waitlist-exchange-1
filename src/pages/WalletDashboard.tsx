import React, { useState } from "react";
import { AuthMethodSelector } from "@/components/wallet/AuthMethodSelector";

const WalletDashboard: React.FC = () => {
  // Example: simple local state for connection
  const [isConnecting, setIsConnecting] = useState(false);

  // These handler stubs can be replaced with real logic as needed
  const [open, setOpen] = useState(true);
  const handleSelectMethod = () => {};

  return (
    <AuthMethodSelector
      open={open}
      onOpenChange={setOpen}
      onSelectMethod={handleSelectMethod}
      isAuthenticating={isConnecting}
    />
  );
};

export default WalletDashboard;