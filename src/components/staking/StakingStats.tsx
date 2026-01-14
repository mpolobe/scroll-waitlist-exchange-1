import { Card, CardContent } from '@/components/ui/card';
import { StakingStats as StakingStatsType } from '@/services/stakingService';
import { Coins, TrendingUp, Wallet, Lock, Users, Flame } from 'lucide-react';

interface StakingStatsProps {
  totalStaked: string;
  pendingRewards: string;
  availableBalance: string;
  activeStakes: number;
  globalStats: StakingStatsType | null;
  formatAmount: (amount: bigint) => string;
}

export function StakingStats({
  totalStaked,
  pendingRewards,
  availableBalance,
  activeStakes,
  globalStats,
  formatAmount,
}: StakingStatsProps) {
  const stats = [
    {
      label: 'Your Staked',
      value: `${parseFloat(totalStaked).toLocaleString()} wAFC`,
      icon: Lock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Pending Rewards',
      value: `${parseFloat(pendingRewards).toLocaleString()} wAFC`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Available Balance',
      value: `${parseFloat(availableBalance).toLocaleString()} wAFC`,
      icon: Wallet,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Active Stakes',
      value: activeStakes.toString(),
      icon: Coins,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const globalStatsData = globalStats ? [
    {
      label: 'Total Value Locked',
      value: `${parseFloat(formatAmount(globalStats.totalStaked)).toLocaleString()} wAFC`,
      icon: Users,
      color: 'text-cyan-500',
    },
    {
      label: 'Total Rewards Paid',
      value: `${parseFloat(formatAmount(globalStats.totalRewardsDistributed)).toLocaleString()} wAFC`,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      label: 'Penalties Collected',
      value: `${parseFloat(formatAmount(globalStats.totalPenaltiesCollected)).toLocaleString()} wAFC`,
      icon: Flame,
      color: 'text-red-500',
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-lg font-semibold text-white mt-0.5">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Stats */}
      {globalStats && (
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Protocol Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              {globalStatsData.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs text-gray-500">{stat.label}</span>
                  </div>
                  <p className="text-sm font-medium text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
