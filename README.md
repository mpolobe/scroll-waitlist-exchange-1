# Africoin Wallet - Cryptocurrency Wallet & Payment Platform

A modern cryptocurrency wallet application with AI-powered assistance, built with React, TypeScript, and Vite.

## Features

- **Smart Wallet**: Alchemy-powered smart wallets with passkey authentication
- **Phone Authentication**: Sign up and log in with phone number + SMS OTP
- **2FA Wallet Security**: Biometric authentication (Face ID, Touch ID, passkey)
- **AI Assistant**: Gemini-powered chatbot for 24/7 customer support
- **Token Management**: Send/receive ETH, AFC, USDC with gas-sponsored transactions
- **Africa Railways Integration**: Real railway booking with Sui blockchain backend
- **Cross-Chain Payments**: Bridge AFC (Ethereum) to AFRC (Sui) for bookings
- **Real-Time Tracking**: Live train telemetry and sentinel network integration
- **Merchant Portal**: API integration for payment processing
- **Multi-Layer Security**: Separate account and wallet authentication

## Prerequisites

- Node.js (v18 or higher)
- Alchemy Account Kit API key and Configuration (required for wallet features)
- Alchemy Gas Manager Policy ID (optional, for sponsored transactions)
- Supabase project (authentication & database)
- Gemini API key (optional, for AI chatbot)
- Twilio account (optional, for SMS/phone auth)
- Africa Railways API key (optional, for real railway bookings)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env.local` file in the root directory (see `.env.example` for template):
   ```env
   # Alchemy Account Kit (Required for wallet features)
   VITE_ALCHEMY_API_KEY=your-alchemy-api-key
   VITE_ALCHEMY_GAS_POLICY_ID=your-gas-policy-id  # Optional, for sponsored transactions
   
   # Supabase (Authentication & Database)
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # Gemini AI (Optional)
   VITE_GEMINI_API_KEY=your-gemini-api-key
   
   # Africa Railways Integration (Optional)
   VITE_AFRICA_RAILWAYS_API_URL=https://api.africa-railways.com
   AFRICA_RAILWAYS_API_KEY=your-africa-railways-api-key
   VITE_SUI_NETWORK=testnet
   ```
   
   **Setting up Alchemy Account Kit:**
   1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/)
   2. Create a new app or select existing app
   3. Copy your API key
   4. Go to [Smart Wallets Configuration](https://dashboard.alchemy.com/services/smart-wallets/configuration)
   5. Create a new configuration and enable desired login methods (email, social, passkeys)
   6. (Optional) Create a [Gas Manager Policy](https://dashboard.alchemy.com/services/gas-manager/configuration) for sponsored transactions
   
   **For Phone Authentication:**
   Configure Twilio in Supabase Dashboard:
   - Go to Authentication > Providers > Phone
   - Add your Twilio credentials
   - Enable phone authentication
   
   **For Africa Railways Integration:**
   - Contact Africa Railways for API access
   - Configure bridge service for cross-chain payments
   - See `AFRICA_RAILWAYS_INTEGRATION.md` for details

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Authentication

### Phone Number Login
- Sign up with phone number + SMS OTP
- International format required (+country code)
- Secure 6-digit verification code
- Rate-limited to prevent abuse

### Wallet Security (2FA)
- Email authentication (primary method)
- Social login (Google, Facebook)
- Passkey support (Face ID, Touch ID, device passcode) - added after initial login
- Self-custodial wallet with device-level security

**Important:** Passkeys (Face ID, Touch ID, Passcode) are added AFTER you authenticate with email or social login. They cannot be used as the primary authentication method without first logging in.

### Two-Layer Security
1. **Account Layer**: Phone/email authentication via Supabase
2. **Wallet Layer**: Biometric/passkey authentication via Alchemy

## AI Assistant

The Gemini AI chatbot provides:
- Wallet and transaction help
- Blockchain concept explanations
- Railway booking assistance
- Security guidance
- 24/7 support

To enable AI features, add your Gemini API key to `.env.local`.

## Africa Railways Integration

### Overview
Africoin Wallet integrates with Africa Railways' Sui blockchain infrastructure for real railway bookings across 54 African nations.

### Features
- **Real Railway Data**: Live train schedules and seat availability
- **Cross-Chain Payments**: AFC (Ethereum) → AFRC (Sui) bridge
- **Real-Time Tracking**: WebSocket-based train telemetry
- **Sentinel Network**: Safety reports and track worker alerts
- **Blockchain Tickets**: Sui Move-based digital tickets

### Demo
Visit `/africa-railways-demo` to see the integration in action.

### Documentation
See `AFRICA_RAILWAYS_INTEGRATION.md` for:
- Complete architecture specifications
- 4-phase implementation plan (16 weeks)
- API endpoint documentation
- Security considerations
- Cost analysis

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase
- **Blockchain**: Alchemy Account Kit (Sepolia testnet)
- **AI**: Google Gemini Pro
- **State**: React Context + TanStack Query
