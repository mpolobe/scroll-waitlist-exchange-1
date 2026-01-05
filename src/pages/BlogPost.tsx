import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Twitter, Linkedin, Facebook, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlogCard } from '@/components/blog/BlogCard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchPost(id);
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;
      if (data) {
        setPost(data);
        fetchRelatedPosts(data.category, data.id);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category: string, currentId: string) => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('category', category)
      .neq('id', currentId)
      .limit(3);
    
    if (data) setRelatedPosts(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-orange-600 hover:text-orange-700">Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-96 object-cover" />
          
          <div className="p-8">
            <Badge className="mb-4">{post.category}</Badge>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {post.date}
              </span>
              <span>{post.read_time}</span>
            </div>

            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-xl text-gray-700 leading-relaxed mb-6">{post.excerpt}</p>
              <p className="text-gray-700 leading-relaxed">{post.content}</p>
            </div>

            <div className="flex items-center gap-4 pt-8 border-t">
              <span className="font-semibold">Share:</span>
              <Button variant="outline" size="sm"><Twitter className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm"><Linkedin className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm"><Facebook className="w-4 h-4" /></Button>
            </div>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <div className="max-w-6xl mx-auto mt-16">
            <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map(post => (
                <BlogCard 
                  key={post.id} 
                  {...post} 
                  readTime={post.read_time}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
