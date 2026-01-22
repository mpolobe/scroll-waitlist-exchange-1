/**
 * SENT Airdrop Claim Button (Full Tracking Version)
 * Tracks all claim data in Supabase for Sentinel records
 * 
 * Stores:
 * - wallet_address
 * - claim_tx_hash
 * - claimed_at timestamp
 * - amount claimed
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
 
export default function ClaimButtonTracked({ onSuccess, onError }: ClaimButtonProps) {
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
        100 $SENT Claimed Successfully!
      </div>
    );
  }
 
  return (
    <div className="space-y-3">
      <TransactionButton
        transaction={async () => {
          // A. Get signature from backend (sends wallet address)
          const res = await fetch("/api/airdrop/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: account.address }),
          });
 
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Not eligible - complete quiz first");
          }

          const { req, signature } = await res.json();
 
          // B. Call the Airdrop contract's pull function
          return airdropERC20WithSignature({
            contract: airdropContract,
            req,
            signature,
          });
        }}
        onTransactionConfirmed={async (result) => {
          // C. Store claim record in Supabase for Sentinel tracking
          await supabase
            .from("airdrop_status")
            .update({ 
              claimed: true,
              claim_tx_hash: result.transactionHash,
              claimed_at: new Date().toISOString(),
              amount_claimed: 100
            })
            .eq("wallet_address", account.address?.toLowerCase());
 
          setClaimed(true);
          onSuccess?.();
          alert("100 $SENT successfully pulled to your wallet!");
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
        }}
      >
        <Gift className="h-5 w-5" style={{ marginRight: "8px", display: "inline" }} />
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
