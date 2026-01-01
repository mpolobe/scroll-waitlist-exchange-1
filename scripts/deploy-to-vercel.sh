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
#   ./scripts/deploy-to-vercel.sh [production|preview] [--debug]
#
# Options:
#   production|preview  Deployment type (default: preview)
#   --debug            Enable detailed debug logging
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_TYPE="${1:-preview}"  # Default to preview deployment
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
ERROR_VERCEL_NOT_FOUND="E001"
ERROR_INVALID_DEPLOYMENT_TYPE="E002"
ERROR_BUILD_FAILED="E003"
ERROR_DEPLOYMENT_FAILED="E004"
ERROR_DB_CREDENTIALS_MISSING="E005"
ERROR_DB_MIGRATION_FAILED="E006"

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
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}


log_info "=== Vercel Deployment Script Started ==="
log_debug "Script arguments: $*"
log_debug "Deployment type: $DEPLOYMENT_TYPE"
log_debug "Debug mode: $DEBUG"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Africoin Vercel Deployment Script                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DEBUG" = true ]; then
  echo -e "${CYAN}🐛 DEBUG MODE ENABLED${NC}"
  echo ""
fi

# Check if Vercel CLI is installed
STEP_START=$(date +%s)
log_info "Checking for Vercel CLI..."
log_debug "Checking if 'vercel' command is available"

if ! command -v vercel &> /dev/null; then
    log_error "$ERROR_VERCEL_NOT_FOUND" "Vercel CLI not found"
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    log_info "Installing Vercel CLI..."
    npm install -g vercel
    log_success "Vercel CLI installed successfully"
else
    VERCEL_VERSION=$(vercel --version)
    log_debug "Vercel CLI version: $VERCEL_VERSION"
    log_success "Vercel CLI found (version: $VERCEL_VERSION)"
fi

STEP_END=$(date +%s)
STEP_DURATION=$((STEP_END - STEP_START))
log_debug "Vercel CLI check completed in ${STEP_DURATION}s"

# Validate deployment type
log_info "Validating deployment type..."
if [[ "$DEPLOYMENT_TYPE" != "production" && "$DEPLOYMENT_TYPE" != "preview" ]]; then
    log_error "$ERROR_INVALID_DEPLOYMENT_TYPE" "Invalid deployment type: $DEPLOYMENT_TYPE"
    echo -e "${RED}❌ Invalid deployment type: $DEPLOYMENT_TYPE${NC}"
    echo -e "${YELLOW}Usage: $0 [production|preview] [--debug]${NC}"
    exit 1
fi

log_success "Deployment type validated: $DEPLOYMENT_TYPE"
echo -e "${GREEN}📦 Deployment Type: $DEPLOYMENT_TYPE${NC}"
echo ""

# Step 1: Build the application
STEP_START=$(date +%s)
log_step "Step 1: Building Application"
log_info "Starting build process..."
log_debug "Running: npm run build"

npm run build

if [ $? -eq 0 ]; then
    STEP_END=$(date +%s)
    STEP_DURATION=$((STEP_END - STEP_START))
    log_success "Build successful (took ${STEP_DURATION}s)"
    echo -e "${GREEN}✅ Build successful${NC}"
else
    log_error "$ERROR_BUILD_FAILED" "Build failed"
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""

# Step 2: Deploy to Vercel
STEP_START=$(date +%s)
log_step "Step 2: Deploying to Vercel"
log_info "Starting Vercel deployment..."

if [ "$DEPLOYMENT_TYPE" = "production" ]; then
    log_warn "Deploying to PRODUCTION environment"
    echo -e "${YELLOW}⚠️  Deploying to PRODUCTION${NC}"
    log_debug "Running: vercel --prod --yes"
    DEPLOYMENT_URL=$(vercel --prod --yes 2>&1 | tee /dev/tty | grep -o 'https://[^ ]*' | tail -1)
else
    log_info "Deploying to PREVIEW environment"
    echo -e "${YELLOW}Deploying to PREVIEW${NC}"
    log_debug "Running: vercel --yes"
    DEPLOYMENT_URL=$(vercel --yes 2>&1 | tee /dev/tty | grep -o 'https://[^ ]*' | tail -1)
fi

if [ -z "$DEPLOYMENT_URL" ]; then
    log_error "$ERROR_DEPLOYMENT_FAILED" "Failed to get deployment URL"
    echo -e "${RED}❌ Failed to get deployment URL${NC}"
    exit 1
fi

STEP_END=$(date +%s)
STEP_DURATION=$((STEP_END - STEP_START))
log_success "Deployment successful (took ${STEP_DURATION}s)"
log_info "Deployment URL: $DEPLOYMENT_URL"
echo -e "${GREEN}✅ Deployment successful${NC}"
echo -e "${GREEN}🔗 URL: $DEPLOYMENT_URL${NC}"
echo ""

# Step 3: Migrate Database (Optional)
STEP_START=$(date +%s)
log_step "Step 3: Database Migration"
log_info "Prompting for database migration..."

read -p "Do you want to migrate the database? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "User chose to migrate database"
    log_debug "Checking database credentials..."
    
    # Check if required environment variables are set
    if [ -z "$SOURCE_SUPABASE_URL" ] || [ -z "$SOURCE_SUPABASE_KEY" ]; then
        log_error "$ERROR_DB_CREDENTIALS_MISSING" "Source database credentials not set"
        echo -e "${RED}❌ Source database credentials not set${NC}"
        echo -e "${YELLOW}Please set SOURCE_SUPABASE_URL and SOURCE_SUPABASE_KEY${NC}"
        exit 1
    fi

    if [ -z "$TARGET_SUPABASE_URL" ] || [ -z "$TARGET_SUPABASE_KEY" ]; then
        log_error "$ERROR_DB_CREDENTIALS_MISSING" "Target database credentials not set"
        echo -e "${RED}❌ Target database credentials not set${NC}"
        echo -e "${YELLOW}Please set TARGET_SUPABASE_URL and TARGET_SUPABASE_KEY${NC}"
        exit 1
    fi

    log_success "Database credentials validated"
    log_info "Starting database migration..."
    echo -e "${YELLOW}Starting database migration...${NC}"
    
    # Pass debug flag to migration script if enabled
    MIGRATION_ARGS=""
    if [ "$DEBUG" = true ]; then
        MIGRATION_ARGS="--debug"
        log_debug "Passing --debug flag to migration script"
    fi
    
    log_debug "Running: node scripts/migrate-database.js $MIGRATION_ARGS"
    node scripts/migrate-database.js $MIGRATION_ARGS

    if [ $? -eq 0 ]; then
        STEP_END=$(date +%s)
        STEP_DURATION=$((STEP_END - STEP_START))
        log_success "Database migration successful (took ${STEP_DURATION}s)"
        echo -e "${GREEN}✅ Database migration successful${NC}"
    else
        log_error "$ERROR_DB_MIGRATION_FAILED" "Database migration failed"
        echo -e "${RED}❌ Database migration failed${NC}"
        echo -e "${YELLOW}⚠️  Deployment is live but database may be incomplete${NC}"
        exit 1
    fi
else
    log_info "User chose to skip database migration"
    echo -e "${YELLOW}⏭️  Skipping database migration${NC}"
fi

echo ""

# Step 4: Summary
log_step "Deployment Summary"
log_info "=== Deployment Summary ==="
log_info "Deployment URL: $DEPLOYMENT_URL"
log_info "Deployment Type: $DEPLOYMENT_TYPE"
log_success "Deployment completed successfully"

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

log_info "=== Vercel Deployment Script Completed ==="
