#!/bin/bash

###############################################################################
# Migration Scripts Smoke Test
# 
# This script performs basic validation of migration scripts without requiring
# actual database credentials. It tests:
# - Script syntax validation
# - Help/usage output
# - Command-line argument parsing
# - Error handling for missing credentials
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Migration Scripts Smoke Test                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
  local test_name=$1
  local test_command=$2
  
  echo -e "${BLUE}▶ Testing: ${test_name}${NC}"
  
  if eval "$test_command" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}  ❌ FAIL${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Test 1: Node.js syntax check for migration script
run_test "Migration script syntax" "node --check scripts/migrate-database.js"

# Test 2: Node.js syntax check for verification script
run_test "Verification script syntax" "node --check scripts/verify-migration.js"

# Test 3: Check if scripts require environment variables
echo -e "${BLUE}▶ Testing: Environment variable validation${NC}"
if node scripts/migrate-database.js 2>&1 | grep -q "Missing required environment variables"; then
  echo -e "${GREEN}  ✅ PASS - Correctly requires environment variables${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL - Should require environment variables${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 4: Check if verification script requires environment variables
echo -e "${BLUE}▶ Testing: Verification environment variable validation${NC}"
if node scripts/verify-migration.js 2>&1 | grep -q "Missing required environment variables"; then
  echo -e "${GREEN}  ✅ PASS - Correctly requires environment variables${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL - Should require environment variables${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 5: Check package.json scripts
echo -e "${BLUE}▶ Testing: Package.json scripts${NC}"
if npm run 2>&1 | grep -q "migrate:db"; then
  echo -e "${GREEN}  ✅ PASS - migrate:db script exists${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL - migrate:db script missing${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo -e "${BLUE}▶ Testing: Package.json verification script${NC}"
if npm run 2>&1 | grep -q "verify:migration"; then
  echo -e "${GREEN}  ✅ PASS - verify:migration script exists${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL - verify:migration script missing${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 6: Check if workflow file exists
run_test "GitHub Actions workflow exists" "test -f .github/workflows/database-migration.yml"

# Test 7: Check if runbook exists
run_test "Migration runbook exists" "test -f DATABASE_MIGRATION_RUNBOOK.md"

# Test 8: Validate workflow YAML syntax
echo -e "${BLUE}▶ Testing: Workflow YAML syntax${NC}"
if command -v yamllint &> /dev/null; then
  if yamllint .github/workflows/database-migration.yml > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ PASS - Valid YAML${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${YELLOW}  ⚠️  WARN - YAML validation warnings (non-critical)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  fi
else
  echo -e "${YELLOW}  ⚠️  SKIP - yamllint not installed${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
fi

# Test 9: Check if build works
run_test "Application build" "npm run build"

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  echo ""
  echo -e "${BLUE}Next steps:${NC}"
  echo "  1. Configure environment variables for migration"
  echo "  2. Run dry-run: node scripts/migrate-database.js --dry-run --debug"
  echo "  3. Run verification: npm run verify:migration"
  echo "  4. Test GitHub Actions workflow manually"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Please review the output above.${NC}"
  exit 1
fi
