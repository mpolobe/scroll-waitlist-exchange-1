// Vercel Serverless Function: Verify social tasks (Twitter/Telegram)

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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { walletAddress, task } = req.body;

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

  if (!task || !["twitter", "telegram"].includes(task)) {
    return res.status(400).json({ 
      success: false, 
      error: "Task must be 'twitter' or 'telegram'" 
    });
  }

  try {
    const updateField = task === "twitter" 
      ? { twitter_verified: true }
      : { telegram_verified: true };

    const { error } = await getSupabase()
      .from("airdrop_status")
      .update(updateField)
      .eq("wallet_address", walletAddress.toLowerCase());

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to verify task" 
      });
    }

    return res.status(200).json({
      success: true,
      message: `${task === "twitter" ? "Twitter" : "Telegram"} verified successfully`
    });

  } catch (error) {
    console.error("Verify task error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Internal server error" 
    });
  }
}
