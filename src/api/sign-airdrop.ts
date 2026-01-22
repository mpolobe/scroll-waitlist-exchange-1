/**
 * Backend Signer for SENT Airdrop
 * 
 * Verifies worker quiz score in Supabase, then generates
 * a cryptographic signature allowing them to claim SENT tokens.
 * 
 * Contracts (Polygon Mainnet):
 * - SENT Token: 0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5
 * - Airdrop Contract: 0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf
 */

import { createThirdwebClient, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { generateAirdropSignatureERC20 } from "thirdweb/extensions/airdrop";
import { privateKeyToAccount } from "thirdweb/wallets";
import { createClient } from "@supabase/supabase-js";

// Configuration
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY || "cHGBHt9Tx2HjojftKIgd7cLob0fPRkyxEB5o2h1CZwmT66xFuYDWj9mXOuxVoGSK5awBqnBkHFsFM3S5Dyec9g";
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || "0xREMOVED_COMPROMISED_KEY";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://llvprbmrnjvamjzavmhg.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

// Contract addresses
const SENT_TOKEN = "0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5";
const AIRDROP_CONTRACT = "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf";

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const thirdwebClient = createThirdwebClient({ 
  secretKey: THIRDWEB_SECRET_KEY 
});

const adminAccount = privateKeyToAccount({
  client: thirdwebClient,
  privateKey: ADMIN_PRIVATE_KEY
});

const airdropContract = getContract({
  client: thirdwebClient,
  chain: polygon,
  address: AIRDROP_CONTRACT
});

interface SignAirdropRequest {
  walletAddress: string;
}

interface SignAirdropResponse {
  success: boolean;
  signature?: string;
  payload?: any;
  allocation?: number;
  error?: string;
}

/**
 * Verify worker eligibility and generate claim signature
 */
export async function signAirdrop(request: SignAirdropRequest): Promise<SignAirdropResponse> {
  const { walletAddress } = request;

  // Validate address format
  if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return { success: false, error: "Invalid wallet address" };
  }

  const address = walletAddress.toLowerCase();

  try {
    // 1. Check Supabase for worker status
    const { data: worker, error } = await supabase
      .from("airdrop_status")
      .select("quiz_score, claimed, twitter_verified, telegram_verified, referral_count")
      .eq("wallet_address", address)
      .single();

    if (error || !worker) {
      return { success: false, error: "Not registered for airdrop" };
    }

    // 2. Verify quiz score >= 80
    if (worker.quiz_score < 80) {
      return { 
        success: false, 
        error: `Quiz score too low: ${worker.quiz_score}/100 (need 80+)` 
      };
    }

    // 3. Check if already claimed
    if (worker.claimed) {
      return { success: false, error: "Already claimed" };
    }

    // 4. Calculate allocation
    let allocation = 100; // Base for passing quiz

    if (worker.twitter_verified && worker.telegram_verified) {
      allocation += 50; // Social bonus
    }

    if (worker.referral_count >= 3) {
      allocation += worker.referral_count * 25; // Referral bonus
    }

    // 5. Generate signature
    const { payload, signature } = await generateAirdropSignatureERC20({
      account: adminAccount,
      contract: airdropContract,
      airdropRequest: {
        tokenAddress: SENT_TOKEN,
        contents: [{
          recipient: walletAddress,
          amount: (BigInt(allocation) * BigInt(10 ** 18)).toString() // Convert to wei
        }]
      }
    });

    // 6. Update Supabase
    await supabase
      .from("airdrop_status")
      .update({
        total_allocation: allocation,
        signature_generated_at: new Date().toISOString()
      })
      .eq("wallet_address", address);

    return {
      success: true,
      signature,
      payload,
      allocation
    };

  } catch (err) {
    console.error("Sign airdrop error:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Failed to generate signature" 
    };
  }
}

/**
 * Mark wallet as claimed after successful transaction
 */
export async function markClaimed(walletAddress: string, txHash: string): Promise<boolean> {
  const { error } = await supabase
    .from("airdrop_status")
    .update({ 
      claimed: true,
      claim_tx_hash: txHash,
      claimed_at: new Date().toISOString()
    })
    .eq("wallet_address", walletAddress.toLowerCase());

  return !error;
}

export default signAirdrop;
