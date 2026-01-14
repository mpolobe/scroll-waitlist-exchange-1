// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RewardDistributor
 * @dev Manages reward distribution schedules and vesting for AFC staking ecosystem.
 *      Handles community rewards, sentinel rewards, and ecosystem fund allocation.
 */
contract RewardDistributor is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable wAFC;

    // Allocation percentages in basis points (10000 = 100%)
    uint256 public constant STAKING_REWARDS_BPS = 4500;    // 45% - Community & Sentinels
    uint256 public constant ECOSYSTEM_FUND_BPS = 2000;     // 20% - Ecosystem development
    uint256 public constant LIQUIDITY_BPS = 1500;          // 15% - Liquidity incentives
    uint256 public constant SENTINEL_REWARDS_BPS = 1000;   // 10% - Track worker rewards
    uint256 public constant RESERVE_BPS = 1000;            // 10% - Reserve fund

    uint256 public constant BASIS_POINTS = 10000;

    // Distribution tracking
    uint256 public totalDistributed;
    uint256 public stakingRewardsDistributed;
    uint256 public ecosystemFundDistributed;
    uint256 public liquidityDistributed;
    uint256 public sentinelRewardsDistributed;
    uint256 public reserveDistributed;

    // Vesting schedules
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 released;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
        bool revoked;
    }

    mapping(address => VestingSchedule) public vestingSchedules;
    address[] public vestingBeneficiaries;

    // Sentinel (track worker) rewards
    mapping(address => uint256) public sentinelRewards;
    mapping(address => bool) public isSentinel;
    address[] public sentinels;

    // Authorized distributors (staking contract, etc.)
    mapping(address => bool) public authorizedDistributors;

    // Events
    event RewardsAllocated(
        uint256 stakingAmount,
        uint256 ecosystemAmount,
        uint256 liquidityAmount,
        uint256 sentinelAmount,
        uint256 reserveAmount
    );
    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 amount,
        uint256 cliffDuration,
        uint256 vestingDuration
    );
    event VestingReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 unvestedAmount);
    event SentinelAdded(address indexed sentinel);
    event SentinelRemoved(address indexed sentinel);
    event SentinelRewarded(address indexed sentinel, uint256 amount);
    event DistributorAuthorized(address indexed distributor);
    event DistributorRevoked(address indexed distributor);

    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || authorizedDistributors[msg.sender],
            "Not authorized"
        );
        _;
    }

    constructor(address _wAFC) Ownable(msg.sender) {
        require(_wAFC != address(0), "Invalid token address");
        wAFC = IERC20(_wAFC);
    }

    // ============ Distribution Functions ============

    /**
     * @dev Allocate incoming funds according to tokenomics.
     */
    function allocateFunds(uint256 amount) external onlyAuthorized nonReentrant {
        require(amount > 0, "Amount must be > 0");
        wAFC.safeTransferFrom(msg.sender, address(this), amount);

        uint256 stakingAmount = (amount * STAKING_REWARDS_BPS) / BASIS_POINTS;
        uint256 ecosystemAmount = (amount * ECOSYSTEM_FUND_BPS) / BASIS_POINTS;
        uint256 liquidityAmount = (amount * LIQUIDITY_BPS) / BASIS_POINTS;
        uint256 sentinelAmount = (amount * SENTINEL_REWARDS_BPS) / BASIS_POINTS;
        uint256 reserveAmount = amount - stakingAmount - ecosystemAmount - liquidityAmount - sentinelAmount;

        stakingRewardsDistributed += stakingAmount;
        ecosystemFundDistributed += ecosystemAmount;
        liquidityDistributed += liquidityAmount;
        sentinelRewardsDistributed += sentinelAmount;
        reserveDistributed += reserveAmount;
        totalDistributed += amount;

        emit RewardsAllocated(
            stakingAmount,
            ecosystemAmount,
            liquidityAmount,
            sentinelAmount,
            reserveAmount
        );
    }

    /**
     * @dev Transfer staking rewards to the staking contract.
     */
    function transferToStakingContract(address stakingContract, uint256 amount) external onlyOwner {
        require(amount <= stakingRewardsDistributed, "Exceeds allocated staking rewards");
        wAFC.safeTransfer(stakingContract, amount);
    }

    // ============ Vesting Functions ============

    /**
     * @dev Create a vesting schedule for a beneficiary.
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        require(vestingDuration > 0, "Vesting duration must be > 0");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Schedule exists");

        wAFC.safeTransferFrom(msg.sender, address(this), amount);

        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            released: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            revoked: false
        });

        vestingBeneficiaries.push(beneficiary);

        emit VestingScheduleCreated(beneficiary, amount, cliffDuration, vestingDuration);
    }

    /**
     * @dev Calculate vested amount for a beneficiary.
     */
    function vestedAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];

        if (schedule.revoked) {
            return schedule.released;
        }

        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }

        uint256 elapsed = block.timestamp - schedule.startTime;
        if (elapsed >= schedule.vestingDuration) {
            return schedule.totalAmount;
        }

        return (schedule.totalAmount * elapsed) / schedule.vestingDuration;
    }

    /**
     * @dev Calculate releasable amount for a beneficiary.
     */
    function releasableAmount(address beneficiary) public view returns (uint256) {
        return vestedAmount(beneficiary) - vestingSchedules[beneficiary].released;
    }

    /**
     * @dev Release vested tokens to beneficiary.
     */
    function releaseVested() external nonReentrant {
        uint256 amount = releasableAmount(msg.sender);
        require(amount > 0, "No tokens to release");

        vestingSchedules[msg.sender].released += amount;
        wAFC.safeTransfer(msg.sender, amount);

        emit VestingReleased(msg.sender, amount);
    }

    /**
     * @dev Revoke vesting schedule. Unvested tokens returned to owner.
     */
    function revokeVesting(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(!schedule.revoked, "Already revoked");

        uint256 vested = vestedAmount(beneficiary);
        uint256 unvested = schedule.totalAmount - vested;

        schedule.revoked = true;

        if (unvested > 0) {
            wAFC.safeTransfer(owner(), unvested);
        }

        emit VestingRevoked(beneficiary, unvested);
    }

    // ============ Sentinel Functions ============

    /**
     * @dev Add a sentinel (track worker) to receive rewards.
     */
    function addSentinel(address sentinel) external onlyOwner {
        require(sentinel != address(0), "Invalid address");
        require(!isSentinel[sentinel], "Already a sentinel");

        isSentinel[sentinel] = true;
        sentinels.push(sentinel);

        emit SentinelAdded(sentinel);
    }

    /**
     * @dev Remove a sentinel.
     */
    function removeSentinel(address sentinel) external onlyOwner {
        require(isSentinel[sentinel], "Not a sentinel");
        isSentinel[sentinel] = false;

        // Remove from array
        for (uint256 i = 0; i < sentinels.length; i++) {
            if (sentinels[i] == sentinel) {
                sentinels[i] = sentinels[sentinels.length - 1];
                sentinels.pop();
                break;
            }
        }

        emit SentinelRemoved(sentinel);
    }

    /**
     * @dev Reward a sentinel for safety reporting.
     */
    function rewardSentinel(address sentinel, uint256 amount) external onlyAuthorized {
        require(isSentinel[sentinel], "Not a sentinel");
        require(amount <= sentinelRewardsDistributed, "Exceeds sentinel allocation");

        sentinelRewards[sentinel] += amount;
        sentinelRewardsDistributed -= amount;
        wAFC.safeTransfer(sentinel, amount);

        emit SentinelRewarded(sentinel, amount);
    }

    /**
     * @dev Batch reward multiple sentinels.
     */
    function batchRewardSentinels(
        address[] calldata _sentinels,
        uint256[] calldata amounts
    ) external onlyAuthorized {
        require(_sentinels.length == amounts.length, "Length mismatch");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(totalAmount <= sentinelRewardsDistributed, "Exceeds sentinel allocation");

        for (uint256 i = 0; i < _sentinels.length; i++) {
            require(isSentinel[_sentinels[i]], "Not a sentinel");
            sentinelRewards[_sentinels[i]] += amounts[i];
            wAFC.safeTransfer(_sentinels[i], amounts[i]);
            emit SentinelRewarded(_sentinels[i], amounts[i]);
        }

        sentinelRewardsDistributed -= totalAmount;
    }

    // ============ Authorization Functions ============

    /**
     * @dev Authorize a distributor (e.g., staking contract).
     */
    function authorizeDistributor(address distributor) external onlyOwner {
        require(distributor != address(0), "Invalid address");
        authorizedDistributors[distributor] = true;
        emit DistributorAuthorized(distributor);
    }

    /**
     * @dev Revoke distributor authorization.
     */
    function revokeDistributor(address distributor) external onlyOwner {
        authorizedDistributors[distributor] = false;
        emit DistributorRevoked(distributor);
    }

    // ============ View Functions ============

    /**
     * @dev Get all vesting beneficiaries.
     */
    function getVestingBeneficiaries() external view returns (address[] memory) {
        return vestingBeneficiaries;
    }

    /**
     * @dev Get all sentinels.
     */
    function getSentinels() external view returns (address[] memory) {
        return sentinels;
    }

    /**
     * @dev Get distribution statistics.
     */
    function getDistributionStats() external view returns (
        uint256 _totalDistributed,
        uint256 _stakingRewards,
        uint256 _ecosystemFund,
        uint256 _liquidity,
        uint256 _sentinelRewards,
        uint256 _reserve
    ) {
        return (
            totalDistributed,
            stakingRewardsDistributed,
            ecosystemFundDistributed,
            liquidityDistributed,
            sentinelRewardsDistributed,
            reserveDistributed
        );
    }

    /**
     * @dev Get vesting schedule details.
     */
    function getVestingSchedule(address beneficiary) external view returns (
        uint256 total,
        uint256 released,
        uint256 releasable,
        uint256 startTime,
        uint256 cliffEnd,
        uint256 vestingEnd,
        bool revoked
    ) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        return (
            schedule.totalAmount,
            schedule.released,
            releasableAmount(beneficiary),
            schedule.startTime,
            schedule.startTime + schedule.cliffDuration,
            schedule.startTime + schedule.vestingDuration,
            schedule.revoked
        );
    }

    /**
     * @dev Get contract token balance.
     */
    function getBalance() external view returns (uint256) {
        return wAFC.balanceOf(address(this));
    }

    // ============ Emergency Functions ============

    /**
     * @dev Recover accidentally sent tokens.
     */
    function recoverTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
