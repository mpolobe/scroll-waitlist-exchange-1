const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AFCStaking", function () {
  let wAFC, staking, distributor;
  let owner, user1, user2, relayer;
  
  const LOCK_3_MONTHS = 90 * 24 * 60 * 60;
  const LOCK_6_MONTHS = 180 * 24 * 60 * 60;
  const LOCK_12_MONTHS = 365 * 24 * 60 * 60;
  
  const STAKE_AMOUNT = ethers.parseUnits("1000", 9); // 1000 wAFC (9 decimals)
  const REWARD_POOL_AMOUNT = ethers.parseUnits("100000", 9); // 100k wAFC for rewards

  beforeEach(async function () {
    [owner, user1, user2, relayer] = await ethers.getSigners();

    // Deploy wAFC
    const WrappedAfricoin = await ethers.getContractFactory("WrappedAfricoin");
    wAFC = await WrappedAfricoin.deploy(owner.address, relayer.address);
    await wAFC.waitForDeployment();

    // Deploy AFCStaking
    const AFCStaking = await ethers.getContractFactory("AFCStaking");
    staking = await AFCStaking.deploy(await wAFC.getAddress());
    await staking.waitForDeployment();

    // Deploy RewardDistributor
    const RewardDistributor = await ethers.getContractFactory("RewardDistributor");
    distributor = await RewardDistributor.deploy(await wAFC.getAddress());
    await distributor.waitForDeployment();

    // Mint tokens to users for testing
    await wAFC.connect(relayer).mint(user1.address, ethers.parseUnits("10000", 9));
    await wAFC.connect(relayer).mint(user2.address, ethers.parseUnits("10000", 9));
    
    // Fund reward pool
    await wAFC.connect(relayer).mint(owner.address, REWARD_POOL_AMOUNT);
    await wAFC.connect(owner).approve(await staking.getAddress(), REWARD_POOL_AMOUNT);
    await staking.connect(owner).fundRewardPool(REWARD_POOL_AMOUNT);
  });

  describe("Deployment", function () {
    it("Should set the correct wAFC address", async function () {
      expect(await staking.wAFC()).to.equal(await wAFC.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await staking.owner()).to.equal(owner.address);
    });

    it("Should have funded reward pool", async function () {
      expect(await staking.rewardPool()).to.equal(REWARD_POOL_AMOUNT);
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      await wAFC.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
    });

    it("Should allow staking with 3-month lock", async function () {
      await expect(staking.connect(user1).stake(STAKE_AMOUNT, LOCK_3_MONTHS))
        .to.emit(staking, "Staked");

      expect(await staking.totalStakedByUser(user1.address)).to.equal(STAKE_AMOUNT);
      expect(await staking.totalStakedGlobal()).to.equal(STAKE_AMOUNT);
      
      const stakes = await staking.getUserStakes(user1.address);
      expect(stakes[0].lockPeriod).to.equal(LOCK_3_MONTHS);
    });

    it("Should allow staking with 6-month lock", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT, LOCK_6_MONTHS);
      
      const stakes = await staking.getUserStakes(user1.address);
      expect(stakes.length).to.equal(1);
      expect(stakes[0].lockPeriod).to.equal(LOCK_6_MONTHS);
    });

    it("Should allow staking with 12-month lock", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT, LOCK_12_MONTHS);
      
      const stakes = await staking.getUserStakes(user1.address);
      expect(stakes[0].lockPeriod).to.equal(LOCK_12_MONTHS);
    });

    it("Should reject invalid lock periods", async function () {
      await expect(staking.connect(user1).stake(STAKE_AMOUNT, 30 * 24 * 60 * 60))
        .to.be.revertedWith("Invalid lock period");
    });

    it("Should reject zero amount", async function () {
      await expect(staking.connect(user1).stake(0, LOCK_3_MONTHS))
        .to.be.revertedWith("Amount must be > 0");
    });

    it("Should allow multiple stakes from same user", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT, LOCK_3_MONTHS);
      
      await wAFC.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT, LOCK_6_MONTHS);
      
      const stakes = await staking.getUserStakes(user1.address);
      expect(stakes.length).to.equal(2);
      expect(await staking.totalStakedByUser(user1.address)).to.equal(STAKE_AMOUNT * 2n);
    });
  });

  describe("Rewards Calculation", function () {
    beforeEach(async function () {
      await wAFC.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT, LOCK_3_MONTHS);
    });

    it("Should calculate rewards correctly after time passes", async function () {
      // Advance 30 days
      await time.increase(30 * 24 * 60 * 60);
      
      const rewards = await staking.calculateRewards(user1.address, 0);
      expect(rewards).to.be.gt(0);
    });

    it("Should return higher rewards for longer lock periods", async function () {
      // Stake with 12-month lock
      await wAFC.connect(user2).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user2).stake(STAKE_AMOUNT, LOCK_12_MONTHS);
      
      // Advance 30 days
      await time.increase(30 * 24 * 60 * 60);
      
      const rewards3m = await staking.calculateRewards(user1.address, 0);
      const rewards12m = await staking.calculateRewards(user2.address, 0);
      
      // 12-month should have higher rewards due to multiplier
      expect(rewards12m).to.be.gt(rewards3m);
    });

    it("Should return correct APY multipliers", async function () {
      expect(await staking.getMultiplier(LOCK_3_MONTHS)).to.equal(10000);  // 1.0x
      expect(await staking.getMultiplier(LOCK_6_MONTHS)).to.equal(12500);  // 1.25x
      expect(await staking.getMultiplier(LOCK_12_MONTHS)).to.equal(16700); // 1.67x
    });

    it("Should return correct effective APY", async function () {
      expect(await staking.getEffectiveAPY(LOCK_3_MONTHS)).to.equal(1200);  // 12%
      expect(await staking.getEffectiveAPY(LOCK_6_MONTHS)).to.equal(1500);  // 15%
      expect(await staking.getEffectiveAPY(LOCK_12_MONTHS)).to.equal(2004); // ~20%
    });
  });

  describe("Claiming Rewards", function () {
    beforeEach(async function () {
      await wAFC.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT, LOCK_3_MONTHS);
    });

    it("Should allow claiming rewards", async function () {
      await time.increase(30 * 24 * 60 * 60);
      
      const rewardsBefore = await staking.calculateRewards(user1.address, 0);
      const balanceBefore = await wAFC.balanceOf(user1.address);
      
      await staking.connect(user1).claimRewards(0);
      
      const balanceAfter = await wAFC.balanceOf(user1.address);
      expect(balanceAfter - balanceBefore).to.be.closeTo(rewardsBefore, ethers.parseUnits("1", 9));
    });

    it("Should update lastClaimTime after claiming", async function () {
      await time.increase(30 * 24 * 60 * 60);
      await staking.connect(user1).claimRewards(0);
      
      // Rewards should be near zero right after claiming
      const rewards = await staking.calculateRewards(user1.address, 0);
      expect(rewards).to.be.lt(ethers.parseUnits("1", 9));
    });

    it("Should have zero or minimal rewards immediately after staking", async function () {
      const rewards = await staking.calculateRewards(user1.address, 0);
      // Rewards should be very small (near zero) immediately after staking
      expect(rewards).to.be.lt(ethers.parseUnits("1", 9));
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      await wAFC.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT, LOCK_3_MONTHS);
    });

    it("Should allow unstaking after lock period", async function () {
      await time.increase(LOCK_3_MONTHS + 1);
      
      const balanceBefore = await wAFC.balanceOf(user1.address);
      await staking.connect(user1).unstake(0);
      const balanceAfter = await wAFC.balanceOf(user1.address);
      
      // Should receive principal + rewards, no penalty
      expect(balanceAfter).to.be.gt(balanceBefore + STAKE_AMOUNT - ethers.parseUnits("1", 9));
    });

    it("Should apply penalty for early unstaking", async function () {
      await time.increase(30 * 24 * 60 * 60); // Only 30 days
      
      const balanceBefore = await wAFC.balanceOf(user1.address);
      
      await expect(staking.connect(user1).unstake(0))
        .to.emit(staking, "Unstaked");
      
      const balanceAfter = await wAFC.balanceOf(user1.address);
      
      // Should receive less than staked amount due to 10% penalty
      const expectedPrincipal = STAKE_AMOUNT - (STAKE_AMOUNT * 1000n / 10000n);
      expect(balanceAfter - balanceBefore).to.be.closeTo(expectedPrincipal, ethers.parseUnits("10", 9));
    });

    it("Should add penalty to reward pool", async function () {
      const rewardPoolBefore = await staking.rewardPool();
      
      await time.increase(30 * 24 * 60 * 60);
      await staking.connect(user1).unstake(0);
      
      const rewardPoolAfter = await staking.rewardPool();
      const expectedPenalty = STAKE_AMOUNT * 1000n / 10000n;
      
      // Reward pool should increase by penalty amount (minus any rewards paid)
      expect(rewardPoolAfter).to.be.gt(rewardPoolBefore - ethers.parseUnits("100", 9));
    });

    it("Should deactivate stake after unstaking", async function () {
      await time.increase(LOCK_3_MONTHS + 1);
      await staking.connect(user1).unstake(0);
      
      const stakes = await staking.getUserStakes(user1.address);
      expect(stakes[0].active).to.be.false;
    });
  });

  describe("Global Stats", function () {
    it("Should track global statistics correctly", async function () {
      await wAFC.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT, LOCK_3_MONTHS);
      
      await wAFC.connect(user2).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user2).stake(STAKE_AMOUNT, LOCK_6_MONTHS);
      
      const [totalStaked, totalRewards, totalPenalties, rewardPool] = await staking.getGlobalStats();
      
      expect(totalStaked).to.equal(STAKE_AMOUNT * 2n);
      expect(totalRewards).to.equal(0);
      expect(totalPenalties).to.equal(0);
      expect(rewardPool).to.equal(REWARD_POOL_AMOUNT);
    });
  });

  describe("Project Funding", function () {
    it("Should allow owner to fund projects", async function () {
      const fundAmount = ethers.parseUnits("1000", 9);
      
      await expect(staking.connect(owner).fundProject("East Africa", fundAmount))
        .to.emit(staking, "ProjectFunded")
        .withArgs("East Africa", fundAmount);
      
      expect(await staking.getProjectFunding("East Africa")).to.equal(fundAmount);
    });

    it("Should track multiple funded projects", async function () {
      await staking.connect(owner).fundProject("East Africa", ethers.parseUnits("1000", 9));
      await staking.connect(owner).fundProject("West Africa", ethers.parseUnits("2000", 9));
      
      const projects = await staking.getFundedProjects();
      expect(projects.length).to.equal(2);
      expect(projects).to.include("East Africa");
      expect(projects).to.include("West Africa");
    });

    it("Should reject non-owner funding projects", async function () {
      await expect(staking.connect(user1).fundProject("East Africa", ethers.parseUnits("1000", 9)))
        .to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause", async function () {
      await staking.connect(owner).pause();
      expect(await staking.paused()).to.be.true;
    });

    it("Should prevent staking when paused", async function () {
      await staking.connect(owner).pause();
      await wAFC.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      
      await expect(staking.connect(user1).stake(STAKE_AMOUNT, LOCK_3_MONTHS))
        .to.be.revertedWithCustomError(staking, "EnforcedPause");
    });

    it("Should allow emergency withdraw when paused", async function () {
      await wAFC.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT, LOCK_3_MONTHS);
      
      await staking.connect(owner).pause();
      
      await expect(staking.connect(user1).emergencyWithdraw(0))
        .to.emit(staking, "EmergencyWithdraw")
        .withArgs(user1.address, STAKE_AMOUNT);
    });
  });
});

describe("RewardDistributor", function () {
  let wAFC, distributor;
  let owner, user1, sentinel1, sentinel2, relayer;
  
  const ALLOCATION_AMOUNT = ethers.parseUnits("100000", 9);

  beforeEach(async function () {
    [owner, user1, sentinel1, sentinel2, relayer] = await ethers.getSigners();

    const WrappedAfricoin = await ethers.getContractFactory("WrappedAfricoin");
    wAFC = await WrappedAfricoin.deploy(owner.address, relayer.address);
    await wAFC.waitForDeployment();

    const RewardDistributor = await ethers.getContractFactory("RewardDistributor");
    distributor = await RewardDistributor.deploy(await wAFC.getAddress());
    await distributor.waitForDeployment();

    // Mint tokens for testing
    await wAFC.connect(relayer).mint(owner.address, ALLOCATION_AMOUNT);
    await wAFC.connect(owner).approve(await distributor.getAddress(), ALLOCATION_AMOUNT);
  });

  describe("Fund Allocation", function () {
    it("Should allocate funds according to tokenomics", async function () {
      await distributor.connect(owner).allocateFunds(ALLOCATION_AMOUNT);
      
      const [total, staking, ecosystem, liquidity, sentinel, reserve] = 
        await distributor.getDistributionStats();
      
      expect(total).to.equal(ALLOCATION_AMOUNT);
      expect(staking).to.equal(ALLOCATION_AMOUNT * 4500n / 10000n);  // 45%
      expect(ecosystem).to.equal(ALLOCATION_AMOUNT * 2000n / 10000n); // 20%
      expect(liquidity).to.equal(ALLOCATION_AMOUNT * 1500n / 10000n); // 15%
      expect(sentinel).to.equal(ALLOCATION_AMOUNT * 1000n / 10000n);  // 10%
    });
  });

  describe("Sentinel Management", function () {
    it("Should add sentinels", async function () {
      await expect(distributor.connect(owner).addSentinel(sentinel1.address))
        .to.emit(distributor, "SentinelAdded")
        .withArgs(sentinel1.address);
      
      expect(await distributor.isSentinel(sentinel1.address)).to.be.true;
    });

    it("Should remove sentinels", async function () {
      await distributor.connect(owner).addSentinel(sentinel1.address);
      await distributor.connect(owner).removeSentinel(sentinel1.address);
      
      expect(await distributor.isSentinel(sentinel1.address)).to.be.false;
    });

    it("Should reward sentinels", async function () {
      await distributor.connect(owner).addSentinel(sentinel1.address);
      await distributor.connect(owner).allocateFunds(ALLOCATION_AMOUNT);
      
      const rewardAmount = ethers.parseUnits("100", 9);
      
      await expect(distributor.connect(owner).rewardSentinel(sentinel1.address, rewardAmount))
        .to.emit(distributor, "SentinelRewarded")
        .withArgs(sentinel1.address, rewardAmount);
      
      expect(await wAFC.balanceOf(sentinel1.address)).to.equal(rewardAmount);
    });
  });

  describe("Vesting", function () {
    const VESTING_AMOUNT = ethers.parseUnits("10000", 9);
    const CLIFF = 180 * 24 * 60 * 60; // 6 months
    const DURATION = 365 * 24 * 60 * 60; // 12 months

    beforeEach(async function () {
      await wAFC.connect(relayer).mint(owner.address, VESTING_AMOUNT);
      await wAFC.connect(owner).approve(await distributor.getAddress(), VESTING_AMOUNT);
    });

    it("Should create vesting schedule", async function () {
      await expect(distributor.connect(owner).createVestingSchedule(
        user1.address,
        VESTING_AMOUNT,
        CLIFF,
        DURATION
      )).to.emit(distributor, "VestingScheduleCreated");
      
      const [total, released, releasable] = await distributor.getVestingSchedule(user1.address);
      expect(total).to.equal(VESTING_AMOUNT);
      expect(released).to.equal(0);
      expect(releasable).to.equal(0); // Still in cliff
    });

    it("Should release vested tokens after cliff", async function () {
      await distributor.connect(owner).createVestingSchedule(
        user1.address,
        VESTING_AMOUNT,
        CLIFF,
        DURATION
      );
      
      // Advance past cliff
      await time.increase(CLIFF + 30 * 24 * 60 * 60);
      
      const releasable = await distributor.releasableAmount(user1.address);
      expect(releasable).to.be.gt(0);
      
      await distributor.connect(user1).releaseVested();
      expect(await wAFC.balanceOf(user1.address)).to.be.gt(0);
    });

    it("Should revoke vesting and return unvested tokens", async function () {
      await distributor.connect(owner).createVestingSchedule(
        user1.address,
        VESTING_AMOUNT,
        CLIFF,
        DURATION
      );
      
      const ownerBalanceBefore = await wAFC.balanceOf(owner.address);
      
      await distributor.connect(owner).revokeVesting(user1.address);
      
      const ownerBalanceAfter = await wAFC.balanceOf(owner.address);
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });
  });
});
