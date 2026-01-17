/**
 * Token Configuration for Africa Railways Ecosystem
 * 
 * Three-token model:
 * - AFC (Africoin): Payment currency on Sui - 1 AFC = 1 USD (stablecoin)
 * - AFRC (Africa Rail Credits): Reward/loyalty token on Polygon
 * - SENT (Sentinel): Governance token on Polygon - IDO target
 */

export interface TokenConfig {
  symbol: string;
  name: string;
  description: string;
  network: 'sui' | 'polygon';
  chainId?: string;
  contractAddress?: string;
  decimals: number;
  icon: string;
  color: string;
  purpose: string;
  isLive: boolean;
}

// AFC - Payment Currency (Sui Mainnet)
export const AFC_TOKEN: TokenConfig = {
  symbol: 'AFC',
  name: 'Africoin',
  description: 'The Digital Currency of Africa Railways',
  network: 'sui',
  decimals: 9,
  icon: '🪙',
  color: '#FFB800',
  purpose: 'Payment for tickets, services, and in-app transactions',
  isLive: true,
};

// AFRC - Reward/Loyalty Token (Polygon)
export const AFRC_TOKEN: TokenConfig = {
  symbol: 'AFRC',
  name: 'Africa Rail Credits',
  description: 'Reward and loyalty token for the Africa Railways ecosystem',
  network: 'polygon',
  chainId: '0x89', // Polygon Mainnet
  decimals: 18,
  icon: '🎫',
  color: '#8B5CF6',
  purpose: 'Rewards, staking, loyalty points, and DeFi operations',
  isLive: false, // Q2 2026 launch
};

// SENT - Governance Token (Polygon) - IDO Target
export const SENT_TOKEN: TokenConfig = {
  symbol: 'SENT',
  name: 'Sentinel',
  description: 'Governance token for the Sentinel safety network',
  network: 'polygon',
  chainId: '0x89', // Polygon Mainnet
  decimals: 18,
  icon: '🛡️',
  color: '#10B981',
  purpose: 'Governance, staking, fee rewards, priority access',
  isLive: false, // Q1 2026 IDO
};

// IDO Configuration for SENT
export const SENT_IDO_CONFIG = {
  token: SENT_TOKEN,
  totalSupply: 5_000_000_000, // 5 billion SENT
  idoAllocation: 1_000_000_000, // 1 billion (20%) for IDO
  idoPrice: 0.00005, // $0.00005 per SENT
  hardCap: 50_000, // $50,000 USD
  softCap: 25_000, // $25,000 USD
  minBuy: 100, // $100 minimum
  maxBuy: 5_000, // $5,000 maximum
  vestingSchedule: {
    tgeUnlock: 20, // 20% at TGE
    cliffMonths: 1,
    vestingMonths: 6,
    vestingPercent: 80, // 80% vested over 6 months
  },
  launchpad: 'PinkSale',
  listingDex: 'Cetus DEX',
  startDate: '2026-03-01T00:00:00Z',
  endDate: '2026-03-15T00:00:00Z',
  tgeDate: '2026-03-20T00:00:00Z',
};

// Token utility breakdown
export const TOKEN_UTILITIES = {
  AFC: [
    'Purchase train tickets',
    'Pay for in-app services',
    'Cross-border payments',
    'Merchant settlements',
    'Stablecoin (1 AFC = 1 USD)',
  ],
  AFRC: [
    'Loyalty rewards',
    'Staking rewards',
    'Fee discounts',
    'NFT purchases',
    'DeFi yield farming',
  ],
  SENT: [
    'Governance voting',
    'Sentinel network staking',
    'Fee revenue sharing',
    'Priority access to features',
    'Safety report validation rewards',
  ],
};

// Network configurations
export const NETWORK_CONFIG = {
  sui: {
    name: 'Sui Mainnet',
    rpcUrl: 'https://mainnet.sui.io',
    explorerUrl: 'https://suiscan.xyz',
    nativeCurrency: { name: 'SUI', symbol: 'SUI', decimals: 9 },
  },
  polygon: {
    name: 'Polygon Mainnet',
    chainId: '0x89',
    rpcUrl: 'https://polygon-rpc.com/',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
};

// Helper functions
export const getTokenBySymbol = (symbol: string): TokenConfig | undefined => {
  const tokens = [AFC_TOKEN, AFRC_TOKEN, SENT_TOKEN];
  return tokens.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
};

export const getTokensByNetwork = (network: 'sui' | 'polygon'): TokenConfig[] => {
  const tokens = [AFC_TOKEN, AFRC_TOKEN, SENT_TOKEN];
  return tokens.filter(t => t.network === network);
};

export const formatTokenAmount = (amount: number, token: TokenConfig): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)}B ${token.symbol}`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M ${token.symbol}`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K ${token.symbol}`;
  }
  return `${amount.toFixed(2)} ${token.symbol}`;
};
