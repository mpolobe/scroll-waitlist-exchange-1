export interface CryptoProject {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  network: string;
  category: string;
  rating: number;
  auditScore: number;
  launchpad?: string;
  status: 'live' | 'upcoming' | 'ended';
  featured: boolean;
  verified: boolean;
  excerpt: string;
  fullReview: string;
  tokenomics?: {
    totalSupply: string;
    circulatingSupply: string;
    marketCap?: string;
    price?: string;
  };
  links: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    contract?: string;
    launchpad?: string;
  };
  pros: string[];
  cons: string[];
  verdict: string;
  reviewDate: string;
  author: string;
}

export const cryptoProjects: CryptoProject[] = [
  {
    id: 'africa-railways-ecosystem',
    name: 'Africa Railways',
    symbol: 'AFRC',
    logo: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp',
    network: 'Multi-Chain',
    category: 'Infrastructure',
    rating: 9.5,
    auditScore: 98,
    launchpad: 'PinkSale',
    status: 'live',
    featured: true,
    verified: true,
    excerpt: 'The complete ecosystem powering Africa\'s digital railway infrastructure. Includes AFC, SENT, and AFRC tokens across Sui, Polygon, and more.',
    fullReview: `## Overview

Africa Railways is building the world's first integrated infrastructure project combining heavy rail logistics with blockchain technology. The ecosystem includes multiple tokens serving different purposes.

## The Ecosystem

### AFC (Africoin) - Payment Token
- Network: Sui Blockchain
- Use: Railway ticket purchases, merchant payments
- Status: Live on MovePump

### SENT (Sentinel) - Governance Token  
- Network: Polygon
- Use: Safety reporting, worker rewards, governance
- Status: Live IDO on PinkSale

### AFRC - Infrastructure Token
- Network: Multi-chain
- Use: Infrastructure bonds, staking, treasury
- Status: Coming Q2 2026

## Why This Matters

Africa's railway network is undergoing massive expansion with $1.4B+ in Chinese investment. Africa Railways is positioning to be the digital backbone of this transformation.

## The Team

The team includes railway industry veterans, blockchain developers, and African fintech experts. They have partnerships with PinkSale, DEXView, and are building relationships with railway authorities.`,
    tokenomics: {
      totalSupply: 'Multi-token ecosystem',
      circulatingSupply: 'Various',
      marketCap: 'Growing',
    },
    links: {
      website: 'https://africarailways.com',
      twitter: 'https://x.com/africoin_afc',
      telegram: 'https://t.me/Africoin_Official',
      launchpad: 'https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08'
    },
    pros: [
      'Complete ecosystem with multiple tokens',
      'Real infrastructure backing',
      'Multiple blockchain presence',
      'Strong partnerships (PinkSale, DEXView)',
      'Experienced team',
      'Clear roadmap through 2026'
    ],
    cons: [
      'Complex ecosystem to understand',
      'Dependent on African railway development',
      'Early stage for some tokens'
    ],
    verdict: 'Africa Railways represents a unique opportunity to invest in real infrastructure development through blockchain. The multi-token ecosystem provides multiple entry points for investors with different risk appetites. Highly recommended for those bullish on African development.',
    reviewDate: 'Jan 20, 2026',
    author: 'Africa Railways Research'
  },
  {
    id: 'sent-token-sentinel-network',
    name: 'Sentinel Network',
    symbol: 'SENT',
    logo: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp',
    network: 'Polygon',
    category: 'Infrastructure',
    rating: 9.2,
    auditScore: 95,
    launchpad: 'PinkSale',
    status: 'live',
    featured: true,
    verified: true,
    excerpt: 'Decentralized safety reporting system for Africa\'s railway infrastructure. Real utility with 2,000+ track workers using Proof-of-Safety consensus.',
    fullReview: `## Overview

Sentinel Network ($SENT) is a groundbreaking project that brings blockchain technology to Africa's railway infrastructure. Unlike typical meme coins, SENT has real-world utility with over 2,000 track workers already integrated into the system.

## The Problem It Solves

Africa's railway network spans thousands of kilometers but lacks a unified safety reporting system. Track workers often report hazards through outdated methods, leading to delays and safety risks.

## The Solution

SENT implements a "Proof-of-Safety" consensus mechanism where track workers:
- Report safety hazards in real-time
- Earn SENT tokens for verified reports
- Participate in network governance
- Access premium platform features

## Technical Analysis

The smart contract is deployed on Polygon for low gas fees, making it accessible to workers across Africa. The contract has been audited and liquidity is locked on PinkSale.

## Investment Thesis

With real utility and a growing user base, SENT represents a unique opportunity in the crypto space. The project combines DeFi mechanics with real-world infrastructure needs.`,
    tokenomics: {
      totalSupply: '100,000,000,000 SENT',
      circulatingSupply: '3,000,000,000 SENT',
      marketCap: '$150,000',
      price: '$0.00005'
    },
    links: {
      website: 'https://africarailways.com',
      twitter: 'https://x.com/africoin_afc',
      telegram: 'https://t.me/Africoin_Official',
      contract: '0xf366e3aaCC54C99E50c90B7C57625776f88D8d08',
      launchpad: 'https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08'
    },
    pros: [
      'Real utility with 2,000+ active users',
      'Audited smart contract',
      'Locked liquidity on PinkSale',
      'Strong team with infrastructure background',
      'Low market cap with high growth potential'
    ],
    cons: [
      'Early stage project',
      'Limited exchange listings',
      'Dependent on African railway adoption'
    ],
    verdict: 'SENT is a rare find in the crypto space - a project with genuine utility and a clear path to adoption. The combination of real-world infrastructure needs and blockchain technology creates a compelling investment thesis. Recommended for investors looking for high-potential utility tokens.',
    reviewDate: 'Jan 19, 2026',
    author: 'Africa Railways Research'
  },
  {
    id: 'africoin-afc',
    name: 'Africoin',
    symbol: 'AFC',
    logo: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp',
    network: 'Sui',
    category: 'Payments',
    rating: 8.8,
    auditScore: 90,
    launchpad: 'MovePump',
    status: 'live',
    featured: true,
    verified: true,
    excerpt: 'Pan-African payment token on Sui blockchain. Enables cross-border payments and railway ticket purchases across 15 African countries.',
    fullReview: `## Overview

Africoin ($AFC) is the native payment token for the Africa Railways ecosystem, built on the Sui blockchain for fast, low-cost transactions.

## Use Cases

- Railway ticket purchases across 15 African countries
- Cross-border payments and remittances
- Merchant payments at partner locations
- Staking rewards for long-term holders

## Why Sui?

The Sui blockchain offers:
- Sub-second finality
- Near-zero transaction fees
- High throughput for payment processing
- Move language security

## Tokenomics

AFC has a deflationary model with transaction burns and staking rewards. The treasury is managed transparently on-chain.`,
    tokenomics: {
      totalSupply: '1,000,000,000 AFC',
      circulatingSupply: '15,814,949 AFC',
      marketCap: '$1,000',
      price: '$0.0000000515 SUI'
    },
    links: {
      website: 'https://africarailways.com',
      twitter: 'https://x.com/africoin_afc',
      telegram: 'https://t.me/Africoin_Official',
      contract: '0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC',
      launchpad: 'https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC'
    },
    pros: [
      'Built on fast Sui blockchain',
      'Real payment utility',
      'Growing merchant network',
      'Transparent treasury',
      'Active development team'
    ],
    cons: [
      'Low liquidity currently',
      'Sui ecosystem still growing',
      'Requires wallet setup'
    ],
    verdict: 'AFC represents the future of African payments. With real utility and a growing ecosystem, it\'s positioned for significant growth as adoption increases.',
    reviewDate: 'Jan 15, 2026',
    author: 'Africa Railways Research'
  },
  {
    id: 'example-defi-project',
    name: 'AfriSwap',
    symbol: 'ASWAP',
    logo: 'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285110803_c14d926f.webp',
    network: 'BSC',
    category: 'DeFi',
    rating: 7.5,
    auditScore: 85,
    launchpad: 'PinkSale',
    status: 'upcoming',
    featured: false,
    verified: false,
    excerpt: 'Decentralized exchange focused on African tokens and cross-chain swaps. Launching Q1 2026 with innovative liquidity mining.',
    fullReview: `## Overview

AfriSwap aims to be the premier DEX for African crypto projects, offering low-fee swaps and liquidity mining opportunities.

## Features

- Multi-chain support (BSC, Polygon, Sui)
- African token focus
- Liquidity mining rewards
- Governance voting

## Roadmap

- Q1 2026: Mainnet launch
- Q2 2026: Cross-chain bridge
- Q3 2026: Mobile app
- Q4 2026: Fiat on-ramp`,
    tokenomics: {
      totalSupply: '500,000,000 ASWAP',
      circulatingSupply: 'TBA',
    },
    links: {
      website: 'https://afriswap.io',
      twitter: 'https://twitter.com/afriswap',
      telegram: 'https://t.me/afriswap',
    },
    pros: [
      'Focused on underserved market',
      'Multi-chain approach',
      'Strong tokenomics',
      'Experienced team'
    ],
    cons: [
      'Not yet launched',
      'Competitive DEX market',
      'Unaudited contracts'
    ],
    verdict: 'Promising project with a clear market focus. Wait for audit completion and mainnet launch before investing.',
    reviewDate: 'Jan 10, 2026',
    author: 'Africa Railways Research'
  },
  {
    id: 'sui-network-ecosystem',
    name: 'Sui Network',
    symbol: 'SUI',
    logo: 'https://cryptologos.cc/logos/sui-sui-logo.png',
    network: 'Sui',
    category: 'Layer 1',
    rating: 8.5,
    auditScore: 95,
    status: 'live',
    featured: false,
    verified: true,
    excerpt: 'Next-generation Layer 1 blockchain built by former Meta engineers. Fast, scalable, and developer-friendly with Move language.',
    fullReview: `## Overview

Sui is a Layer 1 blockchain designed for high throughput and low latency. Built by Mysten Labs, founded by former Meta (Facebook) engineers who worked on the Diem blockchain.

## Key Features

- **Parallel Transaction Processing**: Unlike traditional blockchains, Sui can process independent transactions in parallel
- **Move Language**: Secure smart contract language originally developed for Diem
- **Object-Centric Model**: Unique data model that enables better scalability
- **Sub-Second Finality**: Transactions confirm in under a second

## Why Africa Railways Chose Sui

We built AFC on Sui because:
1. Low transaction fees (critical for African users)
2. Fast confirmation times
3. Strong security model
4. Growing ecosystem

## Investment Thesis

Sui represents a strong Layer 1 play with solid technology and experienced team. The ecosystem is growing rapidly with DeFi, NFTs, and gaming projects.`,
    tokenomics: {
      totalSupply: '10,000,000,000 SUI',
      circulatingSupply: '2,700,000,000 SUI',
      marketCap: '$3.5B',
      price: '$1.30'
    },
    links: {
      website: 'https://sui.io',
      twitter: 'https://twitter.com/SuiNetwork',
      telegram: 'https://t.me/SuiNetwork',
    },
    pros: [
      'Experienced team from Meta',
      'Innovative technology',
      'Fast and cheap transactions',
      'Growing ecosystem',
      'Strong VC backing'
    ],
    cons: [
      'Relatively new blockchain',
      'Competition from other L1s',
      'Token unlock schedule'
    ],
    verdict: 'Sui is a solid Layer 1 investment with strong fundamentals. The technology is innovative and the team is experienced. Good for long-term holders.',
    reviewDate: 'Jan 5, 2026',
    author: 'Africa Railways Research'
  },
  {
    id: 'polygon-matic',
    name: 'Polygon',
    symbol: 'MATIC',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    network: 'Polygon',
    category: 'Layer 2',
    rating: 8.8,
    auditScore: 98,
    status: 'live',
    featured: false,
    verified: true,
    excerpt: 'Leading Ethereum Layer 2 scaling solution. Home to thousands of dApps and chosen network for SENT token deployment.',
    fullReview: `## Overview

Polygon is the leading Ethereum scaling solution, providing fast and cheap transactions while maintaining Ethereum security.

## Why We Chose Polygon for SENT

The Sentinel Network ($SENT) is deployed on Polygon because:
1. **Low Gas Fees**: Railway workers can transact without high costs
2. **Ethereum Compatibility**: Easy integration with existing tools
3. **Proven Security**: Battle-tested with billions in TVL
4. **Wide Adoption**: Supported by all major wallets and exchanges

## Polygon 2.0

The upcoming Polygon 2.0 upgrade will bring:
- ZK-powered scaling
- Unified liquidity
- Enhanced security

## Investment Thesis

Polygon remains a top Layer 2 choice with strong fundamentals, wide adoption, and continuous innovation.`,
    tokenomics: {
      totalSupply: '10,000,000,000 MATIC',
      circulatingSupply: '9,300,000,000 MATIC',
      marketCap: '$4.5B',
      price: '$0.48'
    },
    links: {
      website: 'https://polygon.technology',
      twitter: 'https://twitter.com/0xPolygon',
      telegram: 'https://t.me/polygonofficial',
    },
    pros: [
      'Market leader in L2',
      'Ethereum security',
      'Massive ecosystem',
      'Continuous innovation',
      'Enterprise adoption'
    ],
    cons: [
      'Competition from other L2s',
      'Token migration to POL',
      'Centralization concerns'
    ],
    verdict: 'Polygon is a blue-chip L2 investment. The ecosystem is mature and the team continues to innovate. Essential holding for any crypto portfolio.',
    reviewDate: 'Jan 3, 2026',
    author: 'Africa Railways Research'
  },
  {
    id: 'pinksale-launchpad',
    name: 'PinkSale',
    symbol: 'PINKSALE',
    logo: 'https://www.pinksale.finance/static/media/pinkswap.a95de4f3.png',
    network: 'Multi-Chain',
    category: 'Launchpad',
    rating: 8.2,
    auditScore: 90,
    status: 'live',
    featured: false,
    verified: true,
    excerpt: 'Leading decentralized launchpad for token sales. Trusted platform for fairlaunches, presales, and token locks.',
    fullReview: `## Overview

PinkSale is the most popular decentralized launchpad in crypto, hosting thousands of token launches across multiple chains.

## Why Projects Choose PinkSale

1. **Decentralized**: No KYC required for participants
2. **Multi-Chain**: Supports BSC, Ethereum, Polygon, Arbitrum, and more
3. **Built-in Tools**: Token locks, vesting, and anti-bot features
4. **Large User Base**: Millions of active users

## Our Experience

Africa Railways launched SENT on PinkSale because:
- Trusted platform with proven track record
- Easy setup and management
- Built-in liquidity locking
- Wide reach to crypto investors

## For Investors

When evaluating PinkSale projects, look for:
- Locked liquidity
- Audited contracts
- Verified team (KYC badge)
- Realistic tokenomics`,
    tokenomics: {
      totalSupply: 'Platform Token',
      circulatingSupply: 'N/A',
    },
    links: {
      website: 'https://www.pinksale.finance',
      twitter: 'https://twitter.com/paboratory',
      telegram: 'https://t.me/PinkSale',
    },
    pros: [
      'Market leading launchpad',
      'Multi-chain support',
      'Built-in security features',
      'Large user base',
      'Easy to use'
    ],
    cons: [
      'Many scam projects launch here',
      'DYOR essential',
      'No guaranteed returns'
    ],
    verdict: 'PinkSale is the go-to launchpad for new token launches. While quality varies, the platform itself is reliable. Always do your own research on individual projects.',
    reviewDate: 'Dec 28, 2025',
    author: 'Africa Railways Research'
  }
];

export const reviewCategories = [
  'All',
  'Infrastructure',
  'Payments',
  'DeFi',
  'GameFi',
  'NFT',
  'Meme',
  'AI',
  'RWA'
];

export const networks = [
  'All Networks',
  'Polygon',
  'Sui',
  'BSC',
  'Ethereum',
  'Solana',
  'Arbitrum',
  'Base'
];

export const launchpads = [
  'PinkSale',
  'Unicrypt',
  'DxSale',
  'MovePump',
  'Gempad',
  'Seedify'
];
