#!/bin/bash
# PetLegacy Migration Script
# This script renames all MemoriQR references to PetLegacy
# Run this AFTER cloning the repo into a new PetLegacy directory

set -e

echo "🐾 PetLegacy Migration Script"
echo "=============================="
echo ""

# Check we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from the project root."
    exit 1
fi

# Confirm before proceeding
echo "This will rename all MemoriQR references to PetLegacy."
echo "Make sure you've committed any changes first!"
read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "📝 Step 1: Renaming brand references..."

# Define replacements (order matters - do longer strings first)
# Format: old|new

REPLACEMENTS=(
    # Domains and emails
    "memoriqr.co.nz|petlegacy.co.nz"
    "memoriqr.com.au|petlegacy.com.au"
    "dev.memoriqr|dev.petlegacy"
    
    # Email addresses (specific)
    "privacy@memoriqr|privacy@petlegacy"
    "support@memoriqr|support@petlegacy"
    "partners@memoriqr|partners@petlegacy"
    "legal@memoriqr|legal@petlegacy"
    "info@memoriqr|info@petlegacy"
    
    # Brand names (case sensitive - do caps first)
    "MemoriQR|PetLegacy"
    "memoriqr|petlegacy"
    "Memoriqr|Petlegacy"
    "MEMORIQR|PETLEGACY"
)

# File extensions to process
EXTENSIONS="ts tsx js jsx json md css html"

# Build find command for extensions
EXT_ARGS=""
for ext in $EXTENSIONS; do
    if [ -z "$EXT_ARGS" ]; then
        EXT_ARGS="-name \"*.$ext\""
    else
        EXT_ARGS="$EXT_ARGS -o -name \"*.$ext\""
    fi
done

# Apply replacements
for replacement in "${REPLACEMENTS[@]}"; do
    OLD="${replacement%%|*}"
    NEW="${replacement##*|}"
    echo "  Replacing: $OLD → $NEW"
    
    # Use find + sed for cross-platform compatibility
    find . -type f \( $EXT_ARGS \) -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./migration/*" -exec sed -i "s/${OLD}/${NEW}/g" {} + 2>/dev/null || true
done

echo ""
echo "📝 Step 2: Updating package.json..."

# Update package.json name
sed -i 's/"name": "memoriqr"/"name": "petlegacy"/g' package.json
sed -i 's/"name": "petlegacy"/"name": "petlegacy"/g' package.json

echo ""
echo "📝 Step 3: Updating devcontainer.json..."

# Update devcontainer if exists
if [ -f ".devcontainer/devcontainer.json" ]; then
    sed -i 's/MemoriQR Dev/PetLegacy Dev/g' .devcontainer/devcontainer.json
    sed -i 's/memoriqr/petlegacy/g' .devcontainer/devcontainer.json
fi

echo ""
echo "📝 Step 4: Renaming public asset files..."

# Rename logo files if they exist
if [ -d "public/materials/logos" ]; then
    for file in public/materials/logos/memoriqr-*; do
        if [ -f "$file" ]; then
            newname="${file//memoriqr/petlegacy}"
            mv "$file" "$newname" 2>/dev/null || true
            echo "  Renamed: $file → $newname"
        fi
    done
fi

# Rename material files
if [ -d "public/materials" ]; then
    for file in public/materials/memoriqr-*; do
        if [ -f "$file" ]; then
            newname="${file//memoriqr/petlegacy}"
            mv "$file" "$newname" 2>/dev/null || true
            echo "  Renamed: $file → $newname"
        fi
    done
fi

echo ""
echo "📝 Step 5: Creating .env.local template..."

cat > .env.local.example << 'EOF'
# PetLegacy Environment Variables
# Copy this to .env.local and fill in values

# Supabase (same instance, different schema)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database schema (use petlegacy schema)
SUPABASE_SCHEMA=petlegacy

# Stripe (same account)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Site
NEXT_PUBLIC_SITE_URL=https://petlegacy.co.nz
NEXT_PUBLIC_BRAND_NAME=PetLegacy

# Admin
ADMIN_PASSWORD=your-admin-password

# Optional: Pipedream
PIPEDREAM_WEBHOOK_URL=https://your-pipedream-webhook
EOF

echo "  Created .env.local.example"

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "  1. Review changes with: git diff"
echo "  2. Update/create new logos and assets"
echo "  3. Copy .env.local.example to .env.local and fill in values"
echo "  4. Run: npm install"
echo "  5. Run: npm run dev"
echo "  6. Delete files you don't need (see FILES_TO_DELETE.md)"
echo ""
echo "🐾 Welcome to PetLegacy!"
