# Africoin Wallet - Africa Railways Integration

A modern web and mobile application for the Africoin digital wallet with integrated railway booking system across Africa. Built with React, TypeScript, and blockchain technology.

## Features

- **Digital Wallet**: Secure cryptocurrency wallet powered by Alchemy Account Kit
- **Railway Booking**: Book train tickets across African railway networks
- **Loyalty Program**: Earn and redeem points with tiered benefits
- **Multi-Currency Support**: Handle transactions in multiple currencies
- **Mobile Support**: Native iOS and Android apps via Capacitor
- **AI Assistant**: Integrated Gemini AI chatbot for customer support
- **Admin Dashboard**: Comprehensive management interface
- **Merchant Portal**: API integration for third-party merchants

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Router** - Navigation

### Backend & Services
- **Supabase** - Database and authentication
- **Alchemy Account Kit** - Blockchain wallet infrastructure
- **WalletConnect** - Web3 connectivity
- **Sui Blockchain** - zkLogin integration
- **Google Gemini AI** - Chatbot functionality

### Mobile
- **Capacitor** - Cross-platform mobile framework
- **Android & iOS** - Native app support

## Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mpolobe/scroll-waitlist-exchange-1.git
cd scroll-waitlist-exchange-1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Start development server:
```bash
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080)

## Environment Variables

Required environment variables (see `.env.example` for full list):

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Alchemy Account Kit
VITE_ALCHEMY_API_KEY=your_alchemy_api_key

# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run seed:db      # Seed database with initial data
```

## Project Structure

```
src/
├── components/      # React components
│   ├── admin/      # Admin dashboard components
│   ├── auth/       # Authentication components
│   ├── booking/    # Railway booking components
│   ├── wallet/     # Wallet components
│   └── ui/         # Reusable UI components
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── lib/            # Utilities and services
├── pages/          # Route pages
└── services/       # API services
```

## Mobile Development

### Android
```bash
npm run build
npx cap sync android
npx cap open android
```

### iOS
```bash
npm run build
npx cap sync ios
npx cap open ios
```

## Deployment

### Vercel (Recommended)
The project is configured for automatic deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Push to `main` branch to trigger deployment

### Manual Deployment
```bash
npm run build
# Deploy the dist/ directory to your hosting provider
```

## Documentation

- [Setup Guide](./QUICK_SETUP.md)
- [GitHub Secrets Setup](./GITHUB_SECRETS_SETUP.md)
- [Project Audit Report](./PROJECT_AUDIT_REPORT.md)
- [Security Documentation](./SECURITY.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- Never commit `.env` files
- Rotate credentials regularly
- Report security issues to the maintainers
- See [SECURITY.md](./SECURITY.md) for details

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@africoin.com or open an issue in the repository.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Blockchain infrastructure by [Alchemy](https://www.alchemy.com/)
- Backend powered by [Supabase](https://supabase.com/)
