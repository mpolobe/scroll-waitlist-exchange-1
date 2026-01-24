// Vercel Serverless Function: Claim SENT tokens
// Server-side push - Worker clicks claim, server sends tokens from treasury wallet
// Verifies tasks in Supabase before sending

import { createThirdwebClient, getContract, sendTransaction } from "thirdweb";
import { transfer } from "thirdweb/extensions/erc20";
import { privateKeyToAccount } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { createClient } from "@supabase/supabase-js";

// Lazy initialize Supabase client
let supabase = null;
function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL || "https://llvprbmrnjvamjzavmhg.supabase.co";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (!key) {
      throw new Error("Supabase credentials not configured");
    }
    supabase = createClient(url, key);
  }
  return supabase;
}

// SENT Token Contract on Polygon (the ERC20 token, not the airdrop contract)
const SENT_TOKEN_ADDRESS = "0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5";
const POLYGON_CHAIN_ID = 137;

// Check worker status in Supabase
async function checkWorkerStatus(walletAddress) {
  const { data, error } = await getSupabase()
    .from("airdrop_status")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (error || !data) {
    return { verified: false, reason: "Not registered for airdrop" };
  }

  if (data.claimed) {
    return { verified: false, reason: "Already claimed" };
  }

  // Must have Twitter AND Telegram verified
  if (!data.twitter_verified || !data.telegram_verified) {
    return { 
      verified: false, 
      reason: "Complete Twitter and Telegram tasks first",
      tasks: {
        twitter: data.twitter_verified,
        telegram: data.telegram_verified
      }
    };
  }

  // Calculate allocation based on completed tasks
  let allocation = 100; // Base amount for social tasks

  // Quiz bonus (80%+ score)
  if (data.quiz_score >= 80) {
    allocation += 50;
  }

  // Referral bonus (3+ referrals)
  if (data.referral_count >= 3) {
    allocation += data.referral_count * 25;
  }

  return { 
    verified: true, 
    allocation,
    data
  };
}

// Mark as claimed in Supabase
async function markAsClaimed(walletAddress, txHash, amount) {
  const { error } = await getSupabase()
    .from("airdrop_status")
    .update({ 
      claimed: true,
      total_allocation: amount,
      claimed_at: new Date().toISOString()
    })
    .eq("wallet_address", walletAddress.toLowerCase());

  if (error) {
    console.error("Failed to mark as claimed:", error);
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  
  // Health check
  if (req.method === "GET") {
    return res.status(200).json({ 
      success: true, 
      message: "claim-sent endpoint ready",
      hasThirdwebKey: !!process.env.THIRDWEB_SECRET_KEY,
      hasAdminKey: !!process.env.ADMIN_PRIVATE_KEY,
      hasSupabaseKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY)
    });
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { workerAddress } = req.body;

  // Validate address
  if (!workerAddress || !workerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ error: "Valid wallet address required" });
  }

  // Check for required environment variables
  if (!process.env.THIRDWEB_SECRET_KEY) {
    return res.status(500).json({ error: "Server configuration error: Missing Thirdweb key" });
  }

  if (!process.env.ADMIN_PRIVATE_KEY) {
    return res.status(500).json({ error: "Server configuration error: Missing admin key" });
  }

  try {
    // 1. CHECK SUPABASE - Verify worker completed tasks
    const status = await checkWorkerStatus(workerAddress);
    
    if (!status.verified) {
      return res.status(403).json({ 
        error: status.reason,
        tasks: status.tasks || null
      });
    }

    // 2. Initialize Thirdweb Client with secret key
    console.log("Initializing Thirdweb client...");
    const client = createThirdwebClient({ 
      secretKey: process.env.THIRDWEB_SECRET_KEY 
    });

    // 3. Create admin account from private key (treasury wallet)
    // Ensure private key has 0x prefix
    console.log("Creating admin account...");
    const privateKey = process.env.ADMIN_PRIVATE_KEY.startsWith('0x') 
      ? process.env.ADMIN_PRIVATE_KEY 
      : `0x${process.env.ADMIN_PRIVATE_KEY}`;
    console.log("Private key length:", privateKey.length);
    
    let adminAccount;
    try {
      adminAccount = privateKeyToAccount({
        client,
        privateKey
      });
      console.log("Admin account created:", adminAccount.address);
    } catch (accountError) {
      console.error("Failed to create admin account:", accountError);
      return res.status(500).json({ 
        error: "Failed to initialize admin wallet",
        details: accountError.message 
      });
    }

    // 4. Get the SENT token contract
    console.log("Getting token contract...");
    const tokenContract = getContract({
      client,
      chain: defineChain(POLYGON_CHAIN_ID),
      address: SENT_TOKEN_ADDRESS,
    });

    // 5. Prepare the transfer transaction
    console.log("Preparing transfer of", status.allocation, "SENT to", workerAddress);
    const transaction = transfer({
      contract: tokenContract,
      to: workerAddress,
      amount: status.allocation.toString(),
    });

    // 6. Send the transaction from admin wallet
    console.log("Sending transaction...");
    const result = await sendTransaction({
      transaction,
      account: adminAccount,
    });
    console.log("Transaction sent:", result.transactionHash);

    // 7. Mark as claimed in Supabase
    await markAsClaimed(workerAddress, result.transactionHash, status.allocation);

    // 8. Increment referrer's count if applicable
    if (status.data?.referrer_wallet) {
      await getSupabase().rpc("increment_referral_count", { 
        referrer: status.data.referrer_wallet 
      });
    }

    return res.status(200).json({ 
      success: true, 
      txHash: result.transactionHash,
      amount: status.allocation,
      message: `${status.allocation} SENT sent to your wallet!`
    });

  } catch (error) {
    console.error("Claim error:", error);
    return res.status(500).json({ error: error.message });
  }
}
