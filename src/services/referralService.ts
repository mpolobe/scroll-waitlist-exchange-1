/**
 * Referral Service for SENT Token 310M Airdrop
 * - 50M SENT Referral Pool
 * - 100M SENT Social Tasks Pool
 * Tracks in Supabase airdrop_referrals table with Sybil protection
 */

import { supabase } from '@/lib/supabase';

export interface AirdropReferral {
  id: string;
  created_at: string;
  user_wallet: string;
  referrer_wallet: string;
  task_completed: boolean;
}

export interface LeaderboardEntry {
  referrer_wallet: string;
  referral_count: number;
  task_completed_count: number;
}

/**
 * Log a referral when user claims SENT tokens
 * Returns error if user already claimed (Sybil protection via unique user_wallet)
 */
export async function logReferral(
  userWallet: string,
  referrerWallet: string
): Promise<{ success: boolean; error?: string }> {
  // Prevent self-referral
  if (userWallet.toLowerCase() === referrerWallet.toLowerCase()) {
    return { success: false, error: 'Cannot refer yourself' };
  }

  const { error } = await supabase
    .from('airdrop_referrals')
    .insert([
      {
        user_wallet: userWallet.toLowerCase(),
        referrer_wallet: referrerWallet.toLowerCase(),
      },
    ]);

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation on user_wallet
      return { success: false, error: 'User already claimed referral bonus' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Mark social task as completed for 100M SENT pool
 */
export async function markTaskCompleted(
  userWallet: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('airdrop_referrals')
    .update({ task_completed: true })
    .eq('user_wallet', userWallet.toLowerCase());

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
    .select('referrer_wallet, total_referrals')
    .limit(limit);

  if (error) {
    console.error('Failed to fetch leaderboard:', error.message);
    return [];
  }

  // Get task completion counts separately
  const wallets = (data || []).map(d => d.referrer_wallet);
  
  if (wallets.length === 0) return [];

  const { data: taskData } = await supabase
    .from('airdrop_referrals')
    .select('referrer_wallet')
    .in('referrer_wallet', wallets)
    .eq('task_completed', true);

  // Count tasks per referrer
  const taskCounts = (taskData || []).reduce((acc, row) => {
    acc[row.referrer_wallet] = (acc[row.referrer_wallet] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (data || []).map(row => ({
    referrer_wallet: row.referrer_wallet,
    referral_count: row.total_referrals,
    task_completed_count: taskCounts[row.referrer_wallet] || 0,
  }));
}

/**
 * Get referral count for a specific wallet
 */
export async function getReferralCount(walletAddress: string): Promise<number> {
  const { count, error } = await supabase
    .from('airdrop_referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_wallet', walletAddress.toLowerCase());

  if (error) {
    console.error('Failed to fetch referral count:', error.message);
    return 0;
  }

  return count || 0;
}

/**
 * Get count of referrals who completed social tasks (100M pool)
 */
export async function getTaskCompletedCount(walletAddress: string): Promise<number> {
  const { count, error } = await supabase
    .from('airdrop_referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_wallet', walletAddress.toLowerCase())
    .eq('task_completed', true);

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
    .from('airdrop_referrals')
    .select('id')
    .eq('user_wallet', userWallet.toLowerCase())
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
  getVerifiedReferralCount,
  hasBeenReferred,
  setActiveReferrer,
  getActiveReferrer,
  clearActiveReferrer,
};
