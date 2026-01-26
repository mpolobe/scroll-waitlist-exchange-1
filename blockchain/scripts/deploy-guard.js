const hre = require("hardhat");

/**
 * Deploy SafeAirdropGuard
 * 
 * Deployed to Polygon Mainnet: 0x43B8Deeae29558ee36Ba6b0800fA2ed77B43FFe1
 * 
 * Usage:
 *   PRIVATE_KEY=... npx hardhat run scripts/deploy-guard.js --network polygon
 */
async function main() {
  const SENT_TOKEN = "0x75CaEb2c62D8E29DAE0cdFde6775B898Dee43f46";

  console.log("Deploying SafeAirdropGuard...");
  console.log("SENT Token:", SENT_TOKEN);

  const SafeAirdropGuard = await hre.ethers.getContractFactory("SafeAirdropGuard");
  const guard = await SafeAirdropGuard.deploy(SENT_TOKEN);

  await guard.waitForDeployment();

  const address = await guard.getAddress();
  console.log("SafeAirdropGuard deployed to:", address);

  return address;
}

main()
  .then((address) => {
    console.log("\nDeployment successful!");
    console.log("Guard address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
