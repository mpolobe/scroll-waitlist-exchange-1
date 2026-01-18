import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Twitter, Linkedin, Facebook, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlogCard } from '@/components/blog/BlogCard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MarketingNav from '@/components/MarketingNav';

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
    content: `We are excited to announce that the $SENT token Initial DEX Offering (IDO) is now LIVE on PinkSale!

## IDO Details

- **Platform:** PinkSale Fairlaunch
- **Network:** Polygon (MATIC)
- **Start Date:** January 19, 2026
- **End Date:** February 2, 2026
- **Token Price:** $0.00005 per SENT
- **Total for Sale:** 3 Billion SENT tokens

## How to Participate

1. Visit the official PinkSale launchpad: [https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08](https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08)
2. Connect your MetaMask or compatible Polygon wallet
3. Ensure you have MATIC for gas fees and USDT/USDC for contribution
4. Enter your contribution amount and confirm the transaction

## What is SENT?

SENT is the governance token for the Sentinel Network, a decentralized safety reporting system for Africa's railway infrastructure. Over 2,000 track workers across the continent will use SENT to:

- Report safety hazards and infrastructure issues
- Earn rewards through Proof-of-Safety consensus
- Participate in network governance decisions
- Access premium platform features

## Tokenomics

- **Total Supply:** 100 Billion SENT
- **IDO Allocation:** 3 Billion (3%)
- **Vesting:** 10% unlock at TGE, 90% linear vesting over 12 months

## Why Polygon?

We chose Polygon for its low transaction fees, fast confirmation times, and strong ecosystem support. This ensures that railway workers across Africa can participate without prohibitive gas costs.

## Security

The SENT smart contract has been audited and the liquidity will be locked on PinkSale. We are committed to building a transparent and secure platform for Africa's railway community.

Join us in building the future of railway safety infrastructure!

---

*For questions, join our community channels or visit [africarailways.com](https://africarailways.com)*`,
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
    content: `In Dar es Salaam's train station, hundreds of passengers sat amid piles of luggage as a listless breeze blew through the open windows. Shortly before their scheduled 3:50pm departure on the Tanzania-Zambia Railway Authority's (TAZARA) Mukuba Express train, an update crackled over the tannoy: the train would be leaving two hours late.

A collective groan rippled through the crowd, and under the soaring roof of the station, pigeons darted back and forth, disappearing into holes left from rotted-out ceiling tiles. But nobody was really surprised. Given the train's reputation for unreliable service, the passengers knew a two-hour delay for the TAZARA was practically on time.

The railway runs from Tanzania's largest city through the country's southern highlands and across the border into Zambia's copper provinces, finally pulling into the town of Kapiri Mposhi some 1,860 kilometres (1,156 miles) away. It's a journey that, according to official timetables, should take about 40 hours.

For regular passengers, it's a cheap way to reach parts of the country that are not located near main highways. For foreign tourists, it's a unique way to see Tanzania's landscapes far from the bustling cities and overcrowded safari parks, provided they are not in a hurry. A first-class sleeper car all the way to Mbeya, a travel hub and border town just to the east of Zambia, surrounded by lush mountains and coffee farms, is just over $20.

This year, the railroad celebrated its 50th anniversary, but it has struggled for most of its existence, requiring foreign investment for basic upkeep and failing to haul the amount of freight it was built to carry. Inconsistent maintenance and limited investment have seen its infrastructure and cars deteriorate from decades of use.

But big improvements for TAZARA are on the horizon, thanks to a major investment by the China Civil Engineering Construction Corporation (CCECC), which has pledged $1.4bn to refurbish the ageing rail line over the next three years.

Article by Paul Stremple with photos by Kang-Chun Cheng. Originally published by Al Jazeera.`,
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
    content: 'Africoin has officially launched across 15 African countries, marking a significant milestone in our mission to bring accessible digital payments to the continent. Our platform now supports mobile money integration, cross-border transfers, and merchant payments in local currencies.',
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
    content: 'Mobile money has transformed how millions of Africans access financial services. From M-Pesa in Kenya to MTN Mobile Money across West Africa, these platforms have brought banking to the unbanked and created new opportunities for economic participation.',
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
    content: 'Cryptocurrency represents a new frontier in digital finance. This guide covers the basics of blockchain technology, how to safely store and transfer digital assets, and the opportunities cryptocurrency presents for African users.',
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
    content: 'Traditional markets across Africa are embracing digital payments. From Lagos to Nairobi, vendors are discovering that accepting mobile money and cryptocurrency opens new customer bases and simplifies their business operations.',
    category: 'Case Studies',
    author: 'Kofi Mensah',
    date: 'Nov 12, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285112788_f2d50abf.webp',
    read_time: '6 min read',
    featured: true
  }
];

export default function BlogPost() {
  const { slug } = useParams();
  const id = slug; // Support both /blog/:id and /blog/:slug
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
      console.error('Error fetching post from Supabase, using fallback:', error);
      // Use fallback data
      const fallbackPost = fallbackPosts.find(p => p.id === postId);
      if (fallbackPost) {
        setPost(fallbackPost);
        const related = fallbackPosts.filter(p => p.category === fallbackPost.category && p.id !== postId).slice(0, 3);
        setRelatedPosts(related);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category: string, currentId: string) => {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', category)
        .neq('id', currentId)
        .limit(3);
      
      if (data && data.length > 0) {
        setRelatedPosts(data);
      } else {
        // Use fallback related posts
        const related = fallbackPosts.filter(p => p.category === category && p.id !== currentId).slice(0, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      // Use fallback related posts
      const related = fallbackPosts.filter(p => p.category === category && p.id !== currentId).slice(0, 3);
      setRelatedPosts(related);
    }
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
      <MarketingNav />
      <div className="container mx-auto px-4 py-12 pt-24">
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
