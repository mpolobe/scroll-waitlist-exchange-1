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
  name: 'SENTINEL',
  description: 'Governance token for the Sentinel safety network',
  network: 'polygon',
  chainId: '0x89', // Polygon Mainnet
  contractAddress: '0x75CaEb2c62D8E29DAE0cdFde6775B898Dee43f46',
  decimals: 18,
  icon: '🛡️',
  color: '#10B981',
  purpose: 'Governance, staking, fee rewards, priority access',
  isLive: true, // Live on Pink Sale
};

// IDO Configuration for SENT - Pink Sale Fairlaunch
export const SENT_IDO_CONFIG = {
  token: SENT_TOKEN,
  totalSupply: 10_000_000_000, // 10 billion SENT
  idoAllocation: 3_000_000_000, // 3 billion for presale
  liquidityAllocation: 1_453_500_000, // 1.4535 billion for liquidity
  initialMarketCap: 123_009.56, // $123,009.56 USD
  softCap: 255_000, // 255,000 POL (~$36.9K USD)
  softCapUsd: 36_900, // Approximate USD value
  maxBuyPol: 10_000, // 10,000 POL maximum per wallet
  // Pool addresses
  tokenAddress: '0x75CaEb2c62D8E29DAE0cdFde6775B898Dee43f46',
  poolAddress: '0xf366e3aaCC54C99E50c90B7C57625776f88D8d08',
  // Listing details
  launchpad: 'PinkSale',
  launchpadUrl: 'https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08',
  listingDex: 'QuickSwap',
  liquidityPercent: 51,
  liquidityLockDays: 720, // 720 days after pool ends
  // Sale type
  saleType: 'Fairlaunch',
  whitelistOnly: true,
  status: 'Upcoming',
  // Dates (to be set)
  startDate: null, // Not set yet
  endDate: null, // Not set yet
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
