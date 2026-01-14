const hre = require("hardhat");

async function main() {
  console.log("Deploying AFC Staking System to", hre.network.name);
  console.log("=".repeat(50));

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  console.log();

  // Get wAFC address from env or deploy new one
  let wafcAddress = process.env.WAFC_ADDRESS;
  
  if (!wafcAddress) {
    console.log("1. Deploying WrappedAfricoin (wAFC)...");
    const RELAYER_ADDRESS = process.env.RELAYER_ADDRESS || deployer.address;
    
    const WrappedAfricoin = await hre.ethers.getContractFactory("WrappedAfricoin");
    const wafc = await WrappedAfricoin.deploy(deployer.address, RELAYER_ADDRESS);
    await wafc.waitForDeployment();
    
    wafcAddress = await wafc.getAddress();
    console.log("   wAFC deployed to:", wafcAddress);
  } else {
    console.log("1. Using existing wAFC at:", wafcAddress);
  }
  console.log();

  // Deploy AFCStaking
  console.log("2. Deploying AFCStaking...");
  const AFCStaking = await hre.ethers.getContractFactory("AFCStaking");
  const staking = await AFCStaking.deploy(wafcAddress);
  await staking.waitForDeployment();
  
  const stakingAddress = await staking.getAddress();
  console.log("   AFCStaking deployed to:", stakingAddress);
  console.log();

  // Deploy RewardDistributor
  console.log("3. Deploying RewardDistributor...");
  const RewardDistributor = await hre.ethers.getContractFactory("RewardDistributor");
  const distributor = await RewardDistributor.deploy(wafcAddress);
  await distributor.waitForDeployment();
  
  const distributorAddress = await distributor.getAddress();
  console.log("   RewardDistributor deployed to:", distributorAddress);
  console.log();

  // Setup: Authorize staking contract as distributor
  console.log("4. Setting up permissions...");
  const distributorContract = await hre.ethers.getContractAt("RewardDistributor", distributorAddress);
  const authTx = await distributorContract.authorizeDistributor(stakingAddress);
  await authTx.wait();
  console.log("   Authorized AFCStaking as distributor");

  // If we deployed wAFC, grant REWARDS_MINTER_ROLE to staking contract
  if (!process.env.WAFC_ADDRESS) {
    const wafcContract = await hre.ethers.getContractAt("WrappedAfricoin", wafcAddress);
    const REWARDS_MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("REWARDS_MINTER_ROLE"));
    const grantTx = await wafcContract.grantRole(REWARDS_MINTER_ROLE, stakingAddress);
    await grantTx.wait();
    console.log("   Granted REWARDS_MINTER_ROLE to AFCStaking");
  }
  console.log();

  // Summary
  console.log("=".repeat(50));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log("Network:            ", hre.network.name);
  console.log("wAFC:               ", wafcAddress);
  console.log("AFCStaking:         ", stakingAddress);
  console.log("RewardDistributor:  ", distributorAddress);
  console.log();
  console.log("Add to .env:");
  console.log(`WAFC_ADDRESS=${wafcAddress}`);
  console.log(`AFC_STAKING_ADDRESS=${stakingAddress}`);
  console.log(`REWARD_DISTRIBUTOR_ADDRESS=${distributorAddress}`);
  console.log();

  // Verify contracts if on supported network
  if (["scrollSepolia", "scroll", "polygonAmoy"].includes(hre.network.name)) {
    console.log("Verifying contracts on explorer...");
    
    try {
      if (!process.env.WAFC_ADDRESS) {
        await hre.run("verify:verify", {
          address: wafcAddress,
          constructorArguments: [deployer.address, process.env.RELAYER_ADDRESS || deployer.address],
        });
      }
      
      await hre.run("verify:verify", {
        address: stakingAddress,
        constructorArguments: [wafcAddress],
      });
      
      await hre.run("verify:verify", {
        address: distributorAddress,
        constructorArguments: [wafcAddress],
      });
      
      console.log("Verification complete");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
