import React, { createContext, useContext } from "react";
import { useUser, useAccount, useSmartAccountClient, useAuthModal, useLogout } from "@account-kit/react";

const SmartWalletContext = createContext<any>(null);

export const SmartWalletProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Alchemy hooks - always call unconditionally (they return defaults when not configured)
  const alchemyUser = useUser();
  const { account, isLoadingAccount } = useAccount({ type: "ModularAccountV2" });
  const { client: alchemyClient } = useSmartAccountClient({ type: "ModularAccountV2" });
  const { openAuthModal } = useAuthModal();
  const { logout: alchemyLogout } = useLogout();

  const value = {
    alchemyUser,
    account,
    isLoadingAccount,
    alchemyClient,
    openAuthModal,
    alchemyLogout
    // Add additional wallet state and methods here as needed
  };

  return (
    <SmartWalletContext.Provider value={value}>
      {children}
    </SmartWalletContext.Provider>
  );
};

export const useSmartWallet = () => useContext(SmartWalletContext);