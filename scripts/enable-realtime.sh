#!/bin/bash
# Enable Realtime for airdrop_status table in Supabase
#
# This script requires the Supabase CLI or direct database access.
# 
# Option 1: Run via Supabase Dashboard
#   1. Go to https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg
#   2. Navigate to SQL Editor
#   3. Run: ALTER PUBLICATION supabase_realtime ADD TABLE airdrop_status;
#
# Option 2: Run via psql (requires database connection string)
#   psql "postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres" \
#     -c "ALTER PUBLICATION supabase_realtime ADD TABLE airdrop_status;"
#
# Option 3: Use Supabase CLI
#   supabase db execute --project-ref llvprbmrnjvamjzavmhg \
#     "ALTER PUBLICATION supabase_realtime ADD TABLE airdrop_status;"

echo "=============================================="
echo "Enable Realtime for airdrop_status table"
echo "=============================================="
echo ""
echo "Run this SQL in Supabase Dashboard > SQL Editor:"
echo ""
echo "  ALTER PUBLICATION supabase_realtime ADD TABLE airdrop_status;"
echo ""
echo "Dashboard URL:"
echo "  https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/sql"
echo ""
echo "Or via Database > Replication:"
echo "  1. Click on 'supabase_realtime' publication"
echo "  2. Toggle 'airdrop_status' table ON"
echo ""
