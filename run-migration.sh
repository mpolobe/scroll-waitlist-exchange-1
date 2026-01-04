#!/bin/bash
# run-migration.sh
# Quick migration runner with pre-configured Vercel Supabase credentials

# Set Vercel Supabase credentials (destination)
export NEXT_PUBLIC_SUPABASE_URL='https://llvprbmrnjvamjzavmhg.supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdnByYm1ybmp2YW1qemF2bWhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0NDU1MiwiZXhwIjoyMDgxMzIwNTUyfQ.yfdj690DOhgtlLXENe8nd5y22IFq5N1gtNZ2vnpHcKI'

echo "=========================================="
echo "🚀 Database Migration Options"
echo "=========================================="
echo ""
echo "Choose migration method:"
echo ""
echo "1. Direct migration (requires service_role key)"
echo "2. Famous-AI API migration (requires anon key)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    # Direct migration
    if [ -z "$FAMOUS_AI_SUPABASE_KEY" ]; then
        echo ""
        echo "❌ Error: FAMOUS_AI_SUPABASE_KEY not set"
        echo ""
        echo "Please get your Famous-AI Supabase service_role key and run:"
        echo "export FAMOUS_AI_SUPABASE_KEY='your-famous-ai-service-role-key'"
        echo ""
        exit 1
    fi
    
    echo ""
    echo "Starting direct migration..."
    node migrate-db.js
    
elif [ "$choice" = "2" ]; then
    # API migration
    if [ -z "$FAMOUS_AI_ANON_KEY" ]; then
        echo ""
        echo "❌ Error: FAMOUS_AI_ANON_KEY not set"
        echo ""
        echo "Please get your Famous-AI Supabase anon (public) key and run:"
        echo "export FAMOUS_AI_ANON_KEY='your-famous-ai-anon-key'"
        echo ""
        echo "This key should be visible in Famous-AI project settings"
        echo "It's a JWT token starting with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        echo ""
        exit 1
    fi
    
    echo ""
    echo "Starting API-based migration..."
    node migrate-via-famous-api.js
    
else
    echo "Invalid choice. Please run again and enter 1 or 2."
    exit 1
fi
