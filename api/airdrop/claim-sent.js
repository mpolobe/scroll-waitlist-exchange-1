// Vercel Serverless Function: Claim SENT tokens
// Hybrid "Pull" System - Worker clicks claim, server pushes tokens
// Verifies tasks in Supabase before sending

import { createThirdwebClient, getContract } from "thirdweb";
import { transfer, decimals } from "thirdweb/extensions/erc20";
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

// SENT Contract on Polygon
const SENT_CONTRACT = "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf";
const POLYGON_CHAIN_ID = 137;

// Check worker status in Supabase
async function checkWorkerStatus(walletAddress) {
  const { data, error } = await getSupabase()
    .from("airdrop_status")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (error || !data) {
    return { verified: false, reason: "Not registered" };
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

  // Quiz bonus (5/5 = 100% score)
  if (data.quiz_score >= 100) {
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
      total_allocation: amount
    })
    .eq("wallet_address", walletAddress.toLowerCase());

  if (error) {
    console.error("Failed to mark as claimed:", error);
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { workerAddress } = req.body;

  // Validate address
  if (!workerAddress || !workerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ error: "Valid wallet address required" });
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

    // 2. Initialize Secure Thirdweb Client (server-side only)
    const client = createThirdwebClient({ 
      secretKey: process.env.THIRDWEB_SECRET_KEY 
    });

    const contract = getContract({
      client,
      chain: defineChain(POLYGON_CHAIN_ID),
      address: SENT_CONTRACT,
    });

    // 3. EXECUTE THE TRANSFER (Server-side "push" that feels like "pull")
    const transaction = await transfer({
      contract,
      to: workerAddress,
      amount: status.allocation.toString(),
    });

    // 4. Mark as claimed in Supabase
    await markAsClaimed(workerAddress, transaction.transactionHash, status.allocation);

    // 5. Increment referrer's count if applicable
    if (status.data?.referrer_wallet) {
      await getSupabase().rpc("increment_referral_count", { 
        referrer: status.data.referrer_wallet 
      });
    }

    return res.status(200).json({ 
      success: true, 
      txHash: transaction.transactionHash,
      amount: status.allocation,
      message: `${status.allocation} SENT sent to your wallet!`
    });

  } catch (error) {
    console.error("Claim error:", error);
    return res.status(500).json({ error: error.message });
  }
}
