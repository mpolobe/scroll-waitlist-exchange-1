/**
 * Airdrop Stats Dashboard
 * Real-time view of SENT token distribution to Africa Railways workers
 * 
 * Metrics:
 * - Total Passed: Workers with quiz_score >= 80
 * - Total Claimed: Workers who have claimed tokens
 * - Total SENT Distributed: Sum of claimed tokens (100 SENT each)
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Users, CheckCircle, Coins, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AirdropMetrics {
  totalRegistered: number;
  totalPassed: number;
  totalClaimed: number;
  totalSentDistributed: number;
  recentClaims: ClaimRecord[];
}

interface ClaimRecord {
  wallet_address: string;
  claimed_at: string;
  quiz_score: number;
}

export function AirdropStats() {
  const [metrics, setMetrics] = useState<AirdropMetrics>({
    totalRegistered: 0,
    totalPassed: 0,
    totalClaimed: 0,
    totalSentDistributed: 0,
    recentClaims: [],
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Get all records
      const { data: allRecords, error } = await supabase
        .from("airdrop_status")
        .select("wallet_address, quiz_score, claimed, claimed_at");

      if (error) {
        console.error("Error fetching airdrop stats:", error);
        return;
      }

      const records = allRecords || [];
      
      // Calculate metrics
      const totalRegistered = records.length;
      const totalPassed = records.filter(r => r.quiz_score >= 80).length;
      const totalClaimed = records.filter(r => r.claimed === true).length;
      const totalSentDistributed = totalClaimed * 100; // 100 SENT per claim

      // Get recent claims (last 10)
      const recentClaims = records
        .filter(r => r.claimed && r.claimed_at)
        .sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime())
        .slice(0, 10)
        .map(r => ({
          wallet_address: r.wallet_address,
          claimed_at: r.claimed_at,
          quiz_score: r.quiz_score,
        }));

      setMetrics({
        totalRegistered,
        totalPassed,
        totalClaimed,
        totalSentDistributed,
        recentClaims,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMetrics();

    // Set up real-time subscription
    const channel = supabase
      .channel("airdrop-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "airdrop_status",
        },
        (payload) => {
          console.log("Airdrop status changed:", payload);
          // Refetch metrics on any change
          fetchMetrics();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatWallet = (address: string) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const claimRate = metrics.totalPassed > 0 
    ? ((metrics.totalClaimed / metrics.totalPassed) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SENT Airdrop Dashboard</h2>
          <p className="text-sm text-gray-500">
            Real-time tracking of Africa Railways worker claims
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchMetrics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Registered
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalRegistered.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Workers in database</p>
          </CardContent>
        </Card>

        {/* Total Passed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Quiz Passed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {metrics.totalPassed.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Score ≥ 80%</p>
          </CardContent>
        </Card>

        {/* Total Claimed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Claimed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {metrics.totalClaimed.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">{claimRate}% claim rate</p>
          </CardContent>
        </Card>

        {/* Total SENT Distributed */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              SENT Distributed
            </CardTitle>
            <Coins className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {metrics.totalSentDistributed.toLocaleString()}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              ${(metrics.totalSentDistributed * 0.001).toFixed(2)} USD est.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Distribution Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Claimed: {metrics.totalClaimed.toLocaleString()} / 2,000 workers</span>
              <span>{((metrics.totalClaimed / 2000) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((metrics.totalClaimed / 2000) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>Target: 2,000 workers × 100 SENT = 200,000 SENT</span>
              <span>2,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Claims */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.recentClaims.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No claims yet</p>
          ) : (
            <div className="space-y-2">
              {metrics.recentClaims.map((claim, index) => (
                <div 
                  key={claim.wallet_address + index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-mono text-sm">{formatWallet(claim.wallet_address)}</p>
                      <p className="text-xs text-gray-500">{formatTime(claim.claimed_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+100 SENT</p>
                    <p className="text-xs text-gray-500">Score: {claim.quiz_score}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Info */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">SENT Token Contract</p>
              <a 
                href="https://polygonscan.com/token/0x65f6cEdBB6e023e7A91df61c26364FAc0fA2dd64"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-600 hover:underline"
              >
                0x65f6cEdBB6e023e7A91df61c26364FAc0fA2dd64
              </a>
            </div>
            <div>
              <p className="text-gray-500">Airdrop Contract</p>
              <a 
                href="https://polygonscan.com/address/0x71F7edd5bE9E509E68ef70216C59Df37484e0E23"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-600 hover:underline"
              >
                0x71F7edd5bE9E509E68ef70216C59Df37484e0E23
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
