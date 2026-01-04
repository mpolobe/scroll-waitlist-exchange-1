#!/bin/bash
# migrate-famous-to-vercel.sh

set -e

echo "=========================================="
echo "Famous-AI Supabase → Vercel Supabase"
echo "=========================================="
echo ""

# Check required environment variables
if [ -z "$FAMOUS_AI_SUPABASE_KEY" ]; then
    echo "❌ Error: FAMOUS_AI_SUPABASE_KEY not set"
    echo ""
    echo "Get your Famous-AI Supabase key:"
    echo "1. Go to Famous-AI project settings"
    echo "2. Navigate to Database → Settings → API"
    echo "3. Copy the 'service_role' key (not anon key)"
    echo ""
    echo "Then run:"
    echo "export FAMOUS_AI_SUPABASE_KEY='your-key-here'"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not set"
    echo ""
    echo "Get your Vercel Supabase service role key:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Settings → API → service_role key"
    echo ""
    echo "Then run:"
    echo "export SUPABASE_SERVICE_ROLE_KEY='your-key-here'"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Compile TypeScript
echo "Compiling migration script..."
npx tsc scripts/migrate-supabase-to-supabase.ts --outDir dist --esModuleInterop

# Run migration
echo ""
echo "Starting migration..."
echo ""
node dist/migrate-supabase-to-supabase.js

echo ""
echo "=========================================="
echo "✅ Migration Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify data in Vercel Supabase dashboard"
echo "2. Test your application with new database"
echo "3. Update environment variables if needed"
echo "4. Detach Famous-AI database once verified"
