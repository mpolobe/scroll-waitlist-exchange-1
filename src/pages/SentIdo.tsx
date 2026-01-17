import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, Shield, TrendingUp, Users, Clock, 
  AlertCircle, CheckCircle, ExternalLink, Loader2,
  Award, Lock, Coins
} from 'lucide-react';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  connectPolygonWallet,
  isOnPolygon,
  switchToPolygon,
  getIdoStats,
  calculateTokens,
  participateInIdo,
  SENT_IDO_CONFIG,
  type IdoStats,
} from '@/services/sentIdoService';
import { SENT_TOKEN, formatTokenAmount } from '@/data/tokenConfig';

export default function SentIdo() {
  const { user } = useAuth();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [idoStats, setIdoStats] = useState<IdoStats | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Load IDO stats
  useEffect(() => {
    loadIdoStats();
    const interval = setInterval(loadIdoStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const endDate = new Date(SENT_IDO_CONFIG.endDate).getTime();
      const now = Date.now();
      const distance = endDate - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadIdoStats = async () => {
    const stats = await getIdoStats();
    setIdoStats(stats);
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const result = await connectPolygonWallet();
      if (result.success && result.address) {
        setWalletConnected(true);
        setWalletAddress(result.address);
        toast.success('Connected to Polygon wallet');
      } else {
        toast.error(result.error || 'Failed to connect wallet');
      }
    } catch (error: any) {
      toast.error(error.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleParticipate = async () => {
    if (!walletConnected || !walletAddress) {
      toast.error('Please connect your Polygon wallet first');
      return;
    }

    if (!user) {
      toast.error('Please log in to participate');
      return;
    }

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount < SENT_IDO_CONFIG.minBuy || amount > SENT_IDO_CONFIG.maxBuy) {
      toast.error(`Please enter an amount between $${SENT_IDO_CONFIG.minBuy} and $${SENT_IDO_CONFIG.maxBuy}`);
      return;
    }

    // Check network
    if (!(await isOnPolygon())) {
      const switchResult = await switchToPolygon();
      if (!switchResult.success) {
        toast.error(switchResult.error || 'Please switch to Polygon network');
        return;
      }
    }

    setIsParticipating(true);
    try {
      const result = await participateInIdo(user.id, walletAddress, amount);
      if (result.success && result.participation) {
        toast.success(`Successfully participated! You will receive ${formatTokenAmount(result.participation.tokensAllocated, SENT_TOKEN)}`);
        setContributionAmount('');
        loadIdoStats();
      } else {
        toast.error(result.error || 'Participation failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Participation failed');
    } finally {
      setIsParticipating(false);
    }
  };

  const tokenCalculation = contributionAmount ? calculateTokens(parseFloat(contributionAmount) || 0) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <MarketingNav />

      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            SENT IDO - Polygon Network
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🛡️ Sentinel Token IDO
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Governance token for the Africa Railways Sentinel safety network.
            Connect your Polygon wallet to participate.
          </p>

          {/* Network Notice */}
          <div className="inline-block bg-purple-500/20 border border-purple-500 rounded-lg px-6 py-3 mb-8">
            <p className="text-purple-300 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Polygon wallet required (MetaMask or compatible). We do not create wallets for you.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* Countdown */}
        <Card className="mb-8 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500">
          <CardContent className="py-8">
            <h3 className="text-center text-purple-300 mb-6">⏰ Time Remaining Until IDO Ends</h3>
            <div className="flex justify-center gap-4 md:gap-8">
              {[
                { value: countdown.days, label: 'Days' },
                { value: countdown.hours, label: 'Hours' },
                { value: countdown.minutes, label: 'Minutes' },
                { value: countdown.seconds, label: 'Seconds' },
              ].map((item) => (
                <div key={item.label} className="text-center bg-gray-900/50 rounded-lg p-4 min-w-[80px]">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-400">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Section */}
        {idoStats && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-yellow-400">Sale Progress</CardTitle>
                <span className="text-3xl font-bold text-cyan-400">
                  {idoStats.percentComplete.toFixed(1)}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={idoStats.percentComplete} className="h-4 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">
                    ${idoStats.totalRaised.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Raised</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    ${SENT_IDO_CONFIG.hardCap.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Hard Cap</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-400">
                    {(idoStats.tokensAllocated / 1e9).toFixed(2)}B
                  </div>
                  <div className="text-sm text-gray-400">Tokens Allocated</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {idoStats.participants.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Participants</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Participation Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet className="w-5 h-5 text-purple-400" />
                Participate in SENT IDO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Connection */}
              {!walletConnected ? (
                <div className="text-center py-8">
                  <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">
                    Connect your Polygon wallet to participate
                  </p>
                  <Button
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Polygon Wallet
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Connected Status */}
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400">Connected to Polygon</span>
                    </div>
                    <span className="font-mono text-sm text-gray-400">
                      {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                    </span>
                  </div>

                  {/* Contribution Input */}
                  <div>
                    <Label className="text-gray-300">Contribution Amount (USD)</Label>
                    <Input
                      type="number"
                      min={SENT_IDO_CONFIG.minBuy}
                      max={SENT_IDO_CONFIG.maxBuy}
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder={`$${SENT_IDO_CONFIG.minBuy} - $${SENT_IDO_CONFIG.maxBuy}`}
                      className="mt-2 bg-gray-900 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Min: ${SENT_IDO_CONFIG.minBuy} | Max: ${SENT_IDO_CONFIG.maxBuy}
                    </p>
                  </div>

                  {/* Token Calculation */}
                  {tokenCalculation && parseFloat(contributionAmount) >= SENT_IDO_CONFIG.minBuy && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Base Tokens:</span>
                        <span className="text-white">{tokenCalculation.baseTokens.toLocaleString()} SENT</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Bonus ({tokenCalculation.bonusPercent}%):</span>
                        <span className="text-green-400">+{tokenCalculation.bonusTokens.toLocaleString()} SENT</span>
                      </div>
                      <Separator className="bg-gray-700" />
                      <div className="flex justify-between font-bold">
                        <span className="text-gray-300">Total Tokens:</span>
                        <span className="text-yellow-400">{tokenCalculation.totalTokens.toLocaleString()} SENT</span>
                      </div>
                      <Badge className="w-full justify-center mt-2" variant="outline">
                        {tokenCalculation.tier.toUpperCase()} TIER
                      </Badge>
                    </div>
                  )}

                  <Button
                    onClick={handleParticipate}
                    disabled={isParticipating || !contributionAmount}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold"
                  >
                    {isParticipating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Participate Now'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* IDO Details Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-green-400" />
                SENT Token Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Token Price</div>
                  <div className="text-lg font-bold text-yellow-400">${SENT_IDO_CONFIG.idoPrice}</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Total Supply</div>
                  <div className="text-lg font-bold text-white">5B SENT</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">IDO Allocation</div>
                  <div className="text-lg font-bold text-cyan-400">1B (20%)</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Network</div>
                  <div className="text-lg font-bold text-purple-400">Polygon</div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Vesting Schedule
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">TGE Unlock:</span>
                    <span className="text-white">{SENT_IDO_CONFIG.vestingSchedule.tgeUnlock}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cliff Period:</span>
                    <span className="text-white">{SENT_IDO_CONFIG.vestingSchedule.cliffMonths} month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vesting Period:</span>
                    <span className="text-white">{SENT_IDO_CONFIG.vestingSchedule.vestingMonths} months</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Tier Bonuses
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bronze ($100-$500):</span>
                    <span className="text-green-400">+5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Silver ($500-$2,000):</span>
                    <span className="text-green-400">+10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gold ($2,000-$5,000):</span>
                    <span className="text-green-400">+15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platinum ($5,000):</span>
                    <span className="text-green-400">+20%</span>
                  </div>
                </div>
              </div>

              <a
                href="https://polygonscan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 text-sm mt-4"
              >
                View on PolygonScan <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Token Utilities */}
        <Card className="mt-8 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Coins className="w-5 h-5 text-yellow-400" />
              SENT Token Utilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { icon: '🗳️', title: 'Governance', desc: 'Vote on protocol decisions' },
                { icon: '🔒', title: 'Staking', desc: 'Stake for network rewards' },
                { icon: '💰', title: 'Fee Sharing', desc: 'Earn from network fees' },
                { icon: '⚡', title: 'Priority Access', desc: 'Early feature access' },
                { icon: '🛡️', title: 'Safety Rewards', desc: 'Validate safety reports' },
              ].map((item) => (
                <div key={item.title} className="text-center p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <MarketingFooter />
    </div>
  );
}
