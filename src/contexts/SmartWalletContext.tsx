import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SmartWalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const SmartWalletContext = createContext<SmartWalletContextType | undefined>(undefined);

interface SmartWalletProviderProps {
  children: ReactNode;
}

export const SmartWalletProvider: React.FC<SmartWalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      }
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
  };

  const value = { address, isConnected, connect, disconnect };

  return (
    <SmartWalletContext.Provider value={value}>
      {children}
    </SmartWalletContext.Provider>
  );
};

export const useSmartWallet = () => {
  const context = useContext(SmartWalletContext);
  if (!context) {
    throw new Error('useSmartWallet must be used within SmartWalletProvider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}