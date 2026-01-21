// Vercel Serverless Function: Generate Airdrop Signature
// Worker completes quiz/tasks → Server verifies → Generates signature → Worker claims

import { createThirdwebClient, getContract } from "thirdweb";
import { generateAirdropSignatureERC20 } from "thirdweb/extensions/airdrop";
import { defineChain } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import { createClient } from "@supabase/supabase-js";

// Supabase client (project: llvprbmrnjvamjzavmhg)
const supabase = createClient(
  process.env.SUPABASE_URL || "https://llvprbmrnjvamjzavmhg.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// SENT Airdrop Contract on Polygon
const SENT_CONTRACT = "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf";
const POLYGON_CHAIN_ID = 137;

// Verify worker completed tasks in Supabase
async function verifyWorkerStatus(walletAddress) {
  const { data, error } = await supabase
    .from("airdrop_status")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (error || !data) {
    return { eligible: false, reason: "Not registered for airdrop" };
  }

  if (data.claimed) {
    return { eligible: false, reason: "Already claimed" };
  }

  // Required: Twitter AND Telegram verified
  if (!data.twitter_verified || !data.telegram_verified) {
    return { 
      eligible: false, 
      reason: "Complete Twitter and Telegram tasks first",
      tasks: {
        twitter: data.twitter_verified,
        telegram: data.telegram_verified
      }
    };
  }

  // Calculate allocation based on completed tasks
  let allocation = 100; // Base: Social tasks (100M pool)

  // Quiz bonus: 5/5 correct = 100% score
  if (data.quiz_score >= 100) {
    allocation += 50; // Quiz winner (10M pool)
  }

  // Referral bonus: 3+ referrals
  if (data.referral_count >= 3) {
    allocation += data.referral_count * 25; // 25 SENT per referral (50M pool)
  }

  return {
    eligible: true,
    allocation,
    quizPassed: data.quiz_score >= 100,
    referralCount: data.referral_count,
    data
  };
}

// Store signature to prevent replay
async function storeSignature(walletAddress, allocation) {
  await supabase
    .from("airdrop_status")
    .update({ 
      total_allocation: allocation,
      signature_generated_at: new Date().toISOString()
    })
    .eq("wallet_address", walletAddress.toLowerCase());
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

  const { workerAddress, quizPassed } = req.body;

  // Validate address
  if (!workerAddress || !workerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ error: "Valid wallet address required" });
  }

  try {
    // 1. VERIFY IN SUPABASE
    const verification = await verifyWorkerStatus(workerAddress);
    
    if (!verification.eligible) {
      return res.status(403).json({ 
        error: verification.reason,
        eligible: false,
        tasks: verification.tasks
      });
    }

    // 2. Initialize Thirdweb with Secret Key (server-side only)
    const client = createThirdwebClient({ 
      secretKey: process.env.THIRDWEB_SECRET_KEY 
    });

    // 3. Get Airdrop contract
    const airdropContract = getContract({
      client,
      chain: defineChain(POLYGON_CHAIN_ID),
      address: SENT_CONTRACT,
    });

    // 4. Create admin account (0xfcfa... treasury wallet)
    const adminAccount = privateKeyToAccount({
      client,
      privateKey: process.env.ADMIN_PRIVATE_KEY,
    });

    // 5. GENERATE AIRDROP SIGNATURE
    const { payload, signature } = await generateAirdropSignatureERC20({
      account: adminAccount,
      contract: airdropContract,
      contents: [
        { 
          recipient: workerAddress, 
          amount: verification.allocation.toString() 
        }
      ],
    });

    // 6. Store in Supabase
    await storeSignature(workerAddress, verification.allocation);

    // 7. Return signature to worker
    return res.status(200).json({
      success: true,
      eligible: true,
      allocation: verification.allocation,
      payload,
      signature,
      breakdown: {
        socialTasks: 100,
        quizBonus: verification.quizPassed ? 50 : 0,
        referralBonus: verification.referralCount >= 3 ? verification.referralCount * 25 : 0,
      },
      message: `Claim ${verification.allocation} SENT with this signature`
    });

  } catch (error) {
    console.error("Signature generation error:", error);
    return res.status(500).json({ error: error.message });
  }
}
