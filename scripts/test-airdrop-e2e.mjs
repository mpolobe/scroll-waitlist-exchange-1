#!/usr/bin/env node
/**
 * E2E Airdrop Test Script
 * Tests the complete airdrop flow against the deployed Vercel API
 * 
 * Usage: node scripts/test-airdrop-e2e.mjs
 */

const API_BASE = "https://scroll-waitlist-exchange-1.vercel.app";

// Test wallet - use a real wallet you control for actual claims
const TEST_WALLET = "0x0000000000000000000000000000000000000001";

async function testEndpoint(name, url, options = {}) {
  console.log(`\n📋 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2).split('\n').map(l => '   ' + l).join('\n'));
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("SENT Airdrop E2E Test");
  console.log("=".repeat(60));
  console.log(`API Base: ${API_BASE}`);
  console.log(`Test Wallet: ${TEST_WALLET}`);

  const results = {};

  // 1. Test sign endpoint health
  results.signHealth = await testEndpoint(
    "Sign Endpoint Health",
    `${API_BASE}/api/airdrop/sign`
  );

  // 2. Test claim-sent endpoint health
  results.claimHealth = await testEndpoint(
    "Claim-SENT Endpoint Health",
    `${API_BASE}/api/airdrop/claim-sent?test=true`
  );

  // 3. Test leaderboard
  results.leaderboard = await testEndpoint(
    "Leaderboard",
    `${API_BASE}/api/airdrop/leaderboard`
  );

  // 4. Test get-status for a registered wallet
  if (results.leaderboard.success && results.leaderboard.data?.leaderboard?.[0]) {
    const wallet = results.leaderboard.data.leaderboard[0].wallet_address;
    results.getStatus = await testEndpoint(
      `Get Status (${wallet.slice(0,10)}...)`,
      `${API_BASE}/api/airdrop/get-status?wallet=${wallet}`
    );
  }

  // 5. Test sign endpoint with test wallet
  results.signTest = await testEndpoint(
    "Sign Request (Test Wallet)",
    `${API_BASE}/api/airdrop/sign`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: TEST_WALLET })
    }
  );

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("TEST SUMMARY");
  console.log("=".repeat(60));

  const checks = [
    { name: "Sign endpoint configured", pass: results.signHealth?.data?.hasSecretKey && results.signHealth?.data?.hasAdminKey },
    { name: "Claim endpoint configured", pass: results.claimHealth?.data?.hasThirdwebKey && results.claimHealth?.data?.hasAdminKey },
    { name: "Thirdweb client works", pass: results.claimHealth?.data?.thirdwebTest === "success" },
    { name: "Database connected", pass: results.leaderboard?.success },
    { name: "Wallets registered", pass: (results.leaderboard?.data?.stats?.totalClaims || 0) > 0 },
  ];

  checks.forEach(c => {
    console.log(`${c.pass ? '✅' : '❌'} ${c.name}`);
  });

  // Airdrop readiness
  console.log("\n" + "-".repeat(40));
  console.log("AIRDROP READINESS:");
  
  const stats = results.leaderboard?.data?.stats;
  if (stats) {
    console.log(`   Total registered: ${stats.totalClaims}`);
    console.log(`   Tasks completed: ${stats.tasksCompleted}`);
    console.log(`   Pool allocation: ${stats.pools?.total}`);
  }

  // Admin wallet
  if (results.claimHealth?.data?.adminAddress) {
    console.log(`   Admin wallet: ${results.claimHealth.data.adminAddress}`);
  }

  // Check if sign works for eligible wallet
  if (results.signTest?.data?.error === "Complete Twitter and Telegram tasks first") {
    console.log("\n⚠️  Test wallet needs to complete tasks before claiming");
    console.log("   To test full flow, use a wallet that has:");
    console.log("   - twitter_verified: true");
    console.log("   - telegram_verified: true");
  } else if (results.signTest?.data?.signature) {
    console.log("\n✅ Signature generation working!");
  }

  // Contract balance warning
  console.log("\n" + "-".repeat(40));
  console.log("⚠️  IMPORTANT: Airdrop contract has 0 SENT tokens");
  console.log("   Transfer tokens from Safe treasury before users can claim");
  console.log("   Run: node scripts/fund-airdrop-contract.mjs");
}

main().catch(console.error);
