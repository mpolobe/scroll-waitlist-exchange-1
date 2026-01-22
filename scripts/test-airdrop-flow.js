/**
 * SENT Airdrop Flow Test Script
 * 
 * Tests the complete airdrop signing flow:
 * 1. Adds test wallet to Supabase airdrop_status
 * 2. Calls /api/airdrop/sign endpoint
 * 3. Verifies signature response
 * 
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/test-airdrop-flow.js
 * 
 * Or with .env file:
 *   node -r dotenv/config scripts/test-airdrop-flow.js
 */

const { createClient } = require('@supabase/supabase-js');

// Test wallet address (use a test wallet you control)
const TEST_WALLET = '0x0000000000000000000000000000000000000001';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://llvprbmrnjvamjzavmhg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY is required');
  console.log('\nUsage:');
  console.log('  SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/test-airdrop-flow.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runTest() {
  console.log('='.repeat(60));
  console.log('SENT Airdrop Flow Test');
  console.log('='.repeat(60));
  console.log(`\nTest Wallet: ${TEST_WALLET}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`API Base URL: ${API_BASE_URL}\n`);

  // Step 1: Add test wallet to airdrop_status
  console.log('Step 1: Adding test wallet to airdrop_status...');
  
  const { data: existingRecord, error: checkError } = await supabase
    .from('airdrop_status')
    .select('*')
    .eq('wallet_address', TEST_WALLET.toLowerCase())
    .single();

  if (existingRecord) {
    console.log('  ⚠️  Test wallet already exists, resetting...');
    const { error: updateError } = await supabase
      .from('airdrop_status')
      .update({ 
        quiz_score: 100, 
        claimed: false,
        claim_tx_hash: null,
        claimed_at: null 
      })
      .eq('wallet_address', TEST_WALLET.toLowerCase());
    
    if (updateError) {
      console.error('  ❌ Failed to reset:', updateError.message);
      return;
    }
    console.log('  ✅ Test wallet reset with quiz_score=100, claimed=false');
  } else {
    const { error: insertError } = await supabase
      .from('airdrop_status')
      .insert({
        wallet_address: TEST_WALLET.toLowerCase(),
        quiz_score: 100,
        claimed: false
      });

    if (insertError) {
      console.error('  ❌ Failed to insert:', insertError.message);
      return;
    }
    console.log('  ✅ Test wallet added with quiz_score=100');
  }

  // Step 2: Verify the record
  console.log('\nStep 2: Verifying database record...');
  const { data: record, error: verifyError } = await supabase
    .from('airdrop_status')
    .select('*')
    .eq('wallet_address', TEST_WALLET.toLowerCase())
    .single();

  if (verifyError || !record) {
    console.error('  ❌ Failed to verify:', verifyError?.message);
    return;
  }

  console.log('  ✅ Record verified:');
  console.log(`     - wallet_address: ${record.wallet_address}`);
  console.log(`     - quiz_score: ${record.quiz_score}`);
  console.log(`     - claimed: ${record.claimed}`);

  // Step 3: Test API endpoint (if running locally)
  console.log('\nStep 3: Testing /api/airdrop/sign endpoint...');
  console.log('  ⚠️  API test requires the server to be running');
  console.log(`  Run: curl -X POST ${API_BASE_URL}/api/airdrop/sign \\`);
  console.log(`         -H "Content-Type: application/json" \\`);
  console.log(`         -d '{"address": "${TEST_WALLET}"}'`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/airdrop/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: TEST_WALLET })
    });

    if (response.ok) {
      const signature = await response.json();
      console.log('\n  ✅ API Response received:');
      console.log('     - Has payload:', !!signature.payload);
      console.log('     - Has signature:', !!signature.signature);
      
      if (signature.payload) {
        console.log('     - Recipient:', signature.payload?.contents?.[0]?.recipient);
        console.log('     - Amount:', signature.payload?.contents?.[0]?.amount);
      }
    } else {
      const error = await response.json();
      console.log(`  ❌ API Error (${response.status}):`, error.error || error);
    }
  } catch (err) {
    console.log('  ⚠️  Could not reach API (server may not be running)');
    console.log(`     Error: ${err.message}`);
  }

  // Step 4: Cleanup instructions
  console.log('\n' + '='.repeat(60));
  console.log('Test Complete');
  console.log('='.repeat(60));
  console.log('\nNext Steps:');
  console.log('1. If API test passed, the signing flow is working');
  console.log('2. Test the frontend ClaimButton with a real wallet');
  console.log('3. Verify the claim transaction on PolygonScan');
  console.log('\nTo clean up test data:');
  console.log(`  DELETE FROM airdrop_status WHERE wallet_address = '${TEST_WALLET.toLowerCase()}';`);
}

runTest().catch(console.error);
