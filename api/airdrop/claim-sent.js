// Vercel Serverless Function: Claim SENT tokens via Thirdweb Engine
// Transfers 100 SENT from treasury to worker wallet on Polygon

import { createClient } from "@supabase/supabase-js";

// Supabase client for referral tracking
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Configuration
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const SENT_CONTRACT_ADDRESS = "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf";
const TREASURY_WALLET = "0xfcfa02a852551618f544fbce52908a0f941abef9";
const POLYGON_CHAIN_ID = 137;
const CLAIM_AMOUNT = "100000000000000000000"; // 100 SENT (18 decimals)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // Validate configuration
  if (!THIRDWEB_SECRET_KEY) {
    console.error("THIRDWEB_SECRET_KEY not configured");
    return res.status(500).json({ 
      success: false, 
      error: "Server configuration error" 
    });
  }

  if (!SENT_CONTRACT_ADDRESS) {
    console.error("SENT_CONTRACT_ADDRESS not configured");
    return res.status(500).json({ 
      success: false, 
      error: "Contract not deployed yet" 
    });
  }

  const { userWallet, referrerWallet } = req.body;

  // Validate user wallet
  if (!userWallet || !userWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ 
      success: false, 
      error: "Valid wallet address required" 
    });
  }

  // Validate referrer wallet if provided
  if (referrerWallet && !referrerWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid referrer wallet format" 
    });
  }

  // Prevent self-referral
  if (referrerWallet && userWallet.toLowerCase() === referrerWallet.toLowerCase()) {
    return res.status(400).json({ 
      success: false, 
      error: "Cannot refer yourself" 
    });
  }

  try {
    // Check if already claimed (Sybil protection)
    const { data: existingClaim } = await supabase
      .from("airdrop_referrals")
      .select("id")
      .eq("user_wallet", userWallet.toLowerCase())
      .single();

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        error: "Already claimed",
        code: "ALREADY_CLAIMED",
      });
    }

    // Transfer SENT tokens via Thirdweb Engine API
    const transferResponse = await fetch("https://api.thirdweb.com/v1/contracts/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": THIRDWEB_SECRET_KEY,
      },
      body: JSON.stringify({
        chainId: POLYGON_CHAIN_ID,
        calls: [
          {
            contractAddress: SENT_CONTRACT_ADDRESS,
            method: "function transfer(address to, uint256 amount)",
            params: [userWallet, CLAIM_AMOUNT],
          },
        ],
        from: TREASURY_WALLET,
      }),
    });

    const transferResult = await transferResponse.json();

    if (!transferResponse.ok) {
      console.error("Thirdweb transfer failed:", transferResult);
      return res.status(500).json({
        success: false,
        error: "Token transfer failed",
        details: transferResult.error || transferResult.message,
      });
    }

    // Log referral to Supabase after successful transfer
    const { error: dbError } = await supabase
      .from("airdrop_referrals")
      .insert([
        {
          user_wallet: userWallet.toLowerCase(),
          referrer_wallet: referrerWallet ? referrerWallet.toLowerCase() : null,
        },
      ]);

    if (dbError) {
      console.error("Failed to log referral:", dbError);
      // Don't fail the request - tokens were already sent
    }

    return res.status(200).json({
      success: true,
      message: "100 SENT claimed successfully",
      transaction: transferResult,
      allocation: {
        amount: "100 SENT",
        pool: "160M Worker Pool",
        referralCredit: referrerWallet ? "50M Referral Pool" : null,
      },
    });

  } catch (error) {
    console.error("Claim error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
}
