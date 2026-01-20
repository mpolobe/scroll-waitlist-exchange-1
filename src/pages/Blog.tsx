import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MarketingNav from '@/components/MarketingNav';
import { MarketingBanner } from '@/components/blog/MarketingBanner';
import { supabase } from '@/lib/supabase';
import { Loader2, Star, TrendingUp, Rocket, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  image: string;
  read_time: string;
  featured: boolean;
}

// Fallback blog posts when Supabase is unavailable
const fallbackPosts: BlogPost[] = [
  {
    id: 'sent-token-pinksale-launch',
    title: '$SENT Token IDO Live on PinkSale - Join the Sentinel Network',
    excerpt: 'The SENT governance token is now live on PinkSale! Join the fairlaunch on Polygon network from January 19 to February 2, 2026.',
    content: '',
    category: 'Company News',
    author: 'Africa Railways Team',
    date: 'Jan 19, 2026',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp',
    read_time: '4 min read',
    featured: true
  },
  {
    id: 'tazara-railway-50-years',
    title: 'The TAZARA Turns 50: Riding the Railway That Bridges Tanzania and Zambia',
    excerpt: 'A journey through 50 years of history on the Tanzania-Zambia Railway Authority line, exploring its challenges, significance, and future prospects with major Chinese investment.',
    content: '',
    category: 'Infrastructure',
    author: 'Paul Stremple',
    date: 'Dec 28, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp',
    read_time: '8 min read',
    featured: true
  },
  {
    id: 'africoin-launch-2024',
    title: 'Africoin Officially Launches Across 15 African Countries',
    excerpt: 'We are thrilled to announce the official launch of Africoin, bringing seamless cryptocurrency payments to millions across Africa.',
    content: '',
    category: 'Company News',
    author: 'Sarah Okonkwo',
    date: 'Nov 20, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp',
    read_time: '5 min read',
    featured: true
  },
  {
    id: 'mobile-money-integration',
    title: 'How Mobile Money is Revolutionizing African Finance',
    excerpt: 'Exploring the explosive growth of mobile money platforms and their impact on financial inclusion across the continent.',
    content: '',
    category: 'Fintech Trends',
    author: 'James Mwangi',
    date: 'Nov 18, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285110803_c14d926f.webp',
    read_time: '7 min read',
    featured: true
  },
  {
    id: 'crypto-basics-beginners',
    title: "Cryptocurrency 101: A Beginner's Guide for Africans",
    excerpt: 'Everything you need to know about cryptocurrency, blockchain, and how to get started with digital currencies.',
    content: '',
    category: 'Education',
    author: 'Amara Diop',
    date: 'Nov 15, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285111680_3d3e2615.webp',
    read_time: '10 min read',
    featured: false
  },
  {
    id: 'digital-payments-markets',
    title: 'Digital Payments Transform Traditional African Markets',
    excerpt: 'How vendors and small businesses are adopting digital payment solutions to reach more customers.',
    content: '',
    category: 'Case Studies',
    author: 'Kofi Mensah',
    date: 'Nov 12, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285112788_f2d50abf.webp',
    read_time: '6 min read',
    featured: true
  }
];

const categories = ['All', 'Company News', 'Crypto Analysis', 'DeFi', 'Education', 'Market Trends', 'Infrastructure', 'Project Reviews'];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setPosts(data);
      } else {
        // Use fallback data if no posts returned
        setPosts(fallbackPosts);
      }
    } catch (error) {
      console.error('Error fetching posts, using fallback data:', error);
      setPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = posts.filter(post => post.featured);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-orange-900 text-white py-20 pt-32">
        <div className="container mx-auto px-4">
          <Badge className="bg-orange-500 text-white mb-4">Crypto Insights & Analysis</Badge>
          <h1 className="text-5xl font-bold mb-4">Africa Railways Research Hub</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Expert analysis, market trends, and in-depth coverage of crypto projects shaping Africa's digital economy.
          </p>
          <div className="flex gap-4 mt-6">
            <Link to="/reviews">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                <Star className="w-4 h-4 mr-2" /> Project Reviews
              </Button>
            </Link>
            <Link to="/ido">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Rocket className="w-4 h-4 mr-2" /> Active IDOs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Links to Reviews */}
        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/reviews" className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl p-6 text-white hover:opacity-90 transition-opacity">
              <Star className="w-8 h-8 mb-3" />
              <h3 className="text-xl font-bold mb-2">Project Reviews</h3>
              <p className="text-white/80 text-sm mb-3">In-depth analysis of crypto projects with ratings and due diligence</p>
              <span className="flex items-center gap-1 text-sm font-semibold">
                View Reviews <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
            <Link to="/ido" className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white hover:opacity-90 transition-opacity">
              <Rocket className="w-8 h-8 mb-3" />
              <h3 className="text-xl font-bold mb-2">Live IDOs</h3>
              <p className="text-white/80 text-sm mb-3">Participate in verified token launches on PinkSale and more</p>
              <span className="flex items-center gap-1 text-sm font-semibold">
                Join Now <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
            <a href="https://t.me/africarailways" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white hover:opacity-90 transition-opacity">
              <TrendingUp className="w-8 h-8 mb-3" />
              <h3 className="text-xl font-bold mb-2">Get Alpha</h3>
              <p className="text-white/80 text-sm mb-3">Join our Telegram for early access to project launches</p>
              <span className="flex items-center gap-1 text-sm font-semibold">
                Join Community <ChevronRight className="w-4 h-4" />
              </span>
            </a>
          </div>
        </section>

        {/* Featured Banner */}
        <section className="mb-12">
          <MarketingBanner
            badge="Featured IDO"
            title="$SENT Token Live on PinkSale"
            subtitle="Join the Sentinel Network - Africa's railway safety infrastructure token. Audited, verified, and backed by real utility."
            ctaText="Participate Now"
            ctaLink="https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08"
          />
        </section>

        {/* Featured Posts */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Articles</h2>
            <Link to="/reviews" className="text-orange-600 hover:text-orange-700 flex items-center gap-1">
              View All Reviews <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPosts.map(post => (
              <BlogCard key={post.id} {...post} readTime={post.read_time} />
            ))}
          </div>
        </section>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <BlogSearch value={searchQuery} onChange={setSearchQuery} />
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* All Posts */}
        <section>
          <h2 className="text-3xl font-bold mb-8">All Articles</h2>
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <BlogCard key={post.id} {...post} readTime={post.read_time} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
