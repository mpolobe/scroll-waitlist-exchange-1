/**
 * Generate Airdrop Signature API
 * 
 * Verifies worker eligibility in Supabase, then generates
 * a cryptographic signature for claiming SENT tokens.
 * 
 * Contracts (Polygon Mainnet):
 * - SENT Token: 0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5
 * - Airdrop Contract: 0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf
 */

import { createThirdwebClient, getContract } from "thirdweb";
import { generateAirdropSignatureERC20 } from "thirdweb/extensions/airdrop";
import { polygon } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import { createClient } from "@supabase/supabase-js";

// Configuration with fallbacks
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY || "cHGBHt9Tx2HjojftKIgd7cLob0fPRkyxEB5o2h1CZwmT66xFuYDWj9mXOuxVoGSK5awBqnBkHFsFM3S5Dyec9g";
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || "0xdbfa2eeb4ebb86b6d0caeccd5476741bdb234abe6c83f529a35200389dc61b3a";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://llvprbmrnjvamjzavmhg.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

// Supabase client (project: llvprbmrnjvamjzavmhg)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const client = createThirdwebClient({ 
  secretKey: THIRDWEB_SECRET_KEY 
});

// Contract addresses (Polygon Mainnet)
const SENT_TOKEN_ADDRESS = "0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5";
const AIRDROP_CONTRACT_ADDRESS = "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf";

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address } = req.body;

  if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ error: "Valid wallet address required" });
  }

  try {
    // 1. Verify worker progress in Supabase (project: llvprbmrnjvamjzavmhg)
    const { data: worker, error } = await supabase
      .from("airdrop_status")
      .select("quiz_score, claimed, twitter_verified, telegram_verified, referral_count")
      .eq("wallet_address", address.toLowerCase())
      .single();

    if (error || !worker) {
      return res.status(403).json({ error: "Not registered for airdrop" });
    }

    if (worker.quiz_score < 80) {
      return res.status(403).json({ 
        error: "Quiz not passed",
        quizScore: worker.quiz_score,
        required: 80
      });
    }

    if (worker.claimed) {
      return res.status(400).json({ error: "Already claimed" });
    }

    // 2. Calculate allocation based on tasks
    let allocation = 100; // Base amount for passing quiz

    // Bonus for social tasks
    if (worker.twitter_verified && worker.telegram_verified) {
      allocation += 50;
    }

    // Bonus for referrals (3+ referrals)
    if (worker.referral_count >= 3) {
      allocation += worker.referral_count * 25;
    }

    // 3. Generate the cryptographic signature
    const adminAccount = privateKeyToAccount({ 
      client, 
      privateKey: ADMIN_PRIVATE_KEY 
    });

    const airdropContract = getContract({
      client,
      chain: polygon,
      address: AIRDROP_CONTRACT_ADDRESS,
    });

    const signature = await generateAirdropSignatureERC20({
      account: adminAccount,
      contract: airdropContract,
      contents: [{ 
        recipient: address, 
        amount: allocation.toString() 
      }],
    });

    // 4. Update Supabase with signature timestamp
    await supabase
      .from("airdrop_status")
      .update({ 
        total_allocation: allocation,
        signature_generated_at: new Date().toISOString()
      })
      .eq("wallet_address", address.toLowerCase());

    return res.status(200).json({
      ...signature,
      allocation,
      breakdown: {
        quiz: 100,
        social: worker.twitter_verified && worker.telegram_verified ? 50 : 0,
        referrals: worker.referral_count >= 3 ? worker.referral_count * 25 : 0
      }
    });

  } catch (err) {
    console.error("Signature generation error:", err);
    return res.status(500).json({ 
      error: err instanceof Error ? err.message : "Failed to generate signature" 
    });
  }
}
