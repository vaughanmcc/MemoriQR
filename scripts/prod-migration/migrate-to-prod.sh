#!/bin/bash
# ============================================================================
# MEMORIQR PRODUCTION MIGRATION SCRIPT
# preview-smoke → main
# ============================================================================
#
# This script automates the code deployment.
# Database and Pipedream require manual steps (see CHECKLIST.md)
#
# Usage: ./migrate-to-prod.sh
# ============================================================================

set -e

echo "=============================================="
echo "  MemoriQR Production Migration"
echo "  $(date)"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Run this script from the MemoriQR root directory${NC}"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch:${NC} $CURRENT_BRANCH"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    git status --short
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}STEP 1: Fetch latest changes${NC}"
git fetch origin

echo ""
echo -e "${YELLOW}STEP 2: Check commits to migrate${NC}"
COMMIT_COUNT=$(git log origin/main..origin/preview-smoke --oneline | wc -l)
echo -e "${GREEN}$COMMIT_COUNT commits${NC} to migrate from preview-smoke to main"

if [ "$COMMIT_COUNT" -eq 0 ]; then
    echo -e "${GREEN}Nothing to migrate - branches are in sync!${NC}"
    exit 0
fi

echo ""
echo "Recent commits to migrate:"
git log origin/main..origin/preview-smoke --oneline | head -10
echo ""

read -p "Proceed with migration? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}STEP 3: Checkout main branch${NC}"
git checkout main

echo ""
echo -e "${YELLOW}STEP 4: Pull latest main${NC}"
git pull origin main

echo ""
echo -e "${YELLOW}STEP 5: Merge preview-smoke into main${NC}"
git merge origin/preview-smoke -m "Merge preview-smoke: Production release $(date +%Y-%m-%d)"

echo ""
echo -e "${YELLOW}STEP 6: Push to origin${NC}"
git push origin main

echo ""
echo -e "${GREEN}=============================================="
echo "  CODE DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo -e "${NC}Vercel will auto-deploy to production."
echo ""
echo -e "${YELLOW}REMAINING MANUAL STEPS:${NC}"
echo "  1. Run SQL migration in Supabase PROD"
echo "  2. Create Pipedream workflows"
echo "  3. Add environment variables"
echo ""
echo "See: scripts/prod-migration/CHECKLIST.md"
echo ""
