/**
 * SENT Airdrop Claim via Safe Module
 * 
 * Flow:
 * 1. User requests claim
 * 2. Server verifies eligibility in Supabase
 * 3. Server signs claim parameters with ADMIN_PRIVATE_KEY
 * 4. Returns signature for user to call module.claim() on-chain
 * 
 * The SafeAirdropModule at 0x48FA3c656A13E207fdd25228ee3b1943C96F0eA8
 * executes the transfer from the Safe multisig.
 */

import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";

const AIRDROP_MODULE = "0x48FA3c656A13E207fdd25228ee3b1943C96F0eA8";
const POLYGON_CHAIN_ID = 137;

// Lazy Supabase client
let supabase = null;
function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL || "https://llvprbmrnjvamjzavmhg.supabase.co";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!key) throw new Error("Supabase credentials not configured");
    supabase = createClient(url, key);
  }
  return supabase;
}

async function checkWorkerStatus(walletAddress) {
  const { data, error } = await getSupabase()
    .from("airdrop_status")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (error || !data) {
    return { verified: false, reason: "Not registered for airdrop" };
  }

  if (data.claimed) {
    return { verified: false, reason: "Already claimed" };
  }

  if (!data.twitter_verified || !data.telegram_verified) {
    return { 
      verified: false, 
      reason: "Complete Twitter and Telegram tasks first",
      tasks: { twitter: data.twitter_verified, telegram: data.telegram_verified }
    };
  }

  // Calculate allocation
  let allocation = 100; // Base for social tasks
  if (data.quiz_score >= 80) allocation += 50;
  if (data.referral_count >= 3) allocation += data.referral_count * 25;

  return { verified: true, allocation, data };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Health check
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "claim-module endpoint ready",
      module: AIRDROP_MODULE,
      chainId: POLYGON_CHAIN_ID,
      hasAdminKey: !!process.env.ADMIN_PRIVATE_KEY
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { workerAddress } = req.body;

  if (!workerAddress || !workerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ error: "Valid wallet address required" });
  }

  if (!process.env.ADMIN_PRIVATE_KEY) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    // 1. Verify eligibility
    const status = await checkWorkerStatus(workerAddress);
    if (!status.verified) {
      return res.status(403).json({ error: status.reason, tasks: status.tasks });
    }

    // 2. Create signature for module claim
    const privateKey = process.env.ADMIN_PRIVATE_KEY.startsWith('0x')
      ? process.env.ADMIN_PRIVATE_KEY
      : `0x${process.env.ADMIN_PRIVATE_KEY}`;
    
    const signer = new ethers.Wallet(privateKey);
    
    // Amount in wei (18 decimals)
    const amount = ethers.parseUnits(status.allocation.toString(), 18);
    
    // Unique nonce (timestamp + random)
    const nonce = BigInt(Date.now()) * 1000000n + BigInt(Math.floor(Math.random() * 1000000));

    // Create message hash matching the contract
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256", "address", "uint256"],
      [workerAddress.toLowerCase(), amount, nonce, AIRDROP_MODULE, POLYGON_CHAIN_ID]
    );

    // Sign with EIP-191 prefix
    const signature = await signer.signMessage(ethers.getBytes(messageHash));

    // 3. Mark as claimed in Supabase
    await getSupabase()
      .from("airdrop_status")
      .update({ 
        claimed: true,
        total_allocation: status.allocation,
        claimed_at: new Date().toISOString()
      })
      .eq("wallet_address", workerAddress.toLowerCase());

    // 4. Return claim data for user to submit on-chain
    return res.status(200).json({
      success: true,
      claimData: {
        module: AIRDROP_MODULE,
        amount: amount.toString(),
        nonce: nonce.toString(),
        signature: signature,
        chainId: POLYGON_CHAIN_ID
      },
      allocation: status.allocation,
      message: `Signature ready! Call claim() on the module to receive ${status.allocation} SENT`
    });

  } catch (error) {
    console.error("Claim error:", error);
    return res.status(500).json({ error: error.message });
  }
}
