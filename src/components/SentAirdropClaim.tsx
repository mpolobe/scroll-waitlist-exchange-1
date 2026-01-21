/**
 * SENT Airdrop Registration Component
 * Workers register their wallet address to receive 310M SENT airdrop
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Coins, Gift } from "lucide-react";
import { AirdropClaimForm } from "./AirdropClaimForm";
import { ReferralLeaderboard } from "./ReferralLeaderboard";

export function SentAirdropClaim() {
  const [registered, setRegistered] = useState(false);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full">
          <Gift className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">SENT Token Airdrop</h1>
        <p className="text-muted-foreground">
          Register your wallet to receive 100 SENT tokens
        </p>
      </div>

      {/* Registration Form */}
      <AirdropClaimForm
        onSuccess={() => setRegistered(true)}
        onError={(err) => console.error(err)}
      />

      {/* Pool Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">50M</div>
              <div className="text-xs text-muted-foreground">Referral Pool</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">100M</div>
              <div className="text-xs text-muted-foreground">Social Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">160M</div>
              <div className="text-xs text-muted-foreground">Worker Pool</div>
            </div>
          </div>
          <div className="text-center mt-4 pt-4 border-t">
            <div className="text-3xl font-bold">310M SENT</div>
            <div className="text-sm text-muted-foreground">Total Airdrop</div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <ReferralLeaderboard limit={5} />
    </div>
  );
}

export default SentAirdropClaim;
