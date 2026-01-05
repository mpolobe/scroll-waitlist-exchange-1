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
      if (data) setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
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
