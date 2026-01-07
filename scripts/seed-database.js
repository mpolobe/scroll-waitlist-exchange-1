#!/usr/bin/env node
/**
 * Seed Database Script
 * Inserts Famous-AI data into Vercel Supabase during build
 * Runs automatically as part of the build process
 */

import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seedLoyaltyTiers() {
  console.log('📊 Seeding loyalty tiers...');
  
  const tiers = [
    {
      name: 'Bronze',
      min_points: 0,
      max_points: 999,
      discount_percent: 0,
      benefits: ['Priority booking access']
    },
    {
      name: 'Silver',
      min_points: 1000,
      max_points: 4999,
      discount_percent: 5,
      benefits: ['5% discount on bookings', 'Priority support']
    },
    {
      name: 'Gold',
      min_points: 5000,
      max_points: 9999,
      discount_percent: 10,
      benefits: ['10% discount on bookings', 'Free seat selection', 'Priority boarding']
    },
    {
      name: 'Platinum',
      min_points: 10000,
      max_points: 999999,
      discount_percent: 15,
      benefits: ['15% discount on bookings', 'Free upgrades', 'Lounge access', 'Dedicated support']
    }
  ];

  for (const tier of tiers) {
    const { error } = await supabase
      .from('loyalty_tiers')
      .upsert(tier, { onConflict: 'name' });
    
    if (error) {
      console.error(`   ❌ Failed to insert ${tier.name}:`, error.message);
    } else {
      console.log(`   ✅ ${tier.name} tier seeded`);
    }
  }
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  const users = [
    {
      id: 'bcaf0b57-107e-442c-919b-c9742edcd8e5',
      email: 'bcm32@njit.edu',
      full_name: 'Benjamin Mpolokoso',
      country: 'Zambia',
      email_verified: false,
      verification_token: 'c4ba76a2-787a-407c-9065-50d8fdd29a9f',
      verification_token_expires: '2025-11-29T00:28:26.338Z',
      created_at: '2025-11-28T00:28:27.557Z',
      updated_at: '2025-11-28T00:28:27.557Z'
    },
    {
      id: '3a3adc5d-7d32-4824-bda9-ed1d8c81f7c2',
      email: 'globaltelecom2000@gmail.com',
      full_name: 'Global Telecom',
      email_verified: false,
      verification_token: 'b4677c36-96b9-431f-b092-ef5ac49d5d19',
      verification_token_expires: '2025-12-07T16:37:58.198Z',
      created_at: '2025-12-06T16:37:59.089Z',
      updated_at: '2025-12-06T16:37:59.089Z'
    }
  ];

  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'id' });
    
    if (error) {
      console.error(`   ❌ Failed to insert ${user.email}:`, error.message);
    } else {
      console.log(`   ✅ ${user.email} seeded`);
    }
  }
}

async function seedLoyaltyPoints() {
  console.log('🎯 Seeding loyalty points...');
  
  const loyaltyPoints = [
    {
      id: '52a03799-0cb7-4ce8-b0b3-57314456e384',
      user_id: 'bcaf0b57-107e-442c-919b-c9742edcd8e5',
      points_balance: 15,
      lifetime_points: 15,
      tier_level: 'Bronze',
      tier_discount_percent: 0,
      created_at: '2025-11-28T17:53:10.757Z',
      updated_at: '2025-11-28T17:53:10.757Z'
    }
  ];

  for (const points of loyaltyPoints) {
    const { error } = await supabase
      .from('loyalty_points')
      .upsert(points, { onConflict: 'user_id' });
    
    if (error) {
      console.error(`   ❌ Failed to insert loyalty points:`, error.message);
    } else {
      console.log(`   ✅ Loyalty points seeded for user ${points.user_id.substring(0, 8)}...`);
    }
  }
}

async function seedPointsTransactions() {
  console.log('💰 Seeding points transactions...');
  
  const transactions = [
    {
      id: '52a03799-0cb7-4ce8-b0b3-57314456e384',
      user_id: 'bcaf0b57-107e-442c-919b-c9742edcd8e5',
      transaction_type: 'earned',
      points_amount: 15,
      points: 15,
      booking_reference: 'ARN-1764352388361',
      description: 'Earned 15 points from booking',
      afc_amount: 155.00,
      created_at: '2025-11-28T17:53:10.757Z'
    }
  ];

  for (const transaction of transactions) {
    const { error } = await supabase
      .from('points_transactions')
      .upsert(transaction, { onConflict: 'id' });
    
    if (error) {
      console.error(`   ❌ Failed to insert transaction:`, error.message);
    } else {
      console.log(`   ✅ Transaction ${transaction.booking_reference} seeded`);
    }
  }
}

async function seedAdminRoles() {
  console.log('🛡️ Seeding admin roles...');
  
  const adminRoles = [
    {
      id: 'e4adac8e-21ab-4b92-abec-b7682db0d8bd',
      user_id: 'bcaf0b57-107e-442c-919b-c9742edcd8e5', // Benjamin Mpolokoso
      role: 'super_admin',
      granted_by: null,
      granted_at: '2025-11-28T00:20:33.423Z'
    }
  ];

  for (const role of adminRoles) {
    // Check if user exists first to avoid FK error
    const { data: user } = await supabase.from('users').select('id').eq('id', role.user_id).single();
    
    if (!user) {
      console.warn(`   ⚠️ Skipping admin role for missing user ${role.user_id}`);
      // In a real scenario, we might want to create the user here if missing, 
      // but we added it to seedUsers() so it should be there.
      continue;
    }

    const { error } = await supabase
      .from('admin_roles')
      .upsert(role, { onConflict: 'id' });
    
    if (error) {
      console.error(`   ❌ Failed to insert admin role:`, error.message);
    } else {
      console.log(`   ✅ Admin role seeded for user ${role.user_id}`);
    }
  }
}

async function seedWallets() {
  console.log('💼 Seeding wallets...');
  
  const users = [
    { id: 'bcaf0b57-107e-442c-919b-c9742edcd8e5', name: 'Benjamin Mpolokoso' },
    { id: '3a3adc5d-7d32-4824-bda9-ed1d8c81f7c2', name: 'Global Telecom' }
  ];

  for (const user of users) {
    // Check if wallet exists
    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existingWallet) {
      const { error } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          balance: 100.00,
          currency: 'USD',
          created_at: '2025-11-28T00:28:27.557Z',
          updated_at: '2025-11-28T00:28:27.557Z'
        });
      
      if (error) {
        console.error(`   ❌ Failed to create wallet for ${user.name}:`, error.message);
      } else {
        console.log(`   ✅ Wallet created for ${user.name}`);
      }
    } else {
      console.log(`   ℹ️ Wallet already exists for ${user.name}`);
    }
  }
}

async function seedBlogPosts() {
  console.log('📝 Seeding blog posts...');
  
  const blogPosts = [
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

1. **Visit Our Website**: Explore our vision in detail at africa-railways.vercel.app
2. **Read the Whitepaper**: Understand the technical and economic architecture.
3. **Meet the Sentinel Network**: Learn about the 2,000+ track workers powering our "Proof-of-Safety" system.
4. **Buy AFC Token**: Now live on Sui mainnet!

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
      read_time: '5 min read',
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
      read_time: '8 min read',
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
      read_time: '5 min read',
      featured: true
    },
    {
      id: 'mobile-money-integration',
      title: 'How Mobile Money is Revolutionizing African Finance',
      excerpt: 'Exploring the explosive growth of mobile money platforms and their impact on financial inclusion across the continent.',
      content: 'Full article content here...',
      category: 'Fintech Trends',
      author: 'James Mwangi',
      date: 'Nov 18, 2024',
      image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285110803_c14d926f.webp',
      read_time: '7 min read',
      featured: true
    },
    {
      id: 'crypto-basics-beginners',
      title: 'Cryptocurrency 101: A Beginner\'s Guide for Africans',
      excerpt: 'Everything you need to know about cryptocurrency, blockchain, and how to get started with digital currencies.',
      content: 'Full article content here...',
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
      content: 'Full article content here...',
      category: 'Case Studies',
      author: 'Kofi Mensah',
      date: 'Nov 12, 2024',
      image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285112788_f2d50abf.webp',
      read_time: '6 min read',
      featured: true
    },
    {
      id: 'blockchain-explained',
      title: 'Understanding Blockchain Technology: The Future of Finance',
      excerpt: 'A deep dive into blockchain technology and why it matters for Africa\'s financial future.',
      content: 'Full article content here...',
      category: 'Technology',
      author: 'Dr. Chinwe Okoro',
      date: 'Nov 10, 2024',
      image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285113670_87a4e142.webp',
      read_time: '8 min read',
      featured: false
    },
    {
      id: 'entrepreneur-success-story',
      title: 'Success Story: How One Entrepreneur Built a Fintech Empire',
      excerpt: 'Meet the visionary founder who is changing the face of digital payments in West Africa.',
      content: 'Full article content here...',
      category: 'Interviews',
      author: 'Grace Adeyemi',
      date: 'Nov 8, 2024',
      image: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285114575_c3462af2.webp',
      read_time: '12 min read',
      featured: false
    }
  ];

  for (const post of blogPosts) {
    const { error } = await supabase
      .from('blog_posts')
      .upsert(post, { onConflict: 'id' });
    
    if (error) {
      console.error(`   ❌ Failed to insert blog post "${post.title}":`, error.message);
    } else {
      console.log(`   ✅ Blog post "${post.title}" seeded`);
    }
  }
}

async function seedRoutes() {
  console.log('🚂 Seeding routes...');
  
  const routes = [
    {
      origin: 'Nairobi',
      destination: 'Mombasa',
      departure_time: '08:00:00',
      arrival_time: '14:30:00',
      duration: '6h 30m',
      price: 150.00,
      available_seats: 45,
      train_number: 'ARN-101'
    },
    {
      origin: 'Nairobi',
      destination: 'Mombasa',
      departure_time: '14:00:00',
      arrival_time: '20:30:00',
      duration: '6h 30m',
      price: 150.00,
      available_seats: 32,
      train_number: 'ARN-102'
    },
    {
      origin: 'Nairobi',
      destination: 'Mombasa',
      departure_time: '20:00:00',
      arrival_time: '02:30:00',
      duration: '6h 30m',
      price: 120.00,
      available_seats: 28,
      train_number: 'ARN-103'
    }
  ];

  for (const route of routes) {
    const { error } = await supabase
      .from('routes')
      .insert(route);
    
    if (error) {
      // If it's a duplicate, try to update instead
      if (error.code === '23505') {
        console.log(`   ℹ️ Route ${route.train_number} already exists`);
      } else {
        console.error(`   ❌ Failed to insert route ${route.train_number}:`, error.message);
      }
    } else {
      console.log(`   ✅ Route ${route.train_number} seeded`);
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('🌱 Database Seeding Started');
  console.log('========================================');
  console.log(`Database: ${SUPABASE_URL}`);
  console.log('========================================\n');

  try {
    // Seed in dependency order
    await seedLoyaltyTiers();
    await seedUsers();
    await seedLoyaltyPoints();
    await seedPointsTransactions();
    await seedAdminRoles();
    await seedWallets();
    await seedBlogPosts();
    await seedRoutes();

    console.log('\n========================================');
    console.log('✅ Database seeding completed successfully!');
    console.log('========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ Database seeding failed:', error.message);
    console.error('========================================\n');
    process.exit(1);
  }
}

// Run seeding
main();
