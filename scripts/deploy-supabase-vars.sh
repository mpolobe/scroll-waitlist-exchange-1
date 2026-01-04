#!/bin/bash

# =============================================================================
# Deploy Supabase Environment Variables Script
# =============================================================================
#
# Purpose:
#   This script helps you set up Supabase environment variables for Vercel
#   deployment by reading your local .env.local file and providing step-by-step
#   instructions for configuring them in Vercel.
#
# Usage:
#   ./scripts/deploy-supabase-vars.sh
#
# Prerequisites:
#   - .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set
#   - Vercel CLI installed (optional, for CLI deployment)
#   - Vercel account and project set up
#
# What this script does:
#   1. Checks if .env.local exists
#   2. Extracts Supabase environment variables
#   3. Provides instructions for setting variables in Vercel Dashboard
#   4. Provides instructions for using Vercel CLI
#
# Note:
#   This script does NOT automatically deploy to Vercel. It only provides
#   guidance and checks your local configuration.
#
# =============================================================================

set -e

echo "================================================"
echo "  Supabase Environment Variables Setup Helper"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} Found .env.local file"
    
    # Extract Supabase variables (handle values properly, even with quotes or extra =)
    SUPABASE_URL=$(grep "^VITE_SUPABASE_URL=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    SUPABASE_KEY=$(grep "^VITE_SUPABASE_ANON_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
        echo -e "${RED}✗${NC} Missing Supabase variables in .env.local"
        echo ""
        echo "Please ensure your .env.local file contains:"
        echo "  VITE_SUPABASE_URL=your-url"
        echo "  VITE_SUPABASE_ANON_KEY=your-key"
        exit 1
    fi
    
    echo -e "${GREEN}✓${NC} Found Supabase variables in .env.local"
    echo ""
else
    echo -e "${YELLOW}⚠${NC}  No .env.local file found"
    echo ""
    echo "Please create a .env.local file with your Supabase credentials:"
    echo "  VITE_SUPABASE_URL=your-url"
    echo "  VITE_SUPABASE_ANON_KEY=your-key"
    echo ""
    echo "You can copy from .env.example:"
    echo "  cp .env.example .env.local"
    exit 1
fi

echo "================================================"
echo "  Vercel Deployment Instructions"
echo "================================================"
echo ""
echo "To deploy these environment variables to Vercel:"
echo ""
echo "1. Install Vercel CLI (if not already installed):"
echo "   ${GREEN}npm i -g vercel${NC}"
echo ""
echo "2. Login to Vercel:"
echo "   ${GREEN}vercel login${NC}"
echo ""
echo "3. Link your project (if not already linked):"
echo "   ${GREEN}vercel link${NC}"
echo ""
echo "4. Set environment variables using these commands:"
echo ""
echo "   ${GREEN}vercel env add VITE_SUPABASE_URL production${NC}"
echo "   (then paste: ${SUPABASE_URL})"
echo ""
echo "   ${GREEN}vercel env add VITE_SUPABASE_ANON_KEY production${NC}"
echo "   (then paste: ${SUPABASE_KEY})"
echo ""
echo "5. Alternatively, set them in Vercel Dashboard:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Select your project"
echo "   - Go to Settings > Environment Variables"
echo "   - Add:"
echo "     * VITE_SUPABASE_URL = ${SUPABASE_URL}"
echo "     * VITE_SUPABASE_ANON_KEY = [your-key]"
echo ""
echo "6. Redeploy your application:"
echo "   ${GREEN}vercel --prod${NC}"
echo ""
echo "================================================"
echo ""
echo -e "${GREEN}Environment variables are ready for deployment!${NC}"
echo ""
