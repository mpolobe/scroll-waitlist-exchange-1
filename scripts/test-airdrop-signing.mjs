/**
 * Test Airdrop Signing Flow
 * Simulates the /api/airdrop/sign endpoint logic
 */

import { createThirdwebClient, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { generateAirdropSignatureERC20 } from "thirdweb/extensions/airdrop";
import { privateKeyToAccount } from "thirdweb/wallets";

// Configuration from environment
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY || 'cHGBHt9Tx2HjojftKIgd7cLob0fPRkyxEB5o2h1CZwmT66xFuYDWj9mXOuxVoGSK5awBqnBkHFsFM3S5Dyec9g';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || 'REMOVED_COMPROMISED_KEY';
const SUPABASE_URL = 'https://llvprbmrnjvamjzavmhg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdnByYm1ybmp2YW1qemF2bWhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0NDU1MiwiZXhwIjoyMDgxMzIwNTUyfQ.yfdj690DOhgtlLXENe8nd5y22IFq5N1gtNZ2vnpHcKI';

const TEST_WALLET = '0x1234567890abcdef1234567890abcdef12345678';
const AIRDROP_CONTRACT = '0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf';

async function testAirdropSigning() {
  console.log('='.repeat(60));
  console.log('SENT Airdrop Signing Test');
  console.log('='.repeat(60));
  
  // Step 1: Check Supabase for test wallet
  console.log('\n1. Checking Supabase for test wallet...');
  
  const checkResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/airdrop_status?wallet_address=eq.${TEST_WALLET.toLowerCase()}&select=*`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  );
  
  const records = await checkResponse.json();
  
  if (!records || records.length === 0) {
    console.log('   ❌ Test wallet not found in database');
    return;
  }
  
  const worker = records[0];
  console.log(`   ✅ Found: quiz_score=${worker.quiz_score}, claimed=${worker.claimed}`);
  
  if (worker.quiz_score < 80) {
    console.log('   ❌ Quiz score too low (need >= 80)');
    return;
  }
  
  if (worker.claimed) {
    console.log('   ⚠️  Already claimed - resetting for test...');
    await fetch(
      `${SUPABASE_URL}/rest/v1/airdrop_status?wallet_address=eq.${TEST_WALLET.toLowerCase()}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ claimed: false })
      }
    );
    console.log('   ✅ Reset claimed=false');
  }
  
  // Step 2: Create thirdweb client
  console.log('\n2. Creating thirdweb client...');
  const client = createThirdwebClient({ secretKey: THIRDWEB_SECRET_KEY });
  console.log('   ✅ Client created');
  
  // Step 3: Get airdrop contract
  console.log('\n3. Getting airdrop contract...');
  const airdropContract = getContract({
    client,
    chain: polygon,
    address: AIRDROP_CONTRACT
  });
  console.log(`   ✅ Contract: ${AIRDROP_CONTRACT}`);
  
  // Step 4: Create admin account
  console.log('\n4. Creating admin account from private key...');
  const adminAccount = privateKeyToAccount({ 
    client, 
    privateKey: ADMIN_PRIVATE_KEY 
  });
  console.log(`   ✅ Admin address: ${adminAccount.address}`);
  
  // Step 5: Generate signature
  console.log('\n5. Generating airdrop signature...');
  console.log(`   Recipient: ${TEST_WALLET}`);
  console.log('   Amount: 100 SENT');
  
  try {
    // SENT token address on Polygon
    const SENT_TOKEN = '0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5';
    
    const { req, signature } = await generateAirdropSignatureERC20({
      account: adminAccount,
      contract: airdropContract,
      airdropRequest: {
        tokenAddress: SENT_TOKEN,
        contents: [{ 
          recipient: TEST_WALLET, 
          amount: BigInt("100000000000000000000") // 100 SENT with 18 decimals
        }]
      }
    });
    
    console.log('\n   ✅ SIGNATURE GENERATED SUCCESSFULLY!');
    console.log('\n   Response structure:');
    console.log('   - req:', req ? '✅ Present' : '❌ Missing');
    console.log('   - signature:', signature ? '✅ Present' : '❌ Missing');
    
    if (req) {
      console.log('\n   Request details:');
      console.log(`   - tokenAddress: ${req.tokenAddress}`);
      console.log(`   - expirationTimestamp: ${req.expirationTimestamp}`);
      console.log(`   - uid: ${req.uid}`);
      console.log(`   - contents: ${req.contents?.length} recipient(s)`);
      if (req.contents?.[0]) {
        console.log(`     - recipient: ${req.contents[0].recipient}`);
        console.log(`     - amount: ${req.contents[0].amount} wei (${Number(req.contents[0].amount) / 10**18} SENT)`);
      }
    }
    
    console.log('\n   Signature (first 50 chars):', signature?.substring(0, 50) + '...');
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST PASSED - Airdrop signing is working!');
    console.log('='.repeat(60));
    
    return { req, signature };
    
  } catch (error) {
    console.log('\n   ❌ SIGNATURE GENERATION FAILED');
    console.log('   Error:', error.message);
    
    if (error.message.includes('insufficient')) {
      console.log('\n   ⚠️  This may be because:');
      console.log('   - Airdrop contract has no SENT tokens');
      console.log('   - Admin wallet hasn\'t approved the contract');
    }
    
    throw error;
  }
}

testAirdropSigning().catch(err => {
  console.error('\nTest failed:', err.message);
  process.exit(1);
});
