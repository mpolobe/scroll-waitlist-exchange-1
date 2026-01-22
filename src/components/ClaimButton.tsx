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

  return (
    <TransactionButton
      transaction={async () => {
        // A. Get signature from backend
        const res = await fetch("/api/airdrop/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: account?.address }),
        });
        const sigData = await res.json();

        if (!res.ok) {
          throw new Error(sigData.error || "Not eligible");
        }

        // B. Call the Airdrop contract's pull function
        return airdropERC20WithSignature({
          contract: airdropContract,
          ...sigData,
        });
      }}
      onTransactionConfirmed={async () => {
        // C. Update Supabase so they can't claim again
        await supabase
          .from("airdrop_status")
          .update({ claimed: true })
          .eq("wallet_address", account?.address?.toLowerCase());
        
        alert("100 $SENT successfully pulled to your wallet!");
      }}
    >
      Claim My $SENT Reward
    </TransactionButton>
  );
}
