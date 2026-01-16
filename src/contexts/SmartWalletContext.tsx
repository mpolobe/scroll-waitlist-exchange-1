import React, { createContext, useContext, ReactNode } from 'react';
import { useSuiWallet } from './SuiWalletContext';

// Re-export SUI wallet functionality through SmartWallet interface for backward compatibility
interface SmartWalletContextType {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  suiBalance: string;
  afcBalance: string;
  afcBalanceRaw: bigint;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

const SmartWalletContext = createContext<SmartWalletContextType | undefined>(undefined);

interface SmartWalletProviderProps {
  children: ReactNode;
}

export const SmartWalletProvider: React.FC<SmartWalletProviderProps> = ({ children }) => {
  // This is now a pass-through - actual wallet logic is in SuiWalletContext
  return <>{children}</>;
};

export const useSmartWallet = (): SmartWalletContextType => {
  // Use SUI wallet under the hood
  const suiWallet = useSuiWallet();
  
  return {
    address: suiWallet.address,
    isConnected: suiWallet.isConnected,
    isLoading: suiWallet.isLoading,
    suiBalance: suiWallet.suiBalance,
    afcBalance: suiWallet.afcBalance,
    afcBalanceRaw: suiWallet.afcBalanceRaw,
    connect: suiWallet.connect,
    disconnect: suiWallet.disconnect,
    refreshBalance: suiWallet.refreshBalance,
  };
};

declare global {
  interface Window {
    ethereum?: any;
  }
}