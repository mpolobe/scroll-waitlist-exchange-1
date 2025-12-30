#!/bin/bash

###############################################################################
# Vercel Deployment Script with Database Migration
# 
# This script:
# 1. Deploys the application to Vercel
# 2. Migrates database from Famous.AI to Vercel deployment
# 
# Prerequisites:
# - Vercel CLI installed (npm i -g vercel)
# - Environment variables configured
# 
# Usage:
#   ./scripts/deploy-to-vercel.sh [production|preview]
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_TYPE="${1:-preview}"  # Default to preview deployment

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Africoin Vercel Deployment Script                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Validate deployment type
if [[ "$DEPLOYMENT_TYPE" != "production" && "$DEPLOYMENT_TYPE" != "preview" ]]; then
    echo -e "${RED}❌ Invalid deployment type: $DEPLOYMENT_TYPE${NC}"
    echo -e "${YELLOW}Usage: $0 [production|preview]${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Deployment Type: $DEPLOYMENT_TYPE${NC}"
echo ""

# Step 1: Build the application
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Building Application${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""

# Step 2: Deploy to Vercel
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Deploying to Vercel${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$DEPLOYMENT_TYPE" = "production" ]; then
    echo -e "${YELLOW}⚠️  Deploying to PRODUCTION${NC}"
    DEPLOYMENT_URL=$(vercel --prod --yes 2>&1 | tee /dev/tty | grep -o 'https://[^ ]*' | tail -1)
else
    echo -e "${YELLOW}Deploying to PREVIEW${NC}"
    DEPLOYMENT_URL=$(vercel --yes 2>&1 | tee /dev/tty | grep -o 'https://[^ ]*' | tail -1)
fi

if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${RED}❌ Failed to get deployment URL${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment successful${NC}"
echo -e "${GREEN}🔗 URL: $DEPLOYMENT_URL${NC}"
echo ""

# Step 3: Migrate Database (Optional)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Database Migration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

read -p "Do you want to migrate the database? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if required environment variables are set
    if [ -z "$SOURCE_SUPABASE_URL" ] || [ -z "$SOURCE_SUPABASE_KEY" ]; then
        echo -e "${RED}❌ Source database credentials not set${NC}"
        echo -e "${YELLOW}Please set SOURCE_SUPABASE_URL and SOURCE_SUPABASE_KEY${NC}"
        exit 1
    fi

    if [ -z "$TARGET_SUPABASE_URL" ] || [ -z "$TARGET_SUPABASE_KEY" ]; then
        echo -e "${RED}❌ Target database credentials not set${NC}"
        echo -e "${YELLOW}Please set TARGET_SUPABASE_URL and TARGET_SUPABASE_KEY${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Starting database migration...${NC}"
    node scripts/migrate-database.js

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database migration successful${NC}"
    else
        echo -e "${RED}❌ Database migration failed${NC}"
        echo -e "${YELLOW}⚠️  Deployment is live but database may be incomplete${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⏭️  Skipping database migration${NC}"
fi

echo ""

# Step 4: Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Deployment Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Application deployed successfully${NC}"
echo -e "${GREEN}🔗 Deployment URL: $DEPLOYMENT_URL${NC}"
echo -e "${GREEN}📊 Type: $DEPLOYMENT_TYPE${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Test the deployment at: $DEPLOYMENT_URL"
echo -e "  2. Configure environment variables in Vercel dashboard"
echo -e "  3. Set up custom domain (if needed)"
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
