#!/bin/bash
set -e

echo "=========================================="
echo "⚠️  CRITICAL: Remove .env from Git History"
echo "=========================================="
echo ""
echo "This script will remove .env from all git history."
echo "This requires a FORCE PUSH and will rewrite history."
echo ""
echo "⚠️  WARNING: This is a destructive operation!"
echo "   - All team members must re-clone the repository"
echo "   - Open PRs will need to be rebased"
echo "   - Coordinate with your team before running"
echo ""
echo "Prerequisites:"
echo "  1. Backup your repository"
echo "  2. Notify all team members"
echo "  3. Ensure no one is pushing during this operation"
echo ""

read -p "Have you completed the prerequisites? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
    echo "❌ Cancelled. Complete prerequisites first."
    exit 0
fi

echo ""
echo "🔍 Checking for .env in git history..."
COMMITS=$(git log --all --full-history --pretty=format:"%H" -- .env | wc -l)
echo "Found .env in $COMMITS commits"

if [ "$COMMITS" -eq 0 ]; then
    echo "✅ .env not found in history. Nothing to do."
    exit 0
fi

echo ""
echo "Method 1: Using git filter-repo (recommended)"
echo "----------------------------------------------"
echo "Install: pip install git-filter-repo"
echo ""
echo "Run:"
echo "  git filter-repo --path .env --invert-paths --force"
echo ""
echo "Method 2: Using BFG Repo-Cleaner (alternative)"
echo "----------------------------------------------"
echo "Download from: https://rtyley.github.io/bfg-repo-cleaner/"
echo ""
echo "Run:"
echo "  java -jar bfg.jar --delete-files .env"
echo "  git reflog expire --expire=now --all"
echo "  git gc --prune=now --aggressive"
echo ""
echo "Method 3: Using git filter-branch (legacy)"
echo "----------------------------------------------"
echo "Run:"
cat << 'EOF'
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch .env" \
    --prune-empty --tag-name-filter cat -- --all
  
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
EOF

echo ""
echo "After cleaning history:"
echo "----------------------------------------------"
echo "1. Verify .env is removed:"
echo "   git log --all --full-history -- .env"
echo ""
echo "2. Force push to remote:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. Notify team members to:"
echo "   - Delete their local clones"
echo "   - Re-clone the repository"
echo "   - Recreate their .env from .env.example"
echo ""
echo "4. Rotate ALL credentials that were in .env"
echo ""
echo "=========================================="
echo "⚠️  Remember: This is a destructive operation"
echo "=========================================="
