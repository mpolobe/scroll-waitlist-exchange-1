// Vercel Serverless Function: Submit quiz score

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

  const { walletAddress, score } = req.body;

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

  if (typeof score !== "number" || score < 0 || score > 100) {
    return res.status(400).json({ 
      success: false, 
      error: "Score must be a number between 0 and 100" 
    });
  }

  try {
    const { error } = await getSupabase()
      .from("airdrop_status")
      .update({ quiz_score: score })
      .eq("wallet_address", walletAddress.toLowerCase());

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to submit quiz score" 
      });
    }

    const passed = score >= 100; // 5/5 = 100%

    return res.status(200).json({
      success: true,
      score,
      passed,
      message: passed 
        ? "Congratulations! You qualified for the 10M SENT Quiz Pool!" 
        : "Quiz submitted. Try again to qualify for the Quiz Pool."
    });

  } catch (error) {
    console.error("Submit quiz error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Internal server error" 
    });
  }
}
