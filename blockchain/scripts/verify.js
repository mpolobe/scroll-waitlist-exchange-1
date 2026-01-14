const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log("Verifying contracts on", network);
  console.log();

  // Get addresses from environment
  const wafcAddress = process.env.WAFC_ADDRESS;
  const stakingAddress = process.env.AFC_STAKING_ADDRESS;
  const distributorAddress = process.env.REWARD_DISTRIBUTOR_ADDRESS;
  const relayerAddress = process.env.RELAYER_ADDRESS;

  const [deployer] = await hre.ethers.getSigners();

  if (wafcAddress) {
    console.log("Verifying WrappedAfricoin at", wafcAddress);
    try {
      await hre.run("verify:verify", {
        address: wafcAddress,
        constructorArguments: [deployer.address, relayerAddress || deployer.address],
      });
      console.log("wAFC verified");
    } catch (error) {
      console.log("wAFC verification failed:", error.message);
    }
    console.log();
  }

  if (stakingAddress && wafcAddress) {
    console.log("Verifying AFCStaking at", stakingAddress);
    try {
      await hre.run("verify:verify", {
        address: stakingAddress,
        constructorArguments: [wafcAddress],
      });
      console.log("AFCStaking verified");
    } catch (error) {
      console.log("AFCStaking verification failed:", error.message);
    }
    console.log();
  }

  if (distributorAddress && wafcAddress) {
    console.log("Verifying RewardDistributor at", distributorAddress);
    try {
      await hre.run("verify:verify", {
        address: distributorAddress,
        constructorArguments: [wafcAddress],
      });
      console.log("RewardDistributor verified");
    } catch (error) {
      console.log("RewardDistributor verification failed:", error.message);
    }
  }

  console.log();
  console.log("Verification complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
