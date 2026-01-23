/**
 * Airdrop Tasks Component
 * Workers complete tasks to qualify for 310M SENT airdrop
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Twitter, 
  Send, 
  Share2, 
  Users, 
  Wallet, 
  HelpCircle,
  CheckCircle,
  Circle,
  ExternalLink,
  Gift
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ReactNode;
  action: string;
  link?: string;
  completed: boolean;
}

interface AirdropTasksProps {
  walletAddress?: string;
  onAllTasksComplete?: () => void;
}

export function AirdropTasks({ walletAddress, onAllTasksComplete }: AirdropTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "twitter_follow",
      title: "Follow on Twitter",
      description: "Follow @africoin_afc on Twitter/X",
      points: 20,
      icon: <Twitter className="h-5 w-5 text-blue-400" />,
      action: "Follow",
      link: "https://x.com/africoin_afc",
      completed: false,
    },
    {
      id: "telegram_join",
      title: "Join Telegram",
      description: "Join the Africoin Official Telegram group",
      points: 20,
      icon: <Send className="h-5 w-5 text-blue-500" />,
      action: "Join",
      link: "https://t.me/afrcsentinel",
      completed: false,
    },
    {
      id: "retweet",
      title: "Retweet Announcement",
      description: "Retweet the SENT airdrop announcement",
      points: 15,
      icon: <Share2 className="h-5 w-5 text-green-500" />,
      action: "Retweet",
      link: "https://x.com/africoin_afc",
      completed: false,
    },
    {
      id: "referral",
      title: "Share Referral Link",
      description: "Invite 3+ friends using your referral link",
      points: 25,
      icon: <Users className="h-5 w-5 text-purple-500" />,
      action: "Share",
      completed: false,
    },
    {
      id: "pol_balance",
      title: "Hold POL in Wallet",
      description: "Hold minimum 1 POL for gas fees",
      points: 10,
      icon: <Wallet className="h-5 w-5 text-orange-500" />,
      action: "Check",
      completed: false,
    },
    {
      id: "quiz",
      title: "Complete Quiz",
      description: "Answer questions about Africa Railways",
      points: 10,
      icon: <HelpCircle className="h-5 w-5 text-yellow-500" />,
      action: "Start Quiz",
      completed: false,
    },
  ]);

  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    if (walletAddress) {
      // Generate referral link
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/airdrop?ref=${walletAddress.slice(0, 10)}`);
      
      // Load saved task progress from localStorage
      const savedProgress = localStorage.getItem(`airdrop_tasks_${walletAddress}`);
      if (savedProgress) {
        const completed = JSON.parse(savedProgress);
        setTasks(prev => prev.map(task => ({
          ...task,
          completed: completed.includes(task.id)
        })));
      }
    }
  }, [walletAddress]);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
  const earnedPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
  const progress = (completedTasks / tasks.length) * 100;

  const handleTaskAction = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Open external link if available
    if (task.link) {
      window.open(task.link, "_blank");
    }

    // Special handling for referral
    if (taskId === "referral") {
      await navigator.clipboard.writeText(referralLink);
      alert("Referral link copied to clipboard!");
    }

    // Mark task as completed (in production, verify via API)
    markTaskComplete(taskId);
  };

  const markTaskComplete = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      );
      
      // Save progress
      if (walletAddress) {
        const completedIds = updated.filter(t => t.completed).map(t => t.id);
        localStorage.setItem(`airdrop_tasks_${walletAddress}`, JSON.stringify(completedIds));
      }

      // Check if all complete
      if (updated.every(t => t.completed)) {
        onAllTasksComplete?.();
      }

      return updated;
    });
  };

  const copyReferralLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-600" />
          Airdrop Tasks
        </CardTitle>
        <CardDescription>
          Complete tasks to qualify for 310M SENT airdrop
        </CardDescription>
        
        {/* Progress */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-sm">
            <span>{completedTasks}/{tasks.length} tasks</span>
            <span className="font-medium">{earnedPoints}/{totalPoints} points</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              task.completed 
                ? "bg-green-50 border-green-200" 
                : "bg-background border-border hover:bg-muted/50"
            }`}
          >
            {/* Icon */}
            <div className="shrink-0">
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                task.icon
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{task.title}</div>
              <div className="text-xs text-muted-foreground">{task.description}</div>
            </div>

            {/* Points & Action */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-purple-600">
                +{task.points}
              </span>
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTaskAction(task.id)}
                  className="h-7 text-xs"
                >
                  {task.action}
                  {task.link && <ExternalLink className="ml-1 h-3 w-3" />}
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Referral Link */}
        {walletAddress && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm font-medium text-purple-800 mb-2">
              Your Referral Link
            </div>
            <div className="flex gap-2">
              <code className="flex-1 text-xs bg-white p-2 rounded border truncate">
                {referralLink}
              </code>
              <Button size="sm" variant="outline" onClick={copyReferralLink}>
                Copy
              </Button>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Earn 25 points for each friend who joins (50M SENT Referral Pool)
            </p>
          </div>
        )}

        {/* Allocation Info */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            310M SENT Allocation
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Early Supporters</span>
              <span className="font-medium">50M</span>
            </div>
            <div className="flex justify-between">
              <span>Social Tasks</span>
              <span className="font-medium">100M</span>
            </div>
            <div className="flex justify-between">
              <span>Referrals</span>
              <span className="font-medium">50M</span>
            </div>
            <div className="flex justify-between">
              <span>Sentinels</span>
              <span className="font-medium">100M</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span>Quiz Winners (Top 100)</span>
              <span className="font-medium">10M</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AirdropTasks;
