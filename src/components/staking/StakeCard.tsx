import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stake } from '@/services/stakingService';
import { 
  Clock, 
  TrendingUp, 
  Unlock, 
  Lock,
  Gift,
  Loader2
} from 'lucide-react';

interface StakeCardProps {
  stake: Stake;
  formatAmount: (amount: bigint) => string;
  isUnlocked: boolean;
  timeRemaining: { days: number; hours: number; minutes: number };
  lockPeriodLabel: string;
  apyRate: number;
  onUnstake: () => void;
  onClaimRewards: () => void;
  isLoading: boolean;
}

export function StakeCard({
  stake,
  formatAmount,
  isUnlocked,
  timeRemaining,
  lockPeriodLabel,
  apyRate,
  onUnstake,
  onClaimRewards,
  isLoading,
}: StakeCardProps) {
  const stakedAmount = parseFloat(formatAmount(stake.amount));
  const claimedRewards = parseFloat(formatAmount(stake.rewardsClaimed));
  const startDate = new Date(stake.startTime * 1000).toLocaleDateString();
  const unlockDate = new Date(stake.unlockTime * 1000).toLocaleDateString();

  // Calculate progress percentage
  const totalDuration = stake.unlockTime - stake.startTime;
  const elapsed = Math.min(Date.now() / 1000 - stake.startTime, totalDuration);
  const progress = Math.min((elapsed / totalDuration) * 100, 100);

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${isUnlocked ? 'ring-1 ring-green-500/50' : ''}`}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              {isUnlocked ? (
                <Unlock className="w-5 h-5 text-green-500" />
              ) : (
                <Lock className="w-5 h-5 text-orange-500" />
              )}
              <span className="text-lg font-semibold text-white">
                {stakedAmount.toLocaleString()} wAFC
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-slate-700 text-gray-300 rounded">
                {lockPeriodLabel}
              </span>
              <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {apyRate}% APY
              </span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isUnlocked 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {isUnlocked ? 'Unlocked' : 'Locked'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Started: {startDate}</span>
            <span>Unlocks: {unlockDate}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                isUnlocked ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time Remaining */}
        {!isUnlocked && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-slate-900/50 rounded-lg">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m remaining
            </span>
          </div>
        )}

        {/* Rewards Info */}
        <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-400">Rewards Claimed</span>
          </div>
          <span className="text-sm font-medium text-green-400">
            {claimedRewards.toLocaleString()} wAFC
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClaimRewards}
            disabled={isLoading}
            className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/10"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Gift className="w-4 h-4 mr-1" />
                Claim
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onUnstake}
            disabled={isLoading}
            className={`flex-1 ${
              isUnlocked 
                ? 'border-green-500/50 text-green-400 hover:bg-green-500/10' 
                : 'border-red-500/50 text-red-400 hover:bg-red-500/10'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-1" />
                Unstake
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
