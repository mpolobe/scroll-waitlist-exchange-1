import React from "react";
import { isAlchemyConfigured } from '@/lib/alchemyConfig';
import { phoneWalletService, WalletSession, WalletBalance } from '@/services/phoneWalletService';
import { otpService } from '@/services/otpService';

// Dynamic placeholders for account kit exports
let AlchemyAccountProvider: React.ComponentType<any> | null = null;
let useUser: () => unknown = () => null;
let useAccount: (opts: unknown) => { account: { address: string } | null; isLoadingAccount: boolean } = () => ({ account: null, isLoadingAccount: false });
let useSmartAccountClient: (opts: unknown) => { client: unknown } = () => ({ client: null });
let useAuthModal: () => { openAuthModal: () => void } = () => ({ openAuthModal: () => {} });
let useLogout: () => { logout: () => void } = () => ({ logout: () => {} });

if (isAlchemyConfigured) {
  try {
    const accountKit = require('@account-kit/react');
    AlchemyAccountProvider = accountKit.AlchemyAccountProvider;
    useUser = accountKit.useUser;
    useAccount = accountKit.useAccount;
    useSmartAccountClient = accountKit.useSmartAccountClient;
    useAuthModal = accountKit.useAuthModal;
    useLogout = accountKit.useLogout;
  } catch (e) {
    console.warn('Alchemy Account Kit not available');
  }
}

// Dummy hooks for fallback, export actual/dummy as needed based on config:
const useUserDummy = () => null;
const useAccountDummy = () => ({ account: null, isLoadingAccount: false });
const useSmartAccountClientDummy = () => ({ client: null });
const useAuthModalDummy = () => ({ openAuthModal: () => {} });
const useLogoutDummy = () => ({ logout: () => {} });

export const SmartWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isAlchemyConfigured && AlchemyAccountProvider) {
    return <AlchemyAccountProvider>{children}</AlchemyAccountProvider>;
  }
  return <>{children}</>;
};

export const useSmartWalletUser = isAlchemyConfigured ? useUser : useUserDummy;
export const useSmartWalletAccount = isAlchemyConfigured ? useAccount : useAccountDummy;
export const useSmartWalletClient = isAlchemyConfigured ? useSmartAccountClient : useSmartAccountClientDummy;
export const useSmartWalletAuthModal = isAlchemyConfigured ? useAuthModal : useAuthModalDummy;
export const useSmartWalletLogout = isAlchemyConfigured ? useLogout : useLogoutDummy;
