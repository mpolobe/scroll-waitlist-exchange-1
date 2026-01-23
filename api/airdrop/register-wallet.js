// Vercel Serverless Function: Register wallet for SENT airdrop
// For mobile workers who paste their address instead of connecting MetaMask

import { createClient } from "@supabase/supabase-js";

// Lazy initialize Supabase client
let supabase = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://llvprbmrnjvamjzavmhg.supabase.co";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    console.log("Supabase config:", { url, hasKey: !!key, keyPrefix: key?.substring(0, 20) });
    
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
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Health check endpoint
  if (req.method === "GET") {
    try {
      const db = getSupabase();
      const { count, error } = await db
        .from("airdrop_status")
        .select("*", { count: "exact", head: true });
      
      return res.status(200).json({
        success: true,
        message: "API is working",
        airdrop_status_count: count,
        airdrop_status_error: error?.message,
        env: {
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          hasServiceKey2: !!process.env.SUPABASE_SERVICE_KEY,
          hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
          hasViteAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
        }
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        error: e.message,
        name: e.name
      });
    }
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
    const normalizedWallet = walletAddress.toLowerCase();
    const normalizedReferrer = referrerWallet ? referrerWallet.toLowerCase() : null;
    
    // Check if already registered in airdrop_status (primary table)
    const { data: existingStatus, error: statusCheckError } = await db
      .from("airdrop_status")
      .select("wallet_address, created_at")
      .eq("wallet_address", normalizedWallet)
      .single();

    console.log("Status check:", { existingStatus, statusCheckError: statusCheckError?.message });

    // If airdrop_status table exists and wallet is found
    if (existingStatus) {
      return res.status(409).json({
        success: false,
        error: "Wallet already registered",
        code: "ALREADY_REGISTERED",
        registeredAt: existingStatus.created_at,
      });
    }

    // Also check legacy airdrop_referrals table
    const { data: existingReferral, error: referralCheckError } = await db
      .from("airdrop_referrals")
      .select("id, created_at")
      .eq("user_wallet", normalizedWallet)
      .single();

    console.log("Referral check:", { existingReferral, referralCheckError: referralCheckError?.message });

    if (existingReferral) {
      // Migrate to airdrop_status if not already there
      const { error: migrateError } = await db
        .from("airdrop_status")
        .upsert([
          {
            wallet_address: normalizedWallet,
            referrer_wallet: normalizedReferrer,
            twitter_verified: false,
            telegram_verified: false,
            quiz_score: 0,
            referral_count: 0,
            total_allocation: 0,
            claimed: false,
          },
        ], { onConflict: "wallet_address" });

      if (migrateError) {
        console.error("Migration error:", migrateError);
      }

      return res.status(409).json({
        success: false,
        error: "Wallet already registered",
        code: "ALREADY_REGISTERED",
        registeredAt: existingReferral.created_at,
      });
    }

    // Register wallet in airdrop_status table
    const { data, error } = await db
      .from("airdrop_status")
      .insert([
        {
          wallet_address: normalizedWallet,
          referrer_wallet: normalizedReferrer,
          twitter_verified: false,
          telegram_verified: false,
          quiz_score: 0,
          referral_count: 0,
          total_allocation: 0,
          claimed: false,
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

      // Table doesn't exist - fall back to airdrop_referrals
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.log("airdrop_status table not found, using airdrop_referrals");
        
        const { data: fallbackData, error: fallbackError } = await db
          .from("airdrop_referrals")
          .insert([
            {
              user_wallet: normalizedWallet,
              referrer_wallet: normalizedReferrer,
            },
          ])
          .select()
          .single();

        if (fallbackError) {
          if (fallbackError.code === "23505") {
            return res.status(409).json({
              success: false,
              error: "Wallet already registered",
              code: "ALREADY_REGISTERED",
            });
          }
          console.error("Fallback database error:", fallbackError);
          return res.status(500).json({ 
            success: false, 
            error: "Failed to register wallet",
            details: fallbackError.message
          });
        }

        const { count } = await db
          .from("airdrop_referrals")
          .select("*", { count: "exact", head: true });

        return res.status(200).json({
          success: true,
          message: "Wallet registered for airdrop",
          walletAddress: normalizedWallet,
          queuePosition: count || 1,
          allocation: {
            amount: "100 SENT",
            pool: "160M Worker Pool",
            referralCredit: normalizedReferrer ? "Referrer credited in 50M Pool" : null,
          },
        });
      }

      console.error("Database error:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to register wallet",
        details: error.message,
        code: error.code
      });
    }

    // Increment referrer's count if provided
    if (normalizedReferrer) {
      // Use RPC function if available for atomic increment
      await db.rpc("increment_referral_count", { referrer: normalizedReferrer }).catch(async () => {
        // Fallback: manual increment if RPC not available
        const { data: refData } = await db
          .from("airdrop_status")
          .select("referral_count")
          .eq("wallet_address", normalizedReferrer)
          .single();
        
        if (refData) {
          await db
            .from("airdrop_status")
            .update({ referral_count: (refData.referral_count || 0) + 1 })
            .eq("wallet_address", normalizedReferrer);
        }
      });
    }

    // Get current registration count
    const { count } = await db
      .from("airdrop_status")
      .select("*", { count: "exact", head: true });

    return res.status(200).json({
      success: true,
      message: "Wallet registered for airdrop",
      walletAddress: normalizedWallet,
      queuePosition: count || 1,
      allocation: {
        amount: "100 SENT",
        pool: "160M Worker Pool",
        referralCredit: normalizedReferrer ? "Referrer credited in 50M Pool" : null,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Internal server error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      name: error.name
    });
  }
}
