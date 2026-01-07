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
    id: 'africa-railways-community-launch',
    title: 'Welcome to Africa Railways: Building the Digital Backbone of Our Continent',
    excerpt: 'Join us in building the world\'s first integrated infrastructure project combining heavy rail logistics with blockchain technology. AFC is now live on Sui mainnet!',
    content: `Welcome to the official community of Africa Railways—the digital backbone connecting our continent's future! 🚂✨

We're thrilled to have you on board. Every new member brings us one step closer to a unified, modern, and prosperous Africa.

## 🗺️ What We're Building

Africa Railways is building the world's first integrated infrastructure project that combines heavy rail logistics with the Sui blockchain. Our mission is simple yet profound: **Connect all 54 African nations through a transparent, secure, and hyper-efficient digital rail network.**

## 💡 What to Expect Here

- **Exclusive Updates**: Be the first to hear about product launches, partnerships, and milestone announcements.
- **Deep-Dive Discussions**: Engage with the team and community on technology, rail development, and blockchain innovation.
- **Community Voice**: Your feedback and ideas will directly shape the project's roadmap.

## 🚀 Get Started & Dive Deeper

1. **Visit Our Website**: Explore our vision in detail at [africa-railways.vercel.app](https://africa-railways.vercel.app)
2. **Read the Whitepaper**: Understand the technical and economic architecture (link in channel description).
3. **Meet the Sentinel Network**: Learn about the 2,000+ track workers powering our "Proof-of-Safety" system.
4. **Buy AFC Token**: Now live on Sui mainnet! [Get AFC on MovePump](https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC)

## 🎯 Our Immediate Focus: The 2026 Roadmap

- **Q1**: SADC Mesh Deployment (Lusaka ↔ Johannesburg)
- **Q2**: Mainnet Launch of the AFRC Token
- **Q4**: Initialization of the Saharan Quartz Corridor

## 💬 Community Guidelines

To keep this a productive space for everyone, we kindly ask you to:

- Be respectful and constructive in all discussions.
- Keep conversations relevant to Africa Railways and its ecosystem.
- Refrain from spamming, promotional posts, or financial advice.

This is more than a Website—it's the command center for a continental transformation.

Thank you for joining the movement. Let's build the future, together.

**For Africa, By Africa.**  
*The Africa Railways Team*

---

📧 Contact: admin@africarailways.com  
🌐 Website: https://www.africarailways.com`,
    category: 'Company News',
    author: 'Africa Railways Team',
    date: 'Jan 7, 2026',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp',
    readTime: '5 min read',
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

It's hard to determine exactly where a trip on the TAZARA will be at any given time, due to the myriad delays and breakdowns that randomise each journey. Simple derailments from poorly loaded cars and deteriorating tracks are common, and then there's the occasional unfortunate brush with nature — in August, service was cancelled after a passenger train struck an African buffalo while passing through Tanzania's Mwalimu Julius Nyerere National Park.

But since the beginning of 2025, the TAZARA has been plagued by more serious incidents — and fatalities — that reveal the desperate need for an overhaul of both ageing infrastructure and poor safety management. In April, two locomotives being moved from Zambia to a workshop in Mbeya for repairs derailed at a bridge in southern Tanzania, killing both drivers.

Two months later, in June, a train derailed in Zambia and was then struck by the "rescue train" dispatched to assist it. The collision killed one TAZARA employee and injured 10 staff and 19 passengers, according to a media release from the railway.

Citing "unexpected operational challenges," passenger service was briefly suspended in early September. As it turned out, the few operational locomotives the TAZARA could field were stuck in Tanzania, after a fire damaged one of the hundreds of bridges along the track.

But big improvements for TAZARA are on the horizon, thanks to a major investment by the China Civil Engineering Construction Corporation (CCECC), which has pledged $1.4bn to refurbish the ageing rail line over the next three years. Though the continuation of passenger service is mentioned in the agreement, construction work will necessitate some pauses to regular service as the project is completed.

Most of the money will be spent on rehabilitating the tracks, but $400m will go toward 32 new locomotives and 762 wagons, "significantly increasing freight and passenger transport capacity," according to a TAZARA statement. In return, the Chinese state-owned corporation will receive a 30-year concession to run the TAZARA railway and recoup its investment before turning day-to-day management back over to Tanzanian and Zambian authorities.

---

*Article by Paul Stremple with photos by Kang-Chun Cheng. Originally published by Al Jazeera. [Read the full story on Al Jazeera](https://www.aljazeera.com/features/longform/2025/12/28/the-tazara-turns-50-riding-the-railway-that-bridges-tanzania-and-zambia)*`,
    category: 'Infrastructure',
    author: 'Paul Stremple',
    date: 'Dec 28, 2024',
    image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp',
    readTime: '8 min read',
    featured: true
  },
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

export const categories = ['All', 'Company News', 'Fintech Trends', 'Education', 'Technology', 'Case Studies', 'Interviews', 'Infrastructure'];
