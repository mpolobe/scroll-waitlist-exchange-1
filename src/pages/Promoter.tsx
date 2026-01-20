import { useState } from 'react';
import { 
  Megaphone, Users, TrendingUp, Star, 
  CheckCircle, Copy, ExternalLink,
  Twitter, Send, Linkedin, Instagram, Facebook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketingNav from '@/components/MarketingNav';

// Social Media Templates Data
const instagramTemplates = [
  {
    id: 'countdown',
    title: 'Launch Countdown',
    gradient: 'from-blue-900 to-blue-500',
    content: {
      number: '100',
      label: 'Days to Go',
      tagline: 'First rails being laid on the Nile Valley Corridor'
    },
    caption: '100 days until history is made! The Nile Valley Corridor breaks ground, connecting Cairo to Kampala at 250 km/h. This is just the beginning of Africa\'s connected future.',
    hashtags: '#AfricaConnected #AfricaRailways #NileValley #HighSpeedRail #AfricanInfrastructure #PanAfrican #BuildingAfrica'
  },
  {
    id: 'stats',
    title: 'Impact Stats',
    gradient: 'from-orange-500 to-red-600',
    content: {
      number: '54',
      label: 'Capitals Connected',
      tagline: 'For the first time in history, every African capital will be connected by high-speed rail'
    },
    caption: '54 nations. One network. By 2035, you\'ll be able to travel from Algiers to Cape Town, Dakar to Djibouti, on a single integrated rail system. Continental unity through infrastructure.',
    hashtags: '#OneAfrica #54Countries #ContinentalUnity #AfricaRailways #HighSpeedAfrica'
  },
  {
    id: 'route',
    title: 'Route Launch',
    gradient: 'from-green-500 to-green-700',
    content: {
      title: 'West African Coastal',
      subtitle: 'Connecting the Atlantic',
      path: 'Dakar → Bamako → Ouagadougou → Niamey → N\'Djamena',
      stats: [
        { value: '4,200', label: 'KM' },
        { value: '250', label: 'KM/H' },
        { value: '2026', label: 'Launch' }
      ]
    },
    caption: 'ROUTE ANNOUNCEMENT: The West African Coastal Network! 4,200 km of high-speed rail connecting economic powerhouses from Dakar to N\'Djamena. Construction begins this year.',
    hashtags: '#WestAfrica #Dakar #Bamako #ECOWAS #AfricaRailways #InfrastructureDevelopment'
  },
  {
    id: 'environmental',
    title: 'Environmental Impact',
    gradient: 'from-emerald-500 to-teal-700',
    content: {
      number: '60%',
      label: 'Less CO₂ Emissions',
      tagline: 'Electric high-speed rail vs. road and air travel. Building a sustainable future for Africa.'
    },
    caption: 'Sustainability at speed. Our electric trains reduce carbon emissions by 60% compared to traditional transport. 25,000 km of green infrastructure for a greener Africa.',
    hashtags: '#ClimateAction #ElectricTrains #SustainableInfrastructure #GreenTransport #AfricaRailways'
  },
  {
    id: 'jobs',
    title: 'Jobs & Opportunities',
    gradient: 'from-yellow-500 to-orange-500',
    content: {
      title: 'We\'re Hiring',
      subtitle: 'Build Africa\'s Future',
      path: 'Engineers • Project Managers • Operations • Technology • Hospitality',
      stats: [
        { value: '2M+', label: 'Jobs' },
        { value: '54', label: 'Countries' },
        { value: '2026', label: 'Start' }
      ]
    },
    caption: 'Careers that move Africa forward. We\'re recruiting engineers, project managers, operations specialists, and more across all 54 countries. Be part of the team building Africa\'s future.',
    hashtags: '#AfricaJobs #Engineering #Careers #Infrastructure #AfricaRailways #HiringNow'
  }
];

const twitterTemplates = [
  {
    title: 'SENT IDO Live',
    content: '🚨 $SENT IDO is LIVE on PinkSale! 720-day liquidity lock. 10B total supply. Governance & revenue share for Africa Railways. Join the Sentinel Network: pinksale.finance #SENT #PinkSale #Polygon',
    gradient: 'from-purple-600 to-pink-600'
  },
  {
    title: 'Token Ecosystem',
    content: '🎫 $AFC = Train tickets (Sui)\n🏛️ $AFRC = Rewards\n💎 $SENT = Investment & governance (Polygon)\n\nThree tokens powering Africa\'s rail revolution. #AfricaRailways #Crypto',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    title: 'Journey Time',
    content: 'Cairo to Nairobi in 12 hours. The Nile Valley Corridor launches 2026, cutting journey times by 70% and connecting 130M people across 5 nations. This is the future of African mobility. #AfricaConnected',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    title: 'Network Stats',
    content: '25,000 km of high-speed rail. 54 capitals connected. 2 million jobs created. The Africa Continental Rail Network is the most ambitious infrastructure project in African history. #AfricaRailways #BuildingAfrica',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Sustainability',
    content: 'Electric trains. 60% less emissions. Climate-resilient infrastructure. The Africa Railways network proves that development and sustainability go hand in hand. #GreenAfrica #ClimateAction',
    gradient: 'from-green-500 to-teal-500'
  }
];

const linkedinTemplate = {
  title: '2 Million Jobs By 2035',
  subtitle: 'Building Africa\'s Future Together',
  description: 'The Africa Continental Rail Network will create 2M+ construction and operational jobs, developing world-class African engineering expertise.',
  fullPost: `Excited to share that the Africa Continental Rail Network is projected to create over 2 million jobs by 2035 across construction, engineering, operations, and support services.

This isn't just infrastructure—it's capacity building at continental scale. We're developing African engineering expertise that will lead global rail innovation for decades to come.

Key opportunities:
• Civil engineering & construction
• Electrical & systems engineering  
• Operations & logistics management
• Technology & digital services
• Hospitality & customer service

Join us in building Africa's connected future.`,
  hashtags: '#AfricaRailways #JobCreation #Infrastructure #Engineering #AfricanTalent #EconomicDevelopment'
};

const storyTemplate = {
  title: '250 KM/H Across the Sahara',
  subtitle: 'Experience the Maghreb Express',
  ideas: [
    '"Did you know?" facts about each corridor',
    'Behind-the-scenes construction footage',
    'Country spotlight series',
    'Speed comparison animations',
    'Cultural journey previews',
    'Countdown to launch milestones'
  ]
};

const affiliateLinks = {
  website: 'https://africarailways.com',
  telegram: 'https://t.me/Africoin_Official',
  twitter: 'https://x.com/africoin_afc',
  linkedin: 'https://linkedin.com/company/africa-railways'
};

// Social sharing URL generators
const generateTwitterShareUrl = (text: string) => {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
};

const generateFacebookShareUrl = (text: string) => {
  return `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
};

const generateLinkedInShareUrl = (text: string) => {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://africarailways.com')}&summary=${encodeURIComponent(text)}`;
};

const generateWhatsAppShareUrl = (text: string) => {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

const generateTelegramShareUrl = (text: string) => {
  return `https://t.me/share/url?url=${encodeURIComponent('https://africarailways.com')}&text=${encodeURIComponent(text)}`;
};

export default function Promoter() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const ShareButtons = ({ text, id }: { text: string; id: string }) => (
    <div className="flex flex-wrap gap-2 mt-3">
      <a 
        href={generateTwitterShareUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex"
      >
        <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
          <Twitter className="w-4 h-4 mr-1" /> Post on X
        </Button>
      </a>
      <a 
        href={generateFacebookShareUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex"
      >
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Facebook className="w-4 h-4 mr-1" /> Facebook
        </Button>
      </a>
      <a 
        href={generateLinkedInShareUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex"
      >
        <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white">
          <Linkedin className="w-4 h-4 mr-1" /> LinkedIn
        </Button>
      </a>
      <a 
        href={generateWhatsAppShareUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex"
      >
        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
          <Send className="w-4 h-4 mr-1" /> WhatsApp
        </Button>
      </a>
      <a 
        href={generateTelegramShareUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex"
      >
        <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
          <Send className="w-4 h-4 mr-1" /> Telegram
        </Button>
      </a>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => copyToClipboard(text, id)}
      >
        {copiedIndex === id ? (
          <><CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Copied!</>
        ) : (
          <><Copy className="w-4 h-4 mr-1" /> Copy</>
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/20 text-white mb-4">Social Media Hub</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Africa Railways <span className="text-cyan-300">Social Templates</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Ready-to-use social media templates for promoting the Africa Continental Rail Network. 
              Click to share directly on any platform.
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
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">54</p>
              <p className="text-sm text-gray-500">Countries Connected</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Megaphone className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">25K</p>
              <p className="text-sm text-gray-500">KM of Rail</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">2M+</p>
              <p className="text-sm text-gray-500">Jobs Created</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">2026</p>
              <p className="text-sm text-gray-500">First Launch</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="instagram" className="space-y-8">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4">
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">Instagram</span>
            </TabsTrigger>
            <TabsTrigger value="twitter" className="flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              <span className="hidden sm:inline">Twitter/X</span>
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
          </TabsList>

          {/* Instagram Tab */}
          <TabsContent value="instagram" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Instagram Post Templates</h2>
              <p className="text-gray-600 mb-6">Click any share button to post directly to your preferred platform</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instagramTemplates.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    <div className={`aspect-square bg-gradient-to-br ${template.gradient} p-6 flex flex-col justify-center items-center text-white text-center`}>
                      {template.content.number && (
                        <>
                          <div className="text-6xl font-black mb-2">{template.content.number}</div>
                          <div className="text-xl uppercase tracking-wider mb-4">{template.content.label}</div>
                          <div className="text-sm opacity-90 max-w-[80%]">{template.content.tagline}</div>
                        </>
                      )}
                      {template.content.title && (
                        <>
                          <div className="text-2xl font-bold uppercase mb-1">{template.content.title}</div>
                          <div className="text-lg opacity-90 mb-4">{template.content.subtitle}</div>
                          <div className="text-sm mb-4">{template.content.path}</div>
                          {template.content.stats && (
                            <div className="flex gap-4 bg-white/20 rounded-xl p-3">
                              {template.content.stats.map((stat, i) => (
                                <div key={i} className="text-center px-3">
                                  <div className="text-2xl font-bold">{stat.value}</div>
                                  <div className="text-xs uppercase opacity-80">{stat.label}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <CardContent className="p-4 bg-gray-50">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm uppercase tracking-wide">{template.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{template.caption}</p>
                      <p className="text-xs text-blue-500 mb-2">{template.hashtags}</p>
                      <ShareButtons text={`${template.caption}\n\n${template.hashtags}`} id={template.id} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Twitter Tab */}
          <TabsContent value="twitter" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Twitter/X Templates</h2>
              <p className="text-gray-600 mb-6">Optimized for Twitter's character limit - click to tweet instantly</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {twitterTemplates.map((template, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className={`aspect-[2/1] bg-gradient-to-br ${template.gradient} p-6 flex items-center text-white`}>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{template.title}</h3>
                        <p className="text-sm opacity-90">{template.content.substring(0, 80)}...</p>
                      </div>
                    </div>
                    <CardContent className="p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-4">{template.content}</p>
                      <p className="text-xs text-gray-400 mb-3">{template.content.length} characters</p>
                      <ShareButtons text={template.content} id={`twitter-${index}`} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* LinkedIn Tab */}
          <TabsContent value="linkedin" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">LinkedIn Post Template</h2>
              <p className="text-gray-600 mb-6">Professional content for business audiences</p>
              <div className="max-w-2xl mx-auto">
                <Card className="overflow-hidden">
                  <div className="aspect-[1.91/1] bg-white relative">
                    <div className="h-[60%] bg-gradient-to-br from-blue-900 to-cyan-600 flex items-center justify-center text-white">
                      <h2 className="text-4xl font-bold text-center px-8">{linkedinTemplate.title}</h2>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{linkedinTemplate.subtitle}</h3>
                      <p className="text-gray-600">{linkedinTemplate.description}</p>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-gray-50">
                    <h4 className="font-semibold text-blue-900 mb-3 text-sm uppercase tracking-wide">Full Post</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line mb-3">{linkedinTemplate.fullPost}</p>
                    <p className="text-xs text-blue-500 mb-4">{linkedinTemplate.hashtags}</p>
                    <ShareButtons text={`${linkedinTemplate.fullPost}\n\n${linkedinTemplate.hashtags}`} id="linkedin" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Instagram Stories / TikTok Templates</h2>
              <p className="text-gray-600 mb-6">Vertical content ideas for short-form video</p>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card className="overflow-hidden">
                  <div className="aspect-[9/16] bg-gradient-to-br from-pink-500 to-pink-700 p-8 flex flex-col justify-between text-white">
                    <div className="text-center">
                      <div className="text-lg font-bold uppercase tracking-wider mb-1">Africa Railways</div>
                      <div className="text-sm opacity-80">Launch 2026</div>
                    </div>
                    <div className="text-center flex-1 flex flex-col justify-center">
                      <div className="text-3xl font-black mb-4">{storyTemplate.title}</div>
                      <div className="text-lg opacity-90">{storyTemplate.subtitle}</div>
                    </div>
                    <div className="text-center bg-white/20 rounded-full py-3 px-6">
                      Swipe Up to Explore Routes
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Story Series Ideas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {storyTemplate.ideas.map((idea, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Quick Share Text</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        250 km/h across Africa! The Maghreb Express launches 2027. Follow @AfricaRailways for updates! #AfricaConnected
                      </p>
                      <ShareButtons 
                        text="250 km/h across Africa! The Maghreb Express launches 2027. Follow @AfricaRailways for updates! #AfricaConnected #AfricaRailways" 
                        id="story-share" 
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Brand Guidelines */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Brand Guidelines</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Brand Colors</h3>
                  <div className="flex gap-4">
                    <div>
                      <div className="w-16 h-16 rounded-lg bg-blue-900 mb-2"></div>
                      <p className="text-sm">#1e3a8a</p>
                    </div>
                    <div>
                      <div className="w-16 h-16 rounded-lg bg-cyan-500 mb-2"></div>
                      <p className="text-sm">#06b6d4</p>
                    </div>
                    <div>
                      <div className="w-16 h-16 rounded-lg bg-green-500 mb-2"></div>
                      <p className="text-sm">#22c55e</p>
                    </div>
                    <div>
                      <div className="w-16 h-16 rounded-lg bg-orange-500 mb-2"></div>
                      <p className="text-sm">#f97316</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Hashtags</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge>#AfricaRailways</Badge>
                    <Badge>#AfricaConnected</Badge>
                    <Badge>#OneAfrica</Badge>
                    <Badge>#HighSpeedAfrica</Badge>
                    <Badge>#BuildingAfrica</Badge>
                    <Badge>#PanAfrican</Badge>
                    <Badge>#AfricanInfrastructure</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="mt-8 bg-gradient-to-r from-blue-900 to-cyan-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Spread the Word?</h3>
            <p className="mb-6 text-white/80">
              Join our community and help promote Africa's connected future.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href={affiliateLinks.telegram} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                  <Send className="w-4 h-4 mr-2" /> Join Telegram
                </Button>
              </a>
              <a href={affiliateLinks.twitter} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Twitter className="w-4 h-4 mr-2" /> Follow on Twitter
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
