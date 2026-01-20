import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Megaphone, Users, TrendingUp, Shield, Star, Rocket, 
  CheckCircle, ExternalLink, Copy, Download, Share2,
  Twitter, Send, Youtube, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketingNav from '@/components/MarketingNav';

const promotionalAssets = [
  {
    title: 'SENT Token Banner - Twitter',
    description: '1500x500 banner for Twitter/X header',
    type: 'image',
    url: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp'
  },
  {
    title: 'AFC Logo Pack',
    description: 'High-res logos in PNG, SVG, and WebP',
    type: 'zip',
    url: '#'
  },
  {
    title: 'Infographic - Ecosystem Overview',
    description: 'Visual guide to the Africa Railways ecosystem',
    type: 'image',
    url: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285110803_c14d926f.webp'
  }
];

const tweetTemplates = [
  {
    title: 'IDO Announcement',
    content: `🚂 $SENT Token IDO is LIVE on @paboratory! 

🌍 Building Africa's railway safety infrastructure
✅ Audited Contract
✅ Locked Liquidity  
✅ Real Utility - 2,000+ track workers

Join now: https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08

#SENT #PinkSale #Polygon #Crypto`
  },
  {
    title: 'Project Overview',
    content: `🌍 Africa Railways is building the digital backbone of African infrastructure

🔹 $AFC - Payment token on Sui
🔹 $SENT - Governance token on Polygon  
🔹 Real utility with railway integration

Website: https://africarailways.com

#AfricaRailways #Crypto #DeFi #RWA`
  },
  {
    title: 'Why SENT',
    content: `Why I'm bullish on $SENT:

1️⃣ Real utility - 2,000+ railway workers
2️⃣ Proof-of-Safety consensus
3️⃣ Audited & verified on PinkSale
4️⃣ Low market cap gem
5️⃣ Strong roadmap through 2026

DYOR: https://scroll-waitlist-exchange-1-nnjr.vercel.app/reviews/sent-token-sentinel-network

#SENT #CryptoGems`
  }
];

const affiliateLinks = {
  pinksale: 'https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08',
  website: 'https://africarailways.com',
  telegram: 'https://t.me/Africoin_Official',
  twitter: 'https://x.com/africoin_afc',
  reviews: 'https://scroll-waitlist-exchange-1-nnjr.vercel.app/reviews'
};

export default function SocialHandles() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-900 via-orange-900 to-red-900 text-white pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/20 text-white mb-4">Promoter Hub</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Become a Top <span className="text-orange-400">Crypto Promoter</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Access marketing materials, promotional content, and affiliate tools to help spread 
              the word about Africa Railways and earn rewards.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href={affiliateLinks.telegram} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
                  <Send className="w-4 h-4 mr-2" /> Join Telegram
                </Button>
              </a>
              <a href={affiliateLinks.twitter} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Twitter className="w-4 h-4 mr-2" /> Follow Twitter
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">25K+</p>
              <p className="text-sm text-gray-500">Community Members</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Megaphone className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">150+</p>
              <p className="text-sm text-gray-500">Active Promoters</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">$50K+</p>
              <p className="text-sm text-gray-500">Rewards Distributed</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">4.8/5</p>
              <p className="text-sm text-gray-500">Promoter Rating</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="content" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Ready-to-Use Tweet Templates</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tweetTemplates.map((template, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-100 rounded-lg p-4 mb-4 text-sm whitespace-pre-wrap">
                        {template.content}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(template.content, index)}
                        >
                          {copiedIndex === index ? (
                            <><CheckCircle className="w-4 h-4 mr-1" /> Copied</>
                          ) : (
                            <><Copy className="w-4 h-4 mr-1" /> Copy</>
                          )}
                        </Button>
                        <a 
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(template.content)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                            <Twitter className="w-4 h-4 mr-1" /> Tweet
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Key Links to Share</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(affiliateLinks).map(([key, url]) => (
                  <Card key={key}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{url}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(url, Object.keys(affiliateLinks).indexOf(key) + 100)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Promotional Assets</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {promotionalAssets.map((asset, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <img 
                        src={asset.url} 
                        alt={asset.title}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                      <h3 className="font-semibold mb-1">{asset.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{asset.description}</p>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" /> Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Brand Guidelines</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-4">Colors</h3>
                      <div className="flex gap-4">
                        <div>
                          <div className="w-16 h-16 rounded-lg bg-orange-500 mb-2"></div>
                          <p className="text-sm">#F97316</p>
                        </div>
                        <div>
                          <div className="w-16 h-16 rounded-lg bg-purple-600 mb-2"></div>
                          <p className="text-sm">#9333EA</p>
                        </div>
                        <div>
                          <div className="w-16 h-16 rounded-lg bg-gray-900 mb-2"></div>
                          <p className="text-sm">#111827</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-4">Hashtags</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge>#AfricaRailways</Badge>
                        <Badge>#SENT</Badge>
                        <Badge>#AFC</Badge>
                        <Badge>#PinkSale</Badge>
                        <Badge>#Polygon</Badge>
                        <Badge>#Sui</Badge>
                        <Badge>#CryptoAfrica</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Promotion Strategy Guide</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Twitter className="w-5 h-5 text-blue-500" /> Twitter/X Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Post 3-5 times daily during peak hours (9am, 12pm, 6pm UTC)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Engage with crypto influencers and quote tweet their content</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Use relevant hashtags: #Crypto #DeFi #PinkSale #Polygon</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Share project updates, milestones, and community wins</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="w-5 h-5 text-blue-500" /> Telegram Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Share in relevant crypto groups (with permission)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Create engaging discussions about African crypto</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Answer questions and provide helpful information</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Share IDO updates and countdown reminders</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-red-500" /> YouTube Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Create project review videos with honest analysis</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Tutorial videos: How to buy SENT on PinkSale</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Market analysis including Africa Railways ecosystem</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>AMA recordings and community highlights</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-purple-500" /> Discord Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Join crypto Discord servers and participate actively</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Share in #shill or #promotion channels only</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Build reputation before promoting</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <p>Provide value first, promote second</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Promoter Rewards Program</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-orange-200">
                  <CardHeader>
                    <Badge className="w-fit bg-orange-100 text-orange-700">Bronze</Badge>
                    <CardTitle>Community Promoter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Access to promotional materials
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Community badge in Telegram
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Weekly SENT airdrops
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-500">Requirement: 100+ followers</p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardHeader>
                    <Badge className="w-fit bg-purple-100 text-purple-700">Silver</Badge>
                    <CardTitle>KOL Partner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        All Bronze benefits
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Exclusive alpha access
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Monthly SENT bonus
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Direct team communication
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-500">Requirement: 1,000+ followers</p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardHeader>
                    <Badge className="w-fit bg-yellow-100 text-yellow-700">Gold</Badge>
                    <CardTitle>Ambassador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        All Silver benefits
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Revenue share program
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Featured on website
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        AMA hosting opportunities
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Early access to new launches
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-500">Requirement: 10,000+ followers</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-gradient-to-r from-orange-500 to-purple-600 text-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Promoting?</h3>
                <p className="mb-6 text-white/80">
                  Join our Telegram and DM an admin to get started with the promoter program.
                </p>
                <a href={affiliateLinks.telegram} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                    <Send className="w-4 h-4 mr-2" /> Join Telegram Now
                  </Button>
                </a>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
