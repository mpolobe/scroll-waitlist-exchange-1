/**
 * SENT Airdrop Claim Component
 * Two options for workers:
 * 1. Connect MetaMask (desktop)
 * 2. Paste wallet address (mobile)
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ClipboardPaste, Coins } from "lucide-react";
import { ClaimSentButton } from "./ClaimSentButton";
import { AirdropClaimForm } from "./AirdropClaimForm";
import { ReferralLeaderboard } from "./ReferralLeaderboard";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { polygon } from "thirdweb/chains";

export function SentAirdropClaim() {
  const [claimSuccess, setClaimSuccess] = useState(false);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full">
          <Coins className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">SENT Token Airdrop</h1>
        <p className="text-muted-foreground">
          Claim your 100 SENT tokens from the 310M pool
        </p>
      </div>

      {/* Claim Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Claim Your Tokens</CardTitle>
          <CardDescription>
            Choose how you want to receive your SENT tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connect" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connect" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Connect
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex items-center gap-2">
                <ClipboardPaste className="h-4 w-4" />
                Paste Address
              </TabsTrigger>
            </TabsList>

            {/* Option 1: Connect Wallet */}
            <TabsContent value="connect" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Connect your MetaMask or wallet to claim instantly
              </p>
              
              <div className="space-y-3">
                <ConnectButton
                  client={client}
                  chain={polygon}
                  connectButton={{
                    label: "Connect Wallet",
                    className: "w-full",
                  }}
                />
                
                <ClaimSentButton
                  onSuccess={() => setClaimSuccess(true)}
                  onError={(err) => console.error(err)}
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Requires MetaMask or compatible wallet
              </p>
            </TabsContent>

            {/* Option 2: Paste Address */}
            <TabsContent value="paste" className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                For mobile users: paste your Polygon wallet address
              </p>
              
              <AirdropClaimForm
                onSuccess={() => setClaimSuccess(true)}
                onError={(err) => console.error(err)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
