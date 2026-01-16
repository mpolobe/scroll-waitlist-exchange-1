import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { useAuth } from '@/contexts/AuthContext';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import { StakingStats } from '@/components/staking/StakingStats';
import { StakeCard } from '@/components/staking/StakeCard';
import { StakeModal } from '@/components/staking/StakeModal';
import { UnstakeModal } from '@/components/staking/UnstakeModal';
import { RewardsCard } from '@/components/staking/RewardsCard';
import { RailwayProgress } from '@/components/staking/RailwayProgress';
import { useStaking } from '@/hooks/useStaking';
import { Stake } from '@/services/stakingService';
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  Wallet, 
  RefreshCw,
  Train,
  MapPin,
  Loader2,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';

export default function Staking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    address, 
    isConnected: walletConnected, 
    isLoading: walletLoading,
    suiBalance,
    afcBalance,
    refreshBalance 
  } = useSmartWallet();
  
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [unstakeModalOpen, setUnstakeModalOpen] = useState(false);
  const [selectedStake, setSelectedStake] = useState<Stake | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const {
    isConnected,
    isLoading,
    error,
    userData,
    globalStats,
    projectFunding,
    refreshData,
    stake,
    unstake,
    claimRewards,
    claimAllRewards,
    formatAmount,
    isStakeUnlocked,
    getTimeRemaining,
    calculatePenalty,
    lockPeriods,
    lockPeriodLabels,
    apyRates,
  } = useStaking(address || undefined);

  useEffect(() => {
    if (!user) {
      navigate('/signup?tab=login');
    }
  }, [user, navigate]);

  const handleStake = async (amount: string, lockPeriod: number) => {
    try {
      await stake(amount, lockPeriod);
      setStakeModalOpen(false);
    } catch (err) {
      console.error('Stake failed:', err);
    }
  };

  const handleUnstake = async () => {
    if (!selectedStake) return;
    try {
      await unstake(selectedStake.index);
      setUnstakeModalOpen(false);
      setSelectedStake(null);
    } catch (err) {
      console.error('Unstake failed:', err);
    }
  };

  const handleClaimRewards = async (stakeIndex: number) => {
    try {
      await claimRewards(stakeIndex);
    } catch (err) {
      console.error('Claim failed:', err);
    }
  };

  const openUnstakeModal = (stake: Stake) => {
    setSelectedStake(stake);
    setUnstakeModalOpen(true);
  };

  if (!user) return null;

  const activeStakes = userData?.stakes.filter(s => s.active) || [];
  const totalStakedFormatted = userData ? formatAmount(userData.totalStaked) : '0';
  const pendingRewardsFormatted = userData ? formatAmount(userData.pendingRewards) : '0';
  const balanceFormatted = userData ? formatAmount(userData.balance) : '0';

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  // Show wallet connection if not connected (user not logged in)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
        <MarketingNav />
        
        <div className="max-w-xl mx-auto px-4 py-24">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
              <Coins className="w-8 h-8 text-orange-500" />
              AFC Staking
            </h1>
            <p className="text-gray-400 mt-2">
              Sign in to start staking and earn rewards
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <Wallet className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">
                Sign in with Google, Email, or Phone to automatically create your SUI wallet
              </p>
              <Button 
                onClick={() => navigate('/signup')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-2xl font-bold text-orange-400">20%</p>
              <p className="text-sm text-gray-400">Max APY</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-2xl font-bold text-orange-400">$2.5M</p>
              <p className="text-sm text-gray-400">Total Staked</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-2xl font-bold text-orange-400">1,234</p>
              <p className="text-sm text-gray-400">Stakers</p>
            </div>
          </div>
        </div>

        <MarketingFooter />
      </div>
    );
  }

  // Show loading state while wallet is initializing
  if (walletLoading && !walletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
        <MarketingNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Initializing your SUI wallet...</p>
            <p className="text-gray-400 text-sm mt-2">This only takes a moment</p>
          </div>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
      <MarketingNav />
      
      <div className="max-w-7xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Coins className="w-8 h-8 text-orange-500" />
              AFC Staking
            </h1>
            <p className="text-gray-400 mt-1">
              Stake AFC to earn rewards and fund African railway infrastructure
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => { refreshData(); refreshBalance(); }}
            disabled={isLoading || walletLoading}
            className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading || walletLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Wallet Info Card */}
        {address && (
          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-300 font-medium">SUI Wallet (Mainnet)</p>
                    <div className="flex items-center gap-2">
                      <code className="text-white font-mono text-sm">{truncateAddress(address)}</code>
                      <button 
                        onClick={copyAddress}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a 
                        href={`https://suiscan.xyz/mainnet/account/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">SUI Balance</p>
                    <p className="text-xl font-bold text-white">{suiBalance} SUI</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">AFC Balance</p>
                    <p className="text-xl font-bold text-orange-400">{afcBalance} AFC</p>
                  </div>
                </div>
              </div>
              {parseFloat(afcBalance) === 0 && (
                <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-sm text-orange-300">
                    No AFC tokens yet? <a 
                      href="https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-orange-200"
                    >
                      Get AFC on MovePump →
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <StakingStats
          totalStaked={totalStakedFormatted}
          pendingRewards={pendingRewardsFormatted}
          availableBalance={balanceFormatted}
          activeStakes={activeStakes.length}
          globalStats={globalStats}
          formatAmount={formatAmount}
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
              <Wallet className="w-4 h-4 mr-2" />
              My Stakes
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="railway" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
              <Train className="w-4 h-4 mr-2" />
              Railway Progress
            </TabsTrigger>
          </TabsList>

          {/* My Stakes Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6">
              {/* Stake Action Card */}
              <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">Start Earning</h3>
                      <p className="text-gray-400 mt-1">
                        Stake your wAFC tokens to earn up to 20% APY
                      </p>
                    </div>
                    <Button 
                      onClick={() => setStakeModalOpen(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={!walletConnected}
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      Stake wAFC
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Stakes */}
              {isLoading && activeStakes.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-12 text-center">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading your stakes...</p>
                  </CardContent>
                </Card>
              ) : activeStakes.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-12 text-center">
                    <Coins className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Active Stakes</h3>
                    <p className="text-gray-400 mb-4">
                      Start staking to earn rewards and support railway development
                    </p>
                    <Button 
                      onClick={() => setStakeModalOpen(true)}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Stake Now
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {activeStakes.map((stake) => (
                    <StakeCard
                      key={stake.index}
                      stake={stake}
                      formatAmount={formatAmount}
                      isUnlocked={isStakeUnlocked(stake)}
                      timeRemaining={getTimeRemaining(stake)}
                      lockPeriodLabel={lockPeriodLabels[stake.lockPeriod]}
                      apyRate={apyRates[stake.lockPeriod]}
                      onUnstake={() => openUnstakeModal(stake)}
                      onClaimRewards={() => handleClaimRewards(stake.index)}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="mt-6">
            <RewardsCard
              pendingRewards={pendingRewardsFormatted}
              totalClaimed={userData ? formatAmount(
                userData.stakes.reduce((acc, s) => acc + s.rewardsClaimed, BigInt(0))
              ) : '0'}
              stakes={activeStakes}
              formatAmount={formatAmount}
              lockPeriodLabels={lockPeriodLabels}
              apyRates={apyRates}
              onClaimAll={claimAllRewards}
              onClaimSingle={handleClaimRewards}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Railway Progress Tab */}
          <TabsContent value="railway" className="mt-6">
            <RailwayProgress
              projectFunding={projectFunding}
              formatAmount={formatAmount}
              globalStats={globalStats}
            />
          </TabsContent>
        </Tabs>
      </div>

      <MarketingFooter />

      {/* Modals */}
      <StakeModal
        open={stakeModalOpen}
        onClose={() => setStakeModalOpen(false)}
        onStake={handleStake}
        availableBalance={balanceFormatted}
        lockPeriods={lockPeriods}
        lockPeriodLabels={lockPeriodLabels}
        apyRates={apyRates}
        isLoading={isLoading}
      />

      <UnstakeModal
        open={unstakeModalOpen}
        onClose={() => {
          setUnstakeModalOpen(false);
          setSelectedStake(null);
        }}
        onUnstake={handleUnstake}
        stake={selectedStake}
        formatAmount={formatAmount}
        isUnlocked={selectedStake ? isStakeUnlocked(selectedStake) : false}
        penalty={selectedStake ? formatAmount(calculatePenalty(selectedStake)) : '0'}
        timeRemaining={selectedStake ? getTimeRemaining(selectedStake) : { days: 0, hours: 0, minutes: 0 }}
        isLoading={isLoading}
      />
    </div>
  );
}
