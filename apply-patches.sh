#!/bin/bash

# Fintutto Apps - Patch Application Script
# Run this script on your Mac to apply all changes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCHES_DIR="$SCRIPT_DIR/patches"

# Check if patches directory exists
if [ ! -d "$PATCHES_DIR" ]; then
    echo "Error: patches directory not found at $PATCHES_DIR"
    exit 1
fi

# Define the apps and their GitHub repos
declare -A APPS=(
    ["check-mieterhoehung2-fintutto"]="alexanderdeibel-Fintutto/check-mieterhoehung2-fintutto"
    ["deposit-check-pro"]="alexanderdeibel-Fintutto/deposit-check-pro"
    ["grundsteuer-easy"]="alexanderdeibel-Fintutto/grundsteuer-easy"
    ["k-ndigungs-check-pro"]="alexanderdeibel-Fintutto/k-ndigungs-check-pro"
    ["kaution-klar"]="alexanderdeibel-Fintutto/kaution-klar"
    ["miet-check-pro"]="alexanderdeibel-Fintutto/miet-check-pro"
    ["my-deposit-calculator"]="alexanderdeibel-Fintutto/my-deposit-calculator"
    ["property-equity-partner"]="alexanderdeibel-Fintutto/property-equity-partner"
    ["rent-check-buddy"]="alexanderdeibel-Fintutto/rent-check-buddy"
    ["schoenheit-fintutto"]="alexanderdeibel-Fintutto/schoenheit-fintutto"
    ["your-property-costs"]="alexanderdeibel-Fintutto/your-property-costs"
)

# Create temp directory for cloning
WORK_DIR="/tmp/fintutto-deploy"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

echo "=========================================="
echo "Fintutto Apps - Deployment Script"
echo "=========================================="
echo ""

for app in "${!APPS[@]}"; do
    repo="${APPS[$app]}"
    patch_dir="$PATCHES_DIR/$app"

    if [ ! -d "$patch_dir" ]; then
        echo "⚠️  No patches found for $app, skipping..."
        continue
    fi

    echo "📦 Processing $app..."

    # Clone the repo
    if [ -d "$WORK_DIR/$app" ]; then
        rm -rf "$WORK_DIR/$app"
    fi

    git clone "https://github.com/$repo.git" "$app" 2>/dev/null

    if [ $? -ne 0 ]; then
        echo "❌ Failed to clone $app"
        continue
    fi

    cd "$app"

    # Apply patches
    for patch in "$patch_dir"/*.patch; do
        echo "   Applying patch: $(basename "$patch")"
        git am "$patch" 2>/dev/null

        if [ $? -ne 0 ]; then
            echo "   ⚠️  Patch failed, trying with 3-way merge..."
            git am --abort 2>/dev/null
            git am -3 "$patch" 2>/dev/null

            if [ $? -ne 0 ]; then
                echo "   ❌ Could not apply patch for $app"
                git am --abort 2>/dev/null
                cd "$WORK_DIR"
                continue
            fi
        fi
    done

    # Push changes
    echo "   Pushing changes..."
    git push origin main 2>/dev/null

    if [ $? -eq 0 ]; then
        echo "✅ $app updated successfully!"
    else
        echo "❌ Failed to push $app (check authentication)"
    fi

    cd "$WORK_DIR"
    echo ""
done

echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check each Lovable app for deployment status"
echo "2. Configure Supabase environment variables"
echo "3. Set up DNS records for SEO domains"
echo ""
