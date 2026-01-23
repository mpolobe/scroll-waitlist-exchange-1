/**
 * SENT Airdrop Signature API
 * Verifies task completion in Supabase, then signs the claim
 * User pulls tokens using signature (pays own gas)
 */

import { createThirdwebClient, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { generateAirdropSignatureERC20 } from "thirdweb/extensions/airdrop";
import { privateKeyToAccount } from "thirdweb/wallets";
import { createClient } from "@supabase/supabase-js";

// Helper to serialize BigInt values with "n" suffix for JSON
// Client deserializes by matching /^\d+n$/ pattern
function serializeBigInts(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString() + 'n';
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeBigInts(obj[key]);
    }
    return result;
  }
  return obj;
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({ 
      status: "ok",
      hasSecretKey: !!process.env.THIRDWEB_SECRET_KEY,
      hasAdminKey: !!process.env.ADMIN_PRIVATE_KEY,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address } = req.body;

  if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ error: "Valid wallet address required" });
  }

  // Check environment variables
  if (!process.env.THIRDWEB_SECRET_KEY) {
    console.error("Missing THIRDWEB_SECRET_KEY");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!process.env.ADMIN_PRIVATE_KEY) {
    console.error("Missing ADMIN_PRIVATE_KEY");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!process.env.SUPABASE_SERVICE_KEY) {
    console.error("Missing SUPABASE_SERVICE_KEY");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const client = createThirdwebClient({ secretKey: process.env.THIRDWEB_SECRET_KEY });

    const supabase = createClient(
      process.env.SUPABASE_URL || "https://llvprbmrnjvamjzavmhg.supabase.co",
      process.env.SUPABASE_SERVICE_KEY
    );

    // 1. Verify worker status in Supabase
    const { data: worker, error: dbError } = await supabase
      .from("airdrop_status")
      .select("twitter_verified, telegram_verified, quiz_score, claimed")
      .eq("wallet_address", address.toLowerCase())
      .single();

    if (dbError || !worker) {
      return res.status(403).json({ error: "Not registered for airdrop" });
    }

    if (worker.claimed) {
      return res.status(403).json({ error: "Already claimed" });
    }

    // Must have Twitter AND Telegram verified
    if (!worker.twitter_verified || !worker.telegram_verified) {
      return res.status(403).json({ 
        error: "Complete Twitter and Telegram tasks first",
        tasks: {
          twitter: worker.twitter_verified,
          telegram: worker.telegram_verified
        }
      });
    }

    // 2. Calculate allocation
    let allocation = 100; // Base for social tasks
    if (worker.quiz_score >= 80) {
      allocation += 50; // Quiz bonus
    }

    // 3. Mark as claimed before signing (prevents double-claim)
    await supabase
      .from("airdrop_status")
      .update({ claimed: true, claimed_at: new Date().toISOString() })
      .eq("wallet_address", address.toLowerCase());

    // 4. Create admin account and sign
    const adminAccount = privateKeyToAccount({ 
      client, 
      privateKey: process.env.ADMIN_PRIVATE_KEY 
    });

    const airdropContract = getContract({
      client,
      chain: polygon,
      address: "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf"
    });

    // SENT token address on Polygon
    const SENT_TOKEN = "0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5";
    
    // Amount with 18 decimals
    const amountInWei = BigInt(allocation) * BigInt("1000000000000000000");
    
    const { req: airdropReq, signature } = await generateAirdropSignatureERC20({
      account: adminAccount,
      contract: airdropContract,
      airdropRequest: {
        tokenAddress: SENT_TOKEN,
        contents: [{ 
          recipient: address, 
          amount: amountInWei
        }]
      }
    });

    // Serialize BigInt values for JSON response
    const serializedReq = serializeBigInts(airdropReq);

    return res.status(200).json({ 
      req: serializedReq, 
      signature,
      allocation
    });

  } catch (error: any) {
    console.error("Signature generation error:", error);
    
    // Rollback claimed status on error
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL || "https://llvprbmrnjvamjzavmhg.supabase.co",
        process.env.SUPABASE_SERVICE_KEY!
      );
      await supabase
        .from("airdrop_status")
        .update({ claimed: false })
        .eq("wallet_address", address.toLowerCase());
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    return res.status(500).json({ error: error.message || "Failed to generate signature" });
  }
}
