#!/bin/bash

###############################################################################
# Deployment Setup Script
# 
# This script helps you set up the deployment environment
#
# Usage:
#   ./scripts/setup-deployment.sh [--debug]
#
# Options:
#   --debug    Enable detailed debug logging
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
DEBUG=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --debug)
      DEBUG=true
      shift
      ;;
  esac
done

# Error codes
ERROR_VERCEL_NOT_INSTALLED="E001"
ERROR_VERCEL_LOGIN_FAILED="E002"
ERROR_ENV_SETUP_FAILED="E003"
ERROR_LINK_FAILED="E004"

# Logging functions
log_timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

log_info() {
  echo -e "${BLUE}[$(log_timestamp)] [INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[$(log_timestamp)] [SUCCESS]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[$(log_timestamp)] [WARN]${NC} $1"
}

log_error() {
  local error_code=$1
  shift
  echo -e "${RED}[$(log_timestamp)] [ERROR] [$error_code]${NC} $*"
}

log_debug() {
  if [ "$DEBUG" = true ]; then
    echo -e "${CYAN}[$(log_timestamp)] [DEBUG]${NC} $1"
  fi
}

log_step() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log_info "=== Deployment Setup Script Started ==="
log_debug "Script arguments: $*"
log_debug "Debug mode: $DEBUG"


echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Africoin Deployment Setup                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DEBUG" = true ]; then
  echo -e "${CYAN}🐛 DEBUG MODE ENABLED${NC}"
  echo ""
fi

# Check if Vercel CLI is installed
STEP_START=$(date +%s)
log_step "Step 1: Vercel CLI Check"
log_info "Checking for Vercel CLI installation..."
log_debug "Checking if 'vercel' command is available"

if ! command -v vercel &> /dev/null; then
    log_warn "Vercel CLI not found"
    echo -e "${YELLOW}⚠️  Vercel CLI not found${NC}"
    read -p "Install Vercel CLI? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Installing Vercel CLI..."
        npm install -g vercel
        
        if [ $? -eq 0 ]; then
            VERCEL_VERSION=$(vercel --version)
            log_success "Vercel CLI installed successfully (version: $VERCEL_VERSION)"
            echo -e "${GREEN}✅ Vercel CLI installed${NC}"
        else
            log_error "$ERROR_VERCEL_NOT_INSTALLED" "Failed to install Vercel CLI"
            echo -e "${RED}❌ Failed to install Vercel CLI${NC}"
            exit 1
        fi
    else
        log_error "$ERROR_VERCEL_NOT_INSTALLED" "User declined Vercel CLI installation"
        echo -e "${YELLOW}⚠️  Vercel CLI is required for deployment${NC}"
        exit 1
    fi
else
    VERCEL_VERSION=$(vercel --version)
    log_success "Vercel CLI found (version: $VERCEL_VERSION)"
    log_debug "Vercel CLI path: $(which vercel)"
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
fi

STEP_END=$(date +%s)
STEP_DURATION=$((STEP_END - STEP_START))
log_debug "Vercel CLI check completed in ${STEP_DURATION}s"

# Check if logged in to Vercel
STEP_START=$(date +%s)
log_step "Step 2: Vercel Authentication"
log_info "Checking Vercel authentication status..."
log_debug "Running: vercel whoami"

if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami)
    log_success "Logged in as: $VERCEL_USER"
    log_debug "Vercel user: $VERCEL_USER"
    echo -e "${GREEN}✅ Logged in as: $VERCEL_USER${NC}"
else
    log_warn "Not logged in to Vercel"
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    read -p "Login to Vercel now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Initiating Vercel login..."
        vercel login
        
        if [ $? -eq 0 ]; then
            VERCEL_USER=$(vercel whoami)
            log_success "Logged in as: $VERCEL_USER"
            echo -e "${GREEN}✅ Logged in to Vercel${NC}"
        else
            log_error "$ERROR_VERCEL_LOGIN_FAILED" "Failed to login to Vercel"
            echo -e "${RED}❌ Failed to login to Vercel${NC}"
            exit 1
        fi
    else
        log_error "$ERROR_VERCEL_LOGIN_FAILED" "User declined Vercel login"
        echo -e "${YELLOW}⚠️  You need to login to deploy${NC}"
        exit 1
    fi
fi

STEP_END=$(date +%s)
STEP_DURATION=$((STEP_END - STEP_START))
log_debug "Vercel authentication check completed in ${STEP_DURATION}s"

# Create .env.local if it doesn't exist
STEP_START=$(date +%s)
log_step "Step 3: Environment Variables Setup"
log_info "Setting up environment variables..."
log_debug "Checking for .env.local file"

if [ ! -f .env.local ]; then
    log_info "Creating .env.local from template..."
    echo -e "${YELLOW}Creating .env.local from template...${NC}"
    
    if [ -f .env.example ]; then
        cp .env.example .env.local
        log_success ".env.local created from .env.example"
        echo -e "${GREEN}✅ Created .env.local${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env.local with your actual credentials${NC}"
    else
        log_error "$ERROR_ENV_SETUP_FAILED" ".env.example not found"
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
else
    log_success ".env.local already exists"
    log_debug ".env.local size: $(wc -c < .env.local) bytes"
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

STEP_END=$(date +%s)
STEP_DURATION=$((STEP_END - STEP_START))
log_debug "Environment variables setup completed in ${STEP_DURATION}s"

# Link to Vercel project
STEP_START=$(date +%s)
log_step "Step 4: Vercel Project Linking"
log_info "Preparing to link Vercel project..."
echo ""
echo -e "${BLUE}Linking to Vercel project...${NC}"
read -p "Do you want to link to an existing Vercel project? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "User chose to link to Vercel project"
    log_debug "Running: vercel link"
    vercel link
    
    if [ $? -eq 0 ]; then
        log_success "Successfully linked to Vercel project"
        echo -e "${GREEN}✅ Linked to Vercel project${NC}"
    else
        log_error "$ERROR_LINK_FAILED" "Failed to link to Vercel project"
        echo -e "${RED}❌ Failed to link to Vercel project${NC}"
        exit 1
    fi
else
    log_info "User chose to skip Vercel project linking"
    echo -e "${YELLOW}⚠️  You can link later with: vercel link${NC}"
fi

STEP_END=$(date +%s)
STEP_DURATION=$((STEP_END - STEP_START))
log_debug "Vercel project linking completed in ${STEP_DURATION}s"

# Summary
log_step "Setup Complete!"
log_success "Deployment setup completed successfully"
log_info "=== Deployment Setup Summary ==="
log_info "Vercel CLI: Installed and authenticated"
log_info "Environment: .env.local configured"

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "  1. Edit .env.local with your credentials"
echo -e "  2. Set environment variables in Vercel dashboard"
echo -e "  3. Run deployment:"
echo -e "     ${YELLOW}npm run deploy${NC}         (preview)"
echo -e "     ${YELLOW}npm run deploy:prod${NC}    (production)"
echo ""
echo -e "${BLUE}For more information, see DEPLOYMENT.md${NC}"

log_info "=== Deployment Setup Script Completed ==="
