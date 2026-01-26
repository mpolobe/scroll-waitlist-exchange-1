/**
 * Fetch Old SENT Token Holders for Migration
 * 
 * This script queries all transfer events from the old SENT token
 * and calculates current balances for each holder.
 * 
 * Usage: node scripts/migration/fetch_old_sent_holders.js
 */

import fetch from 'node-fetch';
import fs from 'fs';

const OLD_SENT_TOKEN = "0x75CaEb2c62D8E29DAE0cdFde6775B898Dee43f46";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "4RUSMISGTXTKQ9UUDVGG4ZEIQAIS5XBS86";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function fetchAllTransfers() {
  const transfers = [];
  let page = 1;
  const offset = 1000;
  
  console.log("Fetching transfer events from old SENT token...");
  console.log(`Token: ${OLD_SENT_TOKEN}\n`);
  
  while (true) {
    const url = `https://api.etherscan.io/v2/api?chainid=137&module=account&action=tokentx&contractaddress=${OLD_SENT_TOKEN}&page=${page}&offset=${offset}&sort=asc&apikey=${POLYGONSCAN_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "1" || !data.result || data.result.length === 0) {
      break;
    }
    
    transfers.push(...data.result);
    console.log(`Page ${page}: fetched ${data.result.length} transfers (total: ${transfers.length})`);
    
    if (data.result.length < offset) {
      break;
    }
    
    page++;
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  
  return transfers;
}

function calculateBalances(transfers) {
  const balances = new Map();
  
  for (const tx of transfers) {
    const from = tx.from.toLowerCase();
    const to = tx.to.toLowerCase();
    const value = BigInt(tx.value);
    
    // Subtract from sender (unless mint from zero address)
    if (from !== ZERO_ADDRESS) {
      const currentFrom = balances.get(from) || BigInt(0);
      balances.set(from, currentFrom - value);
    }
    
    // Add to receiver
    const currentTo = balances.get(to) || BigInt(0);
    balances.set(to, currentTo + value);
  }
  
  // Filter out zero and negative balances, and zero address
  const holders = [];
  for (const [address, balance] of balances) {
    if (balance > BigInt(0) && address !== ZERO_ADDRESS) {
      holders.push({
        address,
        balance: balance.toString(),
        balanceFormatted: (Number(balance) / 1e18).toFixed(4)
      });
    }
  }
  
  // Sort by balance descending
  holders.sort((a, b) => {
    const balA = BigInt(a.balance);
    const balB = BigInt(b.balance);
    if (balB > balA) return 1;
    if (balB < balA) return -1;
    return 0;
  });
  
  return holders;
}

async function main() {
  try {
    // Fetch all transfers
    const transfers = await fetchAllTransfers();
    console.log(`\nTotal transfers found: ${transfers.length}`);
    
    // Calculate balances
    const holders = calculateBalances(transfers);
    console.log(`\nUnique holders with balance > 0: ${holders.length}`);
    
    // Display holders
    console.log("\n" + "=".repeat(70));
    console.log("OLD SENT TOKEN HOLDERS");
    console.log("=".repeat(70));
    
    let totalSupplyHeld = BigInt(0);
    for (const holder of holders) {
      totalSupplyHeld += BigInt(holder.balance);
      console.log(`${holder.address}: ${holder.balanceFormatted} SENT`);
    }
    
    console.log("=".repeat(70));
    console.log(`Total SENT held: ${(Number(totalSupplyHeld) / 1e18).toFixed(4)} SENT`);
    console.log(`Number of holders: ${holders.length}`);
    
    // Save to file
    const output = {
      oldToken: OLD_SENT_TOKEN,
      snapshotDate: new Date().toISOString(),
      totalHolders: holders.length,
      totalSupplyHeld: totalSupplyHeld.toString(),
      totalSupplyHeldFormatted: (Number(totalSupplyHeld) / 1e18).toFixed(4),
      holders: holders
    };
    
    const outputPath = './scripts/migration/old_sent_holders.json';
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\nSnapshot saved to: ${outputPath}`);
    
    return holders;
  } catch (error) {
    console.error("Error fetching holders:", error);
    process.exit(1);
  }
}

main();
