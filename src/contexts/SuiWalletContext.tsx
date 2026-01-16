import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { useAuth } from './AuthContext';

// AFC Token on SUI Mainnet
const AFC_COIN_TYPE = import.meta.env.VITE_AFC_COIN_TYPE || 
  '0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC';

const SUI_NETWORK = import.meta.env.VITE_SUI_NETWORK || 'mainnet';

interface SuiWalletContextType {
  // Wallet state
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  
  // Balances
  suiBalance: string;
  afcBalance: string;
  afcBalanceRaw: bigint;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  
  // Keypair access (for signing transactions)
  getKeypair: () => Ed25519Keypair | null;
}

const SuiWalletContext = createContext<SuiWalletContextType | undefined>(undefined);

interface SuiWalletProviderProps {
  children: ReactNode;
}

export const SuiWalletProvider: React.FC<SuiWalletProviderProps> = ({ children }) => {
  const { user, walletAddress: authWalletAddress } = useAuth();
  
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suiBalance, setSuiBalance] = useState('0');
  const [afcBalance, setAfcBalance] = useState('0');
  const [afcBalanceRaw, setAfcBalanceRaw] = useState<bigint>(BigInt(0));
  const [keypair, setKeypair] = useState<Ed25519Keypair | null>(null);
  
  // Initialize SUI client
  const suiClient = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet') });

  // Generate or retrieve wallet for user
  const initializeWallet = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      // Check if we have a stored private key for this user
      const storedKey = localStorage.getItem(`sui_private_key_${userId}`);
      
      let kp: Ed25519Keypair;
      
      if (storedKey) {
        // Restore existing keypair
        try {
          kp = Ed25519Keypair.fromSecretKey(storedKey);
        } catch {
          // Invalid key, generate new one
          kp = new Ed25519Keypair();
          localStorage.setItem(`sui_private_key_${userId}`, kp.getSecretKey());
        }
      } else {
        // Generate new keypair
        kp = new Ed25519Keypair();
        localStorage.setItem(`sui_private_key_${userId}`, kp.getSecretKey());
      }
      
      const walletAddress = kp.toSuiAddress();
      
      setKeypair(kp);
      setAddress(walletAddress);
      setIsConnected(true);
      
      // Fetch balances
      await fetchBalances(walletAddress);
      
      return walletAddress;
    } catch (error) {
      console.error('Failed to initialize SUI wallet:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch SUI and AFC balances
  const fetchBalances = async (walletAddress: string) => {
    try {
      // Fetch SUI balance
      const suiBalanceResult = await suiClient.getBalance({
        owner: walletAddress,
      });
      const suiAmount = BigInt(suiBalanceResult.totalBalance);
      setSuiBalance(formatBalance(suiAmount, 9)); // SUI has 9 decimals
      
      // Fetch AFC balance
      try {
        const afcBalanceResult = await suiClient.getBalance({
          owner: walletAddress,
          coinType: AFC_COIN_TYPE,
        });
        const afcAmount = BigInt(afcBalanceResult.totalBalance);
        setAfcBalanceRaw(afcAmount);
        setAfcBalance(formatBalance(afcAmount, 9)); // AFC has 9 decimals
      } catch (afcError) {
        // AFC token might not exist for this address yet
        console.log('No AFC balance found:', afcError);
        setAfcBalance('0');
        setAfcBalanceRaw(BigInt(0));
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  };

  // Format balance with decimals
  const formatBalance = (amount: bigint, decimals: number): string => {
    const divisor = BigInt(10 ** decimals);
    const integerPart = amount / divisor;
    const fractionalPart = amount % divisor;
    
    if (fractionalPart === BigInt(0)) {
      return integerPart.toString();
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    // Trim trailing zeros
    const trimmed = fractionalStr.replace(/0+$/, '');
    
    if (trimmed === '') {
      return integerPart.toString();
    }
    
    return `${integerPart}.${trimmed.slice(0, 4)}`; // Max 4 decimal places
  };

  // Auto-connect when user logs in
  useEffect(() => {
    if (user?.id) {
      // Use authWalletAddress if available, otherwise initialize new wallet
      if (authWalletAddress) {
        setAddress(authWalletAddress);
        setIsConnected(true);
        
        // Try to restore keypair
        const storedKey = localStorage.getItem(`sui_private_key_${user.id}`);
        if (storedKey) {
          try {
            const kp = Ed25519Keypair.fromSecretKey(storedKey);
            setKeypair(kp);
          } catch {
            // Key invalid, will need to regenerate
          }
        }
        
        fetchBalances(authWalletAddress);
      } else {
        initializeWallet(user.id);
      }
    } else {
      // User logged out
      setAddress(null);
      setIsConnected(false);
      setKeypair(null);
      setSuiBalance('0');
      setAfcBalance('0');
      setAfcBalanceRaw(BigInt(0));
    }
  }, [user?.id, authWalletAddress, initializeWallet]);

  // Manual connect (for UI button)
  const connect = async () => {
    if (user?.id) {
      await initializeWallet(user.id);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setKeypair(null);
    setSuiBalance('0');
    setAfcBalance('0');
    setAfcBalanceRaw(BigInt(0));
  };

  // Refresh balances
  const refreshBalance = async () => {
    if (address) {
      setIsLoading(true);
      await fetchBalances(address);
      setIsLoading(false);
    }
  };

  // Get keypair for signing
  const getKeypair = () => keypair;

  const value: SuiWalletContextType = {
    address,
    isConnected,
    isLoading,
    suiBalance,
    afcBalance,
    afcBalanceRaw,
    connect,
    disconnect,
    refreshBalance,
    getKeypair,
  };

  return (
    <SuiWalletContext.Provider value={value}>
      {children}
    </SuiWalletContext.Provider>
  );
};

export const useSuiWallet = () => {
  const context = useContext(SuiWalletContext);
  if (!context) {
    throw new Error('useSuiWallet must be used within SuiWalletProvider');
  }
  return context;
};

export default SuiWalletContext;
