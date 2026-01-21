/**
 * Claim SENT Button Component
 * Uses Thirdweb v5 TransactionButton for on-chain token transfer
 * Checks task completion before allowing claim
 */

import { useState, useEffect } from "react";
import { TransactionButton, useActiveAccount } from "thirdweb/react";
import { transfer } from "thirdweb/extensions/erc20";
import { sentContract } from "@/lib/thirdwebClient";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Lock, Coins, Twitter, Send } from "lucide-react";
import { getAirdropStatus, markAsClaimed, isEligibleToClaim } from "@/services/airdropService";

interface ClaimSentButtonProps {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export function ClaimSentButton({ onSuccess, onError }: ClaimSentButtonProps) {
  const account = useActiveAccount();
  const [claimed, setClaimed] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingTasks, setMissingTasks] = useState<string[]>([]);

  // Check eligibility on mount
  useEffect(() => {
    const checkEligibility = async () => {
      if (!account?.address) {
        setChecking(false);
        return;
      }

      try {
        const status = await getAirdropStatus(account.address);
        
        if (!status) {
          setEligible(false);
          setMissingTasks(["Register for airdrop first"]);
          setChecking(false);
          return;
        }

        if (status.claimed) {
          setClaimed(true);
          setEligible(false);
          setChecking(false);
          return;
        }

        // Check required tasks
        const missing: string[] = [];
        if (!status.twitter_verified) missing.push("Twitter");
        if (!status.telegram_verified) missing.push("Telegram");

        if (missing.length > 0) {
          setMissingTasks(missing);
          setEligible(false);
        } else {
          setEligible(true);
        }
      } catch (err) {
        console.error("Eligibility check failed:", err);
        setEligible(false);
        setMissingTasks(["Unable to verify status"]);
      } finally {
        setChecking(false);
      }
    };

    checkEligibility();
  }, [account?.address]);

  // Handle successful transaction
  const handleSuccess = async (result: { transactionHash: string }) => {
    try {
      if (account?.address) {
        await markAsClaimed(account.address, result.transactionHash);
      }
      setClaimed(true);
      onSuccess?.(result.transactionHash);
    } catch (err) {
      console.error("Failed to update claim status:", err);
      setClaimed(true);
    }
  };

  // Already claimed state
  if (claimed) {
    return (
      <Button disabled className="w-full bg-green-600 hover:bg-green-600">
        <CheckCircle className="mr-2 h-4 w-4" />
        SENT Claimed!
      </Button>
    );
  }

  // Not connected state
  if (!account) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full">
          <Lock className="mr-2 h-4 w-4" />
          Connect Wallet to Claim
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Connect your Polygon wallet to receive SENT
        </p>
      </div>
    );
  }

  // Checking eligibility state
  if (checking) {
    return (
      <Button disabled className="w-full">
        Checking eligibility...
      </Button>
    );
  }

  // Not eligible - show missing tasks
  if (!eligible) {
    return (
      <div className="space-y-3">
        <Button disabled className="w-full bg-gray-400">
          <Lock className="mr-2 h-4 w-4" />
          Complete Tasks to Claim
        </Button>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Complete these tasks first:</p>
          <ul className="space-y-1">
            {missingTasks.map((task) => (
              <li key={task} className="flex items-center gap-2">
                {task === "Twitter" && <Twitter className="h-4 w-4 text-blue-400" />}
                {task === "Telegram" && <Send className="h-4 w-4 text-blue-500" />}
                <span>Verify {task}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Eligible - show claim button
  return (
    <div className="space-y-2">
      <TransactionButton
        transaction={() => transfer({
          contract: sentContract,
          to: account.address,
          amount: "100",
        })}
        onTransactionConfirmed={handleSuccess}
        onError={(err) => {
          setError(err.message);
          onError?.(err.message);
        }}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-md"
      >
        <Coins className="mr-2 h-4 w-4 inline" />
        Receive SENT
      </TransactionButton>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export default ClaimSentButton;
