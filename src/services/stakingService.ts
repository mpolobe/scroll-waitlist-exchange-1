import { ethers, BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';

// Contract addresses - update these after deployment
const CONTRACTS = {
  scrollSepolia: {
    wAFC: import.meta.env.VITE_WAFC_ADDRESS || '',
    staking: import.meta.env.VITE_AFC_STAKING_ADDRESS || '',
    distributor: import.meta.env.VITE_REWARD_DISTRIBUTOR_ADDRESS || '',
  },
  scroll: {
    wAFC: import.meta.env.VITE_WAFC_ADDRESS_MAINNET || '',
    staking: import.meta.env.VITE_AFC_STAKING_ADDRESS_MAINNET || '',
    distributor: import.meta.env.VITE_REWARD_DISTRIBUTOR_ADDRESS_MAINNET || '',
  },
};

// Lock periods in seconds
export const LOCK_PERIODS = {
  THREE_MONTHS: 90 * 24 * 60 * 60,
  SIX_MONTHS: 180 * 24 * 60 * 60,
  TWELVE_MONTHS: 365 * 24 * 60 * 60,
} as const;

export const LOCK_PERIOD_LABELS: Record<number, string> = {
  [LOCK_PERIODS.THREE_MONTHS]: '3 Months',
  [LOCK_PERIODS.SIX_MONTHS]: '6 Months',
  [LOCK_PERIODS.TWELVE_MONTHS]: '12 Months',
};

export const APY_RATES: Record<number, number> = {
  [LOCK_PERIODS.THREE_MONTHS]: 12,
  [LOCK_PERIODS.SIX_MONTHS]: 15,
  [LOCK_PERIODS.TWELVE_MONTHS]: 20,
};

// Minimal ABIs for the contracts
const WAFC_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

const STAKING_ABI = [
  'function stake(uint256 amount, uint256 lockPeriod)',
  'function unstake(uint256 stakeIndex)',
  'function claimRewards(uint256 stakeIndex)',
  'function claimAllRewards()',
  'function fundRewardPool(uint256 amount)',
  'function calculateRewards(address user, uint256 stakeIndex) view returns (uint256)',
  'function getUserStakes(address user) view returns (tuple(uint256 amount, uint256 lockPeriod, uint256 startTime, uint256 unlockTime, uint256 lastClaimTime, uint256 rewardsClaimed, bool active)[])',
  'function getUserTotalPendingRewards(address user) view returns (uint256)',
  'function getUserActiveStakeCount(address user) view returns (uint256)',
  'function totalStakedByUser(address user) view returns (uint256)',
  'function totalStakedGlobal() view returns (uint256)',
  'function rewardPool() view returns (uint256)',
  'function getGlobalStats() view returns (uint256 totalStaked, uint256 totalRewardsDistributed, uint256 totalPenaltiesCollected, uint256 rewardPool)',
  'function getFundedProjects() view returns (string[])',
  'function getProjectFunding(string region) view returns (uint256)',
  'function getEffectiveAPY(uint256 lockPeriod) view returns (uint256)',
  'event Staked(address indexed user, uint256 indexed stakeIndex, uint256 amount, uint256 lockPeriod, uint256 unlockTime)',
  'event Unstaked(address indexed user, uint256 indexed stakeIndex, uint256 principal, uint256 rewards, uint256 penalty)',
  'event RewardsClaimed(address indexed user, uint256 indexed stakeIndex, uint256 amount)',
];

export interface Stake {
  amount: bigint;
  lockPeriod: number;
  startTime: number;
  unlockTime: number;
  lastClaimTime: number;
  rewardsClaimed: bigint;
  active: boolean;
  index: number;
}

export interface StakingStats {
  totalStaked: bigint;
  totalRewardsDistributed: bigint;
  totalPenaltiesCollected: bigint;
  rewardPool: bigint;
}

export interface ProjectFunding {
  region: string;
  amount: bigint;
}

export interface UserStakingData {
  balance: bigint;
  totalStaked: bigint;
  pendingRewards: bigint;
  activeStakeCount: number;
  stakes: Stake[];
}

class StakingService {
  private provider: BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private wafcContract: Contract | null = null;
  private stakingContract: Contract | null = null;
  private network: 'scrollSepolia' | 'scroll' = 'scrollSepolia';
  private decimals = 9;

  async connect(provider: BrowserProvider, network: 'scrollSepolia' | 'scroll' = 'scrollSepolia') {
    this.provider = provider;
    this.signer = await provider.getSigner();
    this.network = network;

    const addresses = CONTRACTS[network];
    
    if (!addresses.wAFC || !addresses.staking) {
      console.warn('Contract addresses not configured. Using mock mode.');
      return false;
    }

    this.wafcContract = new Contract(addresses.wAFC, WAFC_ABI, this.signer);
    this.stakingContract = new Contract(addresses.staking, STAKING_ABI, this.signer);

    try {
      this.decimals = await this.wafcContract.decimals();
    } catch {
      this.decimals = 9;
    }

    return true;
  }

  isConnected(): boolean {
    return this.stakingContract !== null && this.wafcContract !== null;
  }

  formatAmount(amount: bigint): string {
    return formatUnits(amount, this.decimals);
  }

  parseAmount(amount: string): bigint {
    return parseUnits(amount, this.decimals);
  }

  // User data
  async getUserData(address: string): Promise<UserStakingData> {
    if (!this.stakingContract || !this.wafcContract) {
      return this.getMockUserData();
    }

    try {
      const [balance, totalStaked, pendingRewards, activeStakeCount, rawStakes] = await Promise.all([
        this.wafcContract.balanceOf(address),
        this.stakingContract.totalStakedByUser(address),
        this.stakingContract.getUserTotalPendingRewards(address),
        this.stakingContract.getUserActiveStakeCount(address),
        this.stakingContract.getUserStakes(address),
      ]);

      const stakes: Stake[] = rawStakes.map((s: any, index: number) => ({
        amount: s.amount,
        lockPeriod: Number(s.lockPeriod),
        startTime: Number(s.startTime),
        unlockTime: Number(s.unlockTime),
        lastClaimTime: Number(s.lastClaimTime),
        rewardsClaimed: s.rewardsClaimed,
        active: s.active,
        index,
      }));

      return {
        balance,
        totalStaked,
        pendingRewards,
        activeStakeCount: Number(activeStakeCount),
        stakes,
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return this.getMockUserData();
    }
  }

  private getMockUserData(): UserStakingData {
    return {
      balance: parseUnits('5000', 9),
      totalStaked: parseUnits('2500', 9),
      pendingRewards: parseUnits('125', 9),
      activeStakeCount: 2,
      stakes: [
        {
          amount: parseUnits('1500', 9),
          lockPeriod: LOCK_PERIODS.SIX_MONTHS,
          startTime: Math.floor(Date.now() / 1000) - 60 * 24 * 60 * 60,
          unlockTime: Math.floor(Date.now() / 1000) + 120 * 24 * 60 * 60,
          lastClaimTime: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60,
          rewardsClaimed: parseUnits('50', 9),
          active: true,
          index: 0,
        },
        {
          amount: parseUnits('1000', 9),
          lockPeriod: LOCK_PERIODS.TWELVE_MONTHS,
          startTime: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
          unlockTime: Math.floor(Date.now() / 1000) + 335 * 24 * 60 * 60,
          lastClaimTime: Math.floor(Date.now() / 1000) - 3 * 24 * 60 * 60,
          rewardsClaimed: parseUnits('25', 9),
          active: true,
          index: 1,
        },
      ],
    };
  }

  // Global stats
  async getGlobalStats(): Promise<StakingStats> {
    if (!this.stakingContract) {
      return this.getMockGlobalStats();
    }

    try {
      const [totalStaked, totalRewardsDistributed, totalPenaltiesCollected, rewardPool] = 
        await this.stakingContract.getGlobalStats();

      return {
        totalStaked,
        totalRewardsDistributed,
        totalPenaltiesCollected,
        rewardPool,
      };
    } catch (error) {
      console.error('Error fetching global stats:', error);
      return this.getMockGlobalStats();
    }
  }

  private getMockGlobalStats(): StakingStats {
    return {
      totalStaked: parseUnits('2500000', 9),
      totalRewardsDistributed: parseUnits('125000', 9),
      totalPenaltiesCollected: parseUnits('15000', 9),
      rewardPool: parseUnits('500000', 9),
    };
  }

  // Project funding
  async getProjectFunding(): Promise<ProjectFunding[]> {
    if (!this.stakingContract) {
      return this.getMockProjectFunding();
    }

    try {
      const projects = await this.stakingContract.getFundedProjects();
      const funding: ProjectFunding[] = [];

      for (const region of projects) {
        const amount = await this.stakingContract.getProjectFunding(region);
        funding.push({ region, amount });
      }

      return funding;
    } catch (error) {
      console.error('Error fetching project funding:', error);
      return this.getMockProjectFunding();
    }
  }

  private getMockProjectFunding(): ProjectFunding[] {
    return [
      { region: 'East Africa', amount: parseUnits('450000', 9) },
      { region: 'West Africa', amount: parseUnits('320000', 9) },
      { region: 'Southern Africa', amount: parseUnits('280000', 9) },
      { region: 'North Africa', amount: parseUnits('150000', 9) },
      { region: 'Central Africa', amount: parseUnits('100000', 9) },
    ];
  }

  // Staking actions
  async stake(amount: string, lockPeriod: number): Promise<string> {
    if (!this.stakingContract || !this.wafcContract || !this.signer) {
      throw new Error('Not connected');
    }

    const parsedAmount = this.parseAmount(amount);
    const stakingAddress = await this.stakingContract.getAddress();

    // Check allowance
    const signerAddress = await this.signer.getAddress();
    const allowance = await this.wafcContract.allowance(signerAddress, stakingAddress);

    if (allowance < parsedAmount) {
      const approveTx = await this.wafcContract.approve(stakingAddress, parsedAmount);
      await approveTx.wait();
    }

    const tx = await this.stakingContract.stake(parsedAmount, lockPeriod);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async unstake(stakeIndex: number): Promise<string> {
    if (!this.stakingContract) {
      throw new Error('Not connected');
    }

    const tx = await this.stakingContract.unstake(stakeIndex);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async claimRewards(stakeIndex: number): Promise<string> {
    if (!this.stakingContract) {
      throw new Error('Not connected');
    }

    const tx = await this.stakingContract.claimRewards(stakeIndex);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async claimAllRewards(): Promise<string> {
    if (!this.stakingContract) {
      throw new Error('Not connected');
    }

    const tx = await this.stakingContract.claimAllRewards();
    const receipt = await tx.wait();
    return receipt.hash;
  }

  // Calculate pending rewards for a specific stake
  async calculateRewards(address: string, stakeIndex: number): Promise<bigint> {
    if (!this.stakingContract) {
      return BigInt(0);
    }

    try {
      return await this.stakingContract.calculateRewards(address, stakeIndex);
    } catch {
      return BigInt(0);
    }
  }

  // Helper to check if stake is unlocked
  isStakeUnlocked(stake: Stake): boolean {
    return Date.now() / 1000 >= stake.unlockTime;
  }

  // Calculate time remaining until unlock
  getTimeRemaining(stake: Stake): { days: number; hours: number; minutes: number } {
    const now = Date.now() / 1000;
    const remaining = Math.max(0, stake.unlockTime - now);
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remaining % (60 * 60)) / 60);

    return { days, hours, minutes };
  }

  // Calculate early unstake penalty
  calculatePenalty(stake: Stake): bigint {
    if (this.isStakeUnlocked(stake)) {
      return BigInt(0);
    }
    return (stake.amount * BigInt(1000)) / BigInt(10000); // 10% penalty
  }
}

export const stakingService = new StakingService();
export default stakingService;
