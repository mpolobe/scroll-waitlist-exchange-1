#!/bin/bash

###############################################################################
# Deployment Setup Script
# 
# This script helps you set up the deployment environment
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Africoin Deployment Setup                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found${NC}"
    read -p "Install Vercel CLI? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g vercel
        echo -e "${GREEN}✅ Vercel CLI installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Vercel CLI is required for deployment${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
fi

# Check if logged in to Vercel
echo ""
echo -e "${BLUE}Checking Vercel authentication...${NC}"
if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami)
    echo -e "${GREEN}✅ Logged in as: $VERCEL_USER${NC}"
else
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    read -p "Login to Vercel now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel login
        echo -e "${GREEN}✅ Logged in to Vercel${NC}"
    else
        echo -e "${YELLOW}⚠️  You need to login to deploy${NC}"
        exit 1
    fi
fi

# Create .env.local if it doesn't exist
echo ""
echo -e "${BLUE}Setting up environment variables...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local from template...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env.local with your actual credentials${NC}"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# Link to Vercel project
echo ""
echo -e "${BLUE}Linking to Vercel project...${NC}"
read -p "Do you want to link to an existing Vercel project? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel link
else
    echo -e "${YELLOW}⚠️  You can link later with: vercel link${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "  1. Edit .env.local with your credentials"
echo -e "  2. Set environment variables in Vercel dashboard"
echo -e "  3. Run deployment:"
echo -e "     ${YELLOW}npm run deploy${NC}         (preview)"
echo -e "     ${YELLOW}npm run deploy:prod${NC}    (production)"
echo ""
echo -e "${BLUE}For more information, see DEPLOYMENT.md${NC}"
