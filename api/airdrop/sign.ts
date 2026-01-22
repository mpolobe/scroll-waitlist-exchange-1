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

  // 2. Sign the "Permission Slip"
  const adminAccount = privateKeyToAccount({ 
    client, 
    privateKey: process.env.ADMIN_PRIVATE_KEY! 
  });

  const signature = await generateAirdropSignatureERC20({
    account: adminAccount,
    contract: airdropContract,
    contents: [{ recipient: address, amount: "100" }] // 100 $SENT
  });

  return res.status(200).json(signature);
}
