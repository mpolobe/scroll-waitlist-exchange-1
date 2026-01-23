/**
 * Airdrop Service for 310M SENT Distribution
 * Tracks task completion and claim status in Supabase
 */

import { supabase } from '@/lib/supabase';

export interface AirdropStatus {
  wallet_address: string;
  referrer_wallet: string | null;
  twitter_verified: boolean;
  telegram_verified: boolean;
  quiz_score: number;
  referral_count: number;
  total_allocation: number;
  claimed: boolean;
  claimed_at: string | null;
  created_at: string;
}

/**
 * Register wallet for airdrop
 */
export async function registerWallet(
  walletAddress: string,
  referrerWallet?: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedWallet = walletAddress.toLowerCase();
  const normalizedReferrer = referrerWallet ? referrerWallet.toLowerCase() : null;

  const { error } = await supabase
    .from('airdrop_status')
    .insert([{ 
      wallet_address: normalizedWallet,
      referrer_wallet: normalizedReferrer,
      twitter_verified: false,
      telegram_verified: false,
      quiz_score: 0,
      referral_count: 0,
      total_allocation: 0,
      claimed: false,
    }]);

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Wallet already registered' };
    }
    return { success: false, error: error.message };
  }

  // Increment referrer's count if provided
  if (normalizedReferrer) {
    const { data: refData } = await supabase
      .from('airdrop_status')
      .select('referral_count')
      .eq('wallet_address', normalizedReferrer)
      .single();
    
    if (refData) {
      await supabase
        .from('airdrop_status')
        .update({ referral_count: (refData.referral_count || 0) + 1 })
        .eq('wallet_address', normalizedReferrer);
    }
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

  return data;
}

/**
 * Verify Twitter follow (optional bonus task)
 */
export async function verifyTwitter(walletAddress: string): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('airdrop_status')
    .update({ twitter_verified: true })
    .eq('wallet_address', walletAddress.toLowerCase());

  return { success: !error };
}

/**
 * Verify Telegram join (optional bonus task)
 */
export async function verifyTelegram(walletAddress: string): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('airdrop_status')
    .update({ telegram_verified: true })
    .eq('wallet_address', walletAddress.toLowerCase());

  return { success: !error };
}

/**
 * Submit quiz score
 */
export async function submitQuizScore(
  walletAddress: string, 
  score: number
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('airdrop_status')
    .update({ quiz_score: score })
    .eq('wallet_address', walletAddress.toLowerCase());

  return { success: !error };
}

/**
 * Calculate and update total allocation based on completed tasks
 */
export async function calculateAllocation(walletAddress: string): Promise<number> {
  const status = await getAirdropStatus(walletAddress);
  if (!status) return 0;

  let allocation = 100; // Base allocation for all registered workers

  // Bonus for social tasks (optional)
  if (status.twitter_verified) {
    allocation += 50;
  }
  if (status.telegram_verified) {
    allocation += 50;
  }

  // Referral bonus - 25 SENT per referral
  if (status.referral_count > 0) {
    allocation += 25 * status.referral_count;
  }

  // Quiz bonus
  if (status.quiz_score > 0) {
    allocation += status.quiz_score;
  }

  // Update allocation in database
  await supabase
    .from('airdrop_status')
    .update({ total_allocation: allocation })
    .eq('wallet_address', walletAddress.toLowerCase());

  return allocation;
}

/**
 * Check if wallet is eligible to claim
 * Sentinels/workers can claim without social tasks - just need to be registered
 */
export async function isEligibleToClaim(walletAddress: string): Promise<boolean> {
  const status = await getAirdropStatus(walletAddress);
  if (!status) return false;

  // Registered wallets can claim - social tasks are optional bonus
  return !status.claimed;
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
