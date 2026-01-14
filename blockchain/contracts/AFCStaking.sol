// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AFCStaking
 * @dev Staking contract for wAFC tokens with lock periods and reward multipliers.
 *      Supports railway project funding allocation from staking pool.
 */
contract AFCStaking is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable wAFC;

    // Lock periods
    uint256 public constant LOCK_3_MONTHS = 90 days;
    uint256 public constant LOCK_6_MONTHS = 180 days;
    uint256 public constant LOCK_12_MONTHS = 365 days;

    // APY in basis points (1200 = 12%)
    uint256 public constant BASE_APY = 1200;

    // Multipliers in basis points (10000 = 1.0x)
    uint256 public constant MULTIPLIER_3M = 10000;   // 1.0x  -> 12% APY
    uint256 public constant MULTIPLIER_6M = 12500;   // 1.25x -> 15% APY
    uint256 public constant MULTIPLIER_12M = 16700;  // 1.67x -> 20% APY

    uint256 public constant EARLY_UNSTAKE_PENALTY = 1000; // 10%
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    struct Stake {
        uint256 amount;
        uint256 lockPeriod;
        uint256 startTime;
        uint256 unlockTime;
        uint256 lastClaimTime;
        uint256 rewardsClaimed;
        bool active;
    }

    // User stakes: user address => array of stakes
    mapping(address => Stake[]) public stakes;
    mapping(address => uint256) public totalStakedByUser;

    // Global stats
    uint256 public totalStakedGlobal;
    uint256 public totalRewardsDistributed;
    uint256 public totalPenaltiesCollected;

    // Reward pool for distributing rewards
    uint256 public rewardPool;

    // Railway project funding tracking
    mapping(string => uint256) public projectFunding;
    string[] public fundedProjects;

    // Events
    event Staked(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 amount,
        uint256 lockPeriod,
        uint256 unlockTime
    );
    event Unstaked(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 principal,
        uint256 rewards,
        uint256 penalty
    );
    event RewardsClaimed(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 amount
    );
    event RewardPoolFunded(address indexed funder, uint256 amount);
    event ProjectFunded(string indexed region, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    constructor(address _wAFC) Ownable(msg.sender) {
        require(_wAFC != address(0), "Invalid token address");
        wAFC = IERC20(_wAFC);
    }

    /**
     * @dev Stake wAFC tokens with a specified lock period.
     * @param amount Amount of wAFC to stake
     * @param lockPeriod Lock duration (LOCK_3_MONTHS, LOCK_6_MONTHS, or LOCK_12_MONTHS)
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(
            lockPeriod == LOCK_3_MONTHS ||
            lockPeriod == LOCK_6_MONTHS ||
            lockPeriod == LOCK_12_MONTHS,
            "Invalid lock period"
        );

        wAFC.safeTransferFrom(msg.sender, address(this), amount);

        uint256 unlockTime = block.timestamp + lockPeriod;
        uint256 stakeIndex = stakes[msg.sender].length;

        stakes[msg.sender].push(Stake({
            amount: amount,
            lockPeriod: lockPeriod,
            startTime: block.timestamp,
            unlockTime: unlockTime,
            lastClaimTime: block.timestamp,
            rewardsClaimed: 0,
            active: true
        }));

        totalStakedByUser[msg.sender] += amount;
        totalStakedGlobal += amount;

        emit Staked(msg.sender, stakeIndex, amount, lockPeriod, unlockTime);
    }

    /**
     * @dev Calculate pending rewards for a specific stake.
     */
    function calculateRewards(address user, uint256 stakeIndex) public view returns (uint256) {
        require(stakeIndex < stakes[user].length, "Invalid stake index");
        Stake storage s = stakes[user][stakeIndex];

        if (!s.active || s.amount == 0) {
            return 0;
        }

        uint256 timeStaked = block.timestamp - s.lastClaimTime;
        uint256 multiplier = getMultiplier(s.lockPeriod);

        // rewards = (amount * APY * multiplier * time) / (SECONDS_PER_YEAR * BASIS_POINTS * BASIS_POINTS)
        uint256 rewards = (s.amount * BASE_APY * multiplier * timeStaked) /
            (SECONDS_PER_YEAR * BASIS_POINTS * BASIS_POINTS);

        return rewards;
    }

    /**
     * @dev Get the APY multiplier for a lock period.
     */
    function getMultiplier(uint256 lockPeriod) public pure returns (uint256) {
        if (lockPeriod == LOCK_12_MONTHS) return MULTIPLIER_12M;
        if (lockPeriod == LOCK_6_MONTHS) return MULTIPLIER_6M;
        return MULTIPLIER_3M;
    }

    /**
     * @dev Get effective APY for a lock period (in basis points).
     */
    function getEffectiveAPY(uint256 lockPeriod) public pure returns (uint256) {
        return (BASE_APY * getMultiplier(lockPeriod)) / BASIS_POINTS;
    }

    /**
     * @dev Claim accumulated rewards for a specific stake.
     */
    function claimRewards(uint256 stakeIndex) external nonReentrant whenNotPaused {
        require(stakeIndex < stakes[msg.sender].length, "Invalid stake index");
        Stake storage s = stakes[msg.sender][stakeIndex];
        require(s.active, "Stake not active");

        uint256 rewards = calculateRewards(msg.sender, stakeIndex);
        require(rewards > 0, "No rewards to claim");
        require(rewardPool >= rewards, "Insufficient reward pool");

        s.lastClaimTime = block.timestamp;
        s.rewardsClaimed += rewards;
        rewardPool -= rewards;
        totalRewardsDistributed += rewards;

        wAFC.safeTransfer(msg.sender, rewards);

        emit RewardsClaimed(msg.sender, stakeIndex, rewards);
    }

    /**
     * @dev Claim all pending rewards across all stakes.
     */
    function claimAllRewards() external nonReentrant whenNotPaused {
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < stakes[msg.sender].length; i++) {
            Stake storage s = stakes[msg.sender][i];
            if (s.active) {
                uint256 rewards = calculateRewards(msg.sender, i);
                if (rewards > 0) {
                    s.lastClaimTime = block.timestamp;
                    s.rewardsClaimed += rewards;
                    totalRewards += rewards;
                }
            }
        }

        require(totalRewards > 0, "No rewards to claim");
        require(rewardPool >= totalRewards, "Insufficient reward pool");

        rewardPool -= totalRewards;
        totalRewardsDistributed += totalRewards;

        wAFC.safeTransfer(msg.sender, totalRewards);

        emit RewardsClaimed(msg.sender, type(uint256).max, totalRewards);
    }

    /**
     * @dev Unstake tokens. Applies penalty if before unlock time.
     */
    function unstake(uint256 stakeIndex) external nonReentrant whenNotPaused {
        require(stakeIndex < stakes[msg.sender].length, "Invalid stake index");
        Stake storage s = stakes[msg.sender][stakeIndex];
        require(s.active, "Stake not active");

        uint256 principal = s.amount;
        uint256 rewards = calculateRewards(msg.sender, stakeIndex);
        uint256 penalty = 0;

        // Apply penalty if unstaking early
        if (block.timestamp < s.unlockTime) {
            penalty = (principal * EARLY_UNSTAKE_PENALTY) / BASIS_POINTS;
            principal -= penalty;
            totalPenaltiesCollected += penalty;
            // Penalties go to reward pool
            rewardPool += penalty;
        }

        // Deactivate stake
        s.active = false;
        s.amount = 0;

        totalStakedByUser[msg.sender] -= (principal + penalty);
        totalStakedGlobal -= (principal + penalty);

        // Transfer principal
        wAFC.safeTransfer(msg.sender, principal);

        // Transfer rewards if available
        if (rewards > 0 && rewardPool >= rewards) {
            rewardPool -= rewards;
            totalRewardsDistributed += rewards;
            wAFC.safeTransfer(msg.sender, rewards);
        }

        emit Unstaked(msg.sender, stakeIndex, principal, rewards, penalty);
    }

    /**
     * @dev Fund the reward pool. Anyone can contribute.
     */
    function fundRewardPool(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        wAFC.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardPoolFunded(msg.sender, amount);
    }

    /**
     * @dev Allocate funds to a railway project. Owner only.
     */
    function fundProject(string calldata region, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(rewardPool >= amount, "Insufficient reward pool");

        if (projectFunding[region] == 0) {
            fundedProjects.push(region);
        }

        projectFunding[region] += amount;
        rewardPool -= amount;

        emit ProjectFunded(region, amount);
    }

    // ============ View Functions ============

    /**
     * @dev Get all stakes for a user.
     */
    function getUserStakes(address user) external view returns (Stake[] memory) {
        return stakes[user];
    }

    /**
     * @dev Get total pending rewards for a user across all stakes.
     */
    function getUserTotalPendingRewards(address user) external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < stakes[user].length; i++) {
            if (stakes[user][i].active) {
                total += calculateRewards(user, i);
            }
        }
        return total;
    }

    /**
     * @dev Get count of active stakes for a user.
     */
    function getUserActiveStakeCount(address user) external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < stakes[user].length; i++) {
            if (stakes[user][i].active) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Get global staking statistics.
     */
    function getGlobalStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalRewardsDistributed,
        uint256 _totalPenaltiesCollected,
        uint256 _rewardPool
    ) {
        return (
            totalStakedGlobal,
            totalRewardsDistributed,
            totalPenaltiesCollected,
            rewardPool
        );
    }

    /**
     * @dev Get all funded projects.
     */
    function getFundedProjects() external view returns (string[] memory) {
        return fundedProjects;
    }

    /**
     * @dev Get funding amount for a specific project.
     */
    function getProjectFunding(string calldata region) external view returns (uint256) {
        return projectFunding[region];
    }

    // ============ Admin Functions ============

    /**
     * @dev Pause staking operations. Owner only.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause staking operations. Owner only.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw for users when paused.
     */
    function emergencyWithdraw(uint256 stakeIndex) external nonReentrant whenPaused {
        require(stakeIndex < stakes[msg.sender].length, "Invalid stake index");
        Stake storage s = stakes[msg.sender][stakeIndex];
        require(s.active, "Stake not active");

        uint256 amount = s.amount;
        s.active = false;
        s.amount = 0;

        totalStakedByUser[msg.sender] -= amount;
        totalStakedGlobal -= amount;

        wAFC.safeTransfer(msg.sender, amount);

        emit EmergencyWithdraw(msg.sender, amount);
    }

    /**
     * @dev Recover accidentally sent tokens (not wAFC staked).
     */
    function recoverTokens(address token, uint256 amount) external onlyOwner {
        require(token != address(wAFC) || amount <= rewardPool, "Cannot recover staked tokens");
        IERC20(token).safeTransfer(owner(), amount);
    }
}
