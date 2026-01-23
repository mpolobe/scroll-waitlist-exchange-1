/**
 * SENT Airdrop Claim Button
 * Worker clicks to pull SENT tokens after completing tasks
 * Uses signature-based pull - user pays gas
 */

import { TransactionButton, useActiveAccount } from "thirdweb/react";
import { airdropERC20WithSignature } from "thirdweb/extensions/airdrop";
import { airdropContract } from "@/lib/thirdwebClient";
import { supabase } from "@/lib/supabase";

// Helper to deserialize BigInt values from JSON strings
function deserializeBigInts(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(deserializeBigInts);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      const value = obj[key];
      // Convert string numbers that look like BigInt back to BigInt
      if (typeof value === 'string' && /^\d+$/.test(value) && value.length > 15) {
        result[key] = BigInt(value);
      } else if (key === 'expirationTimestamp' && typeof value === 'string') {
        result[key] = BigInt(value);
      } else if (key === 'amount' && typeof value === 'string') {
        result[key] = BigInt(value);
      } else {
        result[key] = deserializeBigInts(value);
      }
    }
    return result;
  }
  
  return obj;
}

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
        
        const data = await res.json();
        
        // Deserialize BigInt values that were stringified for JSON transport
        const req = deserializeBigInts(data.req);
        const signature = data.signature;
        
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
        
        alert("Successfully claimed $SENT!");
      }}
      onError={(err) => alert(err.message)}
    >
      Claim $SENT Reward
    </TransactionButton>
  );
}
