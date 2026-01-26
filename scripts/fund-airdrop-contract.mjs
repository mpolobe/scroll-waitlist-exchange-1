/**
 * Fund Airdrop Contract Script
 * 
 * Transfers SENT tokens from Safe treasury to the airdrop contract.
 * 
 * The Safe at 0x8969Ed336BB2BA8b81FD4BdFd26EDf156E467f8d holds 10B SENT.
 * The airdrop contract at 0x71F7edd5bE9E509E68ef70216C59Df37484e0E23 needs tokens.
 * 
 * IMPORTANT: This script generates a Safe transaction that must be signed
 * by Safe owners through the Safe web interface or Safe SDK.
 * 
 * Usage:
 *   node scripts/fund-airdrop-contract.mjs [amount]
 * 
 * Examples:
 *   node scripts/fund-airdrop-contract.mjs              # Default: 310M SENT
 *   node scripts/fund-airdrop-contract.mjs 500000000    # Custom: 500M SENT
 */

import { ethers } from 'ethers';

// Contract addresses on Polygon Mainnet
const SAFE_ADDRESS = "0x8969Ed336BB2BA8b81FD4BdFd26EDf156E467f8d";
const SENT_TOKEN = "0x75CaEb2c62D8E29DAE0cdFde6775B898Dee43f46";
const AIRDROP_CONTRACT = "0x71F7edd5bE9E509E68ef70216C59Df37484e0E23";

// RPC endpoints (fallback chain)
const RPC_ENDPOINTS = [
  process.env.POLYGON_RPC,
  "https://polygon-rpc.com",
  "https://rpc-mainnet.matic.quiknode.pro",
  "https://polygon.llamarpc.com"
].filter(Boolean);

// ERC20 ABI (minimal)
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

async function getProvider() {
  for (const rpc of RPC_ENDPOINTS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      await provider.getBlockNumber();
      console.log(`Connected to: ${rpc}`);
      return provider;
    } catch (e) {
      console.log(`Failed to connect to ${rpc}`);
    }
  }
  throw new Error("All RPC endpoints failed");
}

async function checkBalances(provider) {
  const token = new ethers.Contract(SENT_TOKEN, ERC20_ABI, provider);
  
  // Sequential calls to avoid RPC batch limits
  const decimals = await token.decimals();
  const symbol = await token.symbol();
  const safeBalance = await token.balanceOf(SAFE_ADDRESS);
  const airdropBalance = await token.balanceOf(AIRDROP_CONTRACT);

  return { decimals, symbol, safeBalance, airdropBalance };
}

function formatAmount(amount, decimals) {
  return ethers.formatUnits(amount, decimals);
}

function parseAmount(amount, decimals) {
  return ethers.parseUnits(amount.toString(), decimals);
}

async function main() {
  console.log("=".repeat(60));
  console.log("Fund Airdrop Contract - SENT Token Transfer");
  console.log("=".repeat(60));
  
  // Parse amount argument (default: 310M for airdrop)
  const amountArg = process.argv[2] || "310000000";
  const transferAmount = BigInt(amountArg);
  
  console.log(`\nAddresses:`);
  console.log(`  Safe Treasury:     ${SAFE_ADDRESS}`);
  console.log(`  SENT Token:        ${SENT_TOKEN}`);
  console.log(`  Airdrop Contract:  ${AIRDROP_CONTRACT}`);
  console.log(`  Transfer Amount:   ${transferAmount.toLocaleString()} SENT`);
  
  // Connect to Polygon
  console.log(`\nConnecting to Polygon Mainnet...`);
  const provider = await getProvider();
  
  // Check current balances
  console.log(`\nChecking balances...`);
  const { decimals, symbol, safeBalance, airdropBalance } = await checkBalances(provider);
  
  console.log(`\nCurrent Balances:`);
  console.log(`  Safe Treasury:     ${formatAmount(safeBalance, decimals)} ${symbol}`);
  console.log(`  Airdrop Contract:  ${formatAmount(airdropBalance, decimals)} ${symbol}`);
  
  // Calculate transfer in wei
  const transferWei = parseAmount(transferAmount, decimals);
  
  // Validate
  if (safeBalance < transferWei) {
    console.log(`\n❌ ERROR: Safe treasury has insufficient balance`);
    console.log(`   Requested: ${formatAmount(transferWei, decimals)} ${symbol}`);
    console.log(`   Available: ${formatAmount(safeBalance, decimals)} ${symbol}`);
    process.exit(1);
  }
  
  // Generate the transfer calldata
  const tokenInterface = new ethers.Interface(ERC20_ABI);
  const transferData = tokenInterface.encodeFunctionData("transfer", [
    AIRDROP_CONTRACT,
    transferWei
  ]);
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("Safe Transaction Details");
  console.log("=".repeat(60));
  console.log(`\nTo execute this transfer, create a Safe transaction with:`);
  console.log(`\n  To:     ${SENT_TOKEN}`);
  console.log(`  Value:  0`);
  console.log(`  Data:   ${transferData}`);
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("Option 1: Safe Web Interface");
  console.log("=".repeat(60));
  console.log(`\n1. Go to: https://app.safe.global/home?safe=matic:${SAFE_ADDRESS}`);
  console.log(`2. Click "New Transaction" > "Send tokens"`);
  console.log(`3. Select SENT token`);
  console.log(`4. Enter recipient: ${AIRDROP_CONTRACT}`);
  console.log(`5. Enter amount: ${transferAmount.toLocaleString()}`);
  console.log(`6. Review and sign with required owners`);
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("Option 2: Safe Transaction Builder");
  console.log("=".repeat(60));
  console.log(`\n1. Go to: https://app.safe.global/apps?safe=matic:${SAFE_ADDRESS}`);
  console.log(`2. Open "Transaction Builder" app`);
  console.log(`3. Add new transaction:`);
  console.log(`   - Contract: ${SENT_TOKEN}`);
  console.log(`   - Method: transfer(address,uint256)`);
  console.log(`   - to: ${AIRDROP_CONTRACT}`);
  console.log(`   - amount: ${transferWei.toString()}`);
  console.log(`4. Create batch and sign`);
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("After Transfer");
  console.log("=".repeat(60));
  console.log(`\nExpected balances after transfer:`);
  console.log(`  Safe Treasury:     ${formatAmount(safeBalance - transferWei, decimals)} ${symbol}`);
  console.log(`  Airdrop Contract:  ${formatAmount(airdropBalance + transferWei, decimals)} ${symbol}`);
  
  console.log(`\nRun this script again to verify the transfer completed.`);
}

main().catch(console.error);
