// Vercel Serverless Function: Get airdrop status for a wallet

import { createClient } from "@supabase/supabase-js";

let supabase = null;
function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://llvprbmrnjvamjzavmhg.supabase.co";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!key) {
      throw new Error("Supabase credentials not configured");
    }
    
    supabase = createClient(url, key);
  }
  return supabase;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Accept both GET with query param and POST with body
  const walletAddress = req.method === "GET" 
    ? req.query.wallet 
    : req.body?.walletAddress;

  if (!walletAddress) {
    return res.status(400).json({ 
      success: false, 
      error: "Wallet address is required" 
    });
  }

  if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid wallet address format" 
    });
  }

  try {
    const { data, error } = await getSupabase()
      .from("airdrop_status")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Database error:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Database error" 
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Wallet not registered",
        code: "NOT_REGISTERED"
      });
    }

    return res.status(200).json({
      success: true,
      status: {
        wallet_address: data.wallet_address,
        twitter_verified: data.twitter_verified,
        telegram_verified: data.telegram_verified,
        quiz_score: data.quiz_score,
        referral_count: data.referral_count,
        total_allocation: data.total_allocation,
        claimed: data.claimed,
        created_at: data.created_at
      }
    });

  } catch (error) {
    console.error("Get status error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Internal server error" 
    });
  }
}
