/**
 * SENT Airdrop Claim Button
 * Worker clicks to pull 100 $SENT after passing quiz
 */

import { TransactionButton } from "thirdweb/react";
import { airdropERC20WithSignature } from "thirdweb/extensions/airdrop";
import { airdropContract } from "@/lib/thirdwebClient";

export default function ClaimButton() {
  return (
    <TransactionButton
      transaction={async () => {
        const res = await fetch("/api/airdrop/sign", { method: "POST" });
        const signature = await res.json();
        
        return airdropERC20WithSignature({
          contract: airdropContract,
          ...signature,
        });
      }}
      onTransactionConfirmed={() => alert("Successfully claimed 100 $SENT!")}
    >
      Claim $SENT Reward
    </TransactionButton>
  );
}
