/**
 * Check SENT Token Balance Script
 * Run: node scripts/check-sent-balance.mjs
 */

const SENT_CONTRACT = "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf";
const TREASURY_WALLET = "0xfcfa02a852551618f544fbce52908a0f941abef9";

console.log("=".repeat(50));
console.log("SENT Token Balance Check");
console.log("=".repeat(50));
console.log(`Contract: ${SENT_CONTRACT}`);
console.log(`Treasury: ${TREASURY_WALLET}`);
console.log("=".repeat(50));

// Check via PolygonScan API (free, no key needed for basic calls)
async function checkViaPolygonscan() {
  const url = `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${SENT_CONTRACT}&address=${SENT_CONTRACT}&tag=latest`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "1") {
      const balanceWei = BigInt(data.result);
      const balanceTokens = balanceWei / (10n ** 18n);
      console.log(`\nContract Balance: ${balanceTokens.toLocaleString()} SENT`);
      return balanceTokens;
    } else {
      console.log("PolygonScan response:", data.message);
      return 0n;
    }
  } catch (err) {
    console.error("Error:", err.message);
    return 0n;
  }
}

// Check treasury balance
async function checkTreasuryBalance() {
  const url = `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${SENT_CONTRACT}&address=${TREASURY_WALLET}&tag=latest`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "1") {
      const balanceWei = BigInt(data.result);
      const balanceTokens = balanceWei / (10n ** 18n);
      console.log(`Treasury Balance: ${balanceTokens.toLocaleString()} SENT`);
      return balanceTokens;
    }
    return 0n;
  } catch (err) {
    return 0n;
  }
}

// Get total supply
async function getTotalSupply() {
  const url = `https://api.polygonscan.com/api?module=stats&action=tokensupply&contractaddress=${SENT_CONTRACT}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "1") {
      const supplyWei = BigInt(data.result);
      const supplyTokens = supplyWei / (10n ** 18n);
      console.log(`Total Supply: ${supplyTokens.toLocaleString()} SENT`);
      return supplyTokens;
    }
    return 0n;
  } catch (err) {
    return 0n;
  }
}

async function main() {
  const totalSupply = await getTotalSupply();
  const contractBalance = await checkViaPolygonscan();
  const treasuryBalance = await checkTreasuryBalance();
  
  const totalAvailable = contractBalance + treasuryBalance;
  const maxClaims = totalAvailable / 100n;
  
  console.log(`\n${"=".repeat(50)}`);
  console.log("Airdrop Capacity:");
  console.log(`  Total available: ${totalAvailable.toLocaleString()} SENT`);
  console.log(`  Tokens per claim: 100 SENT`);
  console.log(`  Max possible claims: ${maxClaims.toLocaleString()}`);
  console.log("=".repeat(50));
  
  if (totalAvailable >= 310_000_000n) {
    console.log(`\n✅ READY for 310M SENT airdrop`);
  } else if (totalAvailable > 0n) {
    console.log(`\n⚠️  Has ${totalAvailable.toLocaleString()} SENT available`);
  } else {
    console.log(`\n❌ No tokens found - deposit needed`);
  }
  
  console.log(`\nView on PolygonScan:`);
  console.log(`https://polygonscan.com/token/${SENT_CONTRACT}`);
}

main();
