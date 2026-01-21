/**
 * Airdrop Claim Form Component
 * For mobile workers who can't connect MetaMask
 * Paste wallet address to register for 310M SENT airdrop
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Wallet, CheckCircle, AlertCircle, Copy, Users } from "lucide-react";
import { getActiveReferrer } from "@/services/referralService";

interface AirdropClaimFormProps {
  onSuccess?: (address: string) => void;
  onError?: (error: string) => void;
}

export function AirdropClaimForm({ onSuccess, onError }: AirdropClaimFormProps) {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate Polygon/Ethereum address format
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedAddress = walletAddress.trim();
    
    if (!trimmedAddress) {
      setError("Please enter your wallet address");
      return;
    }

    if (!isValidAddress(trimmedAddress)) {
      setError("Invalid address format. Must start with 0x and be 42 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const referrer = getActiveReferrer();

      // Submit to API
      const response = await fetch("/api/airdrop/register-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: trimmedAddress,
          referrerWallet: referrer,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === "ALREADY_REGISTERED") {
          setError("This wallet is already registered for the airdrop");
        } else {
          setError(result.error || "Failed to register");
        }
        onError?.(result.error);
        return;
      }

      // Success
      setSubmitted(true);
      onSuccess?.(trimmedAddress);

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && isValidAddress(text.trim())) {
        setWalletAddress(text.trim());
        setError(null);
      } else if (text) {
        setWalletAddress(text.trim());
        setError("Pasted text doesn't look like a valid wallet address");
      }
    } catch (err) {
      // Clipboard access denied - user can type manually
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Registered for Airdrop!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your wallet has been added to the 310M SENT distribution list
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <code className="text-xs break-all">{walletAddress}</code>
            </div>
            <p className="text-xs text-muted-foreground">
              You'll receive 100 SENT when the airdrop is processed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Register for SENT Airdrop
        </CardTitle>
        <CardDescription>
          Paste your Polygon wallet address to receive 100 SENT tokens
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet">Polygon Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                id="wallet"
                type="text"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => {
                  setWalletAddress(e.target.value);
                  setError(null);
                }}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handlePaste}
                title="Paste from clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Find your address in MetaMask → Copy Address
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !walletAddress.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Register for Airdrop
              </>
            )}
          </Button>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              310M SENT Pool: 50M Referrals • 100M Tasks • 160M Workers
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default AirdropClaimForm;
