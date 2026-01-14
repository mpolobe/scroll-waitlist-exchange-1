/**
 * Hybrid Smart Wallet Context
 * 
 * Supports two wallet systems:
 * 1. Alchemy Account Kit (EVM) - For Polygon/Ethereum with gas sponsorship
 * 2. Phone-based Wallet (SUI) - For SUI blockchain via SMS OTP
 * 
 * Use Cases:
 * - Alchemy: Railway ticketing, staff operations (gas-free), social login
 * - Phone: African mobile users, SUI staking, USSD integration
 */

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlchemyAccountProvider, useUser, useSmartAccountClient, useLogout, useAccount } from '@account-kit/react';
import { alchemyConfig, isAlchemyConfigured, networkInfo } from '@/lib/alchemyConfig';
import { phoneWalletService, WalletSession, WalletBalance } from '@/services/phoneWalletService';
import { otpService } from '@/services/otpService';

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  token: string;
  to?: string;
  from?: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  txHash: string;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  icon: string;
}

type WalletType = 'alchemy' | 'phone' | null;

interface SmartWalletContextType {
  // Connection state
  walletType: WalletType;
  address: string | null;
  evmAddress: string | null;  // Alchemy/Polygon address
  suiAddress: string | null;  // SUI address from phone wallet
  afcAddress: string | null;  // AFC EVM address from phone wallet
  phoneNumber: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isLoadingBalances: boolean;
  
  // Feature flags
  isAlchemyAvailable: boolean;
  isPhoneWalletAvailable: boolean;
  
  // Balances
  balance: string;
  tokens: TokenBalance[];
  walletBalance: WalletBalance | null;
  
  // Transactions
  transactions: Transaction[];
  
  // Auth flow state
  authStep: 'idle' | 'phone' | 'otp' | 'authenticated';
  authError: string | null;
  
  // Network info
  network: typeof networkInfo;
  
  // Alchemy client (for EVM transactions)
  alchemyClient: ReturnType<typeof useSmartAccountClient>['client'] | null;
  
  // Actions - Phone wallet
  sendOTP: (phoneNumber: string) => Promise<boolean>;
  verifyOTP: (phoneNumber: string, code: string) => Promise<boolean>;
  
  // Actions - General
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
  switchWalletType: (type: WalletType) => void;
  
  // Transaction helpers
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
}

const SmartWalletContext = createContext<SmartWalletContextType | undefined>(undefined);

const STORAGE_KEY = 'africoin_transactions';

// Inner provider that uses Alchemy hooks (only rendered when Alchemy is available)
function AlchemyWalletProvider({ 
  children, 
  onAlchemyState 
}: { 
  children: ReactNode;
  onAlchemyState: (state: { address: string | null; isConnected: boolean; isLoading: boolean; client: unknown }) => void;
}) {
  const user = useUser();
  const { account, isLoadingAccount } = useAccount({ type: "ModularAccountV2" });
  const { client } = useSmartAccountClient({ type: "ModularAccountV2" });
  const { logout } = useLogout();

  const address = account?.address || null;
  const isConnected = !!user && !!address;

  useEffect(() => {
    onAlchemyState({
      address,
      isConnected,
      isLoading: isLoadingAccount,
      client,
    });
  }, [address, isConnected, isLoadingAccount, client, onAlchemyState]);

  return <>{children}</>;
}

// Main provider component
function SmartWalletProviderInner({ children }: { children: ReactNode }) {
  // Wallet type selection
  const [walletType, setWalletType] = useState<WalletType>(null);
  
  // Alchemy state (from inner provider)
  const [alchemyState, setAlchemyState] = useState<{
    address: string | null;
    isConnected: boolean;
    isLoading: boolean;
    client: unknown;
  }>({ address: null, isConnected: false, isLoading: false, client: null });
  
  // Phone wallet state
  const [phoneSession, setPhoneSession] = useState<WalletSession | null>(null);
  const [authStep, setAuthStep] = useState<'idle' | 'phone' | 'otp' | 'authenticated'>('idle');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Balance state
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load existing phone session on mount
  useEffect(() => {
    const existingSession = phoneWalletService.getSession();
    if (existingSession) {
      setPhoneSession(existingSession);
      setAuthStep('authenticated');
      setWalletType('phone');
    }
  }, []);

  // Auto-detect Alchemy connection
  useEffect(() => {
    if (alchemyState.isConnected && !walletType) {
      setWalletType('alchemy');
    }
  }, [alchemyState.isConnected, walletType]);

  // Determine current connection state
  const isConnected = walletType === 'alchemy' 
    ? alchemyState.isConnected 
    : (walletType === 'phone' && authStep === 'authenticated' && !!phoneSession);

  const address = walletType === 'alchemy' 
    ? alchemyState.address 
    : phoneSession?.suiAddress || null;

  // Load transactions from localStorage
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${address}`);
      if (stored) {
        const parsed = JSON.parse(stored).map((tx: Transaction & { timestamp: string }) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        }));
        setTransactions(parsed);
      }
    }
  }, [address]);

  // Save transactions to localStorage
  useEffect(() => {
    if (address && transactions.length > 0) {
      localStorage.setItem(`${STORAGE_KEY}_${address}`, JSON.stringify(transactions));
    }
  }, [transactions, address]);

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!isConnected) return;
    
    setIsLoadingBalances(true);
    try {
      if (walletType === 'phone' && phoneSession) {
        const balances = await phoneWalletService.getBalances();
        if (balances) {
          setWalletBalance(balances);
          setTokens([
            { symbol: 'SUI', name: 'Sui', balance: balances.sui, usdValue: balances.suiUsd, icon: 'SUI' },
            { symbol: 'AFC', name: 'Africoin', balance: balances.afc, usdValue: balances.afcUsd, icon: 'AFC' },
          ]);
        }
      }
      // Alchemy balances would be fetched differently via their SDK
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [isConnected, walletType, phoneSession]);

  useEffect(() => {
    if (isConnected) {
      fetchBalances();
    }
  }, [isConnected, fetchBalances]);

  // Phone wallet: Send OTP
  const sendOTP = useCallback(async (phoneNumber: string): Promise<boolean> => {
    setIsConnecting(true);
    setAuthError(null);
    setWalletType('phone');
    
    try {
      const validation = otpService.validatePhoneNumber(phoneNumber);
      if (!validation.valid) {
        setAuthError(validation.error || 'Invalid phone number');
        return false;
      }

      if (!otpService.isConfigured()) {
        // Demo mode: auto-authenticate
        console.warn('SMS service not configured. Using demo mode.');
        const newSession = await phoneWalletService.authenticate(phoneNumber);
        setPhoneSession(newSession);
        setAuthStep('authenticated');
        return true;
      }

      const result = await otpService.sendOTP(phoneNumber);
      if (result.success) {
        setAuthStep('otp');
        return true;
      } else {
        setAuthError(result.error || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to send OTP');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Phone wallet: Verify OTP
  const verifyOTP = useCallback(async (phoneNumber: string, code: string): Promise<boolean> => {
    setIsConnecting(true);
    setAuthError(null);
    
    try {
      if (!otpService.isConfigured()) {
        if (code.length === 6 && /^\d+$/.test(code)) {
          const newSession = await phoneWalletService.authenticate(phoneNumber);
          setPhoneSession(newSession);
          setAuthStep('authenticated');
          return true;
        } else {
          setAuthError('Invalid code format. Enter 6 digits.');
          return false;
        }
      }

      const verification = otpService.verifyOTP(phoneNumber, code);
      if (!verification.valid) {
        setAuthError(verification.error || 'Invalid OTP');
        return false;
      }

      const newSession = await phoneWalletService.authenticate(phoneNumber);
      setPhoneSession(newSession);
      setAuthStep('authenticated');
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Verification failed');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (walletType === 'phone') {
      phoneWalletService.logout();
      otpService.clearOTP(phoneSession?.phoneNumber || '');
      setPhoneSession(null);
      setAuthStep('idle');
    }
    // Alchemy logout is handled by their SDK
    setWalletType(null);
    setWalletBalance(null);
    setTokens([]);
    setTransactions([]);
    setAuthError(null);
  }, [walletType, phoneSession?.phoneNumber]);

  // Switch wallet type
  const switchWalletType = useCallback((type: WalletType) => {
    if (type !== walletType) {
      disconnect();
      setWalletType(type);
      if (type === 'phone') {
        setAuthStep('phone');
      }
    }
  }, [walletType, disconnect]);

  // Transaction helpers
  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = { ...tx, id: `tx_${Date.now()}`, timestamp: new Date() };
    setTransactions(prev => [newTx, ...prev].slice(0, 50));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
  }, []);

  // Computed balance
  const balance = useMemo(() => {
    if (!walletBalance) return '0.00';
    const total = parseFloat(walletBalance.suiUsd) + parseFloat(walletBalance.afcUsd);
    return total.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }, [walletBalance]);

  const value = useMemo(() => ({
    walletType,
    address,
    evmAddress: alchemyState.address,
    suiAddress: phoneSession?.suiAddress || null,
    afcAddress: phoneSession?.afcAddress || null,
    phoneNumber: phoneSession?.phoneNumber || null,
    isConnected,
    isConnecting: isConnecting || alchemyState.isLoading,
    isLoadingBalances,
    isAlchemyAvailable: isAlchemyConfigured,
    isPhoneWalletAvailable: true,
    balance,
    tokens,
    walletBalance,
    transactions,
    authStep,
    authError,
    network: networkInfo,
    alchemyClient: alchemyState.client as ReturnType<typeof useSmartAccountClient>['client'] | null,
    sendOTP,
    verifyOTP,
    disconnect,
    refreshBalances: fetchBalances,
    switchWalletType,
    addTransaction,
    updateTransaction,
  }), [
    walletType, address, alchemyState, phoneSession, isConnected, isConnecting,
    isLoadingBalances, balance, tokens, walletBalance, transactions, authStep,
    authError, sendOTP, verifyOTP, disconnect, fetchBalances, switchWalletType,
    addTransaction, updateTransaction,
  ]);

  // Wrap with Alchemy provider if configured
  const content = (
    <SmartWalletContext.Provider value={value}>
      {children}
    </SmartWalletContext.Provider>
  );

  if (isAlchemyConfigured && alchemyConfig) {
    return (
      <AlchemyAccountProvider config={alchemyConfig} queryClient={new QueryClient()}>
        <AlchemyWalletProvider onAlchemyState={setAlchemyState}>
          {content}
        </AlchemyWalletProvider>
      </AlchemyAccountProvider>
    );
  }

  return content;
}

// Export the provider
export function SmartWalletProvider({ children }: { children: ReactNode }) {
  return <SmartWalletProviderInner>{children}</SmartWalletProviderInner>;
}

// Hook to use the wallet context
export const useSmartWallet = () => {
  const context = useContext(SmartWalletContext);
  if (!context) {
    throw new Error('useSmartWallet must be used within SmartWalletProvider');
  }
  return context;
};
