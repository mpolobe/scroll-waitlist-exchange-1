// Vercel Serverless Function: Register wallet for SENT airdrop
// For mobile workers who paste their address instead of connecting MetaMask

import { createClient } from "@supabase/supabase-js";

// Lazy initialize Supabase client
let supabase = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL || "https://llvprbmrnjvamjzavmhg.supabase.co";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!key) {
      throw new Error("Supabase credentials not configured");
    }
    
    supabase = createClient(url, key);
  }
  return supabase;
}

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

  const { walletAddress, referrerWallet } = req.body;

  // Validate wallet address
  if (!walletAddress) {
    return res.status(400).json({ 
      success: false, 
      error: "Wallet address is required" 
    });
  }

  // Validate Ethereum/Polygon address format
  if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid wallet address format" 
    });
  }

  // Validate referrer if provided
  if (referrerWallet && !referrerWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid referrer wallet format" 
    });
  }

  // Prevent self-referral
  if (referrerWallet && walletAddress.toLowerCase() === referrerWallet.toLowerCase()) {
    return res.status(400).json({ 
      success: false, 
      error: "Cannot refer yourself" 
    });
  }

  try {
    const db = getSupabase();
    
    // Check if already registered (Sybil protection)
    const { data: existing } = await db
      .from("airdrop_referrals")
      .select("id, created_at")
      .eq("user_wallet", walletAddress.toLowerCase())
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Wallet already registered",
        code: "ALREADY_REGISTERED",
        registeredAt: existing.created_at,
      });
    }

    // Register wallet for airdrop
    const { data, error } = await db
      .from("airdrop_referrals")
      .insert([
        {
          user_wallet: walletAddress.toLowerCase(),
          referrer_wallet: referrerWallet ? referrerWallet.toLowerCase() : null,
        },
      ])
      .select()
      .single();

    if (error) {
      // Handle unique constraint (race condition)
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          error: "Wallet already registered",
          code: "ALREADY_REGISTERED",
        });
      }

      console.error("Database error:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to register wallet" 
      });
    }

    // Get current registration count
    const { count } = await db
      .from("airdrop_referrals")
      .select("*", { count: "exact", head: true });

    return res.status(200).json({
      success: true,
      message: "Wallet registered for airdrop",
      registrationId: data.id,
      walletAddress: walletAddress.toLowerCase(),
      queuePosition: count || 1,
      allocation: {
        amount: "100 SENT",
        pool: "160M Worker Pool",
        referralCredit: referrerWallet ? "Referrer credited in 50M Pool" : null,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Internal server error" 
    });
  }
}
