// Vercel Serverless Function: Get referral leaderboard
// Returns top referrers for the 50M SENT pool

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const limit = Math.min(parseInt(req.query.limit) || 5, 100);

  try {
    // Query the referral_leaderboard view
    const { data, error } = await supabase
      .from("referral_leaderboard")
      .select("referrer_wallet, total_referrals")
      .limit(limit);

    if (error) {
      console.error("Leaderboard query error:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch leaderboard" 
      });
    }

    // Get total stats from airdrop_status table
    const { count: totalClaims } = await supabase
      .from("airdrop_status")
      .select("*", { count: "exact", head: true });

    const { count: tasksCompleted } = await supabase
      .from("airdrop_status")
      .select("*", { count: "exact", head: true })
      .eq("twitter_verified", true)
      .eq("telegram_verified", true);

    return res.status(200).json({
      success: true,
      leaderboard: data || [],
      stats: {
        totalClaims: totalClaims || 0,
        tasksCompleted: tasksCompleted || 0,
        pools: {
          referral: "50M SENT",
          socialTasks: "100M SENT", 
          workers: "160M SENT",
          total: "310M SENT",
        },
      },
    });

  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
}
