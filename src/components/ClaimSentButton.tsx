/**
 * Claim SENT Button Component
 * Claims 100 SENT tokens and logs referral to Supabase
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import { Loader2, Coins, CheckCircle, AlertCircle } from "lucide-react";
import { getActiveReferrer, clearActiveReferrer } from "@/services/referralService";

interface ClaimSentButtonProps {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export function ClaimSentButton({ onSuccess, onError }: ClaimSentButtonProps) {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!account?.address) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const referrer = getActiveReferrer();

      // Call server-side API to claim SENT
      const response = await fetch("/api/airdrop/claim-sent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userWallet: account.address,
          referrerWallet: referrer,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === "ALREADY_CLAIMED") {
          setError("You have already claimed your SENT tokens");
        } else {
          setError(result.error || "Failed to claim tokens");
        }
        onError?.(result.error);
        return;
      }

      // Success
      setClaimed(true);
      clearActiveReferrer();
      onSuccess?.(result.transaction?.transactionHash || "");

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to claim";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  if (claimed) {
    return (
      <Button disabled className="w-full bg-green-600 hover:bg-green-600">
        <CheckCircle className="mr-2 h-4 w-4" />
        100 SENT Claimed!
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClaim}
        disabled={loading || !account}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Claiming...
          </>
        ) : (
          <>
            <Coins className="mr-2 h-4 w-4" />
            Claim 100 SENT
          </>
        )}
      </Button>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      {!account && (
        <p className="text-xs text-muted-foreground text-center">
          Connect your wallet to claim
        </p>
      )}
    </div>
  );
}

export default ClaimSentButton;
