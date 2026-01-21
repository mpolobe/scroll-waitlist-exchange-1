/**
 * Check SENT Token Balance Script
 * Verifies the contract has tokens ready for 310M airdrop distribution
 * 
 * Run: node scripts/check-sent-balance.js
 */

const SENT_CONTRACT = "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf";
const TREASURY_WALLET = "0xfcfa02a852551618f544fbce52908a0f941abef9";
const POLYGON_RPC = "https://polygon-mainnet.g.alchemy.com/v2/demo";

// ERC20 ABI for balanceOf, totalSupply, decimals, symbol
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

async function checkBalance() {
  console.log("=".repeat(50));
  console.log("SENT Token Balance Check");
  console.log("=".repeat(50));
  console.log(`Contract: ${SENT_CONTRACT}`);
  console.log(`Treasury: ${TREASURY_WALLET}`);
  console.log(`Network:  Polygon Mainnet (Chain ID: 137)`);
  console.log("=".repeat(50));

  try {
    // Using ethers via dynamic import or fetch-based RPC calls
    const { ethers } = await import("ethers");
    
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    const contract = new ethers.Contract(SENT_CONTRACT, ERC20_ABI, provider);

    // Get token info
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name().catch(() => "SENTINEL"),
      contract.symbol().catch(() => "SENT"),
      contract.decimals().catch(() => 18),
      contract.totalSupply().catch(() => 0n),
    ]);

    console.log(`\nToken Info:`);
    console.log(`  Name:     ${name}`);
    console.log(`  Symbol:   ${symbol}`);
    console.log(`  Decimals: ${decimals}`);
    console.log(`  Total Supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);

    // Get contract balance (tokens available for claims)
    const contractBalance = await contract.balanceOf(SENT_CONTRACT);
    console.log(`\nContract Balance (for claims):`);
    console.log(`  ${ethers.formatUnits(contractBalance, decimals)} ${symbol}`);

    // Get treasury balance
    const treasuryBalance = await contract.balanceOf(TREASURY_WALLET);
    console.log(`\nTreasury Balance:`);
    console.log(`  ${ethers.formatUnits(treasuryBalance, decimals)} ${symbol}`);

    // Calculate airdrop capacity
    const claimAmount = 100n;
    const availableTokens = contractBalance / (10n ** BigInt(decimals));
    const maxClaims = availableTokens / claimAmount;

    console.log(`\n${"=".repeat(50)}`);
    console.log("Airdrop Capacity:");
    console.log(`  Tokens per claim: 100 ${symbol}`);
    console.log(`  Max possible claims: ${maxClaims.toLocaleString()}`);
    console.log(`${"=".repeat(50)}`);

    // Status check
    const targetAirdrop = 310_000_000n;
    const available = availableTokens;
    
    if (available >= targetAirdrop) {
      console.log(`\n✅ READY: Contract has enough tokens for 310M SENT airdrop`);
    } else if (available > 0n) {
      console.log(`\n⚠️  PARTIAL: Contract has ${available.toLocaleString()} SENT`);
      console.log(`   Need ${(targetAirdrop - available).toLocaleString()} more for full 310M airdrop`);
    } else {
      console.log(`\n❌ EMPTY: Contract needs tokens deposited for airdrop`);
      console.log(`   Deposit 310,000,000 SENT to the contract address`);
    }

  } catch (error) {
    console.error("\n❌ Error checking balance:", error.message);
    
    // Fallback: Try raw RPC call
    console.log("\nTrying fallback RPC method...");
    await checkBalanceRaw();
  }
}

// Fallback using raw fetch (no ethers dependency)
async function checkBalanceRaw() {
  try {
    // balanceOf(address) selector: 0x70a08231
    const balanceOfSelector = "0x70a08231";
    const paddedAddress = SENT_CONTRACT.slice(2).padStart(64, "0");
    
    const response = await fetch(POLYGON_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{
          to: SENT_CONTRACT,
          data: balanceOfSelector + paddedAddress
        }, "latest"],
        id: 1
      })
    });

    const result = await response.json();
    
    if (result.result) {
      const balanceWei = BigInt(result.result);
      const balanceTokens = balanceWei / (10n ** 18n);
      console.log(`Contract Balance: ${balanceTokens.toLocaleString()} SENT`);
      
      if (balanceTokens > 0n) {
        console.log(`✅ Contract has tokens available`);
      } else {
        console.log(`❌ Contract is empty - deposit tokens needed`);
      }
    } else {
      console.log("Could not read balance:", result.error);
    }
  } catch (err) {
    console.error("Fallback also failed:", err.message);
  }
}

checkBalance();
