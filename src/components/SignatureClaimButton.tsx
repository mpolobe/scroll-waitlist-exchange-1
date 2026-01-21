/**
 * Signature-Based Claim Button
 * Flow:
 * 1. Worker completes tasks (Twitter, Telegram, Quiz)
 * 2. Worker clicks "Verify" → Server checks Supabase → Generates signature
 * 3. Worker clicks "Claim" → Uses signature to pull tokens (pays own gas)
 */

import { useState } from "react";
import { useActiveAccount, TransactionButton } from "thirdweb/react";
import { claimWithSignatureERC20 } from "thirdweb/extensions/airdrop";
import { sentContract } from "@/lib/thirdwebClient";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Coins,
  FileSignature,
  Twitter,
  Send
} from "lucide-react";
import { markAsClaimed } from "@/services/airdropService";

interface SignatureClaimButtonProps {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

interface ClaimBreakdown {
  socialTasks: number;
  quizBonus: number;
  referralBonus: number;
}

export function SignatureClaimButton({ onSuccess, onError }: SignatureClaimButtonProps) {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>(null);
  const [allocation, setAllocation] = useState(0);
  const [breakdown, setBreakdown] = useState<ClaimBreakdown | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingTasks, setMissingTasks] = useState<{ twitter?: boolean; telegram?: boolean } | null>(null);

  // Step 1: Get signature from server (verifies tasks in Supabase)
  const handleGetSignature = async () => {
    if (!account?.address) {
      setError("Connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);
    setMissingTasks(null);

    try {
      const response = await fetch("/api/airdrop/generate-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerAddress: account.address }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to verify tasks");
        if (result.tasks) {
          setMissingTasks(result.tasks);
        }
        onError?.(result.error);
        return;
      }

      // Store signature and payload for claim
      setSignature(result.signature);
      setPayload(result.payload);
      setAllocation(result.allocation);
      setBreakdown(result.breakdown);

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get signature";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle successful claim
  const handleClaimSuccess = async (result: { transactionHash: string }) => {
    if (account?.address) {
      await markAsClaimed(account.address, result.transactionHash);
    }
    setClaimed(true);
    onSuccess?.(result.transactionHash);
  };

  // Already claimed
  if (claimed) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full bg-green-600 hover:bg-green-600">
          <CheckCircle className="mr-2 h-4 w-4" />
          {allocation} SENT Claimed!
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Tokens sent to your wallet
        </p>
      </div>
    );
  }

  // Not connected
  if (!account) {
    return (
      <Button disabled className="w-full">
        Connect Wallet to Claim
      </Button>
    );
  }

  // Has signature - show claim button
  if (signature && payload) {
    return (
      <div className="space-y-3">
        {/* Signature Ready */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Verified!</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{allocation} SENT</p>
          
          {/* Breakdown */}
          {breakdown && (
            <div className="mt-2 text-xs text-green-600 space-y-1">
              <div>Social Tasks: {breakdown.socialTasks} SENT</div>
              {breakdown.quizBonus > 0 && <div>Quiz Bonus: +{breakdown.quizBonus} SENT</div>}
              {breakdown.referralBonus > 0 && <div>Referral Bonus: +{breakdown.referralBonus} SENT</div>}
            </div>
          )}
        </div>

        {/* Claim Button */}
        <TransactionButton
          transaction={() => claimWithSignatureERC20({
            contract: sentContract,
            payload,
            signature,
          })}
          onTransactionConfirmed={handleClaimSuccess}
          onError={(err) => {
            setError(err.message);
            onError?.(err.message);
          }}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "18px",
            fontWeight: "bold",
            background: "linear-gradient(to right, #9333ea, #3b82f6)",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer"
          }}
        >
          <Coins className="mr-2 h-5 w-5 inline" />
          Claim {allocation} SENT
        </TransactionButton>

        <p className="text-xs text-center text-muted-foreground">
          Small gas fee in POL required
        </p>
      </div>
    );
  }

  // No signature yet - show verify button
  return (
    <div className="space-y-3">
      <Button
        onClick={handleGetSignature}
        disabled={loading}
        className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Verifying Tasks...
          </>
        ) : (
          <>
            <FileSignature className="mr-2 h-5 w-5" />
            Verify & Claim SENT
          </>
        )}
      </Button>

      {/* Error with missing tasks */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          
          {missingTasks && (
            <div className="text-xs space-y-1">
              <div className={`flex items-center gap-2 ${missingTasks.twitter ? 'text-green-600' : 'text-red-600'}`}>
                <Twitter className="h-3 w-3" />
                <span>Twitter: {missingTasks.twitter ? '✓ Verified' : '✗ Not verified'}</span>
              </div>
              <div className={`flex items-center gap-2 ${missingTasks.telegram ? 'text-green-600' : 'text-red-600'}`}>
                <Send className="h-3 w-3" />
                <span>Telegram: {missingTasks.telegram ? '✓ Verified' : '✗ Not verified'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Complete Twitter & Telegram tasks, then verify to claim
      </p>
    </div>
  );
}

export default SignatureClaimButton;
