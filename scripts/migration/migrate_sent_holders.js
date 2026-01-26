/**
 * Migrate Old SENT Holders to New SENT Token
 * 
 * This script airdrops new SENT tokens to holders of the old SENT token.
 * 
 * Prerequisites:
 * - New SENT token deployed
 * - Admin wallet has sufficient new SENT tokens
 * - PRIVATE_KEY set in .env
 * 
 * Usage: 
 *   node scripts/migration/migrate_sent_holders.js --dry-run    # Preview only
 *   node scripts/migration/migrate_sent_holders.js              # Execute migration
 */

import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const NEW_SENT_TOKEN = "0x65f6cEdBB6e023e7A91df61c26364FAc0fA2dd64";
const OLD_SENT_TOKEN = "0x75CaEb2c62D8E29DAE0cdFde6775B898Dee43f46";
const COMPROMISED_WALLET = "0x8969ed336bb2ba8b81fd4bdfd26edf156e467f8d".toLowerCase();
const POLYGON_RPC = process.env.POLYGON_RPC || "https://polygon-bor-rpc.publicnode.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// ERC20 ABI (minimal for transfer)
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  console.log("=".repeat(70));
  console.log("SENT TOKEN MIGRATION");
  console.log("=".repeat(70));
  console.log(`Old Token: ${OLD_SENT_TOKEN}`);
  console.log(`New Token: ${NEW_SENT_TOKEN}`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no transactions)' : 'LIVE EXECUTION'}`);
  console.log("=".repeat(70));
  
  // Load snapshot
  const snapshotPath = './scripts/migration/old_sent_holders.json';
  if (!fs.existsSync(snapshotPath)) {
    console.error("❌ Snapshot not found. Run fetch_old_sent_holders.js first.");
    process.exit(1);
  }
  
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  console.log(`\nSnapshot date: ${snapshot.snapshotDate}`);
  console.log(`Total holders in snapshot: ${snapshot.totalHolders}`);
  
  // Filter out compromised wallet
  const eligibleHolders = snapshot.holders.filter(
    h => h.address.toLowerCase() !== COMPROMISED_WALLET
  );
  
  console.log(`\nEligible holders (excluding compromised wallet): ${eligibleHolders.length}`);
  
  if (eligibleHolders.length === 0) {
    console.log("\n✅ No eligible holders to migrate!");
    console.log("The only holder besides the compromised wallet has been identified.");
    return;
  }
  
  // Display migration plan
  console.log("\n" + "-".repeat(70));
  console.log("MIGRATION PLAN");
  console.log("-".repeat(70));
  
  let totalToAirdrop = BigInt(0);
  for (const holder of eligibleHolders) {
    const amount = BigInt(holder.balance);
    totalToAirdrop += amount;
    console.log(`${holder.address}: ${holder.balanceFormatted} SENT`);
  }
  
  console.log("-".repeat(70));
  console.log(`Total to airdrop: ${(Number(totalToAirdrop) / 1e18).toFixed(4)} SENT`);
  console.log("-".repeat(70));
  
  if (isDryRun) {
    console.log("\n🔍 DRY RUN COMPLETE - No transactions executed");
    console.log("Run without --dry-run to execute migration");
    return;
  }
  
  // Execute migration
  if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not set in .env");
    process.exit(1);
  }
  
  console.log("\n🚀 Executing migration...\n");
  
  const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const sentToken = new ethers.Contract(NEW_SENT_TOKEN, ERC20_ABI, wallet);
  
  // Check admin balance
  const adminBalance = await sentToken.balanceOf(wallet.address);
  console.log(`Admin wallet: ${wallet.address}`);
  console.log(`Admin SENT balance: ${ethers.formatEther(adminBalance)} SENT`);
  
  if (adminBalance < totalToAirdrop) {
    console.error(`❌ Insufficient balance. Need ${ethers.formatEther(totalToAirdrop)} SENT`);
    process.exit(1);
  }
  
  // Execute transfers
  const results = [];
  for (const holder of eligibleHolders) {
    try {
      console.log(`\nTransferring ${holder.balanceFormatted} SENT to ${holder.address}...`);
      
      const tx = await sentToken.transfer(holder.address, holder.balance);
      console.log(`  TX Hash: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`  ✅ Confirmed in block ${receipt.blockNumber}`);
      
      results.push({
        address: holder.address,
        amount: holder.balance,
        amountFormatted: holder.balanceFormatted,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        status: 'success'
      });
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
      results.push({
        address: holder.address,
        amount: holder.balance,
        amountFormatted: holder.balanceFormatted,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  // Save results
  const resultsPath = './scripts/migration/migration_results.json';
  const output = {
    migrationDate: new Date().toISOString(),
    oldToken: OLD_SENT_TOKEN,
    newToken: NEW_SENT_TOKEN,
    adminWallet: wallet.address,
    totalMigrated: results.filter(r => r.status === 'success').length,
    totalFailed: results.filter(r => r.status === 'failed').length,
    results
  };
  
  fs.writeFileSync(resultsPath, JSON.stringify(output, null, 2));
  
  console.log("\n" + "=".repeat(70));
  console.log("MIGRATION COMPLETE");
  console.log("=".repeat(70));
  console.log(`Successful: ${output.totalMigrated}`);
  console.log(`Failed: ${output.totalFailed}`);
  console.log(`Results saved to: ${resultsPath}`);
}

main().catch(console.error);
