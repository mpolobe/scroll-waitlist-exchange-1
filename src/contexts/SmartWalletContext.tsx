import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import { useUser, useSmartAccountClient, useLogout, useAccount, AlchemyAccountProvider } from '@account-kit/react';
import { type Address } from 'viem';
import { getEthBalance, getTokenBalances, getTokenMetadata, formatTokenBalance } from '@/lib/tokenService';
import { useAuth } from '@/contexts/AuthContext';
import { alchemyConfig } from '@/lib/alchemyConfig';
import { useQueryClient } from '@tanstack/react-query';

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

interface SmartWalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isLoadingBalances: boolean;
  balance: string;
  tokens: TokenBalance[];
  transactions: Transaction[];
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  client: ReturnType<typeof useSmartAccountClient>['client'];
}

const SmartWalletContext = createContext<SmartWalletContextType | undefined>(undefined);

const STORAGE_KEY = 'africoin_transactions';

function InnerSmartWalletProvider({ children }: { children: ReactNode }) {
  const user = useUser();
  const { account, isLoadingAccount } = useAccount({ type: "ModularAccountV2" });
  const { client } = useSmartAccountClient({ type: "ModularAccountV2" });
  const { logout } = useLogout();

  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const address = account?.address || null;
  const isConnected = !!user && !!address;
  const isConnecting = isLoadingAccount;

  // Load transactions from localStorage
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${address}`);
      if (stored) {
        const parsed = JSON.parse(stored).map((tx: any) => ({ ...tx, timestamp: new Date(tx.timestamp) }));
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

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = { ...tx, id: `tx_${Date.now()}`, timestamp: new Date() };
    setTransactions(prev => [newTx, ...prev].slice(0, 50));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
  }, []);

  const fetchBalances = useCallback(async () => {
    if (!address) { setTokens([]); return; }
    setIsLoadingBalances(true);
    try {
      const ethBalance = await getEthBalance(address as Address);
      const ethToken: TokenBalance = {
        symbol: 'ETH', name: 'Ethereum', balance: parseFloat(ethBalance).toFixed(6),
        usdValue: (parseFloat(ethBalance) * 2200).toFixed(2), icon: 'ETH'
      };
      const tokenBalances = await getTokenBalances(address);
      const nonZeroTokens = tokenBalances.filter(t => t.tokenBalance && t.tokenBalance !== '0x0');
      const erc20Tokens: TokenBalance[] = [];
      for (const token of nonZeroTokens.slice(0, 10)) {
        const metadata = await getTokenMetadata(token.contractAddress);
        if (metadata) {
          const balance = formatTokenBalance(token.tokenBalance, metadata.decimals);
          erc20Tokens.push({
            symbol: metadata.symbol || 'UNK', name: metadata.name || 'Unknown',
            balance, usdValue: '0.00', icon: metadata.symbol || 'UNK'
          });
        }
      }
      setTokens([ethToken, ...erc20Tokens]);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally { setIsLoadingBalances(false); }
  }, [address]);

  useEffect(() => { if (isConnected) fetchBalances(); }, [isConnected, fetchBalances]);

  const balance = useMemo(() => {
    if (!isConnected || tokens.length === 0) return '0.00';
    return tokens.reduce((sum, t) => sum + parseFloat(t.usdValue.replace(',', '') || '0'), 0)
      .toLocaleString('en-US', { minimumFractionDigits: 2 });
  }, [isConnected, tokens]);

  const disconnect = useCallback(() => { logout(); }, [logout]);

  const value = useMemo(() => ({
    address, isConnected, isConnecting, isLoadingBalances, balance, tokens, transactions,
    disconnect, refreshBalances: fetchBalances, addTransaction, updateTransaction, client
  }), [address, isConnected, isConnecting, isLoadingBalances, balance, tokens, transactions, disconnect, fetchBalances, addTransaction, updateTransaction, client]);

  return <SmartWalletContext.Provider value={value}>{children}</SmartWalletContext.Provider>;
}

function DummySmartWalletProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({
    address: null,
    isConnected: false,
    isConnecting: false,
    isLoadingBalances: false,
    balance: '0.00',
    tokens: [],
    transactions: [],
    disconnect: () => {},
    refreshBalances: async () => {},
    addTransaction: () => {},
    updateTransaction: () => {},
    client: undefined
  }), []);

  return <SmartWalletContext.Provider value={value}>{children}</SmartWalletContext.Provider>;
}

export function SmartWalletProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  if (isAdmin) {
    return (
      <AlchemyAccountProvider config={alchemyConfig} queryClient={queryClient}>
        <InnerSmartWalletProvider>{children}</InnerSmartWalletProvider>
      </AlchemyAccountProvider>
    );
  }

  return <DummySmartWalletProvider>{children}</DummySmartWalletProvider>;
}

export const useSmartWallet = () => {
  const context = useContext(SmartWalletContext);
  if (!context) throw new Error('useSmartWallet must be used within SmartWalletProvider');
  return context;
};
