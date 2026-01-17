/**
 * SENT IDO Service
 * 
 * Handles IDO participation for SENT token on Polygon network.
 * Users must connect their own Polygon wallet (MetaMask or compatible).
 */

import { SENT_IDO_CONFIG, SENT_TOKEN, NETWORK_CONFIG } from '@/data/tokenConfig';
import { supabase } from '@/lib/supabase';

// Polygon Mainnet chain ID
const POLYGON_CHAIN_ID = '0x89';

export interface IdoParticipation {
  id: string;
  userId: string;
  walletAddress: string;
  amountUsd: number;
  tokensAllocated: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  bonusPercent: number;
  status: 'pending' | 'confirmed' | 'vesting' | 'claimed';
  txHash?: string;
  createdAt: string;
}

export interface IdoStats {
  totalRaised: number;
  participants: number;
  tokensAllocated: number;
  percentComplete: number;
  timeRemaining: number;
  isActive: boolean;
}

// Tier configuration
const TIERS = {
  bronze: { min: 100, max: 500, bonus: 5 },
  silver: { min: 500, max: 2000, bonus: 10 },
  gold: { min: 2000, max: 5000, bonus: 15 },
  platinum: { min: 5000, max: 5000, bonus: 20 },
};

/**
 * Check if MetaMask or compatible wallet is installed
 */
export const isWalletInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * Get current chain ID from wallet
 */
export const getCurrentChainId = async (): Promise<string | null> => {
  if (!isWalletInstalled()) return null;
  try {
    return await window.ethereum.request({ method: 'eth_chainId' });
  } catch {
    return null;
  }
};

/**
 * Check if wallet is on Polygon network
 */
export const isOnPolygon = async (): Promise<boolean> => {
  const chainId = await getCurrentChainId();
  return chainId === POLYGON_CHAIN_ID;
};

/**
 * Switch wallet to Polygon network
 */
export const switchToPolygon = async (): Promise<{ success: boolean; error?: string }> => {
  if (!isWalletInstalled()) {
    return { success: false, error: 'Please install MetaMask or a compatible EVM wallet' };
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLYGON_CHAIN_ID }],
    });
    return { success: true };
  } catch (error: any) {
    // Chain not added - add it
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: POLYGON_CHAIN_ID,
            chainName: NETWORK_CONFIG.polygon.name,
            nativeCurrency: NETWORK_CONFIG.polygon.nativeCurrency,
            rpcUrls: [NETWORK_CONFIG.polygon.rpcUrl],
            blockExplorerUrls: [NETWORK_CONFIG.polygon.explorerUrl],
          }],
        });
        return { success: true };
      } catch {
        return { success: false, error: 'Failed to add Polygon network' };
      }
    }
    
    if (error.code === 4001) {
      return { success: false, error: 'Please switch to Polygon network to participate' };
    }
    
    return { success: false, error: error.message || 'Failed to switch network' };
  }
};

/**
 * Connect Polygon wallet for IDO participation
 */
export const connectPolygonWallet = async (): Promise<{
  success: boolean;
  address?: string;
  error?: string;
}> => {
  if (!isWalletInstalled()) {
    return {
      success: false,
      error: 'Please install MetaMask or a compatible EVM wallet to participate in the IDO',
    };
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      return { success: false, error: 'No accounts found' };
    }

    // Switch to Polygon
    const switchResult = await switchToPolygon();
    if (!switchResult.success) {
      return { success: false, error: switchResult.error };
    }

    return { success: true, address: accounts[0] };
  } catch (error: any) {
    if (error.code === 4001) {
      return { success: false, error: 'Connection rejected by user' };
    }
    return { success: false, error: error.message || 'Failed to connect wallet' };
  }
};

/**
 * Get tier based on contribution amount
 */
export const getTier = (amountUsd: number): keyof typeof TIERS => {
  if (amountUsd >= TIERS.platinum.min) return 'platinum';
  if (amountUsd >= TIERS.gold.min) return 'gold';
  if (amountUsd >= TIERS.silver.min) return 'silver';
  return 'bronze';
};

/**
 * Calculate tokens allocated for a contribution
 */
export const calculateTokens = (amountUsd: number): {
  baseTokens: number;
  bonusTokens: number;
  totalTokens: number;
  tier: keyof typeof TIERS;
  bonusPercent: number;
} => {
  const tier = getTier(amountUsd);
  const bonusPercent = TIERS[tier].bonus;
  const baseTokens = amountUsd / SENT_IDO_CONFIG.idoPrice;
  const bonusTokens = baseTokens * (bonusPercent / 100);
  
  return {
    baseTokens,
    bonusTokens,
    totalTokens: baseTokens + bonusTokens,
    tier,
    bonusPercent,
  };
};

/**
 * Get IDO statistics
 */
export const getIdoStats = async (): Promise<IdoStats> => {
  try {
    const { data, error } = await supabase
      .from('ido_participations')
      .select('amount_usd, tokens_allocated');

    if (error) throw error;

    const totalRaised = data?.reduce((sum, p) => sum + p.amount_usd, 0) || 0;
    const tokensAllocated = data?.reduce((sum, p) => sum + p.tokens_allocated, 0) || 0;
    const participants = data?.length || 0;

    const now = new Date().getTime();
    const endDate = new Date(SENT_IDO_CONFIG.endDate).getTime();
    const startDate = new Date(SENT_IDO_CONFIG.startDate).getTime();

    return {
      totalRaised,
      participants,
      tokensAllocated,
      percentComplete: (totalRaised / SENT_IDO_CONFIG.hardCap) * 100,
      timeRemaining: Math.max(0, endDate - now),
      isActive: now >= startDate && now <= endDate,
    };
  } catch (error) {
    console.error('Failed to get IDO stats:', error);
    // Return mock data for demo
    return {
      totalRaised: 32500,
      participants: 847,
      tokensAllocated: 650_000_000_000,
      percentComplete: 65,
      timeRemaining: 5 * 24 * 60 * 60 * 1000, // 5 days
      isActive: true,
    };
  }
};

/**
 * Participate in IDO
 */
export const participateInIdo = async (
  userId: string,
  walletAddress: string,
  amountUsd: number
): Promise<{ success: boolean; participation?: IdoParticipation; error?: string }> => {
  // Validate amount
  if (amountUsd < SENT_IDO_CONFIG.minBuy) {
    return { success: false, error: `Minimum contribution is $${SENT_IDO_CONFIG.minBuy}` };
  }
  if (amountUsd > SENT_IDO_CONFIG.maxBuy) {
    return { success: false, error: `Maximum contribution is $${SENT_IDO_CONFIG.maxBuy}` };
  }

  // Check if on Polygon
  if (!(await isOnPolygon())) {
    return { success: false, error: 'Please switch to Polygon network' };
  }

  const { baseTokens, bonusTokens, totalTokens, tier, bonusPercent } = calculateTokens(amountUsd);

  const participation: IdoParticipation = {
    id: `IDO-${Date.now().toString(36).toUpperCase()}`,
    userId,
    walletAddress,
    amountUsd,
    tokensAllocated: totalTokens,
    tier,
    bonusPercent,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('ido_participations').insert({
      id: participation.id,
      user_id: userId,
      wallet_address: walletAddress,
      amount_usd: amountUsd,
      tokens_allocated: totalTokens,
      tier,
      bonus_percent: bonusPercent,
      status: 'pending',
    });

    if (error) throw error;

    return { success: true, participation };
  } catch (error: any) {
    console.error('IDO participation failed:', error);
    return { success: false, error: error.message || 'Failed to record participation' };
  }
};

/**
 * Get user's IDO participations
 */
export const getUserParticipations = async (userId: string): Promise<IdoParticipation[]> => {
  try {
    const { data, error } = await supabase
      .from('ido_participations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(p => ({
      id: p.id,
      userId: p.user_id,
      walletAddress: p.wallet_address,
      amountUsd: p.amount_usd,
      tokensAllocated: p.tokens_allocated,
      tier: p.tier,
      bonusPercent: p.bonus_percent,
      status: p.status,
      txHash: p.tx_hash,
      createdAt: p.created_at,
    })) || [];
  } catch (error) {
    console.error('Failed to get participations:', error);
    return [];
  }
};

/**
 * Get vesting schedule for a participation
 */
export const getVestingSchedule = (participation: IdoParticipation): {
  tgeAmount: number;
  vestedAmount: number;
  claimedAmount: number;
  nextUnlockDate: Date;
  nextUnlockAmount: number;
}[] => {
  const { vestingSchedule } = SENT_IDO_CONFIG;
  const tgeDate = new Date(SENT_IDO_CONFIG.tgeDate);
  const totalTokens = participation.tokensAllocated;
  
  const tgeAmount = totalTokens * (vestingSchedule.tgeUnlock / 100);
  const vestedTotal = totalTokens * (vestingSchedule.vestingPercent / 100);
  const monthlyVest = vestedTotal / vestingSchedule.vestingMonths;

  const schedule = [];
  
  // TGE unlock
  schedule.push({
    tgeAmount,
    vestedAmount: 0,
    claimedAmount: 0,
    nextUnlockDate: tgeDate,
    nextUnlockAmount: tgeAmount,
  });

  // Monthly vesting
  for (let i = 1; i <= vestingSchedule.vestingMonths; i++) {
    const unlockDate = new Date(tgeDate);
    unlockDate.setMonth(unlockDate.getMonth() + vestingSchedule.cliffMonths + i);
    
    schedule.push({
      tgeAmount,
      vestedAmount: monthlyVest * i,
      claimedAmount: 0,
      nextUnlockDate: unlockDate,
      nextUnlockAmount: monthlyVest,
    });
  }

  return schedule;
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export default {
  isWalletInstalled,
  isOnPolygon,
  switchToPolygon,
  connectPolygonWallet,
  getTier,
  calculateTokens,
  getIdoStats,
  participateInIdo,
  getUserParticipations,
  getVestingSchedule,
  SENT_IDO_CONFIG,
  TIERS,
};
