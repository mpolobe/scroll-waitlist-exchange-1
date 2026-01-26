/**
 * Deploy SafeAirdropModule to Polygon Mainnet
 * 
 * This module allows automated token distribution from the Safe
 * without requiring multisig approval for each claim.
 * 
 * Prerequisites:
 * 1. Set PRIVATE_KEY in .env (deployer wallet with MATIC for gas)
 * 2. Set POLYGONSCAN_API_KEY for verification
 * 
 * After deployment:
 * 1. Enable the module on the Safe via Safe UI
 * 2. Transfer tokens to the Safe
 * 3. Update the API to use the module for claims
 * 
 * Usage:
 *   cd blockchain
 *   npx hardhat run scripts/deploy-airdrop-module.js --network polygon
 */

import hre from "hardhat";

const SAFE_ADDRESS = "0x8969Ed336BB2BA8b81FD4BdFd26EDf156E467f8d";
const SENT_TOKEN = "0x65f6cEdBB6e023e7A91df61c26364FAc0fA2dd64";

// Server wallet that will sign claims (from ADMIN_PRIVATE_KEY)
// This should be the address derived from your ADMIN_PRIVATE_KEY
const AUTHORIZED_SIGNER = "0x2dEEaF33C55bc6855E3bf52b8C47fced8bDDc7F1";

async function main() {
  console.log("Deploying SafeAirdropModule to Polygon Mainnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MATIC\n");

  console.log("Configuration:");
  console.log("  Safe:              ", SAFE_ADDRESS);
  console.log("  SENT Token:        ", SENT_TOKEN);
  console.log("  Authorized Signer: ", AUTHORIZED_SIGNER);
  console.log("");

  // Deploy
  const SafeAirdropModule = await hre.ethers.getContractFactory("SafeAirdropModule");
  const module = await SafeAirdropModule.deploy(
    SAFE_ADDRESS,
    SENT_TOKEN,
    AUTHORIZED_SIGNER
  );

  await module.waitForDeployment();
  const moduleAddress = await module.getAddress();

  console.log("✅ SafeAirdropModule deployed to:", moduleAddress);
  console.log("");

  // Verify on Polygonscan
  console.log("Verifying on Polygonscan...");
  try {
    await hre.run("verify:verify", {
      address: moduleAddress,
      constructorArguments: [SAFE_ADDRESS, SENT_TOKEN, AUTHORIZED_SIGNER],
    });
    console.log("✅ Verified on Polygonscan");
  } catch (e) {
    console.log("⚠️  Verification failed:", e.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("NEXT STEPS");
  console.log("=".repeat(60));
  console.log(`
1. ENABLE MODULE ON SAFE:
   - Go to: https://app.safe.global/settings/modules?safe=matic:${SAFE_ADDRESS}
   - Click "Add module"
   - Enter module address: ${moduleAddress}
   - Sign with 2 of 3 owners

2. TRANSFER TOKENS TO SAFE:
   - Transfer SENT tokens from EOA to Safe
   - Safe address: ${SAFE_ADDRESS}

3. UPDATE API:
   - Set AIRDROP_MODULE_ADDRESS=${moduleAddress} in Vercel env
   - Update claim-sent.js to use the module

4. TEST:
   - Run: node scripts/test-module-claim.mjs
`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
