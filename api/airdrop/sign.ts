/**
 * SENT Airdrop Signature API
 * Verifies quiz score in Supabase, then signs the claim
 */

import { createThirdwebClient, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { generateAirdropSignatureERC20 } from "thirdweb/extensions/airdrop";
import { privateKeyToAccount } from "thirdweb/wallets";
import { createClient } from "@supabase/supabase-js";

const client = createThirdwebClient({ secretKey: process.env.THIRDWEB_SECRET_KEY! });

const supabase = createClient(
  process.env.SUPABASE_URL || "https://llvprbmrnjvamjzavmhg.supabase.co",
  process.env.SUPABASE_SERVICE_KEY!
);

const airdropContract = getContract({
  client,
  chain: polygon,
  address: "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf"
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address } = req.body;

  // 1. Verify Quiz Score in Supabase (Project: llvprbmrnjvamjzavmhg)
  const { data: worker } = await supabase
    .from("airdrop_status")
    .select("quiz_score, claimed")
    .eq("wallet_address", address.toLowerCase())
    .single();

  if (!worker || worker.quiz_score < 80 || worker.claimed) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  // 2. Mark as claimed before signing (prevents double-claim)
  await supabase
    .from("airdrop_status")
    .update({ claimed: true })
    .eq("wallet_address", address.toLowerCase());

  // 3. Sign the "Permission Slip"
  const adminAccount = privateKeyToAccount({ 
    client, 
    privateKey: process.env.ADMIN_PRIVATE_KEY! 
  });

  // SENT token address on Polygon
  const SENT_TOKEN = "0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5";
  
  const { req, signature } = await generateAirdropSignatureERC20({
    account: adminAccount,
    contract: airdropContract,
    airdropRequest: {
      tokenAddress: SENT_TOKEN,
      contents: [{ 
        recipient: address, 
        amount: BigInt("100000000000000000000") // 100 SENT with 18 decimals
      }]
    }
  });

  return res.status(200).json({ req, signature });
}
