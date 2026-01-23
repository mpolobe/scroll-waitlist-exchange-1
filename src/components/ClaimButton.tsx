/**
 * SENT Airdrop Claim Button
 * Worker clicks to pull SENT tokens after completing tasks
 * Uses signature-based pull - user pays gas
 */

import { useState } from "react";
import { TransactionButton, useActiveAccount } from "thirdweb/react";
import { airdropERC20WithSignature } from "thirdweb/extensions/airdrop";
import { airdropContract } from "@/lib/thirdwebClient";
import { supabase } from "@/lib/supabase";

/**
 * Helper to convert JSON strings back to BigInt for Thirdweb
 * Server serializes BigInt as "123n" format
 */
function deserializeSignature(data: any): any {
  if (typeof data !== 'object' || data === null) return data;
  
  if (Array.isArray(data)) {
    return data.map(deserializeSignature);
  }
  
  const res: any = {};
  for (const key in data) {
    const value = data[key];
    if (typeof value === 'string' && /^\d+n$/.test(value)) {
      res[key] = BigInt(value.replace('n', ''));
    } else if (typeof value === 'object') {
      res[key] = deserializeSignature(value);
    } else {
      res[key] = value;
    }
  }
  return res;
}

export default function ClaimButton() {
  const account = useActiveAccount();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  if (!account) {
    return <p className="text-gray-500">Please connect wallet to claim.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <TransactionButton
        transaction={async () => {
          setStatus("loading");
          
          const response = await fetch("/api/airdrop/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: account.address }),
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Not eligible for airdrop");
          }

          const signedPayload = await response.json();
          const cleanPayload = deserializeSignature(signedPayload);

          return airdropERC20WithSignature({
            contract: airdropContract,
            req: cleanPayload.req,
            signature: cleanPayload.signature,
          });
        }}
        onTransactionConfirmed={async () => {
          await supabase
            .from("airdrop_status")
            .update({ claimed: true, claimed_at: new Date().toISOString() })
            .eq("wallet_address", account.address.toLowerCase());
          
          setStatus("success");
          alert("$SENT claimed successfully!");
        }}
        onError={(err) => {
          console.error(err);
          setStatus("error");
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all"
      >
        Claim $SENT Reward
      </TransactionButton>

      {status === "success" && (
        <p className="text-green-400 font-medium animate-bounce">
          Tokens Received! Check your wallet.
        </p>
      )}
    </div>
  );
}
