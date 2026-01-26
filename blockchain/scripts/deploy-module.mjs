#!/usr/bin/env node
/**
 * Deploy SafeAirdropModule to Polygon Mainnet
 * 
 * Usage:
 *   PRIVATE_KEY=xxx node scripts/deploy-module.mjs
 * 
 * After deployment:
 * 1. Enable module on Safe (requires 2/3 signatures)
 * 2. Transfer tokens to Safe
 * 3. Update API with module address
 */
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SAFE_ADDRESS = "0x8969Ed336BB2BA8b81FD4BdFd26EDf156E467f8d";
const SENT_TOKEN = "0x65f6cEdBB6e023e7A91df61c26364FAc0fA2dd64";
const AUTHORIZED_SIGNER = "0x2dEEaF33C55bc6855E3bf52b8C47fced8bDDc7F1";

const RPC_ENDPOINTS = [
  "https://polygon-bor-rpc.publicnode.com",
  "https://polygon.llamarpc.com",
  "https://polygon-rpc.com"
];

async function getProvider() {
  for (const rpc of RPC_ENDPOINTS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      await provider.getBlockNumber();
      console.log(`Connected to: ${rpc}`);
      return provider;
    } catch (e) {
      console.log(`RPC failed: ${rpc}`);
    }
  }
  throw new Error("All RPCs failed");
}

async function main() {
  console.log("=".repeat(60));
  console.log("Deploy SafeAirdropModule to Polygon Mainnet");
  console.log("=".repeat(60));

  // Check private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("\n❌ PRIVATE_KEY environment variable required");
    console.log("Usage: PRIVATE_KEY=xxx node scripts/deploy-module.mjs");
    process.exit(1);
  }

  // Load artifact
  const artifactPath = path.join(__dirname, '..', 'artifacts', 'SafeAirdropModule.json');
  if (!fs.existsSync(artifactPath)) {
    console.error("\n❌ Artifact not found. Run compile first:");
    console.log("   node scripts/compile-module.mjs");
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // Connect
  const provider = await getProvider();
  const wallet = new ethers.Wallet(
    privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`,
    provider
  );

  console.log(`\nDeployer: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance:  ${ethers.formatEther(balance)} MATIC`);

  if (balance < ethers.parseEther("0.01")) {
    console.error("\n❌ Insufficient MATIC for deployment (need ~0.01 MATIC)");
    process.exit(1);
  }

  console.log(`\nConfiguration:`);
  console.log(`  Safe:              ${SAFE_ADDRESS}`);
  console.log(`  SENT Token:        ${SENT_TOKEN}`);
  console.log(`  Authorized Signer: ${AUTHORIZED_SIGNER}`);

  // Deploy
  console.log(`\nDeploying...`);
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy(SAFE_ADDRESS, SENT_TOKEN, AUTHORIZED_SIGNER);
  
  console.log(`Tx Hash: ${contract.deploymentTransaction().hash}`);
  console.log(`Waiting for confirmation...`);
  
  await contract.waitForDeployment();
  const moduleAddress = await contract.getAddress();

  console.log(`\n✅ SafeAirdropModule deployed to: ${moduleAddress}`);

  // Save deployment info
  const deploymentInfo = {
    address: moduleAddress,
    network: "polygon",
    chainId: 137,
    deployer: wallet.address,
    safe: SAFE_ADDRESS,
    token: SENT_TOKEN,
    authorizedSigner: AUTHORIZED_SIGNER,
    deployedAt: new Date().toISOString(),
    txHash: contract.deploymentTransaction().hash
  };

  fs.writeFileSync(
    path.join(__dirname, '..', 'artifacts', 'SafeAirdropModule-deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\n${"=".repeat(60)}`);
  console.log("NEXT STEPS");
  console.log("=".repeat(60));
  console.log(`
1. ENABLE MODULE ON SAFE (requires 2/3 signatures):
   Go to: https://app.safe.global/settings/modules?safe=matic:${SAFE_ADDRESS}
   Click "Add module" and enter: ${moduleAddress}

2. TRANSFER TOKENS TO SAFE:
   From EOA (${AUTHORIZED_SIGNER}) to Safe (${SAFE_ADDRESS})

3. UPDATE VERCEL ENVIRONMENT:
   AIRDROP_MODULE_ADDRESS=${moduleAddress}

4. VERIFY ON POLYGONSCAN (optional):
   https://polygonscan.com/address/${moduleAddress}#code
`);
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
