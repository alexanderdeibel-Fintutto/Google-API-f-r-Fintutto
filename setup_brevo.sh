#!/bin/bash
# ============================================================================
# FINTUTTO BREVO SETUP - Komplett-Installation
# ============================================================================

set -e

echo "============================================"
echo "🚀 FINTUTTO Brevo Setup"
echo "============================================"

# Zum richtigen Verzeichnis wechseln
cd ~/Downloads/brevo-integration 2>/dev/null || cd ~/Downloads

# Prüfe ob supabase Ordner existiert
if [ ! -d "supabase/functions" ]; then
    echo "❌ supabase/functions Ordner nicht gefunden!"
    echo ""
    echo "Erstelle Struktur..."
    mkdir -p supabase/functions
fi

# Link zum Projekt
echo ""
echo "📦 1/3 Supabase Projekt verlinken..."
npx supabase link --project-ref aaefocdqgdgexkcrjhks

# Secrets setzen
echo ""
echo "🔐 2/3 Brevo API Key setzen..."
if [ -z "$BREVO_API_KEY" ]; then
    echo "Bitte BREVO_API_KEY eingeben:"
    read -r BREVO_API_KEY
fi
npx supabase secrets set BREVO_API_KEY="$BREVO_API_KEY"

# Functions deployen
echo ""
echo "🚀 3/3 Edge Functions deployen..."

# Prüfe ob Functions existieren
if [ -f "supabase/functions/brevo-core/index.ts" ]; then
    npx supabase functions deploy brevo-core --no-verify-jwt
    echo "✅ brevo-core deployed"
else
    echo "⚠️  brevo-core/index.ts nicht gefunden"
fi

if [ -f "supabase/functions/brevo-events/index.ts" ]; then
    npx supabase functions deploy brevo-events --no-verify-jwt
    echo "✅ brevo-events deployed"
else
    echo "⚠️  brevo-events/index.ts nicht gefunden"
fi

echo ""
echo "============================================"
echo "🎉 FERTIG!"
echo "============================================"
echo ""
echo "Test mit:"
echo "curl -X POST https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/brevo-core \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"action\": \"get_contact\", \"data\": {\"email\": \"test@example.com\"}}'"
echo ""
