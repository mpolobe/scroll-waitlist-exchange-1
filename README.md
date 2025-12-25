# Africoin Wallet - Cryptocurrency Wallet & Payment Platform

A modern cryptocurrency wallet application with AI-powered assistance, built with React, TypeScript, and Vite.

## Features

- **Smart Wallet**: Alchemy-powered smart wallets with passkey authentication
- **Phone Authentication**: Sign up and log in with phone number + SMS OTP
- **2FA Wallet Security**: Biometric authentication (Face ID, Touch ID, passkey)
- **AI Assistant**: Gemini-powered chatbot for 24/7 customer support
- **Token Management**: Send/receive ETH, AFC, USDC with gas-sponsored transactions
- **Railway Integration**: Book train tickets and pay with crypto
- **Merchant Portal**: API integration for payment processing
- **Multi-Layer Security**: Separate account and wallet authentication

## Prerequisites

- Node.js (v18 or higher)
- Alchemy API key
- Supabase project (for authentication)
- Gemini API key (optional, for AI features)
- Twilio account (optional, for SMS/phone auth)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Alchemy (Blockchain)
   VITE_ALCHEMY_API_KEY=your-alchemy-api-key
   
   # Supabase (Authentication & Database)
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # Gemini AI (Optional)
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```
   
   **For Phone Authentication:**
   Configure Twilio in Supabase Dashboard:
   - Go to Authentication > Providers > Phone
   - Add your Twilio credentials
   - Enable phone authentication

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
- Biometric authentication (Face ID, Touch ID)
- Passkey support for all devices
- Email OTP as fallback
- Self-custodial wallet with device-level security

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

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase
- **Blockchain**: Alchemy Account Kit (Sepolia testnet)
- **AI**: Google Gemini Pro
- **State**: React Context + TanStack Query
