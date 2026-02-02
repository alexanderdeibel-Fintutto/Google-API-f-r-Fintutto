#!/usr/bin/env python3
"""
============================================================================
FINTUTTO BREVO TEMPLATES - E-Mail Templates via API erstellen
============================================================================
"""

import requests
import json
import os
import sys
from datetime import datetime

# ============================================================================
# KONFIGURATION
# ============================================================================

BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "")
BREVO_API_URL = "https://api.brevo.com/v3"

if not BREVO_API_KEY:
    print("ERROR: BREVO_API_KEY nicht gesetzt!")
    print("Bitte setze: export BREVO_API_KEY='xkeysib-...'")
    sys.exit(1)

HEADERS = {
    "api-key": BREVO_API_KEY,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

# ============================================================================
# ABSENDER - Vorübergehend alle auf fintutto.de (bis andere Domains verifiziert)
# ============================================================================

# Ändere diese E-Mail auf deine verifizierte Absender-Adresse
DEFAULT_SENDER_EMAIL = "info@fintutto.de"
DEFAULT_SENDER_NAME = "FinTuttO"

SENDERS = {
    "fintutto": {"email": DEFAULT_SENDER_EMAIL, "name": DEFAULT_SENDER_NAME},
    "vermietify": {"email": DEFAULT_SENDER_EMAIL, "name": "Vermietify by FinTuttO"},
    "mieterapp": {"email": DEFAULT_SENDER_EMAIL, "name": "MieterApp by FinTuttO"},
    "hausmeisterpro": {"email": DEFAULT_SENDER_EMAIL, "name": "HausmeisterPro by FinTuttO"},
}

# ============================================================================
# E-MAIL TEMPLATES
# ============================================================================

TEMPLATES = [
    # ----- ONBOARDING VERMIETIFY -----
    {
        "name": "[Vermietify] Willkommen - P01 Starter",
        "subject": "Willkommen bei Vermietify, {{params.FIRSTNAME}}! 🏠",
        "sender": "vermietify",
        "tag": "onboarding",
        "html": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .button:hover { background: #059669; }
        h1 { margin: 0; font-size: 24px; }
        .emoji { font-size: 48px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">🏠</div>
            <h1>Willkommen bei Vermietify!</h1>
        </div>
        <div class="content">
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>herzlich willkommen bei Vermietify! Du hast den ersten Schritt gemacht, um deine Vermietung einfacher und stressfreier zu gestalten.</p>

            <p><strong>Als Erstvermieter starten wir gemeinsam:</strong></p>

            <ul>
                <li>📋 Leg dein erstes Objekt an</li>
                <li>👤 Füge deinen Mieter hinzu</li>
                <li>📊 Behalte alle Zahlungen im Blick</li>
            </ul>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/dashboard" class="button">Jetzt loslegen →</a>
            </p>

            <p>Hast du Fragen? Antworte einfach auf diese E-Mail – wir helfen dir gerne!</p>

            <p>Viele Grüße<br>
            Dein Vermietify Team</p>
        </div>
        <div class="footer">
            <p>Vermietify – Ein Produkt der FinTuttO GmbH</p>
            <p><a href="{{unsubscribe}}">Abmelden</a></p>
        </div>
    </div>
</body>
</html>
        """
    },

    # ----- TRIAL ENDING -----
    {
        "name": "[Vermietify] Trial endet - Upgrade",
        "subject": "{{params.FIRSTNAME}}, dein Trial endet in 3 Tagen ⏰",
        "sender": "vermietify",
        "tag": "lifecycle",
        "html": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .discount { background: #fef3c7; border: 2px dashed #f59e0b; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .discount-code { font-size: 24px; font-weight: bold; color: #d97706; }
        h1 { margin: 0; font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Dein Trial endet bald</h1>
        </div>
        <div class="content">
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>dein kostenloser Testzeitraum bei Vermietify endet in <strong>3 Tagen</strong>.</p>

            <p>In den letzten Tagen hast du:</p>
            <ul>
                <li>{{params.OBJECTS_COUNT}} Objekt(e) angelegt</li>
                <li>{{params.TENANTS_COUNT}} Mieter verwaltet</li>
            </ul>

            <p>Damit du weiterhin alle Funktionen nutzen kannst, haben wir ein besonderes Angebot für dich:</p>

            <div class="discount">
                <p>🎁 <strong>25% Rabatt</strong> auf das Jahresabo</p>
                <p class="discount-code">TRIAL25</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/upgrade?code=TRIAL25" class="button">Jetzt upgraden →</a>
            </p>

            <p>Viele Grüße<br>
            Dein Vermietify Team</p>
        </div>
        <div class="footer">
            <p>Vermietify – Ein Produkt der FinTuttO GmbH</p>
            <p><a href="{{unsubscribe}}">Abmelden</a></p>
        </div>
    </div>
</body>
</html>
        """
    },

    # ----- WIN-BACK -----
    {
        "name": "[Vermietify] Win-Back - Wir vermissen dich",
        "subject": "{{params.FIRSTNAME}}, wir vermissen dich! 💚",
        "sender": "vermietify",
        "tag": "winback",
        "html": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .discount { background: #ede9fe; border: 2px dashed #8b5cf6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .discount-code { font-size: 24px; font-weight: bold; color: #7c3aed; }
        h1 { margin: 0; font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💚 Wir vermissen dich!</h1>
        </div>
        <div class="content">
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>wir haben bemerkt, dass du Vermietify nicht mehr nutzt. Das ist schade – aber wir verstehen, dass manchmal das Timing nicht passt.</p>

            <p><strong>Seitdem hat sich einiges getan:</strong></p>
            <ul>
                <li>🤖 Neuer KI-Assistent für Mietrecht</li>
                <li>📱 Verbesserte Mobile App</li>
                <li>📊 Neue Auswertungen & Reports</li>
            </ul>

            <p>Als Dankeschön für deine Treue:</p>

            <div class="discount">
                <p>🎁 <strong>2 Monate gratis</strong> bei Reaktivierung</p>
                <p class="discount-code">COMEBACK2</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/reactivate?code=COMEBACK2" class="button">Jetzt zurückkommen →</a>
            </p>

            <p>Wir freuen uns auf dich!<br>
            Dein Vermietify Team</p>
        </div>
        <div class="footer">
            <p>Vermietify – Ein Produkt der FinTuttO GmbH</p>
            <p><a href="{{unsubscribe}}">Abmelden</a></p>
        </div>
    </div>
</body>
</html>
        """
    },

    # ----- MIETERAPP WILLKOMMEN -----
    {
        "name": "[MieterApp] Willkommen - Eingeladen",
        "subject": "{{params.FIRSTNAME}}, dein Vermieter hat dich eingeladen! 🏠",
        "sender": "mieterapp",
        "tag": "onboarding",
        "html": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        h1 { margin: 0; font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Willkommen bei MieterApp!</h1>
        </div>
        <div class="content">
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>dein Vermieter nutzt Vermietify und hat dich zur <strong>MieterApp</strong> eingeladen.</p>

            <p><strong>Das kannst du damit machen:</strong></p>
            <ul>
                <li>📱 Schäden direkt per App melden</li>
                <li>💬 Mit deinem Vermieter kommunizieren</li>
                <li>📄 Dokumente einsehen (Mietvertrag, NK-Abrechnung)</li>
                <li>💳 Mietzahlungen im Blick behalten</li>
            </ul>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.mieterapp.de/invite/{{params.INVITE_CODE}}" class="button">App aktivieren →</a>
            </p>

            <p>Die App ist für dich als Mieter <strong>komplett kostenlos</strong>!</p>

            <p>Viele Grüße<br>
            Dein MieterApp Team</p>
        </div>
        <div class="footer">
            <p>MieterApp – Ein Produkt der FinTuttO GmbH</p>
            <p><a href="{{unsubscribe}}">Abmelden</a></p>
        </div>
    </div>
</body>
</html>
        """
    },

    # ----- RECHNER LEAD -----
    {
        "name": "[Rechner] Lead - Ergebnis",
        "subject": "Dein Rechner-Ergebnis ist da! 📊",
        "sender": "fintutto",
        "tag": "lead",
        "html": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .discount { background: #ecfdf5; border: 2px dashed #10b981; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .discount-code { font-size: 24px; font-weight: bold; color: #059669; }
        h1 { margin: 0; font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Dein Rechner-Ergebnis</h1>
        </div>
        <div class="content">
            <p>Hallo,</p>

            <p>danke, dass du unseren <strong>{{params.CALCULATOR_TYPE}}-Rechner</strong> genutzt hast!</p>

            <p>Du interessierst dich für Immobilien? Dann könnte <strong>Vermietify</strong> genau das Richtige für dich sein – unsere All-in-One-Lösung für Vermieter.</p>

            <p><strong>Das bekommst du:</strong></p>
            <ul>
                <li>📋 Alle Objekte und Mieter im Blick</li>
                <li>🤖 KI-Assistent für Mietrecht-Fragen</li>
                <li>📊 Automatische Auswertungen</li>
                <li>📱 Mobile App für unterwegs</li>
            </ul>

            <p>Als Rechner-Nutzer erhältst du:</p>

            <div class="discount">
                <p>🎁 <strong>50% Rabatt</strong> auf den ersten Monat</p>
                <p class="discount-code">RECHNER50</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/signup?code=RECHNER50" class="button">Jetzt testen →</a>
            </p>

            <p>Viele Grüße<br>
            Dein FinTuttO Team</p>
        </div>
        <div class="footer">
            <p>FinTuttO – alles. automatisch. ab jetzt.</p>
            <p><a href="{{unsubscribe}}">Abmelden</a></p>
        </div>
    </div>
</body>
</html>
        """
    },

    # ----- LIMIT REACHED -----
    {
        "name": "[Vermietify] Limit erreicht - Upgrade",
        "subject": "{{params.FIRSTNAME}}, du brauchst mehr Platz! 📈",
        "sender": "vermietify",
        "tag": "upgrade",
        "html": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .discount { background: #ecfdf5; border: 2px dashed #10b981; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .discount-code { font-size: 24px; font-weight: bold; color: #059669; }
        h1 { margin: 0; font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📈 Dein Portfolio wächst!</h1>
        </div>
        <div class="content">
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>Glückwunsch – du hast das <strong>Objekt-Limit</strong> deines aktuellen Plans erreicht!</p>

            <p>Das zeigt, dass dein Immobilien-Portfolio wächst. Zeit für den nächsten Schritt!</p>

            <p><strong>Mit dem Upgrade bekommst du:</strong></p>
            <ul>
                <li>🏠 Unbegrenzte Objekte</li>
                <li>👥 Unbegrenzte Mieter</li>
                <li>🤖 Mehr KI-Anfragen</li>
                <li>📊 Erweiterte Auswertungen</li>
            </ul>

            <div class="discount">
                <p>🎁 <strong>50% Rabatt</strong> auf den ersten Monat</p>
                <p class="discount-code">UPGRADE50</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/upgrade?code=UPGRADE50" class="button">Jetzt upgraden →</a>
            </p>

            <p>Viele Grüße<br>
            Dein Vermietify Team</p>
        </div>
        <div class="footer">
            <p>Vermietify – Ein Produkt der FinTuttO GmbH</p>
            <p><a href="{{unsubscribe}}">Abmelden</a></p>
        </div>
    </div>
</body>
</html>
        """
    },
]

# ============================================================================
# API FUNKTIONEN
# ============================================================================

def create_template(template):
    """Erstellt ein E-Mail Template"""
    sender = SENDERS.get(template["sender"], SENDERS["fintutto"])

    payload = {
        "templateName": template["name"],
        "subject": template["subject"],
        "sender": sender,
        "htmlContent": template["html"].strip(),
        "isActive": True,
        "tag": template.get("tag", "transactional"),
    }

    response = requests.post(
        f"{BREVO_API_URL}/smtp/templates",
        headers=HEADERS,
        json=payload
    )

    if response.status_code == 201:
        data = response.json()
        print(f"  ✓ Template erstellt: {template['name']} (ID: {data.get('id')})")
        return data.get("id")
    elif response.status_code == 400:
        error = response.json()
        if "already exists" in str(error).lower() or "duplicate" in str(error).lower():
            print(f"  ℹ Template existiert: {template['name']}")
            return None
        else:
            print(f"  ✗ Fehler: {error}")
    else:
        print(f"  ✗ Fehler bei {template['name']}: {response.status_code} - {response.text}")

    return None

# ============================================================================
# HAUPTPROGRAMM
# ============================================================================

def main():
    print("=" * 70)
    print("  FINTUTTO BREVO TEMPLATES SETUP")
    print("=" * 70)
    print(f"  Gestartet: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    print()

    print("█" * 70)
    print("  E-MAIL TEMPLATES ERSTELLEN")
    print("█" * 70)
    print()

    template_ids = {}

    for template in TEMPLATES:
        template_id = create_template(template)
        if template_id:
            template_ids[template["name"]] = template_id

    print()
    print("=" * 70)
    print(f"  ✓ {len(template_ids)} Templates erstellt")
    print("=" * 70)
    print()
    print("  Prüfe die Templates: https://app.brevo.com/templates")
    print()

    # JSON Export
    with open("brevo_templates_result.json", "w") as f:
        json.dump({
            "templates": template_ids,
            "created_at": datetime.now().isoformat()
        }, f, indent=2)

    print("  Ergebnis gespeichert: brevo_templates_result.json")
    print()

if __name__ == "__main__":
    main()
