import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLeaderboard, type LeaderboardEntry } from '@/services/referralService';
import { Trophy, Medal, Award, Users, CheckCircle, RefreshCw } from 'lucide-react';

// Truncate wallet address for display
function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Rank icons for top 3
function RankIcon({ rank }: { rank: number }) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
  }
}

interface ReferralLeaderboardProps {
  refreshInterval?: number; // Auto-refresh interval in ms (default: 30s)
  limit?: number; // Number of entries to show (default: 5)
}

export function ReferralLeaderboard({ 
  refreshInterval = 30000, 
  limit = 5 
}: ReferralLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const data = await getLeaderboard(limit);
      setLeaderboard(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchLeaderboard(true);
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh
    const interval = setInterval(() => fetchLeaderboard(false), refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, limit]);

  const totalReferrals = leaderboard.reduce((sum, entry) => sum + entry.referral_count, 0);
  const totalTasksCompleted = leaderboard.reduce((sum, entry) => sum + entry.task_completed_count, 0);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Sentinel Leaderboard
            </CardTitle>
            <CardDescription className="mt-1">
              Top 5 Sentinels - 310M SENT Airdrop
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        
        {/* Pool Stats */}
        <div className="flex gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{totalReferrals} referrals</span>
          </div>
          <div className="flex items-center gap-1 text-green-500">
            <CheckCircle className="h-3 w-3" />
            <span>{totalTasksCompleted} tasks done</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-5 h-5 bg-muted rounded" />
                <div className="flex-1 h-4 bg-muted rounded" />
                <div className="w-12 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No referrals yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.referrer_wallet}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  index === 0 
                    ? 'bg-yellow-500/10 border border-yellow-500/20' 
                    : index < 3 
                    ? 'bg-muted/50' 
                    : 'hover:bg-muted/30'
                }`}
              >
                <RankIcon rank={index + 1} />
                
                <div className="flex-1 min-w-0">
                  <code className="text-sm font-mono">
                    {truncateAddress(entry.referrer_wallet)}
                  </code>
                </div>
                
                <div className="flex items-center gap-2">
                  {entry.task_completed_count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-500" title="Completed Social Tasks">
                      <CheckCircle className="h-3 w-3" />
                      <span>{entry.task_completed_count}</span>
                    </div>
                  )}
                  <div className="text-sm font-semibold tabular-nums">
                    {entry.referral_count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pool Breakdown */}
        <div className="mt-4 pt-4 border-t border-border/40">
          <p className="text-xs font-medium text-muted-foreground mb-2">310M SENT Pool Breakdown</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="font-semibold">50M</div>
              <div className="text-muted-foreground">Referrals</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="font-semibold">100M</div>
              <div className="text-muted-foreground">Social Tasks</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="font-semibold">160M</div>
              <div className="text-muted-foreground">Workers</div>
            </div>
          </div>
        </div>
        
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default ReferralLeaderboard;
