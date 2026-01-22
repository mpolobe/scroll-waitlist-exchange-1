/**
 * SENT Airdrop Claim Button
 * Worker clicks to pull 100 $SENT after passing quiz
 */

import { TransactionButton, useActiveAccount } from "thirdweb/react";
import { airdropERC20WithSignature } from "thirdweb/extensions/airdrop";
import { airdropContract } from "@/lib/thirdwebClient";
import { supabase } from "@/lib/supabase";

export default function ClaimButton() {
  const account = useActiveAccount();

  if (!account) {
    return (
      <button disabled className="opacity-50 cursor-not-allowed px-6 py-3 bg-gray-400 text-white rounded-lg">
        Connect Wallet to Claim
      </button>
    );
  }

  return (
    <TransactionButton
      transaction={async () => {
        const res = await fetch("/api/airdrop/sign", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: account.address })
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to get signature");
        }
        
        const { req, signature } = await res.json();
        
        return airdropERC20WithSignature({
          contract: airdropContract,
          req,
          signature,
        });
      }}
      onTransactionConfirmed={async (result) => {
        // Update Supabase so the Admin Dashboard sees it in real-time
        await supabase
          .from("airdrop_status")
          .update({ 
            claimed: true,
            claimed_at: new Date().toISOString()
          })
          .eq("wallet_address", account.address.toLowerCase());
        
        alert("Successfully claimed 100 $SENT!");
      }}
      onError={(err) => alert(err.message)}
    >
      Claim $SENT Reward
    </TransactionButton>
  );
}
