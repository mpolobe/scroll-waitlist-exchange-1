/**
 * SENT Airdrop Page
 * Complete flow: Register → Quiz → Social Tasks → Claim
 * 
 * Pools:
 * - 50M SENT: Referral Pool (3+ referrals)
 * - 100M SENT: Social Tasks Pool (Twitter + Telegram)
 * - 10M SENT: Quiz Pool (5/5 correct)
 * - 150M SENT: Worker Pool (base allocation)
 * 
 * Airdrop Start: Friday, January 23rd, 2026 at 8:00 AM UTC
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Airdrop start time: Friday, January 23rd, 2026 at 8:00 AM UTC
const AIRDROP_START_TIME = new Date("2026-01-23T08:00:00Z");
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Gift, 
  Wallet, 
  CheckCircle, 
  Circle,
  Twitter,
  Send,
  HelpCircle,
  Users,
  Copy,
  ExternalLink,
  Loader2,
  Trophy,
  Coins
} from "lucide-react";
import { AfricaRailwaysQuiz } from "@/components/AfricaRailwaysQuiz";
import { ReferralLeaderboard } from "@/components/ReferralLeaderboard";
import ClaimButton from "@/components/ClaimButton";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { client, polygon, AIRDROP_CONTRACT_ADDRESS, airdropContract } from "@/lib/thirdwebClient";
import { getAirdropStatus, verifyTwitter, verifyTelegram } from "@/services/airdropService";
import { setActiveReferrer } from "@/services/referralService";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";



interface AirdropProgress {
  registered: boolean;
  twitterVerified: boolean;
  telegramVerified: boolean;
  quizPassed: boolean;
  referralCount: number;
  totalAllocation: number;
  claimed: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Airdrop() {
  const [searchParams] = useSearchParams();
  const account = useActiveAccount();
  const { toast } = useToast();
  
  // State
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState("register");
  const [progress, setProgress] = useState<AirdropProgress>({
    registered: false,
    twitterVerified: false,
    telegramVerified: false,
    quizPassed: false,
    referralCount: 0,
    totalAllocation: 0,
    claimed: false
  });
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [airdropStarted, setAirdropStarted] = useState(false);

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = AIRDROP_START_TIME.getTime() - now.getTime();

      if (difference <= 0) {
        setAirdropStarted(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  


  // Handle referral code from URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setActiveReferrer(ref);
    }
  }, [searchParams]);

  // Auto-fill wallet from connected account
  useEffect(() => {
    if (account?.address && !walletAddress) {
      setWalletAddress(account.address);
    }
  }, [account?.address]);

  // Load progress when wallet changes
  useEffect(() => {
    if (walletAddress && walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      loadProgress(walletAddress);
    }
  }, [walletAddress]);

  const loadProgress = async (address: string) => {
    setLoading(true);
    try {
      const status = await getAirdropStatus(address);
      if (status) {
        setProgress({
          registered: true,
          twitterVerified: status.twitter_verified,
          telegramVerified: status.telegram_verified,
          quizPassed: status.quiz_score >= 100,
          referralCount: status.referral_count,
          totalAllocation: status.total_allocation,
          claimed: status.claimed
        });
        
        // Auto-advance to appropriate tab
        if (status.claimed) {
          setActiveTab("claim");
        } else if (status.twitter_verified && status.telegram_verified) {
          setActiveTab("quiz");
        } else {
          setActiveTab("tasks");
        }
      }
    } catch (err) {
      console.error("Failed to load progress:", err);
    } finally {
      setLoading(false);
    }
  };

  // Register wallet
  const handleRegister = async () => {
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Polygon wallet address",
        variant: "destructive"
      });
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch("/api/airdrop/register-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          walletAddress,
          referrerWallet: searchParams.get("ref")
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === "ALREADY_REGISTERED") {
          // Already registered - load their progress
          await loadProgress(walletAddress);
          toast({
            title: "Welcome Back!",
            description: "Your wallet is already registered"
          });
        } else {
          throw new Error(result.error);
        }
        return;
      }

      setProgress(prev => ({ ...prev, registered: true }));
      setActiveTab("tasks");
      toast({
        title: "Registered!",
        description: "Complete tasks to earn SENT tokens"
      });

    } catch (err) {
      toast({
        title: "Registration Failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };

  // Verify Twitter - opens link and verifies
  const handleTwitterVerify = async () => {
    window.open("https://x.com/africoin_afc", "_blank");
    
    setTimeout(async () => {
      await verifyTwitter(walletAddress);
      setProgress(prev => ({ ...prev, twitterVerified: true }));
      toast({ title: "Twitter Verified!", description: "+50 SENT unlocked" });
    }, 3000);
  };

  // Already following Twitter - direct verification with confirmation
  const handleTwitterAlreadyFollowing = async () => {
    const confirmed = window.confirm(
      "By confirming, you declare that you are following @africoin_afc on Twitter.\n\nFalse claims may result in disqualification from the airdrop."
    );
    if (!confirmed) return;
    
    await verifyTwitter(walletAddress);
    setProgress(prev => ({ ...prev, twitterVerified: true }));
    toast({ title: "Twitter Verified!", description: "+50 SENT unlocked" });
  };

  // Verify Telegram - opens link and verifies
  const handleTelegramVerify = async () => {
    window.open("https://t.me/afrcsentinel", "_blank");
    
    setTimeout(async () => {
      await verifyTelegram(walletAddress);
      setProgress(prev => ({ ...prev, telegramVerified: true }));
      toast({ title: "Telegram Verified!", description: "+50 SENT unlocked" });
    }, 3000);
  };

  // Already joined Telegram - direct verification with confirmation
  const handleTelegramAlreadyJoined = async () => {
    const confirmed = window.confirm(
      "By confirming, you declare that you have joined @afrcsentinel on Telegram.\n\nFalse claims may result in disqualification from the airdrop."
    );
    if (!confirmed) return;
    
    await verifyTelegram(walletAddress);
    setProgress(prev => ({ ...prev, telegramVerified: true }));
    toast({ title: "Telegram Verified!", description: "+50 SENT unlocked" });
  };

  // Quiz completion handler
  const handleQuizComplete = (passed: boolean, score: number) => {
    setProgress(prev => ({ ...prev, quizPassed: passed }));
    if (passed) {
      toast({
        title: "Quiz Passed!",
        description: "You're eligible for the 10M SENT Quiz Pool"
      });
      setActiveTab("claim");
    }
  };

  // Copy referral link
  const copyReferralLink = () => {
    const link = `${window.location.origin}/airdrop?ref=${walletAddress}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Copied!", description: "Share your referral link" });
  };

  // Calculate progress percentage
  const progressPercent = [
    progress.registered,
    progress.twitterVerified,
    progress.telegramVerified,
    progress.quizPassed
  ].filter(Boolean).length * 25;

  // airdropContract is imported from thirdwebClient

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-4">
            <Gift className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">SENT Token Airdrop</h1>
          <p className="text-muted-foreground">
            310 Million SENT tokens for the Africa Railways community
          </p>
        </div>

        {/* Countdown Timer */}
        {!airdropStarted ? (
          <Card className="mb-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50">
            <CardContent className="pt-6">
              <h2 className="text-lg text-center text-purple-300 mb-4 font-semibold">
                Airdrop Claims Start In
              </h2>
              <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="bg-gray-900/80 rounded-lg p-3 border border-purple-500/30">
                    <span className="text-2xl md:text-3xl font-bold text-white font-mono">
                      {timeLeft.days.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-purple-300 text-xs mt-1">Days</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-900/80 rounded-lg p-3 border border-purple-500/30">
                    <span className="text-2xl md:text-3xl font-bold text-white font-mono">
                      {timeLeft.hours.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-purple-300 text-xs mt-1">Hours</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-900/80 rounded-lg p-3 border border-purple-500/30">
                    <span className="text-2xl md:text-3xl font-bold text-white font-mono">
                      {timeLeft.minutes.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-purple-300 text-xs mt-1">Minutes</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-900/80 rounded-lg p-3 border border-purple-500/30">
                    <span className="text-2xl md:text-3xl font-bold text-white font-mono">
                      {timeLeft.seconds.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-purple-300 text-xs mt-1">Seconds</p>
                </div>
              </div>
              <p className="text-center text-gray-400 mt-4 text-sm">
                Friday, January 23rd, 2026 at 8:00 AM UTC
              </p>
              <p className="text-center text-purple-400 mt-2 text-xs">
                Complete tasks now to be ready when claims open!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/50">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <h2 className="text-xl font-bold text-green-400">Airdrop is LIVE!</h2>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <p className="text-center text-green-300 mt-2">
                Claim your 100 $SENT tokens now
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pool Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-xl font-bold">50M</div>
              <div className="text-xs text-muted-foreground">Referral Pool</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Twitter className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-xl font-bold">100M</div>
              <div className="text-xs text-muted-foreground">Social Tasks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <HelpCircle className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-xl font-bold">10M</div>
              <div className="text-xs text-muted-foreground">Quiz Pool</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Coins className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-xl font-bold">150M</div>
              <div className="text-xs text-muted-foreground">Worker Pool</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {progress.registered && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Progress</span>
                <span className="text-sm text-muted-foreground">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span className={progress.registered ? "text-green-600" : ""}>Register</span>
                <span className={progress.twitterVerified ? "text-green-600" : ""}>Twitter</span>
                <span className={progress.telegramVerified ? "text-green-600" : ""}>Telegram</span>
                <span className={progress.quizPassed ? "text-green-600" : ""}>Quiz</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="register">
              {progress.registered ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
              <span className="ml-1 hidden sm:inline">Register</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" disabled={!progress.registered}>
              {progress.twitterVerified && progress.telegramVerified ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <Circle className="h-4 w-4" />
              }
              <span className="ml-1 hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" disabled={!progress.twitterVerified || !progress.telegramVerified}>
              {progress.quizPassed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
              <span className="ml-1 hidden sm:inline">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="claim" disabled={!progress.quizPassed}>
              {progress.claimed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
              <span className="ml-1 hidden sm:inline">Claim</span>
            </TabsTrigger>
          </TabsList>

          {/* Register Tab */}
          <TabsContent value="register" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Register Your Wallet
                </CardTitle>
                <CardDescription>
                  Enter your Polygon wallet address to join the airdrop
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Connect Wallet Button */}
                <div className="flex justify-center mb-4">
                  <ConnectButton 
                    client={client}
                    chain={polygon}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or enter manually
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet">Polygon Wallet Address</Label>
                  <Input
                    id="wallet"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={registering || !walletAddress}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {registering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-4 w-4" />
                      Register for Airdrop
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-6">
            <div className="space-y-4">
              {/* Twitter Task */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${progress.twitterVerified ? 'bg-green-100' : 'bg-blue-100'}`}>
                        <Twitter className={`h-5 w-5 ${progress.twitterVerified ? 'text-green-600' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium">Follow @africoin_afc on Twitter</h3>
                        <p className="text-sm text-muted-foreground">+50 SENT</p>
                      </div>
                    </div>
                    {progress.twitterVerified ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleTwitterVerify} variant="outline" size="sm">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Follow
                        </Button>
                        <Button onClick={handleTwitterAlreadyFollowing} variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Already Following
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Telegram Task */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${progress.telegramVerified ? 'bg-green-100' : 'bg-blue-100'}`}>
                        <Send className={`h-5 w-5 ${progress.telegramVerified ? 'text-green-600' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium">Join @afrcsentinel on Telegram</h3>
                        <p className="text-sm text-muted-foreground">+50 SENT</p>
                      </div>
                    </div>
                    {progress.telegramVerified ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleTelegramVerify} variant="outline" size="sm">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Join
                        </Button>
                        <Button onClick={handleTelegramAlreadyJoined} variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Already Joined
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Referral Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-purple-100">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Refer Friends</h3>
                      <p className="text-sm text-muted-foreground">
                        +25 SENT per referral (3+ to qualify for 50M pool)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/airdrop?ref=${walletAddress.slice(0, 10)}...`}
                      className="font-mono text-sm"
                    />
                    <Button onClick={copyReferralLink} variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-3 text-sm">
                    Your referrals: <span className="font-bold">{progress.referralCount}</span>
                    {progress.referralCount >= 3 && (
                      <span className="ml-2 text-green-600">✓ Qualified for Referral Pool!</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Continue Button */}
              {progress.twitterVerified && progress.telegramVerified && (
                <Button 
                  onClick={() => setActiveTab("quiz")}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  Continue to Quiz
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="mt-6">
            <div className="flex justify-center">
              <AfricaRailwaysQuiz 
                walletAddress={walletAddress}
                onComplete={handleQuizComplete}
              />
            </div>
          </TabsContent>

          {/* Claim Tab */}
          <TabsContent value="claim" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Claim Your SENT Tokens
                </CardTitle>
                <CardDescription>
                  You've completed all tasks! Claim your tokens now.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {progress.claimed ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-600">Already Claimed!</h3>
                    <p className="text-muted-foreground mt-2">
                      {progress.totalAllocation} SENT was sent to your wallet
                    </p>
                  </div>
                ) : (
                  <ClaimButton />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Leaderboard */}
        <div className="mt-8">
          <ReferralLeaderboard limit={10} />
        </div>
      </div>
    </AppLayout>
  );
}
