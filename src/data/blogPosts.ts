export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  image: string;
  readTime: string;
  featured: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: 'africoin-launch-2024',
    title: 'Africoin Officially Launches Across 15 African Countries',
    excerpt: 'We are thrilled to announce the official launch of Africoin, bringing seamless cryptocurrency payments to millions across Africa.',
    content: 'Full article content here...',
    category: 'Company News',
    author: 'Sarah Okonkwo',
    date: 'Nov 20, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp',
    readTime: '5 min read',
    featured: true
  },
  {
    id: 'mobile-money-integration',
    title: 'How Mobile Money is Revolutionizing African Finance',
    excerpt: 'Exploring the explosive growth of mobile money platforms and their impact on financial inclusion across the continent.',
    content: 'Full article content...',
    category: 'Fintech Trends',
    author: 'James Mwangi',
    date: 'Nov 18, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285110803_c14d926f.webp',
    readTime: '7 min read',
    featured: true
  },
  {
    id: 'crypto-basics-beginners',
    title: 'Cryptocurrency 101: A Beginner\'s Guide for Africans',
    excerpt: 'Everything you need to know about cryptocurrency, blockchain, and how to get started with digital currencies.',
    content: 'Full article content...',
    category: 'Education',
    author: 'Amara Diop',
    date: 'Nov 15, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285111680_3d3e2615.webp',
    readTime: '10 min read',
    featured: false
  },
  {
    id: 'digital-payments-markets',
    title: 'Digital Payments Transform Traditional African Markets',
    excerpt: 'How vendors and small businesses are adopting digital payment solutions to reach more customers.',
    content: 'Full article content...',
    category: 'Case Studies',
    author: 'Kofi Mensah',
    date: 'Nov 12, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285112788_f2d50abf.webp',
    readTime: '6 min read',
    featured: true
  },
  {
    id: 'blockchain-explained',
    title: 'Understanding Blockchain Technology: The Future of Finance',
    excerpt: 'A deep dive into blockchain technology and why it matters for Africa\'s financial future.',
    content: 'Full article content...',
    category: 'Technology',
    author: 'Dr. Chinwe Okoro',
    date: 'Nov 10, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285113670_87a4e142.webp',
    readTime: '8 min read',
    featured: false
  },
  {
    id: 'entrepreneur-success-story',
    title: 'Success Story: How One Entrepreneur Built a Fintech Empire',
    excerpt: 'Meet the visionary founder who is changing the face of digital payments in West Africa.',
    content: 'Full article content...',
    category: 'Interviews',
    author: 'Grace Adeyemi',
    date: 'Nov 8, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285114575_c3462af2.webp',
    readTime: '12 min read',
    featured: false
  }
];

export const categories = ['All', 'Company News', 'Fintech Trends', 'Education', 'Technology', 'Case Studies', 'Interviews'];
