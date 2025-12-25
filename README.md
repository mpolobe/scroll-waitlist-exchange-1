# Africoin Wallet - Cryptocurrency Wallet & Payment Platform

A modern cryptocurrency wallet application with AI-powered assistance, built with React, TypeScript, and Vite.

## Features

- **Smart Wallet**: Alchemy-powered smart wallets with passkey authentication
- **AI Assistant**: Gemini-powered chatbot for 24/7 customer support
- **Token Management**: Send/receive ETH, AFC, USDC with gas-sponsored transactions
- **Railway Integration**: Book train tickets and pay with crypto
- **Merchant Portal**: API integration for payment processing
- **Security**: 2FA, fraud detection, and secure authentication

## Prerequisites

- Node.js (v18 or higher)
- Alchemy API key
- Gemini API key (optional, for AI features)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_ALCHEMY_API_KEY=your-alchemy-api-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

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
