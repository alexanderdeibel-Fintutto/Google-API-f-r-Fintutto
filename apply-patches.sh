#!/bin/bash

# Fintutto Apps - Patch Application Script (Mac compatible)
# Run this script on your Mac to apply all changes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCHES_DIR="$SCRIPT_DIR/patches"

# Check if patches directory exists
if [ ! -d "$PATCHES_DIR" ]; then
    echo "Error: patches directory not found at $PATCHES_DIR"
    exit 1
fi

# Create temp directory for cloning
WORK_DIR="/tmp/fintutto-deploy"
mkdir -p "$WORK_DIR"

echo "=========================================="
echo "Fintutto Apps - Deployment Script"
echo "=========================================="
echo ""

# Function to process each app
process_app() {
    local app="$1"
    local repo="$2"
    local patch_dir="$PATCHES_DIR/$app"

    if [ ! -d "$patch_dir" ]; then
        echo "⚠️  No patches found for $app, skipping..."
        return
    fi

    echo "📦 Processing $app..."

    cd "$WORK_DIR"

    # Clone the repo
    if [ -d "$WORK_DIR/$app" ]; then
        rm -rf "$WORK_DIR/$app"
    fi

    git clone "https://github.com/$repo.git" "$app" 2>/dev/null

    if [ $? -ne 0 ]; then
        echo "❌ Failed to clone $app"
        return
    fi

    cd "$app"

    # Apply patches
    for patch in "$patch_dir"/*.patch; do
        if [ -f "$patch" ]; then
            echo "   Applying patch: $(basename "$patch")"
            git am "$patch" 2>/dev/null

            if [ $? -ne 0 ]; then
                echo "   ⚠️  Patch failed, trying with 3-way merge..."
                git am --abort 2>/dev/null
                git am -3 "$patch" 2>/dev/null

                if [ $? -ne 0 ]; then
                    echo "   ❌ Could not apply patch for $app"
                    git am --abort 2>/dev/null
                    return
                fi
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

    echo ""
}

# Process all apps
process_app "check-mieterhoehung2-fintutto" "alexanderdeibel-Fintutto/check-mieterhoehung2-fintutto"
process_app "deposit-check-pro" "alexanderdeibel-Fintutto/deposit-check-pro"
process_app "grundsteuer-easy" "alexanderdeibel-Fintutto/grundsteuer-easy"
process_app "k-ndigungs-check-pro" "alexanderdeibel-Fintutto/k-ndigungs-check-pro"
process_app "kaution-klar" "alexanderdeibel-Fintutto/kaution-klar"
process_app "miet-check-pro" "alexanderdeibel-Fintutto/miet-check-pro"
process_app "my-deposit-calculator" "alexanderdeibel-Fintutto/my-deposit-calculator"
process_app "property-equity-partner" "alexanderdeibel-Fintutto/property-equity-partner"
process_app "rent-check-buddy" "alexanderdeibel-Fintutto/rent-check-buddy"
process_app "schoenheit-fintutto" "alexanderdeibel-Fintutto/schoenheit-fintutto"
process_app "your-property-costs" "alexanderdeibel-Fintutto/your-property-costs"

echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
