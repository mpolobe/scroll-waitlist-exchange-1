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
    const normalizedUser = userWallet.toLowerCase();
    const normalizedReferrer = referrerWallet ? referrerWallet.toLowerCase() : null;

    // Check if user already exists
    const { data: existing } = await supabase
      .from("airdrop_status")
      .select("wallet_address")
      .eq("wallet_address", normalizedUser)
      .single();

    if (existing) {
      // Update referrer if not already set
      const { error: updateError } = await supabase
        .from("airdrop_status")
        .update({ referrer_wallet: normalizedReferrer })
        .eq("wallet_address", normalizedUser)
        .is("referrer_wallet", null);

      if (updateError) {
        console.error("Update error:", updateError);
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from("airdrop_status")
        .insert([
          {
            wallet_address: normalizedUser,
            referrer_wallet: normalizedReferrer,
            twitter_verified: false,
            telegram_verified: false,
            quiz_score: 0,
            referral_count: 0,
            total_allocation: 0,
            claimed: false,
          },
        ]);

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
    }

    // Increment referrer's count if provided
    if (normalizedReferrer) {
      await supabase.rpc("increment_referral_count", { referrer: normalizedReferrer }).catch(async () => {
        // Fallback: manual increment if RPC not available
        const { data: refData } = await supabase
          .from("airdrop_status")
          .select("referral_count")
          .eq("wallet_address", normalizedReferrer)
          .single();
        
        if (refData) {
          await supabase
            .from("airdrop_status")
            .update({ referral_count: (refData.referral_count || 0) + 1 })
            .eq("wallet_address", normalizedReferrer);
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Referral logged successfully",
      pools: {
        referral: normalizedReferrer ? "50M SENT pool credited to referrer" : null,
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
