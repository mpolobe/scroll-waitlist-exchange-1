const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Wrapped Africoin (wAFC)...");

  // 1. Get Signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("   Deploying with account:", deployer.address);

  // 2. Define Relayer Address (The Bridge)
  // In production, this should be your Go Relayer's wallet address
  // For now, we use the deployer or a placeholder
  const RELAYER_ADDRESS = process.env.RELAYER_ADDRESS || deployer.address;
  console.log("   Bridge Relayer Role:", RELAYER_ADDRESS);

  // 3. Deploy Contract
  const WrappedAfricoin = await hre.ethers.getContractFactory("WrappedAfricoin");
  const wafc = await WrappedAfricoin.deploy(deployer.address, RELAYER_ADDRESS);

  await wafc.waitForDeployment();

  const address = await wafc.getAddress();
  console.log(`✅ Wrapped Africoin deployed to: ${address}`);
  console.log("   Network:", hre.network.name);
  
  // 4. Verify (if on Polygon Amoy)
  if (hre.network.name === "polygonAmoy") {
      console.log("   Verifying contract...");
      // Verification logic would go here
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
