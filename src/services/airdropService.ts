/**
 * Airdrop Service for 310M SENT Distribution
 * Tracks task completion and claim status in Supabase
 */

import { supabase } from '@/lib/supabase';

export interface AirdropStatus {
  wallet_address: string;
  quiz_score: number;
  tasks_completed: boolean;
  signature_issued: boolean;
  claimed: boolean;
  claimed_at: string | null;
  // Computed fields for compatibility
  twitter_verified?: boolean;
  telegram_verified?: boolean;
  referral_count?: number;
  total_allocation?: number;
}

/**
 * Register wallet for airdrop
 */
export async function registerWallet(
  walletAddress: string,
  referrerWallet?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('airdrop_status')
    .insert([{ 
      wallet_address: walletAddress.toLowerCase(),
      quiz_score: 0,
      tasks_completed: false,
      signature_issued: false,
      claimed: false,
    }]);

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Wallet already registered' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get airdrop status for a wallet
 */
export async function getAirdropStatus(walletAddress: string): Promise<AirdropStatus | null> {
  const { data, error } = await supabase
    .from('airdrop_status')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error) {
    console.error('Failed to get airdrop status:', error.message);
    return null;
  }

  // Map tasks_completed to twitter/telegram verified for compatibility
  return {
    ...data,
    twitter_verified: data.tasks_completed,
    telegram_verified: data.tasks_completed,
    referral_count: 0,
    total_allocation: data.quiz_score || 0,
  };
}

/**
 * Verify Twitter follow (marks tasks_completed)
 */
export async function verifyTwitter(walletAddress: string): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('airdrop_status')
    .update({ tasks_completed: true })
    .eq('wallet_address', walletAddress.toLowerCase());

  return { success: !error };
}

/**
 * Verify Telegram join (marks tasks_completed)
 */
export async function verifyTelegram(walletAddress: string): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('airdrop_status')
    .update({ tasks_completed: true })
    .eq('wallet_address', walletAddress.toLowerCase());

  return { success: !error };
}

/**
 * Submit quiz score
 * Uses upsert to create record if it doesn't exist
 */
export async function submitQuizScore(
  walletAddress: string, 
  score: number
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('airdrop_status')
    .upsert({ 
      wallet_address: walletAddress.toLowerCase(), 
      quiz_score: score,
      tasks_completed: false,
      signature_issued: false,
      claimed: false,
    }, { onConflict: 'wallet_address' });

  return { success: !error };
}

/**
 * Calculate total allocation based on completed tasks
 */
export async function calculateAllocation(walletAddress: string): Promise<number> {
  const status = await getAirdropStatus(walletAddress);
  if (!status) return 0;

  let allocation = 0;

  // Base allocation for social tasks (100M pool)
  if (status.tasks_completed) {
    allocation += 100; // Base SENT for completing social tasks
  }

  // Quiz bonus (10M pool)
  if (status.quiz_score > 0) {
    allocation += status.quiz_score; // Score = bonus SENT
  }

  return allocation;
}

/**
 * Check if wallet is eligible to claim
 */
export async function isEligibleToClaim(walletAddress: string): Promise<boolean> {
  const status = await getAirdropStatus(walletAddress);
  if (!status) return false;

  // Must have tasks completed
  return status.tasks_completed && !status.claimed;
}

/**
 * Mark wallet as claimed
 */
export async function markAsClaimed(
  walletAddress: string,
  txHash?: string
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('airdrop_status')
    .update({ claimed: true })
    .eq('wallet_address', walletAddress.toLowerCase());

  return { success: !error };
}

/**
 * Get quiz leaderboard (Top 100)
 */
export async function getQuizLeaderboard(): Promise<Array<{ wallet_address: string; quiz_score: number; rank: number }>> {
  const { data, error } = await supabase
    .from('quiz_leaderboard')
    .select('*');

  if (error) {
    console.error('Failed to get quiz leaderboard:', error.message);
    return [];
  }

  return data || [];
}

/**
 * Get referral leaderboard
 */
export async function getReferralLeaderboard(): Promise<Array<{ wallet_address: string; referral_count: number; qualified: boolean }>> {
  const { data, error } = await supabase
    .from('referral_leaderboard')
    .select('*')
    .limit(50);

  if (error) {
    console.error('Failed to get referral leaderboard:', error.message);
    return [];
  }

  return data || [];
}

/**
 * Get airdrop stats
 */
export async function getAirdropStats(): Promise<{
  total_participants: number;
  total_claimed: number;
  twitter_verified: number;
  telegram_verified: number;
  quiz_participants: number;
  qualified_referrers: number;
}> {
  const { data, error } = await supabase
    .from('airdrop_stats')
    .select('*')
    .single();

  if (error) {
    console.error('Failed to get airdrop stats:', error.message);
    return {
      total_participants: 0,
      total_claimed: 0,
      twitter_verified: 0,
      telegram_verified: 0,
      quiz_participants: 0,
      qualified_referrers: 0,
    };
  }

  return data;
}

export default {
  registerWallet,
  getAirdropStatus,
  verifyTwitter,
  verifyTelegram,
  submitQuizScore,
  calculateAllocation,
  isEligibleToClaim,
  markAsClaimed,
  getQuizLeaderboard,
  getReferralLeaderboard,
  getAirdropStats,
};
