#!/usr/bin/env python3
"""
============================================================================
FINTUTTO BREVO TEMPLATES - Persona-basiertes Template-System
============================================================================
Erstellt E-Mail Templates für alle Personas und Produkt-Tiers:

VERMIETIFY (Vermieter):
- P01 Starter Stefan (1 Objekt, Neuling)
- P02 Hobby-Heike (2-5 Objekte, Nebentätigkeit)
- P03 Profi-Paul (6-30 Objekte, Portfolio)
- P04 Senior-Siegfried (65+, Komfort & Einfachheit)
- D1 Erbin-Emma (Frisch geerbt, braucht Unterstützung)

MIETERAPP (Mieter):
- P09 Mieter eingeladen (vom Vermieter)
- P10 Mieter selbst (selbst registriert)

HAUSMEISTERPRO (Facility Management):
- C1-GO Angestellter Hausmeister
- C1-PRO Selbständiger Hausmeister
- C1-ENT Facility Management Firma

B2B PARTNER:
- C2 StB-Sabine (Steuerberater)
- C3 Makler-Marco (Immobilienmakler)

RECHNER/LEADS:
- P05 Investor-Ingo (Kaufinteressent via Rechner)
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
# ABSENDER - Muss exakt mit Brevo-Registrierung übereinstimmen!
# ============================================================================

DEFAULT_SENDER_EMAIL = "info@fintutto.de"
DEFAULT_SENDER_NAME = "FinTutto"

SENDERS = {
    "fintutto": {"email": DEFAULT_SENDER_EMAIL, "name": DEFAULT_SENDER_NAME},
    "vermietify": {"email": DEFAULT_SENDER_EMAIL, "name": DEFAULT_SENDER_NAME},
    "mieterapp": {"email": DEFAULT_SENDER_EMAIL, "name": DEFAULT_SENDER_NAME},
    "hausmeisterpro": {"email": DEFAULT_SENDER_EMAIL, "name": DEFAULT_SENDER_NAME},
}

# ============================================================================
# FARBEN PRO PRODUKT
# ============================================================================

COLORS = {
    "vermietify": {
        "primary": "#10b981",
        "secondary": "#059669",
        "gradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    "mieterapp": {
        "primary": "#3b82f6",
        "secondary": "#2563eb",
        "gradient": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
    },
    "hausmeisterpro": {
        "primary": "#f97316",
        "secondary": "#ea580c",
        "gradient": "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
    },
    "fintutto": {
        "primary": "#06b6d4",
        "secondary": "#0891b2",
        "gradient": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
    },
    "b2b": {
        "primary": "#8b5cf6",
        "secondary": "#7c3aed",
        "gradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
    },
    "warning": {
        "primary": "#f59e0b",
        "secondary": "#d97706",
        "gradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    "winback": {
        "primary": "#ec4899",
        "secondary": "#db2777",
        "gradient": "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
    }
}

# ============================================================================
# HTML TEMPLATE GENERATOR
# ============================================================================

def generate_html(
    product: str,
    header_emoji: str,
    header_title: str,
    content_html: str,
    footer_product: str = None,
    color_scheme: str = None
):
    """Generiert HTML-Template mit einheitlichem Design"""

    scheme = COLORS.get(color_scheme or product, COLORS["fintutto"])
    footer = footer_product or product.title()

    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: {scheme['gradient']}; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
        .content {{ background: #fff; padding: 30px; border: 1px solid #e5e7eb; }}
        .footer {{ background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: {scheme['primary']}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }}
        .button:hover {{ background: {scheme['secondary']}; }}
        .discount {{ background: #fef3c7; border: 2px dashed {scheme['primary']}; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }}
        .discount-code {{ font-size: 24px; font-weight: bold; color: {scheme['secondary']}; }}
        .feature-box {{ background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }}
        h1 {{ margin: 0; font-size: 24px; }}
        .emoji {{ font-size: 48px; margin-bottom: 15px; }}
        ul {{ padding-left: 20px; }}
        li {{ margin-bottom: 8px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">{header_emoji}</div>
            <h1>{header_title}</h1>
        </div>
        <div class="content">
            {content_html}
        </div>
        <div class="footer">
            <p>{footer} - Ein Produkt der FinTuttO GmbH</p>
            <p><a href="{{{{unsubscribe}}}}">Abmelden</a> | <a href="https://fintutto.de/datenschutz">Datenschutz</a></p>
        </div>
    </div>
</body>
</html>"""

# ============================================================================
# VERMIETIFY TEMPLATES (P01-P04, D1)
# ============================================================================

VERMIETIFY_TEMPLATES = [
    # ========== P01 STARTER STEFAN (Erstvermieter) ==========
    {
        "name": "[Vermietify] P01 Willkommen - Erstvermieter",
        "subject": "Willkommen bei Vermietify, {{params.FIRSTNAME}}! Dein Start als Vermieter",
        "sender": "vermietify",
        "tag": "onboarding-p01",
        "html": generate_html(
            "vermietify",
            "🏠",
            "Willkommen bei Vermietify!",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>herzlich willkommen! Du hast gerade den ersten Schritt in die Welt der Vermietung gemacht - und wir sind stolz, dich dabei zu begleiten.</p>

            <p><strong>Als Erstvermieter weist du vielleicht noch nicht alles - und das ist völlig okay!</strong></p>

            <div class="feature-box">
                <p><strong>Deine ersten Schritte:</strong></p>
                <ul>
                    <li>📋 Leg dein erstes Objekt an (dauert nur 2 Minuten)</li>
                    <li>👤 Füge deinen Mieter hinzu</li>
                    <li>📊 Behalte Mietzahlungen im Blick</li>
                </ul>
            </div>

            <p>Unser <strong>KI-Assistent</strong> beantwortet dir jederzeit Fragen zu Mietrecht, Nebenkostenabrechnung und mehr - als hättest du einen persönlichen Berater.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/onboarding/erstvermieter" class="button">Jetzt starten →</a>
            </p>

            <p>Bei Fragen antworte einfach auf diese E-Mail!</p>

            <p>Viele Grüße<br>
            Dein Vermietify Team</p>
            """
        )
    },
    {
        "name": "[Vermietify] P01 Tag 3 - Erste Schritte",
        "subject": "{{params.FIRSTNAME}}, hast du schon dein Objekt angelegt?",
        "sender": "vermietify",
        "tag": "onboarding-p01",
        "html": generate_html(
            "vermietify",
            "📋",
            "Dein erstes Objekt wartet!",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>du bist jetzt seit 3 Tagen bei Vermietify - hast du schon dein erstes Objekt angelegt?</p>

            <p><strong>Falls nicht, hier ein schneller Guide:</strong></p>

            <div class="feature-box">
                <ol>
                    <li>Klicke auf "Neues Objekt"</li>
                    <li>Gib die Adresse ein</li>
                    <li>Fertig! Der Rest ist optional</li>
                </ol>
            </div>

            <p>Du brauchst nicht alle Daten sofort - du kannst sie jederzeit ergänzen.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/properties/new" class="button">Objekt anlegen →</a>
            </p>

            <p>Viele Grüße<br>
            Dein Vermietify Team</p>
            """
        )
    },

    # ========== P02 HOBBY-HEIKE (2-5 Objekte) ==========
    {
        "name": "[Vermietify] P02 Willkommen - Privatvermieter",
        "subject": "Willkommen {{params.FIRSTNAME}}! Endlich alle Objekte an einem Ort",
        "sender": "vermietify",
        "tag": "onboarding-p02",
        "html": generate_html(
            "vermietify",
            "🏘️",
            "Alle Objekte. Ein Dashboard.",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>willkommen bei Vermietify! Mit mehreren Objekten wird die Verwaltung schnell unübersichtlich - Excel-Listen, verschiedene Ordner, Notizzettel... Das kennen wir.</p>

            <p><strong>Vermietify bringt Ordnung rein:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>📊 Alle 2-5 Objekte in einem Dashboard</li>
                    <li>📅 Automatische Erinnerungen für Nebenkostenabrechnungen</li>
                    <li>💰 Mietübersicht für alle Objekte</li>
                    <li>📱 Mieter-App für Schadensmeldungen</li>
                </ul>
            </div>

            <p>Der größte Vorteil? Du sparst dir die jährliche Nebenkostenabrechnung - Vermietify macht das automatisch.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/onboarding/privatvermieter" class="button">Objekte importieren →</a>
            </p>

            <p>Viele Grüße<br>
            Dein Vermietify Team</p>
            """
        )
    },

    # ========== P03 PROFI-PAUL (6-30 Objekte, Portfolio) ==========
    {
        "name": "[Vermietify] P03 Willkommen - Portfolio",
        "subject": "{{params.FIRSTNAME}}, professionelle Verwaltung für dein Portfolio",
        "sender": "vermietify",
        "tag": "onboarding-p03",
        "html": generate_html(
            "vermietify",
            "🏢",
            "Portfolio-Management auf neuem Level",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>willkommen bei Vermietify! Mit einem Portfolio von 6+ Objekten brauchst du professionelle Tools - und genau das bieten wir.</p>

            <p><strong>Für Portfolio-Vermieter wie dich:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>📊 Multi-Objekt Dashboard mit KPIs</li>
                    <li>📈 Rendite-Analysen pro Objekt</li>
                    <li>🤖 KI-Assistent für komplexe Mietrecht-Fragen</li>
                    <li>📤 DATEV-Export für deinen Steuerberater</li>
                    <li>👥 Team-Funktionen für Mitarbeiter</li>
                </ul>
            </div>

            <p><strong>Bulk-Import:</strong> Du kannst alle Objekte auf einmal importieren - per CSV oder direkt aus deiner bisherigen Software.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/onboarding/portfolio" class="button">Portfolio einrichten →</a>
            </p>

            <p>Viele Grüße<br>
            Dein Vermietify Team</p>
            """
        )
    },

    # ========== P04 SENIOR-SIEGFRIED (65+, Komfort) ==========
    {
        "name": "[Vermietify] P04 Willkommen - Einfach & Sicher",
        "subject": "Willkommen {{params.FIRSTNAME}}! Vermietung leicht gemacht",
        "sender": "vermietify",
        "tag": "onboarding-p04",
        "html": generate_html(
            "vermietify",
            "🏡",
            "Vermietung - einfach & sicher",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>herzlich willkommen bei Vermietify! Wir freuen uns, dass Sie sich für uns entschieden haben.</p>

            <p><strong>Bei uns steht Einfachheit an erster Stelle:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>✅ Übersichtliches Design - alles auf einen Blick</li>
                    <li>📞 Persönlicher Support per Telefon</li>
                    <li>📖 Schritt-für-Schritt Anleitungen</li>
                    <li>🔒 Ihre Daten sind sicher bei uns</li>
                </ul>
            </div>

            <p>Sie müssen kein Computer-Experte sein - unsere Software erklärt sich von selbst. Und falls doch mal etwas unklar ist: Rufen Sie uns einfach an!</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/onboarding/senior" class="button">Einfach starten →</a>
            </p>

            <p><strong>Telefon-Support:</strong> Mo-Fr 9-17 Uhr unter 030 / XXX XXX</p>

            <p>Mit freundlichen Grüßen<br>
            Ihr Vermietify Team</p>
            """
        )
    },

    # ========== D1 ERBIN-EMMA (Frisch geerbt) ==========
    {
        "name": "[Vermietify] D1 Willkommen - Immobilie geerbt",
        "subject": "{{params.FIRSTNAME}}, Unterstützung für Ihre geerbte Immobilie",
        "sender": "vermietify",
        "tag": "onboarding-d1",
        "html": generate_html(
            "vermietify",
            "🏠",
            "Wir unterstützen Sie",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>Sie haben eine Immobilie geerbt - das bringt viele Fragen mit sich. Wir verstehen das und möchten Ihnen helfen.</p>

            <p><strong>Die wichtigsten Fragen zuerst:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>📋 <strong>Bestehende Mietverträge</strong> - Was muss ich wissen?</li>
                    <li>💰 <strong>Mieteinnahmen</strong> - Wie verwalte ich diese?</li>
                    <li>📄 <strong>Rechtliche Pflichten</strong> - Was kommt auf mich zu?</li>
                    <li>🔧 <strong>Instandhaltung</strong> - Wer kümmert sich darum?</li>
                </ul>
            </div>

            <p>Unser <strong>Erbschafts-Leitfaden</strong> führt Sie Schritt für Schritt durch alles Wichtige. Und unser KI-Assistent beantwortet Ihre Fragen jederzeit.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/onboarding/erbschaft" class="button">Leitfaden starten →</a>
            </p>

            <p>Sie sind nicht allein - wir begleiten Sie.</p>

            <p>Mit freundlichen Grüßen<br>
            Ihr Vermietify Team</p>
            """
        )
    },

    # ========== VERMIETIFY LIFECYCLE TEMPLATES ==========
    {
        "name": "[Vermietify] Trial endet - Alle Personas",
        "subject": "{{params.FIRSTNAME}}, nur noch 3 Tage Trial!",
        "sender": "vermietify",
        "tag": "lifecycle",
        "html": generate_html(
            "vermietify",
            "⏰",
            "Dein Trial endet bald",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>dein kostenloser Testzeitraum bei Vermietify endet in <strong>3 Tagen</strong>.</p>

            <p>In den letzten Tagen hast du:</p>
            <ul>
                <li>🏠 {{params.OBJECTS_COUNT}} Objekt(e) angelegt</li>
                <li>👥 {{params.TENANTS_COUNT}} Mieter verwaltet</li>
            </ul>

            <p>Damit du weiterhin alle Funktionen nutzen kannst:</p>

            <div class="discount">
                <p>🎁 <strong>25% Rabatt</strong> auf das Jahresabo</p>
                <p class="discount-code">TRIAL25</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/upgrade?code=TRIAL25" class="button">Jetzt upgraden →</a>
            </p>

            <p>Viele Grüße<br>
            Dein Vermietify Team</p>
            """,
            color_scheme="warning"
        )
    },
    {
        "name": "[Vermietify] Win-Back - Alle Personas",
        "subject": "{{params.FIRSTNAME}}, wir vermissen dich!",
        "sender": "vermietify",
        "tag": "winback",
        "html": generate_html(
            "vermietify",
            "💚",
            "Wir vermissen dich!",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>wir haben bemerkt, dass du Vermietify nicht mehr nutzt. Das verstehen wir - manchmal passt das Timing nicht.</p>

            <p><strong>Seitdem hat sich einiges getan:</strong></p>
            <ul>
                <li>🤖 Neuer KI-Assistent für Mietrecht</li>
                <li>📱 Komplett überarbeitete Mobile App</li>
                <li>📊 Neue Auswertungen & Reports</li>
                <li>🔄 Automatische Nebenkostenabrechnung</li>
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
            """,
            color_scheme="winback"
        )
    },
]

# ============================================================================
# MIETERAPP TEMPLATES (P09, P10)
# ============================================================================

MIETERAPP_TEMPLATES = [
    # ========== P09 MIETER EINGELADEN ==========
    {
        "name": "[MieterApp] P09 Willkommen - Eingeladen",
        "subject": "{{params.FIRSTNAME}}, dein Vermieter hat dich eingeladen!",
        "sender": "mieterapp",
        "tag": "onboarding-p09",
        "html": generate_html(
            "mieterapp",
            "🏠",
            "Willkommen bei MieterApp!",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>dein Vermieter <strong>{{params.LANDLORD_NAME}}</strong> nutzt Vermietify und hat dich zur MieterApp eingeladen.</p>

            <p><strong>Das kannst du mit der App:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>📱 Schäden direkt per Foto melden</li>
                    <li>💬 Mit deinem Vermieter chatten</li>
                    <li>📄 Dokumente einsehen (Mietvertrag, NK-Abrechnung)</li>
                    <li>💳 Mietzahlungen im Blick behalten</li>
                    <li>📅 Termine koordinieren</li>
                </ul>
            </div>

            <p>Die App ist für dich als Mieter <strong>komplett kostenlos</strong>!</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.mieterapp.de/invite/{{params.INVITE_CODE}}" class="button">App aktivieren →</a>
            </p>

            <p>Bei Fragen wende dich direkt an deinen Vermieter über die App.</p>

            <p>Viele Grüße<br>
            Dein MieterApp Team</p>
            """,
            footer_product="MieterApp"
        )
    },

    # ========== P10 MIETER SELBST REGISTRIERT ==========
    {
        "name": "[MieterApp] P10 Willkommen - Selbst registriert",
        "subject": "Willkommen bei MieterApp, {{params.FIRSTNAME}}!",
        "sender": "mieterapp",
        "tag": "onboarding-p10",
        "html": generate_html(
            "mieterapp",
            "🏠",
            "Willkommen bei MieterApp!",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>willkommen bei MieterApp! Du hast dich selbst registriert - das ist der erste Schritt zu einer besseren Kommunikation mit deinem Vermieter.</p>

            <p><strong>So geht's weiter:</strong></p>

            <div class="feature-box">
                <ol>
                    <li>Lade deinen Vermieter ein (E-Mail-Adresse eingeben)</li>
                    <li>Sobald er/sie beitritt, seid ihr verbunden</li>
                    <li>Nutze alle Vorteile der digitalen Kommunikation</li>
                </ol>
            </div>

            <p><strong>Deine Vorteile:</strong></p>
            <ul>
                <li>📱 Schäden dokumentieren und melden</li>
                <li>📄 Alle Dokumente digital archiviert</li>
                <li>💬 Nachweisbare Kommunikation</li>
            </ul>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.mieterapp.de/dashboard" class="button">Zur App →</a>
            </p>

            <p>Viele Grüße<br>
            Dein MieterApp Team</p>
            """,
            footer_product="MieterApp"
        )
    },
    {
        "name": "[MieterApp] Schadensmeldung bestätigt",
        "subject": "Deine Schadensmeldung wurde übermittelt",
        "sender": "mieterapp",
        "tag": "notification",
        "html": generate_html(
            "mieterapp",
            "📋",
            "Schadensmeldung eingegangen",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>deine Schadensmeldung wurde erfolgreich übermittelt:</p>

            <div class="feature-box">
                <p><strong>Betreff:</strong> {{params.DAMAGE_TITLE}}</p>
                <p><strong>Datum:</strong> {{params.DAMAGE_DATE}}</p>
                <p><strong>Status:</strong> Übermittelt an Vermieter</p>
            </div>

            <p>Dein Vermieter wurde benachrichtigt und wird sich bei dir melden.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.mieterapp.de/damages/{{params.DAMAGE_ID}}" class="button">Status prüfen →</a>
            </p>

            <p>Viele Grüße<br>
            Dein MieterApp Team</p>
            """,
            footer_product="MieterApp"
        )
    },
]

# ============================================================================
# HAUSMEISTERPRO TEMPLATES (C1 - GO/PRO/ENTERPRISE)
# ============================================================================

HAUSMEISTERPRO_TEMPLATES = [
    # ========== C1-GO ANGESTELLTER HAUSMEISTER ==========
    {
        "name": "[HausmeisterPro] GO Willkommen - Angestellt",
        "subject": "Willkommen bei HausmeisterPro GO, {{params.FIRSTNAME}}!",
        "sender": "hausmeisterpro",
        "tag": "onboarding-c1-go",
        "html": generate_html(
            "hausmeisterpro",
            "🔧",
            "Willkommen bei HausmeisterPro GO!",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>willkommen bei HausmeisterPro GO - der App für angestellte Hausmeister!</p>

            <p><strong>Als angestellter Hausmeister bekommst du:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>📋 Digitale Aufgabenliste von deinem Arbeitgeber</li>
                    <li>📱 Mobile App für unterwegs</li>
                    <li>📸 Foto-Dokumentation von Arbeiten</li>
                    <li>⏰ Einfache Zeiterfassung</li>
                    <li>💬 Direkte Kommunikation mit der Hausverwaltung</li>
                </ul>
            </div>

            <p>Die GO-Version ist <strong>kostenlos</strong> für dich - dein Arbeitgeber übernimmt die Kosten.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.hausmeisterpro.de/go/start" class="button">App einrichten →</a>
            </p>

            <p>Viele Grüße<br>
            Dein HausmeisterPro Team</p>
            """,
            footer_product="HausmeisterPro"
        )
    },

    # ========== C1-PRO SELBSTÄNDIGER HAUSMEISTER ==========
    {
        "name": "[HausmeisterPro] PRO Willkommen - Selbständig",
        "subject": "Willkommen bei HausmeisterPro PRO, {{params.FIRSTNAME}}!",
        "sender": "hausmeisterpro",
        "tag": "onboarding-c1-pro",
        "html": generate_html(
            "hausmeisterpro",
            "🔧",
            "Willkommen bei HausmeisterPro PRO!",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>willkommen bei HausmeisterPro PRO - die Lösung für selbständige Hausmeister!</p>

            <p><strong>Als selbständiger Hausmeister bekommst du:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>🏢 Mehrere Objekte/Kunden verwalten</li>
                    <li>📋 Eigene Aufgaben und Wartungspläne</li>
                    <li>💰 Rechnungsstellung direkt aus der App</li>
                    <li>📊 Auswertungen für deine Buchhaltung</li>
                    <li>📱 Professionelle Mobile App</li>
                    <li>👥 Optional: Mitarbeiter einbinden</li>
                </ul>
            </div>

            <p><strong>14 Tage kostenlos testen</strong> - keine Kreditkarte erforderlich.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.hausmeisterpro.de/pro/onboarding" class="button">Jetzt starten →</a>
            </p>

            <p>Viele Grüße<br>
            Dein HausmeisterPro Team</p>
            """,
            footer_product="HausmeisterPro"
        )
    },

    # ========== C1-ENT FACILITY MANAGEMENT FIRMA ==========
    {
        "name": "[HausmeisterPro] ENTERPRISE Willkommen - Firma",
        "subject": "Willkommen bei HausmeisterPro Enterprise!",
        "sender": "hausmeisterpro",
        "tag": "onboarding-c1-ent",
        "html": generate_html(
            "hausmeisterpro",
            "🏢",
            "Willkommen bei HausmeisterPro Enterprise!",
            """
            <p>Guten Tag,</p>

            <p>vielen Dank für Ihr Interesse an HausmeisterPro Enterprise - unserer Lösung für Facility Management Unternehmen.</p>

            <p><strong>Enterprise-Features für Ihr Unternehmen:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>🏢 <strong>Unbegrenzte Objekte</strong> verwalten</li>
                    <li>👥 <strong>Team-Management</strong> mit Rollen und Rechten</li>
                    <li>📊 <strong>Reporting-Dashboard</strong> für die Geschäftsführung</li>
                    <li>🔗 <strong>API-Anbindung</strong> an Ihre Systeme</li>
                    <li>📤 <strong>DATEV-Export</strong> für die Buchhaltung</li>
                    <li>🤝 <strong>Dedicated Account Manager</strong></li>
                    <li>📞 <strong>Priority Support</strong></li>
                </ul>
            </div>

            <p>Wir bieten individuelle Lösungen und maßgeschneiderte Preise für Ihr Unternehmen.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://hausmeisterpro.de/enterprise/demo" class="button">Demo vereinbaren →</a>
            </p>

            <p>Oder rufen Sie uns direkt an: <strong>030 / XXX XXX</strong></p>

            <p>Mit freundlichen Grüßen<br>
            Ihr HausmeisterPro Enterprise Team</p>
            """,
            footer_product="HausmeisterPro",
            color_scheme="b2b"
        )
    },

    # ========== HAUSMEISTERPRO LIFECYCLE ==========
    {
        "name": "[HausmeisterPro] PRO Trial endet",
        "subject": "{{params.FIRSTNAME}}, dein HausmeisterPro Trial endet bald",
        "sender": "hausmeisterpro",
        "tag": "lifecycle",
        "html": generate_html(
            "hausmeisterpro",
            "⏰",
            "Dein Trial endet in 3 Tagen",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>dein kostenloser Testzeitraum bei HausmeisterPro PRO endet in <strong>3 Tagen</strong>.</p>

            <p>In den letzten Wochen hast du:</p>
            <ul>
                <li>🏢 {{params.OBJECTS_COUNT}} Objekte verwaltet</li>
                <li>✅ {{params.TASKS_COUNT}} Aufgaben erledigt</li>
            </ul>

            <p>Upgrade jetzt und spare:</p>

            <div class="discount">
                <p>🎁 <strong>20% Rabatt</strong> auf das erste Jahr</p>
                <p class="discount-code">HMPRO20</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.hausmeisterpro.de/upgrade?code=HMPRO20" class="button">Jetzt upgraden →</a>
            </p>

            <p>Viele Grüße<br>
            Dein HausmeisterPro Team</p>
            """,
            footer_product="HausmeisterPro",
            color_scheme="warning"
        )
    },
]

# ============================================================================
# B2B TEMPLATES (C2, C3)
# ============================================================================

B2B_TEMPLATES = [
    # ========== C2 STEUERBERATER ==========
    {
        "name": "[B2B] C2 Willkommen - Steuerberater",
        "subject": "Willkommen im Steuerberater-Portal von FinTuttO",
        "sender": "fintutto",
        "tag": "onboarding-c2",
        "html": generate_html(
            "b2b",
            "📊",
            "Willkommen im Steuerberater-Portal!",
            """
            <p>Guten Tag,</p>

            <p>vielen Dank für Ihre Registrierung im FinTuttO Steuerberater-Portal!</p>

            <p><strong>Ihre Vorteile als Partner:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>📤 <strong>DATEV-Export</strong> - Daten Ihrer Mandanten direkt importieren</li>
                    <li>👥 <strong>Mandanten-Übersicht</strong> - Alle Vermietify-Mandanten im Blick</li>
                    <li>📊 <strong>Automatische Auswertungen</strong> für Anlage V</li>
                    <li>💰 <strong>Provisionen</strong> für empfohlene Mandanten</li>
                    <li>📚 <strong>Schulungen</strong> für Ihr Team</li>
                </ul>
            </div>

            <p>Verbinden Sie Ihre bestehenden Mandanten oder empfehlen Sie Vermietify neuen Mandanten.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://partner.fintutto.de/stb/dashboard" class="button">Zum Portal →</a>
            </p>

            <p>Bei Fragen steht Ihnen Ihr persönlicher Ansprechpartner zur Verfügung.</p>

            <p>Mit freundlichen Grüßen<br>
            Ihr FinTuttO Partner-Team</p>
            """,
            footer_product="FinTuttO Partner",
            color_scheme="b2b"
        )
    },

    # ========== C3 MAKLER ==========
    {
        "name": "[B2B] C3 Willkommen - Makler",
        "subject": "Willkommen im Makler-Portal von FinTuttO",
        "sender": "fintutto",
        "tag": "onboarding-c3",
        "html": generate_html(
            "b2b",
            "🏠",
            "Willkommen im Makler-Portal!",
            """
            <p>Guten Tag,</p>

            <p>vielen Dank für Ihre Registrierung im FinTuttO Makler-Portal!</p>

            <p><strong>Ihre Vorteile als Partner:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>🎁 <strong>Vermietify als Mehrwert</strong> - Schenken Sie Käufern 12 Monate kostenlos</li>
                    <li>💰 <strong>Provisionen</strong> für jeden Abschluss nach der Testphase</li>
                    <li>📊 <strong>Tracking-Dashboard</strong> - Sehen Sie, welche Kunden aktiv sind</li>
                    <li>🎨 <strong>Co-Branding</strong> - Ihr Logo in der App</li>
                    <li>📚 <strong>Marketing-Material</strong> für Ihre Exposés</li>
                </ul>
            </div>

            <p>Empfehlen Sie Vermietify an Immobilienkäufer und verdienen Sie mit jedem Upgrade.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://partner.fintutto.de/makler/dashboard" class="button">Zum Portal →</a>
            </p>

            <p>Bei Fragen steht Ihnen Ihr persönlicher Ansprechpartner zur Verfügung.</p>

            <p>Mit freundlichen Grüßen<br>
            Ihr FinTuttO Partner-Team</p>
            """,
            footer_product="FinTuttO Partner",
            color_scheme="b2b"
        )
    },
]

# ============================================================================
# RECHNER/LEAD TEMPLATES (P05)
# ============================================================================

RECHNER_TEMPLATES = [
    # ========== P05 INVESTOR-INGO (Rechner-Lead) ==========
    {
        "name": "[Rechner] P05 Rendite - Ergebnis",
        "subject": "Dein Rendite-Ergebnis ist da!",
        "sender": "fintutto",
        "tag": "lead-p05",
        "html": generate_html(
            "fintutto",
            "📊",
            "Dein Rendite-Ergebnis",
            """
            <p>Hallo,</p>

            <p>danke, dass du unseren <strong>Rendite-Rechner</strong> genutzt hast!</p>

            <p>Du interessierst dich für Immobilien als Investment? Dann solltest du wissen, wie du deine Rendite nach dem Kauf maximierst - mit professioneller Vermietungsverwaltung.</p>

            <p><strong>Vermietify hilft dir dabei:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>📊 Rendite im Blick - Einnahmen vs. Ausgaben</li>
                    <li>📋 Automatische Nebenkostenabrechnung</li>
                    <li>🤖 KI-Assistent für Mieterhöhungen</li>
                    <li>📈 Portfolio-Analyse wenn du wächst</li>
                </ul>
            </div>

            <p>Als Rechner-Nutzer erhältst du:</p>

            <div class="discount">
                <p>🎁 <strong>50% Rabatt</strong> auf den ersten Monat</p>
                <p class="discount-code">RECHNER50</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/signup?code=RECHNER50&source=renditerechner" class="button">Jetzt testen →</a>
            </p>

            <p>Viele Grüße<br>
            Dein FinTuttO Team</p>
            """
        )
    },
    {
        "name": "[Rechner] Mieterhöhung - Ergebnis",
        "subject": "Dein Mieterhöhungs-Ergebnis",
        "sender": "fintutto",
        "tag": "lead-rechner",
        "html": generate_html(
            "fintutto",
            "📈",
            "Dein Mieterhöhungs-Ergebnis",
            """
            <p>Hallo,</p>

            <p>du hast gerade berechnet, ob und um wie viel du die Miete erhöhen kannst.</p>

            <p><strong>Wusstest du?</strong> Mit Vermietify kannst du:</p>

            <div class="feature-box">
                <ul>
                    <li>📄 Rechtssichere Mieterhöhungsschreiben erstellen</li>
                    <li>📊 Automatisch den Mietspiegel berücksichtigen</li>
                    <li>⏰ Fristen automatisch überwachen</li>
                    <li>🤖 KI-Assistent für Mietrecht-Fragen</li>
                </ul>
            </div>

            <p>Als Rechner-Nutzer:</p>

            <div class="discount">
                <p>🎁 <strong>14 Tage kostenlos</strong> testen</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/signup?source=mieterhoehungsrechner" class="button">Jetzt testen →</a>
            </p>

            <p>Viele Grüße<br>
            Dein FinTuttO Team</p>
            """
        )
    },
    {
        "name": "[Rechner] Nebenkosten - Ergebnis",
        "subject": "Dein Nebenkosten-Ergebnis",
        "sender": "fintutto",
        "tag": "lead-rechner",
        "html": generate_html(
            "fintutto",
            "💰",
            "Dein Nebenkosten-Ergebnis",
            """
            <p>Hallo,</p>

            <p>du hast gerade deine Nebenkosten berechnet. Das jährliche Erstellen der Nebenkostenabrechnung ist zeitaufwändig - oder?</p>

            <p><strong>Mit Vermietify nicht mehr:</strong></p>

            <div class="feature-box">
                <ul>
                    <li>🔄 <strong>Automatische</strong> Nebenkostenabrechnung</li>
                    <li>📊 Alle Zählerstände digital erfassen</li>
                    <li>📧 Direkt an Mieter versenden</li>
                    <li>📋 Rechtssichere Vorlagen</li>
                </ul>
            </div>

            <p>Spare dir Stunden an Arbeit:</p>

            <div class="discount">
                <p>🎁 <strong>14 Tage kostenlos</strong> testen</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/signup?source=nebenkostenrechner" class="button">Jetzt testen →</a>
            </p>

            <p>Viele Grüße<br>
            Dein FinTuttO Team</p>
            """
        )
    },
    {
        "name": "[Rechner] P05 Follow-Up Tag 3",
        "subject": "Hast du dir Vermietify schon angeschaut?",
        "sender": "fintutto",
        "tag": "lead-nurturing",
        "html": generate_html(
            "fintutto",
            "👋",
            "Kurze Erinnerung",
            """
            <p>Hallo,</p>

            <p>vor ein paar Tagen hast du unseren Rechner genutzt. Hast du dir Vermietify schon angeschaut?</p>

            <p>Falls du dich fragst, ob sich das lohnt:</p>

            <div class="feature-box">
                <p><strong>Das sagen unsere Nutzer:</strong></p>
                <p><em>"Ich spare mir jeden Monat mindestens 3 Stunden Verwaltungsaufwand."</em><br>
                – Thomas, 4 Objekte</p>
            </div>

            <p>Dein Rabatt-Code ist noch gültig:</p>

            <div class="discount">
                <p class="discount-code">RECHNER50</p>
                <p>50% auf den ersten Monat</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.vermietify.de/signup?code=RECHNER50" class="button">Jetzt testen →</a>
            </p>

            <p>Viele Grüße<br>
            Dein FinTuttO Team</p>
            """
        )
    },
]

# ============================================================================
# TRANSACTIONAL TEMPLATES (Alle Produkte)
# ============================================================================

TRANSACTIONAL_TEMPLATES = [
    {
        "name": "[System] E-Mail Verifizierung",
        "subject": "Bestätige deine E-Mail-Adresse",
        "sender": "fintutto",
        "tag": "transactional",
        "html": generate_html(
            "fintutto",
            "✉️",
            "E-Mail bestätigen",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="{{params.VERIFICATION_URL}}" class="button">E-Mail bestätigen →</a>
            </p>

            <p>Oder kopiere diesen Link in deinen Browser:</p>
            <p style="word-break: break-all; font-size: 12px; color: #6b7280;">
                {{params.VERIFICATION_URL}}
            </p>

            <p>Der Link ist 24 Stunden gültig.</p>

            <p>Viele Grüße<br>
            Dein FinTuttO Team</p>
            """
        )
    },
    {
        "name": "[System] Passwort zurücksetzen",
        "subject": "Passwort zurücksetzen",
        "sender": "fintutto",
        "tag": "transactional",
        "html": generate_html(
            "fintutto",
            "🔑",
            "Passwort zurücksetzen",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>du hast angefordert, dein Passwort zurückzusetzen.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="{{params.RESET_URL}}" class="button">Neues Passwort setzen →</a>
            </p>

            <p>Falls du das nicht warst, ignoriere diese E-Mail einfach.</p>

            <p>Der Link ist 1 Stunde gültig.</p>

            <p>Viele Grüße<br>
            Dein FinTuttO Team</p>
            """
        )
    },
    {
        "name": "[System] Zahlungsbestätigung",
        "subject": "Danke für deine Zahlung!",
        "sender": "fintutto",
        "tag": "transactional",
        "html": generate_html(
            "fintutto",
            "✅",
            "Zahlung erhalten",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>wir haben deine Zahlung erhalten. Vielen Dank!</p>

            <div class="feature-box">
                <p><strong>Betrag:</strong> {{params.AMOUNT}} EUR</p>
                <p><strong>Produkt:</strong> {{params.PRODUCT_NAME}}</p>
                <p><strong>Datum:</strong> {{params.PAYMENT_DATE}}</p>
                <p><strong>Rechnungsnr:</strong> {{params.INVOICE_NUMBER}}</p>
            </div>

            <p>Deine Rechnung findest du in deinem Account unter "Rechnungen".</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.fintutto.de/account/invoices" class="button">Rechnung ansehen →</a>
            </p>

            <p>Viele Grüße<br>
            Dein FinTuttO Team</p>
            """
        )
    },
    {
        "name": "[System] Zahlung fehlgeschlagen",
        "subject": "Zahlung fehlgeschlagen - Aktion erforderlich",
        "sender": "fintutto",
        "tag": "transactional",
        "html": generate_html(
            "fintutto",
            "⚠️",
            "Zahlung fehlgeschlagen",
            """
            <p>Hallo {{params.FIRSTNAME}},</p>

            <p>leider konnte deine Zahlung nicht verarbeitet werden.</p>

            <div class="feature-box">
                <p><strong>Betrag:</strong> {{params.AMOUNT}} EUR</p>
                <p><strong>Grund:</strong> {{params.FAILURE_REASON}}</p>
            </div>

            <p>Bitte aktualisiere deine Zahlungsmethode, damit dein Abo aktiv bleibt.</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://app.fintutto.de/account/payment" class="button">Zahlungsmethode aktualisieren →</a>
            </p>

            <p>Bei Fragen sind wir für dich da.</p>

            <p>Viele Grüße<br>
            Dein FinTuttO Team</p>
            """,
            color_scheme="warning"
        )
    },
]

# ============================================================================
# ALLE TEMPLATES ZUSAMMENFASSEN
# ============================================================================

ALL_TEMPLATES = (
    VERMIETIFY_TEMPLATES +
    MIETERAPP_TEMPLATES +
    HAUSMEISTERPRO_TEMPLATES +
    B2B_TEMPLATES +
    RECHNER_TEMPLATES +
    TRANSACTIONAL_TEMPLATES
)

# ============================================================================
# API FUNKTIONEN
# ============================================================================

def get_existing_templates():
    """Holt alle existierenden Templates"""
    templates = []
    offset = 0
    limit = 50

    while True:
        response = requests.get(
            f"{BREVO_API_URL}/smtp/templates?limit={limit}&offset={offset}",
            headers=HEADERS
        )
        if response.status_code == 200:
            data = response.json()
            templates.extend(data.get("templates", []))
            if len(data.get("templates", [])) < limit:
                break
            offset += limit
        else:
            break

    return {t["name"]: t["id"] for t in templates}

def create_template(template, existing_templates):
    """Erstellt oder aktualisiert ein E-Mail Template"""
    sender = SENDERS.get(template["sender"], SENDERS["fintutto"])

    payload = {
        "templateName": template["name"],
        "subject": template["subject"],
        "sender": sender,
        "htmlContent": template["html"].strip(),
        "isActive": True,
        "tag": template.get("tag", "transactional"),
    }

    # Prüfen ob Template existiert
    if template["name"] in existing_templates:
        template_id = existing_templates[template["name"]]
        response = requests.put(
            f"{BREVO_API_URL}/smtp/templates/{template_id}",
            headers=HEADERS,
            json=payload
        )
        if response.status_code == 204:
            print(f"  ✓ Template aktualisiert: {template['name']} (ID: {template_id})")
            return template_id
        else:
            print(f"  ✗ Fehler beim Update {template['name']}: {response.status_code} - {response.text}")
            return None

    # Neues Template erstellen
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
            print(f"  ℹ Template existiert bereits: {template['name']}")
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
    print("  FINTUTTO BREVO TEMPLATES - PERSONA-BASIERTES SYSTEM")
    print("=" * 70)
    print(f"  Gestartet: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    print()

    # Existierende Templates holen
    print("█" * 70)
    print("  EXISTIERENDE TEMPLATES LADEN")
    print("█" * 70)
    print()
    existing = get_existing_templates()
    print(f"  ℹ {len(existing)} existierende Templates gefunden")
    print()

    # Templates erstellen
    categories = [
        ("VERMIETIFY (P01-P04, D1)", VERMIETIFY_TEMPLATES),
        ("MIETERAPP (P09, P10)", MIETERAPP_TEMPLATES),
        ("HAUSMEISTERPRO (GO/PRO/ENTERPRISE)", HAUSMEISTERPRO_TEMPLATES),
        ("B2B (C2, C3)", B2B_TEMPLATES),
        ("RECHNER/LEADS (P05)", RECHNER_TEMPLATES),
        ("TRANSACTIONAL", TRANSACTIONAL_TEMPLATES),
    ]

    results = {
        "created": [],
        "updated": [],
        "failed": []
    }

    for category_name, templates in categories:
        print("█" * 70)
        print(f"  {category_name}")
        print("█" * 70)
        print()

        for template in templates:
            template_id = create_template(template, existing)
            if template_id:
                if template["name"] in existing:
                    results["updated"].append(template["name"])
                else:
                    results["created"].append(template["name"])
            else:
                if template["name"] not in existing:
                    results["failed"].append(template["name"])

        print()

    # Zusammenfassung
    print("=" * 70)
    print("  ZUSAMMENFASSUNG")
    print("=" * 70)
    print()
    print(f"  ✓ {len(results['created'])} Templates neu erstellt")
    print(f"  ✓ {len(results['updated'])} Templates aktualisiert")
    if results["failed"]:
        print(f"  ✗ {len(results['failed'])} Templates fehlgeschlagen")
    print()
    print(f"  Gesamt: {len(ALL_TEMPLATES)} Templates definiert")
    print()
    print("  Prüfe die Templates: https://app.brevo.com/templates")
    print()

    # JSON Export
    result_data = {
        "created": results["created"],
        "updated": results["updated"],
        "failed": results["failed"],
        "total_defined": len(ALL_TEMPLATES),
        "categories": {
            "vermietify": len(VERMIETIFY_TEMPLATES),
            "mieterapp": len(MIETERAPP_TEMPLATES),
            "hausmeisterpro": len(HAUSMEISTERPRO_TEMPLATES),
            "b2b": len(B2B_TEMPLATES),
            "rechner": len(RECHNER_TEMPLATES),
            "transactional": len(TRANSACTIONAL_TEMPLATES),
        },
        "created_at": datetime.now().isoformat()
    }

    with open("brevo_templates_personas_result.json", "w") as f:
        json.dump(result_data, f, indent=2)

    print("  Ergebnis gespeichert: brevo_templates_personas_result.json")
    print()

if __name__ == "__main__":
    main()
