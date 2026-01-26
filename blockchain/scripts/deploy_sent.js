/**
 * Deploy SENT Token to Polygon Mainnet
 * 
 * Usage:
 *   npx hardhat run scripts/deploy_sent.js --network polygon
 * 
 * Required env vars:
 *   PRIVATE_KEY - Deployer wallet private key
 *   POLYGONSCAN_API_KEY - For contract verification
 */

import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("=".repeat(60));
  console.log("SENT Token Deployment");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "POL");
  console.log("=".repeat(60));
  
  if (balance < hre.ethers.parseEther("0.1")) {
    console.error("⚠️  Warning: Low balance. Deployment may fail.");
  }
  
  // Deploy SENT Token
  console.log("\n📦 Deploying SENT Token...");
  const SENTToken = await hre.ethers.getContractFactory("SENTToken");
  const sent = await SENTToken.deploy(deployer.address);
  await sent.waitForDeployment();
  
  const sentAddress = await sent.getAddress();
  console.log("✅ SENT Token deployed to:", sentAddress);
  
  // Get token info
  const name = await sent.name();
  const symbol = await sent.symbol();
  const totalSupply = await sent.totalSupply();
  const maxSupply = await sent.MAX_SUPPLY();
  
  console.log("\n📊 Token Info:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), symbol);
  console.log("   Max Supply:", hre.ethers.formatEther(maxSupply), symbol);
  console.log("   Owner:", deployer.address);
  
  // Verify contract
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contract on PolygonScan...");
    console.log("   Waiting 30 seconds for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      await hre.run("verify:verify", {
        address: sentAddress,
        constructorArguments: [deployer.address],
      });
      console.log("✅ Contract verified on PolygonScan");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified");
      } else {
        console.log("⚠️  Verification failed:", error.message);
        console.log("   You can verify manually later with:");
        console.log(`   npx hardhat verify --network polygon ${sentAddress} ${deployer.address}`);
      }
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\n📋 Next Steps:");
  console.log("1. Go to https://www.pinksale.finance/launchpad/create");
  console.log("2. Select 'Polygon' network");
  console.log("3. Choose 'Fairlaunch' or 'Presale'");
  console.log("4. Enter token address:", sentAddress);
  console.log("5. Configure your launch parameters");
  console.log("6. Approve SENT tokens for PinkSale contract");
  console.log("7. Create the launchpad");
  console.log("\n🔗 PolygonScan:", `https://polygonscan.com/token/${sentAddress}`);
  console.log("=".repeat(60));
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    token: {
      address: sentAddress,
      name,
      symbol,
      totalSupply: hre.ethers.formatEther(totalSupply),
      maxSupply: hre.ethers.formatEther(maxSupply),
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };
  
  console.log("\n📄 Deployment Info (save this):");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
