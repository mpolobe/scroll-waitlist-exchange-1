import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stake } from '@/services/stakingService';
import { TrendingUp, Gift, Clock, Loader2, Coins } from 'lucide-react';

interface RewardsCardProps {
  pendingRewards: string;
  totalClaimed: string;
  stakes: Stake[];
  formatAmount: (amount: bigint) => string;
  lockPeriodLabels: Record<number, string>;
  apyRates: Record<number, number>;
  onClaimAll: () => Promise<string>;
  onClaimSingle: (stakeIndex: number) => Promise<void>;
  isLoading: boolean;
}

export function RewardsCard({
  pendingRewards,
  totalClaimed,
  stakes,
  formatAmount,
  lockPeriodLabels,
  apyRates,
  onClaimAll,
  onClaimSingle,
  isLoading,
}: RewardsCardProps) {
  const hasPendingRewards = parseFloat(pendingRewards) > 0;

  return (
    <div className="space-y-6">
      {/* Rewards Summary */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Gift className="w-5 h-5" />
                <span className="text-sm font-medium">Total Pending Rewards</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {parseFloat(pendingRewards).toLocaleString()} wAFC
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Total claimed: {parseFloat(totalClaimed).toLocaleString()} wAFC
              </p>
            </div>
            <Button
              onClick={onClaimAll}
              disabled={isLoading || !hasPendingRewards}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Claim All
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* APY Rates */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-green-500" />
            APY Rates by Lock Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(apyRates).map(([period, rate]) => (
              <div
                key={period}
                className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-center"
              >
                <div className="flex items-center justify-center gap-1 text-gray-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{lockPeriodLabels[parseInt(period)]}</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{rate}%</p>
                <p className="text-xs text-gray-500">Annual</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Stake Rewards */}
      {stakes.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Coins className="w-5 h-5 text-orange-500" />
              Rewards by Stake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stakes.map((stake) => {
                const stakeAmount = parseFloat(formatAmount(stake.amount));
                const claimed = parseFloat(formatAmount(stake.rewardsClaimed));
                const apy = apyRates[stake.lockPeriod];
                
                return (
                  <div
                    key={stake.index}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {stakeAmount.toLocaleString()} wAFC
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                          {apy}% APY
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                        <span>{lockPeriodLabels[stake.lockPeriod]}</span>
                        <span>•</span>
                        <span>Claimed: {claimed.toLocaleString()} wAFC</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onClaimSingle(stake.index)}
                      disabled={isLoading}
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                    >
                      Claim
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How Rewards Work */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">How Rewards Work</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-400 space-y-3 text-sm">
          <p>
            <strong className="text-white">Accrual:</strong> Rewards accrue continuously based on your staked amount and lock period APY.
          </p>
          <p>
            <strong className="text-white">Claiming:</strong> You can claim rewards at any time without affecting your stake.
          </p>
          <p>
            <strong className="text-white">Compounding:</strong> Claimed rewards are sent to your wallet. Restake them to compound your earnings.
          </p>
          <p>
            <strong className="text-white">Source:</strong> Rewards come from the protocol's reward pool, funded by ecosystem allocation and early unstake penalties.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
