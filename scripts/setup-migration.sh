#!/bin/bash

# Quick Setup Script for Database Migration
# This script helps you set up the environment for migrating from Famous.AI to Vercel Supabase

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Database Migration Quick Setup                          ║"
echo "║   Africoin Wallet - Famous.AI to Vercel Migration         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if src/lib/supabase.ts exists
if [ ! -f "src/lib/supabase.ts" ]; then
    echo "📄 Creating src/lib/supabase.ts from template..."
    cp src/lib/supabase.ts.example src/lib/supabase.ts
    echo "✅ Created src/lib/supabase.ts"
else
    echo "✅ src/lib/supabase.ts already exists"
fi

echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📄 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: You must edit .env.local and add your database credentials!"
    echo ""
    echo "   Required credentials:"
    echo "   - SOURCE_SUPABASE_URL (Famous.AI Supabase URL)"
    echo "   - SOURCE_SUPABASE_KEY (Famous.AI Service Role Key)"
    echo "   - TARGET_SUPABASE_URL (Vercel Supabase URL)"
    echo "   - TARGET_SUPABASE_KEY (Vercel Service Role Key)"
    echo ""
    echo "   See FAMOUS_AI_MIGRATION_GUIDE.md for how to get these credentials."
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Setup Complete!                                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env.local and add your database credentials"
echo "   nano .env.local  (or use your preferred editor)"
echo ""
echo "2. Load environment variables:"
echo "   export \$(cat .env.local | xargs)"
echo ""
echo "3. Verify setup:"
echo "   npm run check:migration"
echo ""
echo "4. Test connection (dry-run):"
echo "   node scripts/migrate-database.js --dry-run --debug"
echo ""
echo "5. Run migration:"
echo "   npm run migrate:db"
echo ""
echo "6. Verify success:"
echo "   npm run verify:migration"
echo ""
echo "📖 For detailed instructions, see: FAMOUS_AI_MIGRATION_GUIDE.md"
echo "🔧 For troubleshooting, see: TROUBLESHOOTING_EMPTY_DATABASE.md"
echo ""
