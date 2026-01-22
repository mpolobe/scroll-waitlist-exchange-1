/**
 * Sentinel Claim Button
 * 
 * Flow:
 * 1. User clicks "Claim My $SENT Reward"
 * 2. Frontend requests signature from backend (verifies Supabase)
 * 3. User signs transaction to pull tokens from Airdrop contract
 * 4. Supabase marked as claimed
 */

import { TransactionButton, useActiveAccount } from "thirdweb/react";
import { airdropERC20WithSignature } from "thirdweb/extensions/airdrop";
import { airdropContract } from "@/lib/thirdwebClient";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Gift, CheckCircle, AlertCircle } from "lucide-react";

interface ClaimButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function SentinelClaim({ onSuccess, onError }: ClaimButtonProps) {
  const account = useActiveAccount();
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!account) {
    return (
      <button 
        disabled
        className="w-full py-4 px-6 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
      >
        Connect Wallet to Claim
      </button>
    );
  }

  if (claimed) {
    return (
      <div className="w-full py-4 px-6 bg-green-100 text-green-700 rounded-lg font-medium text-center flex items-center justify-center gap-2">
        <CheckCircle className="h-5 w-5" />
        $SENT Claimed Successfully!
      </div>
    );
  }



  return (
    <div className="space-y-3">
      <TransactionButton
        transaction={async () => {
          // A. Get signature from our backend
          const res = await fetch("/api/airdrop/generate-signature", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: account.address }),
          });
          
          const sigData = await res.json();
          
          if (!res.ok) {
            throw new Error(sigData.error || "Failed to get signature");
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
            .eq("wallet_address", account.address?.toLowerCase());
          
          setClaimed(true);
          onSuccess?.();
        }}
        onError={(err) => {
          const message = err instanceof Error ? err.message : "Claim failed";
          setError(message);
          onError?.(message);
        }}
        style={{
          width: "100%",
          padding: "16px 24px",
          fontSize: "18px",
          fontWeight: "600",
          background: "linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)",
          color: "white",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
      >
        <Gift className="h-5 w-5" />
        Claim My $SENT Reward
      </TransactionButton>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <p className="text-xs text-center text-gray-500">
        Small gas fee in POL required to claim
      </p>
    </div>
  );
}

export { SentinelClaim };
