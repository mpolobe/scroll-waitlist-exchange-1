import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, Shield, ExternalLink, Copy, CheckCircle,
  Coins, Lock, Droplets, AlertCircle
} from 'lucide-react';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import { toast } from 'sonner';
import { SENT_IDO_CONFIG } from '@/services/sentIdoService';
import { SENT_TOKEN } from '@/data/tokenConfig';

export default function SentIdo() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <MarketingNav />

      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-yellow-500/20 text-yellow-400 border-yellow-500">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse" />
            {SENT_IDO_CONFIG.status} - {SENT_IDO_CONFIG.saleType}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🛡️ SENTINEL Token Fairlaunch
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Governance token for the Africa Railways Sentinel safety network.
            Live on PinkSale - Polygon Network.
          </p>

          {/* PinkSale CTA */}
          <a
            href={SENT_IDO_CONFIG.launchpadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg px-8 py-6"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Participate on PinkSale
            </Button>
          </a>

          {/* Network Notice */}
          <div className="inline-block bg-purple-500/20 border border-purple-500 rounded-lg px-6 py-3 mt-8">
            <p className="text-purple-300 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {SENT_IDO_CONFIG.whitelistOnly ? 'Whitelist Only' : 'Public Sale'} - Polygon wallet required (MetaMask or compatible)
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* Sale Status Card */}
        <Card className="mb-8 bg-gradient-to-r from-pink-900/50 to-purple-900/50 border-pink-500">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Presale Status</h3>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  {SENT_IDO_CONFIG.status}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Soft Cap</div>
                <div className="text-3xl font-bold text-cyan-400">
                  {formatNumber(SENT_IDO_CONFIG.softCap)} POL
                </div>
                <div className="text-sm text-gray-500">~${formatNumber(SENT_IDO_CONFIG.softCapUsd)} USD</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Max Buy</div>
                <div className="text-3xl font-bold text-yellow-400">
                  {formatNumber(SENT_IDO_CONFIG.maxBuyPol)} POL
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Addresses */}
        <Card className="mb-8 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-green-400" />
              Contract Addresses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Token Address</span>
                <Badge variant="outline" className="text-red-400 border-red-400 text-xs">
                  Do NOT send POL here
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-cyan-400 font-mono break-all">
                  {SENT_IDO_CONFIG.tokenAddress}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(SENT_IDO_CONFIG.tokenAddress, 'Token address')}
                >
                  {copied === 'Token address' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Pool Address (PinkSale)</span>
                <Badge variant="outline" className="text-red-400 border-red-400 text-xs">
                  Do NOT send POL here
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-purple-400 font-mono break-all">
                  {SENT_IDO_CONFIG.poolAddress}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(SENT_IDO_CONFIG.poolAddress, 'Pool address')}
                >
                  {copied === 'Pool address' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <a
                href={`https://polygonscan.com/token/${SENT_IDO_CONFIG.tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full">
                  View Token on PolygonScan <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <a
                href={SENT_IDO_CONFIG.launchpadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full bg-pink-500/10 border-pink-500 text-pink-400 hover:bg-pink-500/20">
                  View on PinkSale <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Token Info Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Coins className="w-5 h-5 text-yellow-400" />
                Token Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Name</div>
                  <div className="text-lg font-bold text-white">{SENT_TOKEN.name}</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Symbol</div>
                  <div className="text-lg font-bold text-cyan-400">{SENT_TOKEN.symbol}</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Decimals</div>
                  <div className="text-lg font-bold text-white">{SENT_TOKEN.decimals}</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Network</div>
                  <div className="text-lg font-bold text-purple-400">Polygon</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg col-span-2">
                  <div className="text-xs text-gray-500 uppercase">Total Supply</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {formatNumber(SENT_IDO_CONFIG.totalSupply)} SENT
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tokens for Presale</span>
                  <span className="text-white font-semibold">
                    {formatNumber(SENT_IDO_CONFIG.idoAllocation)} SENT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tokens for Liquidity</span>
                  <span className="text-white font-semibold">
                    {formatNumber(SENT_IDO_CONFIG.liquidityAllocation)} SENT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Initial Market Cap</span>
                  <span className="text-green-400 font-semibold">
                    ${formatNumber(SENT_IDO_CONFIG.initialMarketCap)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listing Details Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Droplets className="w-5 h-5 text-blue-400" />
                Listing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Launchpad</div>
                  <div className="text-lg font-bold text-pink-400">{SENT_IDO_CONFIG.launchpad}</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Listing DEX</div>
                  <div className="text-lg font-bold text-blue-400">{SENT_IDO_CONFIG.listingDex}</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Liquidity %</div>
                  <div className="text-lg font-bold text-green-400">{SENT_IDO_CONFIG.liquidityPercent}%</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Sale Type</div>
                  <div className="text-lg font-bold text-yellow-400">{SENT_IDO_CONFIG.saleType}</div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-green-400">Liquidity Lock</span>
                </div>
                <p className="text-gray-300">
                  Liquidity will be locked for <span className="text-white font-bold">{SENT_IDO_CONFIG.liquidityLockDays} days</span> after pool ends
                </p>
              </div>

              <Separator className="bg-gray-700" />

              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Sale Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Start Time:</span>
                    <span className="text-yellow-400">
                      {SENT_IDO_CONFIG.startDate ? new Date(SENT_IDO_CONFIG.startDate).toLocaleString() : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">End Time:</span>
                    <span className="text-yellow-400">
                      {SENT_IDO_CONFIG.endDate ? new Date(SENT_IDO_CONFIG.endDate).toLocaleString() : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Participate */}
        <Card className="mt-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Wallet className="w-5 h-5 text-purple-400" />
              How to Participate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Get POL', desc: 'Ensure you have POL tokens in your Polygon wallet' },
                { step: '2', title: 'Connect Wallet', desc: 'Visit PinkSale and connect your MetaMask or compatible wallet' },
                { step: '3', title: 'Join Whitelist', desc: 'Complete whitelist requirements if sale is whitelist-only' },
                { step: '4', title: 'Contribute', desc: 'Enter your contribution amount (max 10,000 POL) and confirm' },
              ].map((item) => (
                <div key={item.step} className="text-center p-4 bg-gray-900/50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">{item.step}</span>
                  </div>
                  <div className="font-semibold text-white mb-1">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <a
                href={SENT_IDO_CONFIG.launchpadUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Go to PinkSale Fairlaunch
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Token Utilities */}
        <Card className="mt-8 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-green-400" />
              SENTINEL Token Utilities
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
