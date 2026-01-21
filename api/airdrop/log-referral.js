// Vercel Serverless Function: Log referral after SENT claim
// Securely records referral to Supabase for 50M SENT pool tracking

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role for secure writes
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

  const { userWallet, referrerWallet } = req.body;

  if (!userWallet) {
    return res.status(400).json({ 
      success: false, 
      error: "User wallet address is required" 
    });
  }

  // Validate Ethereum address format
  if (!userWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid user wallet address format" 
    });
  }

  if (referrerWallet && !referrerWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid referrer wallet address format" 
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
    // Insert referral record
    const { data, error } = await supabase
      .from("airdrop_referrals")
      .insert([
        {
          user_wallet: userWallet.toLowerCase(),
          referrer_wallet: referrerWallet ? referrerWallet.toLowerCase() : null,
        },
      ])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation (Sybil protection)
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          error: "User has already claimed",
          code: "ALREADY_CLAIMED",
        });
      }

      console.error("Database error:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to log referral" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Referral logged successfully",
      referralId: data.id,
      pools: {
        referral: referrerWallet ? "50M SENT pool credited to referrer" : null,
        worker: "160M SENT pool - base allocation",
      },
    });

  } catch (error) {
    console.error("Log referral error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
}
