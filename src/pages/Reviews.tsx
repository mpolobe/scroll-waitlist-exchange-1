import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, Star, Shield, Rocket, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketingNav from '@/components/MarketingNav';
import { ProjectReviewCard } from '@/components/blog/ProjectReviewCard';
import { MarketingBanner, StatsBar } from '@/components/blog/MarketingBanner';
import { cryptoProjects, reviewCategories, networks } from '@/data/cryptoReviews';

export default function Reviews() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNetwork, setSelectedNetwork] = useState('All Networks');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredProjects = cryptoProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesNetwork = selectedNetwork === 'All Networks' || project.network === selectedNetwork;
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesNetwork && matchesStatus;
  });

  const featuredProjects = cryptoProjects.filter(p => p.featured);
  const liveProjects = cryptoProjects.filter(p => p.status === 'live');
  const upcomingProjects = cryptoProjects.filter(p => p.status === 'upcoming');

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-orange-900 text-white pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-orange-500 text-white mb-4">Trusted Crypto Reviews</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Africa's Premier <span className="text-orange-400">Crypto Research</span> Platform
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              In-depth project reviews, due diligence reports, and market analysis. 
              Make informed investment decisions with our verified research.
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  placeholder="Search projects by name or symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
                />
              </div>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <StatsBar />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Banner */}
        <section className="mb-12">
          <MarketingBanner
            badge="Live Now on PinkSale"
            title="$SENT Token IDO - Join the Sentinel Network"
            subtitle="The governance token for Africa's railway safety infrastructure. Real utility, verified team, audited contract. Don't miss this opportunity!"
            ctaText="Join IDO Now"
            ctaLink="https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08"
          />
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/ido" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
              <Rocket className="w-8 h-8 text-orange-500 mb-3" />
              <h3 className="font-semibold mb-1">Active IDOs</h3>
              <p className="text-sm text-gray-500">View live launches</p>
              <ChevronRight className="w-5 h-5 text-orange-500 mt-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/reviews" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
              <Star className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="font-semibold mb-1">Top Rated</h3>
              <p className="text-sm text-gray-500">Best reviewed projects</p>
              <ChevronRight className="w-5 h-5 text-orange-500 mt-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/blog" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
              <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-semibold mb-1">Market Analysis</h3>
              <p className="text-sm text-gray-500">Latest insights</p>
              <ChevronRight className="w-5 h-5 text-orange-500 mt-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="https://t.me/Africoin_Official" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
              <Shield className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-semibold mb-1">Join Community</h3>
              <p className="text-sm text-gray-500">Get alpha first</p>
              <ChevronRight className="w-5 h-5 text-orange-500 mt-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <Tabs defaultValue="all" onValueChange={setSelectedStatus}>
              <TabsList>
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="live">Live ({liveProjects.length})</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming ({upcomingProjects.length})</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {reviewCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Network" />
                </SelectTrigger>
                <SelectContent>
                  {networks.map(net => (
                    <SelectItem key={net} value={net}>{net}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" /> Featured Projects
              </h2>
              <Link to="/reviews" className="text-orange-600 hover:text-orange-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map(project => (
                <ProjectReviewCard key={project.id} {...project} />
              ))}
            </div>
          </section>
        )}

        {/* All Projects */}
        <section>
          <h2 className="text-2xl font-bold mb-6">All Reviewed Projects</h2>
          {filteredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectReviewCard key={project.id} {...project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500 text-lg">No projects found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedNetwork('All Networks');
                  setSelectedStatus('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </section>

        {/* Submit Project CTA */}
        <section className="mt-16">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Want Your Project Reviewed?</h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Get your project in front of thousands of investors. Our team provides thorough due diligence 
              and honest reviews to help quality projects gain visibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://t.me/Africoin_Official" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Submit for Review
                </Button>
              </a>
              <Link to="/partners">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Become a Partner
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
