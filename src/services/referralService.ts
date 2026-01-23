/**
 * Referral Service for SENT Token 310M Airdrop
 * - 50M SENT Referral Pool
 * - 100M SENT Social Tasks Pool
 * - 160M SENT Worker Pool
 * Tracks in Supabase airdrop_status table with Sybil protection
 */

import { supabase } from '@/lib/supabase';

export interface AirdropReferral {
  wallet_address: string;
  created_at: string;
  referrer_wallet: string | null;
  twitter_verified: boolean;
  telegram_verified: boolean;
  claimed: boolean;
  claimed_at: string | null;
  tx_hash: string | null;
}

export interface LeaderboardEntry {
  referrer_wallet: string;
  referral_count: number;
  task_completed_count: number;
}

/**
 * Log a referral when user claims SENT tokens
 * Returns error if user already claimed (Sybil protection via unique wallet_address)
 */
export async function logReferral(
  userWallet: string,
  referrerWallet: string
): Promise<{ success: boolean; error?: string }> {
  // Prevent self-referral
  if (referrerWallet && userWallet.toLowerCase() === referrerWallet.toLowerCase()) {
    return { success: false, error: 'Cannot refer yourself' };
  }

  const normalizedUser = userWallet.toLowerCase();
  const normalizedReferrer = referrerWallet ? referrerWallet.toLowerCase() : null;

  // Check if user already exists
  const { data: existing } = await supabase
    .from('airdrop_status')
    .select('wallet_address')
    .eq('wallet_address', normalizedUser)
    .single();

  if (existing) {
    // Update referrer if not already set
    const { error } = await supabase
      .from('airdrop_status')
      .update({ referrer_wallet: normalizedReferrer })
      .eq('wallet_address', normalizedUser)
      .is('referrer_wallet', null);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Insert new record
    const { error } = await supabase
      .from('airdrop_status')
      .insert([
        {
          wallet_address: normalizedUser,
          referrer_wallet: normalizedReferrer,
          twitter_verified: false,
          telegram_verified: false,
          quiz_score: 0,
          referral_count: 0,
          total_allocation: 0,
          claimed: false,
        },
      ]);

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation on wallet_address
        return { success: false, error: 'User already claimed referral bonus' };
      }
      return { success: false, error: error.message };
    }
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
 * Mark worker as claimed with transaction hash
 * Called after successful on-chain transfer
 */
export async function markAsClaimed(
  userWallet: string,
  txHash: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedWallet = userWallet.toLowerCase();
  
  // First check if user exists
  const { data: existing } = await supabase
    .from('airdrop_status')
    .select('wallet_address')
    .eq('wallet_address', normalizedWallet)
    .single();

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('airdrop_status')
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
        tx_hash: txHash,
      })
      .eq('wallet_address', normalizedWallet);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Insert new record with claimed status
    const { error } = await supabase
      .from('airdrop_status')
      .insert([
        {
          wallet_address: normalizedWallet,
          referrer_wallet: getActiveReferrer()?.toLowerCase() || null,
          twitter_verified: false,
          telegram_verified: false,
          quiz_score: 0,
          referral_count: 0,
          total_allocation: 0,
          claimed: true,
          claimed_at: new Date().toISOString(),
          tx_hash: txHash,
        },
      ]);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

/**
 * Check if user has already claimed tokens
 */
export async function hasClaimed(userWallet: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('airdrop_status')
    .select('claimed')
    .eq('wallet_address', userWallet.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to check claim status:', error.message);
  }

  return data?.claimed === true;
}

/**
 * Get user's claim status and details
 */
export async function getClaimStatus(userWallet: string): Promise<{
  registered: boolean;
  claimed: boolean;
  claimedAt: string | null;
  txHash: string | null;
}> {
  const { data, error } = await supabase
    .from('airdrop_status')
    .select('claimed, claimed_at, tx_hash')
    .eq('wallet_address', userWallet.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to get claim status:', error.message);
  }

  return {
    registered: !!data,
    claimed: data?.claimed === true,
    claimedAt: data?.claimed_at || null,
    txHash: data?.tx_hash || null,
  };
}

/**
 * Mark social tasks as completed for 100M SENT pool
 */
export async function markTaskCompleted(
  userWallet: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('airdrop_status')
    .update({ twitter_verified: true, telegram_verified: true })
    .eq('wallet_address', userWallet.toLowerCase());

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get top referrers for the leaderboard
 * Uses the referral_leaderboard view for optimized queries
 */
export async function getLeaderboard(limit: number = 5): Promise<LeaderboardEntry[]> {
  // Query the pre-computed view for instant results
  const { data, error } = await supabase
    .from('referral_leaderboard')
    .select('wallet_address, referral_count, qualified')
    .limit(limit);

  if (error) {
    console.error('Failed to fetch leaderboard:', error.message);
    return [];
  }

  // Get task completion counts separately
  const wallets = (data || []).map(d => d.wallet_address);
  
  if (wallets.length === 0) return [];

  const { data: taskData } = await supabase
    .from('airdrop_status')
    .select('referrer_wallet')
    .in('referrer_wallet', wallets)
    .eq('twitter_verified', true)
    .eq('telegram_verified', true);

  // Count tasks per referrer
  const taskCounts = (taskData || []).reduce((acc, row) => {
    if (row.referrer_wallet) {
      acc[row.referrer_wallet] = (acc[row.referrer_wallet] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (data || []).map(row => ({
    referrer_wallet: row.wallet_address,
    referral_count: row.referral_count,
    task_completed_count: taskCounts[row.wallet_address] || 0,
  }));
}

/**
 * Get referral count for a specific wallet
 */
export async function getReferralCount(walletAddress: string): Promise<number> {
  const { data, error } = await supabase
    .from('airdrop_status')
    .select('referral_count')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch referral count:', error.message);
    return 0;
  }

  return data?.referral_count || 0;
}

/**
 * Get count of referrals who completed social tasks (100M pool)
 */
export async function getTaskCompletedCount(walletAddress: string): Promise<number> {
  const { count, error } = await supabase
    .from('airdrop_status')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_wallet', walletAddress.toLowerCase())
    .eq('twitter_verified', true)
    .eq('telegram_verified', true);

  if (error) {
    console.error('Failed to fetch task completed count:', error.message);
    return 0;
  }

  return count || 0;
}

/**
 * Check if user has already been referred
 */
export async function hasBeenReferred(userWallet: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('airdrop_status')
    .select('wallet_address')
    .eq('wallet_address', userWallet.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to check referral status:', error.message);
  }

  return !!data;
}

/**
 * Store active referrer in localStorage (for claim action)
 */
export function setActiveReferrer(referrerWallet: string): void {
  localStorage.setItem('active_referrer', referrerWallet.toLowerCase());
}

/**
 * Get active referrer from localStorage
 */
export function getActiveReferrer(): string | null {
  return localStorage.getItem('active_referrer');
}

/**
 * Clear active referrer after successful claim
 */
export function clearActiveReferrer(): void {
  localStorage.removeItem('active_referrer');
}

export default {
  logReferral,
  getLeaderboard,
  getReferralCount,
  getTaskCompletedCount,
  hasBeenReferred,
  setActiveReferrer,
  getActiveReferrer,
  clearActiveReferrer,
};
