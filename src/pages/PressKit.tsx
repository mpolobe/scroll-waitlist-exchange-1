import { useState } from 'react';
import { 
  Mail, FileText, Copy, CheckCircle, Download, 
  Newspaper, Users, Building, Globe, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketingNav from '@/components/MarketingNav';

const emailTemplates = [
  {
    id: 'launch-announcement',
    title: 'Launch Announcement',
    subject: 'Africa Railways: Continental Rail Network Launches 2026',
    recipient: 'General Audience',
    body: `Dear [Name],

We are thrilled to announce the launch of the Africa Continental Rail Network – the most ambitious infrastructure project in African history.

Starting in 2026, we will connect 54 African capitals with 25,000+ kilometers of high-speed rail, traveling at speeds up to 250 km/h.

KEY HIGHLIGHTS:
• First routes operational in 2026 (Nile Valley & West African Coastal corridors)
• 2 million jobs created by 2035
• 60% reduction in carbon emissions vs. road/air travel
• 50% projected boost in intra-African trade

This is more than infrastructure – it's continental unity in motion.

Visit africarailways.com to explore routes, track construction progress, and join our journey.

Together, we're connecting Africa, one track at a time.

Best regards,
[Your Name]
Africa Railways Communications Team

---
Website: africarailways.com
Twitter: @AfricaRailways
LinkedIn: Africa Continental Rail Network`
  },
  {
    id: 'investor-outreach',
    title: 'Investor Outreach',
    subject: 'Investment Opportunity: Africa Continental Rail Network',
    recipient: 'Potential Investors',
    body: `Dear [Investor Name],

I am reaching out regarding a transformative infrastructure investment opportunity – the Africa Continental Rail Network.

INVESTMENT HIGHLIGHTS:
• $100B+ total economic impact by 2035
• 25,000 km high-speed rail network across 54 countries
• Backed by African Development Bank and major sovereign wealth funds
• Supporting the African Continental Free Trade Area (AfCFTA)

PROJECTED RETURNS:
• 4:1 economic multiplier on infrastructure investment
• Revenue streams: passenger services, freight, real estate development
• Long-term concession agreements with participating governments

RISK MITIGATION:
• Phased construction approach (7 corridors, 2026-2035)
• Multi-lateral government backing
• Proven technology partnerships with global rail leaders

We would welcome the opportunity to present our detailed investment prospectus and discuss partnership structures.

Are you available for a 30-minute call next week?

Best regards,
[Your Name]
Director of Investor Relations
Africa Railways

---
Confidential Investment Inquiries: investors@africarailways.com`
  },
  {
    id: 'partnership-proposal',
    title: 'Partnership Proposal',
    subject: 'Strategic Partnership Opportunity – Africa Railways',
    recipient: 'Corporate Partners',
    body: `Dear [Partner Name],

Africa Railways is seeking strategic partners to join us in building the continent's first integrated high-speed rail network.

PARTNERSHIP OPPORTUNITIES:

1. TECHNOLOGY PARTNERS
   • Rolling stock manufacturing
   • Signaling and control systems
   • Station technology and digital infrastructure

2. CONSTRUCTION PARTNERS
   • Civil engineering and track laying
   • Station and terminal construction
   • Tunnel and bridge engineering

3. OPERATIONS PARTNERS
   • Train operations and maintenance
   • Hospitality and onboard services
   • Ticketing and customer experience

4. COMMERCIAL PARTNERS
   • Station retail and F&B concessions
   • Advertising and media rights
   • Tourism and travel packages

WHAT WE OFFER:
• Long-term contracts across 54 countries
• First-mover advantage in emerging markets
• Brand association with Pan-African unity
• Access to 1.4 billion potential customers

Let's explore how [Company Name] can be part of Africa's connected future.

Best regards,
[Your Name]
Head of Strategic Partnerships
Africa Railways

---
partnerships@africarailways.com`
  },
  {
    id: 'government-engagement',
    title: 'Government Engagement',
    subject: 'Africa Railways: National Integration Proposal',
    recipient: 'Government Officials',
    body: `Your Excellency,

On behalf of the Africa Continental Rail Network initiative, I write to discuss [Country Name]'s integration into the continental high-speed rail network.

NATIONAL BENEFITS:

Economic Impact:
• [X,XXX] direct construction jobs
• [X,XXX] permanent operational positions
• Estimated [X]% GDP contribution from improved connectivity

Infrastructure Development:
• [X] new stations in major cities
• [X] km of track within national borders
• Modern maintenance facilities and training centers

Regional Integration:
• Direct connections to [neighboring countries]
• Support for AfCFTA trade facilitation
• Enhanced tourism accessibility

PROPOSED TIMELINE:
• Phase 1: Feasibility and route planning (6 months)
• Phase 2: Environmental and social impact assessment (12 months)
• Phase 3: Construction commencement (2027)
• Phase 4: Operations launch (2029)

We respectfully request a meeting with your Ministry of Transport to present our detailed national integration plan.

With highest regards,
[Your Name]
Government Relations Director
Africa Railways

---
Official Correspondence: government@africarailways.com`
  },
  {
    id: 'media-invitation',
    title: 'Media Event Invitation',
    subject: 'MEDIA INVITATION: Africa Railways Ground-Breaking Ceremony',
    recipient: 'Press & Media',
    body: `FOR IMMEDIATE RELEASE

MEDIA INVITATION
Africa Railways Ground-Breaking Ceremony

Dear [Journalist Name],

You are cordially invited to attend the historic ground-breaking ceremony for the Africa Continental Rail Network.

EVENT DETAILS:
Date: [Date]
Time: [Time]
Location: [Venue, City, Country]

PROGRAM HIGHLIGHTS:
• Keynote addresses by Heads of State
• First rail laying ceremony
• Press conference with project leadership
• Site tour and technical briefings
• Networking reception

ATTENDING DIGNITARIES:
• [List of confirmed VIPs]

MEDIA FACILITIES:
• Dedicated press center
• Interview opportunities
• B-roll footage available
• Press kit distribution

RSVP REQUIRED BY: [Date]
Contact: press@africarailways.com

Press credentials will be verified upon registration.

We look forward to your coverage of this historic moment for Africa.

Best regards,
[Your Name]
Director of Communications
Africa Railways

---
Press Office: +XXX XXX XXXX
press@africarailways.com`
  }
];

const pressReleases = [
  {
    id: 'launch-pr',
    title: 'Africa Railways Announces Continental Network Launch',
    date: 'January 2026',
    category: 'Major Announcement',
    content: `FOR IMMEDIATE RELEASE

AFRICA RAILWAYS ANNOUNCES LAUNCH OF CONTINENTAL HIGH-SPEED RAIL NETWORK
54 Capitals to be Connected by 2035 in Largest Infrastructure Project in African History

[ADDIS ABABA, ETHIOPIA] – The Africa Continental Rail Network today announced the official launch of construction on the world's most ambitious rail infrastructure project, connecting all 54 African capitals with high-speed rail by 2035.

"This is a historic day for Africa," said [CEO Name], Chief Executive of Africa Railways. "For the first time, our continent will have a unified transportation network that matches our shared aspirations for unity and prosperity."

PROJECT HIGHLIGHTS:

• 25,000+ kilometers of high-speed rail
• Maximum speeds of 250 km/h
• 7 major corridors across all regions
• First routes operational in 2026
• 2 million jobs created
• $100 billion economic impact

The first phase includes the Nile Valley Corridor (Cairo-Khartoum-Addis Ababa-Nairobi-Kampala) and the West African Coastal Network (Dakar-Bamako-Ouagadougou-Niamey-N'Djamena), with construction beginning immediately.

"This network will transform how Africans live, work, and trade," said [African Union Representative]. "It is the physical manifestation of our continental integration vision."

The project is backed by the African Development Bank, with additional funding from international development partners and private investors.

ABOUT AFRICA RAILWAYS:
Africa Railways is the implementing body for the Africa Continental Rail Network, established under the auspices of the African Union to deliver integrated high-speed rail connectivity across the continent.

MEDIA CONTACT:
[Name]
Director of Communications
press@africarailways.com
+XXX XXX XXXX

###

Note to Editors:
• High-resolution images available at africarailways.com/press
• Executive interviews available upon request
• Technical fact sheets attached`
  },
  {
    id: 'milestone-pr',
    title: 'First 1,000 Kilometers of Track Completed',
    date: 'Q3 2026',
    category: 'Construction Milestone',
    content: `FOR IMMEDIATE RELEASE

AFRICA RAILWAYS COMPLETES FIRST 1,000 KILOMETERS OF CONTINENTAL NETWORK
Nile Valley Corridor Reaches Major Construction Milestone

[KHARTOUM, SUDAN] – Africa Railways today announced the completion of the first 1,000 kilometers of track on the continental high-speed rail network, marking a major milestone in the project's construction phase.

The completed section spans from Cairo, Egypt to Khartoum, Sudan, forming the northern segment of the Nile Valley Corridor.

KEY ACHIEVEMENTS:

• 1,000 km of track laid in 8 months
• 15,000 workers employed across construction sites
• 3 major stations under construction
• On schedule for 2027 passenger service

"We promised to deliver, and we are delivering," said [Project Director]. "This milestone proves that Africa can execute world-class infrastructure projects on time and on budget."

The construction has already generated significant economic activity:
• $2.3 billion in local procurement
• 847 local suppliers contracted
• 12 training centers established
• 5,000 African engineers trained

Test runs on the completed section will begin in Q4 2026, with commercial passenger service expected to launch in early 2027.

NEXT MILESTONES:
• Khartoum-Addis Ababa section: Q1 2027
• Addis Ababa-Nairobi section: Q3 2027
• Full Nile Valley Corridor: Q4 2028

MEDIA CONTACT:
[Name]
Director of Communications
press@africarailways.com

###`
  },
  {
    id: 'partnership-pr',
    title: 'Major Technology Partnership Announced',
    date: 'Q2 2026',
    category: 'Partnership',
    content: `FOR IMMEDIATE RELEASE

AFRICA RAILWAYS ANNOUNCES LANDMARK TECHNOLOGY PARTNERSHIP
[Partner Company] to Provide Rolling Stock and Systems for Continental Network

[NAIROBI, KENYA] – Africa Railways and [Partner Company] today announced a landmark partnership agreement for the supply of high-speed trains and signaling systems for the Africa Continental Rail Network.

The agreement, valued at $[X] billion, represents one of the largest rail technology contracts in history.

PARTNERSHIP SCOPE:

Rolling Stock:
• [X] high-speed train sets
• Maximum speed: 250 km/h
• Capacity: [X] passengers per train
• African assembly facility to be established

Signaling & Control:
• European Train Control System (ETCS) Level 2
• Centralized traffic management
• Predictive maintenance systems

Technology Transfer:
• Joint venture manufacturing facility
• Training for 2,000 African engineers
• Local content requirement: 40% by 2030

"This partnership combines world-leading technology with African talent and ambition," said [Africa Railways CEO]. "We are not just buying trains – we are building African rail manufacturing capability."

[Partner Company CEO] added: "Africa represents the future of rail transportation. We are proud to be part of this transformative project."

The first trains are expected to arrive in Q3 2026, with local assembly beginning in 2028.

MEDIA CONTACT:
[Name]
Director of Communications
press@africarailways.com

###`
  }
];

export default function PressKit() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/20 text-white mb-4">Press & Communications</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Press Kit & <span className="text-blue-400">Email Templates</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Ready-to-use press releases, email templates, and media materials for 
              communicating the Africa Railways story.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-gray-500">Email Templates</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Newspaper className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-gray-500">Press Releases</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-gray-500">Audience Types</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Globe className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">54</p>
              <p className="text-sm text-gray-500">Countries</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="emails" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Templates
            </TabsTrigger>
            <TabsTrigger value="press" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Press Releases
            </TabsTrigger>
          </TabsList>

          {/* Email Templates Tab */}
          <TabsContent value="emails" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Email Templates</h2>
              <p className="text-gray-600">Professional email templates for different audiences and purposes</p>
            </div>
            
            <div className="grid gap-6">
              {emailTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-500" />
                          {template.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="outline" className="mr-2">{template.recipient}</Badge>
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`Subject: ${template.subject}\n\n${template.body}`, template.id)}
                      >
                        {copiedId === template.id ? (
                          <><CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Copied</>
                        ) : (
                          <><Copy className="w-4 h-4 mr-1" /> Copy All</>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Subject Line:</p>
                      <p className="text-sm bg-white p-2 rounded border">{template.subject}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Email Body:</p>
                      <pre className="text-sm whitespace-pre-wrap font-sans bg-white p-4 rounded border max-h-64 overflow-y-auto">
                        {template.body}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Press Releases Tab */}
          <TabsContent value="press" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Press Releases</h2>
              <p className="text-gray-600">Official press releases for media distribution</p>
            </div>

            <div className="grid gap-6">
              {pressReleases.map((pr) => (
                <Card key={pr.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Newspaper className="w-5 h-5 text-purple-500" />
                          {pr.title}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <Badge variant="outline">{pr.category}</Badge>
                          <span className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" /> {pr.date}
                          </span>
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(pr.content, pr.id)}
                      >
                        {copiedId === pr.id ? (
                          <><CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Copied</>
                        ) : (
                          <><Copy className="w-4 h-4 mr-1" /> Copy</>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans bg-white p-4 rounded border max-h-96 overflow-y-auto">
                        {pr.content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Media Contact Card */}
        <Card className="mt-12 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Media Contact</h3>
                <div className="space-y-3">
                  <p><strong>Press Office:</strong> press@africarailways.com</p>
                  <p><strong>Phone:</strong> +251 XXX XXX XXX</p>
                  <p><strong>Hours:</strong> 24/7 for urgent inquiries</p>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Download Assets</h3>
                <div className="space-y-3">
                  <Button variant="secondary" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" /> Logo Pack (PNG, SVG, EPS)
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" /> Executive Headshots
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" /> Project Fact Sheet (PDF)
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
