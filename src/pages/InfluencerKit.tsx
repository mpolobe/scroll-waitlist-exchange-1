import { useState } from 'react';
import { 
  Star, Users, Gift, CheckCircle, Download, Copy,
  Twitter, Instagram, Youtube, Mic, Camera, Video,
  Award, TrendingUp, Globe, Heart, MessageCircle, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketingNav from '@/components/MarketingNav';

const partnershipTiers = [
  {
    id: 'ambassador',
    name: 'Ambassador',
    icon: Award,
    color: 'from-yellow-500 to-orange-500',
    requirements: {
      followers: '500K+',
      engagement: '3%+',
      platforms: 'Multi-platform presence'
    },
    benefits: [
      'Exclusive first-class rail experiences',
      'Annual compensation package ($50K-$200K)',
      'Personal brand integration opportunities',
      'VIP access to launch events',
      'Dedicated partnership manager',
      'Custom content production support',
      'Revenue share on referrals (5%)',
      'Featured on official channels'
    ],
    deliverables: [
      '12 sponsored posts per year',
      '4 video features (5+ min each)',
      '2 live event appearances',
      'Ongoing story/reel coverage',
      'Exclusive interview availability'
    ]
  },
  {
    id: 'creator',
    name: 'Creator Partner',
    icon: Video,
    color: 'from-purple-500 to-pink-500',
    requirements: {
      followers: '100K-500K',
      engagement: '4%+',
      platforms: 'Primary platform focus'
    },
    benefits: [
      'Complimentary rail passes (business class)',
      'Per-campaign compensation ($5K-$25K)',
      'Press trip invitations',
      'Early access to announcements',
      'Brand asset library access',
      'Co-branded merchandise',
      'Affiliate commission (3%)'
    ],
    deliverables: [
      '6 sponsored posts per year',
      '2 video features',
      'Story/reel coverage per trip',
      'Authentic journey documentation'
    ]
  },
  {
    id: 'micro',
    name: 'Micro-Influencer',
    icon: Star,
    color: 'from-blue-500 to-cyan-500',
    requirements: {
      followers: '10K-100K',
      engagement: '5%+',
      platforms: 'Niche audience focus'
    },
    benefits: [
      'Complimentary rail passes (standard class)',
      'Per-post compensation ($500-$2K)',
      'Exclusive community access',
      'Brand swag packages',
      'Feature opportunities',
      'Affiliate commission (2%)'
    ],
    deliverables: [
      '4 sponsored posts per year',
      'Story coverage per trip',
      'Authentic reviews and testimonials'
    ]
  },
  {
    id: 'community',
    name: 'Community Advocate',
    icon: Heart,
    color: 'from-green-500 to-teal-500',
    requirements: {
      followers: '1K-10K',
      engagement: '6%+',
      platforms: 'Local/regional focus'
    },
    benefits: [
      'Discounted rail passes (50% off)',
      'Community recognition',
      'Exclusive updates and news',
      'Brand ambassador badge',
      'Referral rewards program'
    ],
    deliverables: [
      'Organic content sharing',
      'Community engagement',
      'Local event participation'
    ]
  }
];

const contentGuidelines = {
  dos: [
    'Share authentic experiences and genuine reactions',
    'Highlight the journey, not just the destination',
    'Showcase diverse African cultures and landscapes',
    'Include accessibility and sustainability messaging',
    'Tag @AfricaRailways and use campaign hashtags',
    'Disclose partnership per FTC/local guidelines',
    'Engage with comments and questions',
    'Create content in local languages when relevant'
  ],
  donts: [
    'Make false claims about routes or timelines',
    'Share confidential business information',
    'Create content that could be seen as political',
    'Use competitor comparisons negatively',
    'Post content without proper disclosure',
    'Misrepresent your relationship with the brand',
    'Share unverified statistics or data',
    'Create content that could harm brand reputation'
  ]
};

const campaignIdeas = [
  {
    title: 'Journey Documentation',
    description: 'Document your complete rail journey from booking to arrival',
    platforms: ['YouTube', 'TikTok', 'Instagram'],
    format: 'Vlog / Series',
    hashtags: ['#MyAfricaRailJourney', '#AfricaConnected']
  },
  {
    title: 'City-to-City Challenge',
    description: 'Race against other transport modes to show rail efficiency',
    platforms: ['YouTube', 'TikTok'],
    format: 'Challenge Video',
    hashtags: ['#RailVsRoad', '#FastestWay']
  },
  {
    title: 'Cultural Connections',
    description: 'Explore how rail connects different African cultures',
    platforms: ['Instagram', 'YouTube'],
    format: 'Photo Essay / Documentary',
    hashtags: ['#AfricaUnited', '#CultureByRail']
  },
  {
    title: 'Behind the Scenes',
    description: 'Exclusive access to construction sites and operations',
    platforms: ['YouTube', 'Instagram', 'Twitter'],
    format: 'Documentary / BTS',
    hashtags: ['#BuildingAfrica', '#RailConstruction']
  },
  {
    title: 'Local Food Trail',
    description: 'Taste local cuisines at each station stop',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    format: 'Food Series',
    hashtags: ['#TasteOfAfrica', '#RailFoodie']
  },
  {
    title: 'Sustainability Story',
    description: 'Highlight the environmental benefits of rail travel',
    platforms: ['Instagram', 'LinkedIn', 'YouTube'],
    format: 'Educational Content',
    hashtags: ['#GreenTravel', '#SustainableAfrica']
  }
];

const brandAssets = [
  { name: 'Logo Pack', description: 'PNG, SVG, EPS formats', icon: Download },
  { name: 'Brand Guidelines', description: 'Colors, fonts, usage rules', icon: Download },
  { name: 'Photo Library', description: 'High-res train and station images', icon: Camera },
  { name: 'Video B-Roll', description: 'Footage for content creation', icon: Video },
  { name: 'Social Templates', description: 'Customizable post templates', icon: Share2 },
  { name: 'Fact Sheets', description: 'Key statistics and talking points', icon: Download }
];

export default function InfluencerKit() {
  const [selectedTier, setSelectedTier] = useState('creator');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentTier = partnershipTiers.find(t => t.id === selectedTier);

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 text-white pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/20 text-white mb-4">Partnership Program</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Influencer <span className="text-pink-300">Partnership Kit</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Join us in telling Africa's greatest infrastructure story. 
              Partner with Africa Railways and inspire millions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
                Apply Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" /> Download Media Kit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">1.4B</p>
              <p className="text-sm text-gray-500">Potential Reach</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Globe className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">54</p>
              <p className="text-sm text-gray-500">Countries</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">$200K</p>
              <p className="text-sm text-gray-500">Max Annual Package</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-gray-500">Partnership Tiers</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="tiers" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="tiers">Tiers</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>

          {/* Partnership Tiers Tab */}
          <TabsContent value="tiers" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Partnership Tiers</h2>
              <p className="text-gray-600">Choose the partnership level that matches your influence</p>
            </div>

            {/* Tier selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {partnershipTiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`p-4 rounded-xl transition-all ${
                    selectedTier === tier.id 
                      ? 'ring-2 ring-purple-500 bg-white shadow-lg' 
                      : 'bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                    <tier.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold">{tier.name}</p>
                  <p className="text-sm text-gray-500">{tier.requirements.followers}</p>
                </button>
              ))}
            </div>

            {/* Selected tier details */}
            {currentTier && (
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentTier.color} flex items-center justify-center`}>
                        <currentTier.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>{currentTier.name}</CardTitle>
                        <CardDescription>Partnership Requirements</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Followers</span>
                        <span className="font-semibold">{currentTier.requirements.followers}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Engagement Rate</span>
                        <span className="font-semibold">{currentTier.requirements.engagement}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Platform</span>
                        <span className="font-semibold">{currentTier.requirements.platforms}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Benefits</h4>
                      <ul className="space-y-2">
                        {currentTier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Deliverables</CardTitle>
                    <CardDescription>What we expect from partners</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentTier.deliverables.map((deliverable, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 text-sm font-bold">{i + 1}</span>
                          </div>
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500">
                      Apply for {currentTier.name} Partnership
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Content Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Content Guidelines</h2>
              <p className="text-gray-600">Best practices for creating Africa Railways content</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-6 h-6" /> Do's
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {contentGuidelines.dos.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">✕</span>
                    Don'ts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {contentGuidelines.donts.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5 text-xs">✕</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle>Official Hashtags</CardTitle>
                <CardDescription>Use these hashtags in all partnership content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['#AfricaRailways', '#AfricaConnected', '#OneAfrica', '#RailAfrica', '#BuildingAfrica', '#AfricaByRail', '#HighSpeedAfrica', '#PanAfricanRail'].map((tag) => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(tag, tag)}
                      className="flex items-center gap-1"
                    >
                      {copiedId === tag ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {tag}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Disclosure */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-800">Disclosure Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-900 mb-4">
                  All sponsored content must include clear disclosure. Use one of these approved formats:
                </p>
                <div className="space-y-2">
                  {[
                    '#Ad #AfricaRailwaysPartner',
                    'Paid partnership with @AfricaRailways',
                    'Sponsored by Africa Railways'
                  ].map((disclosure, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <code className="text-sm">{disclosure}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(disclosure, `disclosure-${i}`)}
                      >
                        {copiedId === `disclosure-${i}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaign Ideas Tab */}
          <TabsContent value="campaigns" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Campaign Ideas</h2>
              <p className="text-gray-600">Inspiration for your Africa Railways content</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaignIdeas.map((campaign, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Platforms</p>
                        <div className="flex gap-2">
                          {campaign.platforms.map((platform) => (
                            <Badge key={platform} variant="outline">
                              {platform === 'YouTube' && <Youtube className="w-3 h-3 mr-1" />}
                              {platform === 'Instagram' && <Instagram className="w-3 h-3 mr-1" />}
                              {platform === 'TikTok' && <Video className="w-3 h-3 mr-1" />}
                              {platform === 'Twitter' && <Twitter className="w-3 h-3 mr-1" />}
                              {platform === 'LinkedIn' && <MessageCircle className="w-3 h-3 mr-1" />}
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Format</p>
                        <Badge className="bg-purple-100 text-purple-700">{campaign.format}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Hashtags</p>
                        <div className="flex flex-wrap gap-1">
                          {campaign.hashtags.map((tag) => (
                            <span key={tag} className="text-sm text-blue-600">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Brand Assets Tab */}
          <TabsContent value="assets" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Brand Assets</h2>
              <p className="text-gray-600">Download official Africa Railways assets for your content</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandAssets.map((asset, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <asset.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-1">{asset.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{asset.description}</p>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Color palette */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>Official color palette for content creation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Primary Blue', hex: '#1e3a8a', class: 'bg-blue-900' },
                    { name: 'Cyan Accent', hex: '#06b6d4', class: 'bg-cyan-500' },
                    { name: 'Success Green', hex: '#22c55e', class: 'bg-green-500' },
                    { name: 'Energy Orange', hex: '#f97316', class: 'bg-orange-500' }
                  ].map((color) => (
                    <div key={color.hex} className="text-center">
                      <div className={`w-full h-20 ${color.class} rounded-lg mb-2`} />
                      <p className="font-medium">{color.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(color.hex, color.hex)}
                        className="text-gray-500"
                      >
                        {copiedId === color.hex ? 'Copied!' : color.hex}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Partner?</h3>
            <p className="mb-6 text-white/80 max-w-2xl mx-auto">
              Join our growing network of influencers and content creators helping to tell 
              Africa's greatest infrastructure story.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Apply for Partnership
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Partnerships Team
              </Button>
            </div>
            <p className="mt-6 text-sm text-white/60">
              partnerships@africarailways.com | Response within 48 hours
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
