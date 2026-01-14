import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import stakingService, {
  Stake,
  StakingStats,
  ProjectFunding,
  UserStakingData,
  LOCK_PERIODS,
  LOCK_PERIOD_LABELS,
  APY_RATES,
} from '@/services/stakingService';

export interface UseStakingReturn {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // User data
  userData: UserStakingData | null;
  
  // Global stats
  globalStats: StakingStats | null;
  
  // Project funding
  projectFunding: ProjectFunding[];
  
  // Actions
  connect: (provider: BrowserProvider) => Promise<void>;
  refreshData: () => Promise<void>;
  stake: (amount: string, lockPeriod: number) => Promise<string>;
  unstake: (stakeIndex: number) => Promise<string>;
  claimRewards: (stakeIndex: number) => Promise<string>;
  claimAllRewards: () => Promise<string>;
  
  // Helpers
  formatAmount: (amount: bigint) => string;
  isStakeUnlocked: (stake: Stake) => boolean;
  getTimeRemaining: (stake: Stake) => { days: number; hours: number; minutes: number };
  calculatePenalty: (stake: Stake) => bigint;
  
  // Constants
  lockPeriods: typeof LOCK_PERIODS;
  lockPeriodLabels: typeof LOCK_PERIOD_LABELS;
  apyRates: typeof APY_RATES;
}

export function useStaking(userAddress?: string): UseStakingReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserStakingData | null>(null);
  const [globalStats, setGlobalStats] = useState<StakingStats | null>(null);
  const [projectFunding, setProjectFunding] = useState<ProjectFunding[]>([]);

  const connect = useCallback(async (provider: BrowserProvider) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await stakingService.connect(provider, 'scrollSepolia');
      setIsConnected(connected);
      
      if (!connected) {
        // Still load mock data for demo
        setIsConnected(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      // Use mock mode on error
      setIsConnected(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!userAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [user, stats, funding] = await Promise.all([
        stakingService.getUserData(userAddress),
        stakingService.getGlobalStats(),
        stakingService.getProjectFunding(),
      ]);
      
      setUserData(user);
      setGlobalStats(stats);
      setProjectFunding(funding);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  // Auto-refresh data when connected and address changes
  useEffect(() => {
    if (isConnected && userAddress) {
      refreshData();
    }
  }, [isConnected, userAddress, refreshData]);

  // Refresh data periodically (every 30 seconds)
  useEffect(() => {
    if (!isConnected || !userAddress) return;
    
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [isConnected, userAddress, refreshData]);

  const stake = useCallback(async (amount: string, lockPeriod: number): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const txHash = await stakingService.stake(amount, lockPeriod);
      await refreshData();
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Staking failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  const unstake = useCallback(async (stakeIndex: number): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const txHash = await stakingService.unstake(stakeIndex);
      await refreshData();
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unstaking failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  const claimRewards = useCallback(async (stakeIndex: number): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const txHash = await stakingService.claimRewards(stakeIndex);
      await refreshData();
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Claiming rewards failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  const claimAllRewards = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const txHash = await stakingService.claimAllRewards();
      await refreshData();
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Claiming rewards failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  return {
    isConnected,
    isLoading,
    error,
    userData,
    globalStats,
    projectFunding,
    connect,
    refreshData,
    stake,
    unstake,
    claimRewards,
    claimAllRewards,
    formatAmount: stakingService.formatAmount.bind(stakingService),
    isStakeUnlocked: stakingService.isStakeUnlocked.bind(stakingService),
    getTimeRemaining: stakingService.getTimeRemaining.bind(stakingService),
    calculatePenalty: stakingService.calculatePenalty.bind(stakingService),
    lockPeriods: LOCK_PERIODS,
    lockPeriodLabels: LOCK_PERIOD_LABELS,
    apyRates: APY_RATES,
  };
}

export default useStaking;
