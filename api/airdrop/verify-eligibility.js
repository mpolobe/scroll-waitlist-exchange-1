// Vercel Serverless Function: Verify worker airdrop eligibility
// Uses THIRDWEB_SECRET_KEY (server-side only - never exposed to browser)

import { createThirdwebClient } from "thirdweb";
import { createClient } from "@supabase/supabase-js";

// Initialize SECURE Thirdweb client (server-side only)
const secureClient = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

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

  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ 
      success: false, 
      error: "Wallet address is required" 
    });
  }

  // Validate Ethereum address format
  if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid wallet address format" 
    });
  }

  try {
    // Check if user has already claimed (Sybil protection)
    const { data: existingClaim, error: checkError } = await supabase
      .from("airdrop_referrals")
      .select("id, created_at")
      .eq("user_wallet", walletAddress.toLowerCase())
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Database error:", checkError);
      return res.status(500).json({ 
        success: false, 
        error: "Database error" 
      });
    }

    if (existingClaim) {
      return res.status(200).json({
        success: false,
        eligible: false,
        reason: "already_claimed",
        claimedAt: existingClaim.created_at,
      });
    }

    // User is eligible for airdrop
    return res.status(200).json({
      success: true,
      eligible: true,
      allocation: {
        base: 100,           // Base SENT tokens per worker
        referralPool: "50M", // 50M SENT referral pool
        taskPool: "100M",    // 100M SENT social tasks pool
        workerPool: "160M",  // 160M SENT worker pool
      },
    });

  } catch (error) {
    console.error("Eligibility check error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
}
