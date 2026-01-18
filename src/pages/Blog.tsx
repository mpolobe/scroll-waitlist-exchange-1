import { useState, useEffect } from 'react';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MarketingNav from '@/components/MarketingNav';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

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

const categories = ['All', 'Company News', 'Fintech Trends', 'Education', 'Case Studies', 'Infrastructure'];

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
      <div className="bg-gradient-to-r from-orange-600 to-purple-600 text-white py-20 pt-32">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Africoin Blog</h1>
          <p className="text-xl opacity-90">Insights on cryptocurrency, fintech trends, and the future of African finance</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Posts */}
        <section className="mb-16">

          <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
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
