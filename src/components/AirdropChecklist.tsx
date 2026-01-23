/**
 * Airdrop Portal Component
 * Shows task checklist - ClaimButton only active when eligibleAmount > 0
 */

import { useState, useEffect } from "react";
import { ClaimButton, useActiveAccount, ConnectButton } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Circle, 
  Twitter, 
  Send, 
  HelpCircle, 
  Users,
  Gift,
  Loader2,
  ExternalLink
} from "lucide-react";
import { 
  getAirdropStatus, 
  verifyTwitter, 
  verifyTelegram, 
  submitQuizScore,
  markAsClaimed,
  registerWallet
} from "@/services/airdropService";

// Task Item Component
function TaskItem({ 
  label, 
  completed, 
  icon,
  onClick,
  onAlreadyDone,
  alreadyDoneLabel = "Already Done"
}: { 
  label: string; 
  completed: boolean; 
  icon: React.ReactNode;
  onClick?: () => void;
  onAlreadyDone?: () => void;
  alreadyDoneLabel?: string;
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
      completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-gray-300"
    }`}>
      {completed ? (
        <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
      ) : (
        <Circle className="h-6 w-6 text-gray-300 shrink-0" />
      )}
      <div className="flex-1 flex items-center gap-2">
        {icon}
        <span className={`font-medium ${completed ? "text-green-800" : "text-gray-700"}`}>
          {label}
        </span>
      </div>
      {!completed && (
        <div className="flex gap-2">
          {onClick && (
            <Button size="sm" variant="outline" onClick={onClick}>
              Start
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
          {onAlreadyDone && (
            <Button size="sm" variant="ghost" onClick={onAlreadyDone} className="text-green-600 hover:text-green-700 hover:bg-green-50">
              <CheckCircle className="mr-1 h-3 w-3" />
              {alreadyDoneLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function AirdropChecklist() {
  const account = useActiveAccount();
  const [tasks, setTasks] = useState({ 
    twitter: false, 
    telegram: false, 
    quiz: false,
    referrals: false
  });
  const [eligibleAmount, setEligibleAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [referralCount, setReferralCount] = useState(0);

  // Fetch status from Supabase when wallet connects
  useEffect(() => {
    const fetchStatus = async () => {
      if (!account?.address) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let status = await getAirdropStatus(account.address);
        
        // Auto-register if not found
        if (!status) {
          await registerWallet(account.address);
          status = await getAirdropStatus(account.address);
        }

        if (status) {
          setTasks({
            twitter: status.twitter_verified,
            telegram: status.telegram_verified,
            quiz: status.quiz_score >= 80,
            referrals: status.referral_count >= 3
          });
          setQuizScore(status.quiz_score);
          setReferralCount(status.referral_count);
          setClaimed(status.claimed);
          setEligibleAmount(status.total_allocation);
        }
      } catch (err) {
        console.error("Failed to fetch status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [account?.address]);

  // Calculate allocation when tasks change
  useEffect(() => {
    let amount = 0;
    
    // Base: Twitter + Telegram = 100 SENT
    if (tasks.twitter && tasks.telegram) {
      amount += 100;
    }
    
    // Quiz bonus: 80%+ score = 50 SENT
    if (tasks.quiz) {
      amount += 50;
    }
    
    // Referral bonus: 3+ referrals = 25 SENT per referral
    if (tasks.referrals) {
      amount += referralCount * 25;
    }
    
    setEligibleAmount(amount);
  }, [tasks, referralCount]);

  // Task handlers
  const handleTwitter = async (alreadyFollowing = false) => {
    if (alreadyFollowing) {
      const confirmed = window.confirm(
        "By confirming, you declare that you are following @africoin_afc on Twitter.\n\nFalse claims may result in disqualification from the airdrop."
      );
      if (!confirmed) return;
    } else {
      window.open("https://x.com/africoin_afc", "_blank");
    }
    if (account?.address) {
      await verifyTwitter(account.address);
      setTasks(prev => ({ ...prev, twitter: true }));
    }
  };

  const handleTelegram = async (alreadyJoined = false) => {
    if (alreadyJoined) {
      const confirmed = window.confirm(
        "By confirming, you declare that you have joined @afrcsentinel on Telegram.\n\nFalse claims may result in disqualification from the airdrop."
      );
      if (!confirmed) return;
    } else {
      window.open("https://t.me/afrcsentinel", "_blank");
    }
    if (account?.address) {
      await verifyTelegram(account.address);
      setTasks(prev => ({ ...prev, telegram: true }));
    }
  };

  const startQuiz = () => {
    // Navigate to quiz page or open modal
    window.location.href = "/quiz";
  };

  // Quiz completion handler (call this when quiz is done)
  const completeQuiz = async (score: number) => {
    if (account?.address) {
      await submitQuizScore(account.address, score);
      setQuizScore(score);
      if (score >= 80) {
        setTasks(prev => ({ ...prev, quiz: true }));
      }
    }
  };

  // Claim success handler
  const handleClaimSuccess = async () => {
    if (account?.address) {
      await markAsClaimed(account.address);
    }
    setClaimed(true);
  };

  // Not connected
  if (!account) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Gift className="h-12 w-12 text-purple-600 mx-auto" />
            <h2 className="text-2xl font-bold">SENT Airdrop</h2>
            <p className="text-muted-foreground">Connect wallet to check eligibility</p>
            <ConnectButton
              client={client}
              chain={defineChain(137)}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading
  if (loading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Already claimed
  if (claimed) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold">SENT Claimed!</h2>
            <p className="text-muted-foreground">Tokens sent to your wallet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white shadow-xl rounded-lg">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold">SENT Airdrop Dashboard</h1>
      </div>

      {/* Task Checklist */}
      <div className="space-y-3 my-6">
        <TaskItem 
          label="Follow @africoin_afc on Twitter" 
          completed={tasks.twitter}
          icon={<Twitter className="h-5 w-5 text-blue-400" />}
          onClick={() => handleTwitter(false)}
          onAlreadyDone={() => handleTwitter(true)}
          alreadyDoneLabel="Already Following"
        />
        <TaskItem 
          label="Join @afrcsentinel on Telegram" 
          completed={tasks.telegram}
          icon={<Send className="h-5 w-5 text-blue-500" />}
          onClick={() => handleTelegram(false)}
          onAlreadyDone={() => handleTelegram(true)}
          alreadyDoneLabel="Already Joined"
        />
        <TaskItem 
          label={`Africa Railways Quiz ${quizScore > 0 ? `(${quizScore}%)` : ""}`}
          completed={tasks.quiz}
          icon={<HelpCircle className="h-5 w-5 text-yellow-500" />}
          onClick={startQuiz}
        />
        <TaskItem 
          label={`Refer 3+ Friends (${referralCount}/3)`}
          completed={tasks.referrals}
          icon={<Users className="h-5 w-5 text-purple-500" />}
        />
      </div>

      {/* Allocation Display */}
      {eligibleAmount > 0 && (
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-purple-700 font-medium">Your Allocation</p>
          <p className="text-4xl font-bold text-purple-600">{eligibleAmount.toLocaleString()} SENT</p>
        </div>
      )}

      {/* THE SMART CLAIM BUTTON - Only shows when eligibleAmount > 0 */}
      {eligibleAmount > 0 ? (
        <ClaimButton
          contractAddress="0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf"
          chain={defineChain(137)}
          client={client}
          claimParams={{
            type: "ERC20",
            quantity: eligibleAmount.toString(),
            to: account?.address,
          }}
          onTransactionConfirmed={handleClaimSuccess}
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
          Claim {eligibleAmount.toLocaleString()} $SENT
        </ClaimButton>
      ) : (
        <Button disabled className="w-full py-4 text-lg">
          Complete Tasks to Unlock Claim
        </Button>
      )}

      {/* Progress indicator */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        {Object.values(tasks).filter(Boolean).length}/4 tasks completed
      </p>
    </div>
  );
}

export default AirdropChecklist;
