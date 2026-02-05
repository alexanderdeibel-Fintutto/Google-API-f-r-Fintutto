#!/usr/bin/env python3
"""
============================================================================
FINTUTTO BREVO SETUP - Komplettes Setup via API
============================================================================
Erstellt automatisch:
- Listen für alle Personas
- Kontakt-Attribute
- Ordnerstruktur
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
# PERSONAS
# ============================================================================

PERSONAS = {
    # Vermietify - Vermieter Personas
    "P01": {"name": "Starter Stefan", "desc": "1 Objekt, Neuling", "product": "vermietify"},
    "P02": {"name": "Hobby-Heike", "desc": "2-5 Objekte, Nebentätigkeit", "product": "vermietify"},
    "P03": {"name": "Profi-Paul", "desc": "6-30 Objekte, Portfolio", "product": "vermietify"},
    "P04": {"name": "Senior-Siegfried", "desc": "65+, Komfort", "product": "vermietify"},
    "D1": {"name": "Erbin-Emma", "desc": "Frisch geerbt", "product": "vermietify"},
    # Rechner/Leads
    "P05": {"name": "Investor-Ingo", "desc": "Kaufinteressent via Rechner", "product": "rechner"},
    # MieterApp - Mieter Personas
    "P09": {"name": "Mieter (eingeladen)", "desc": "Vom Vermieter eingeladen", "product": "mieterapp"},
    "P10": {"name": "Mieter (selbst)", "desc": "Selbst registriert", "product": "mieterapp"},
    # HausmeisterPro - Tiers
    "C1-GO": {"name": "Hausmeister GO", "desc": "Angestellter Hausmeister", "product": "hausmeisterpro"},
    "C1-PRO": {"name": "Hausmeister PRO", "desc": "Selbständiger Hausmeister", "product": "hausmeisterpro"},
    "C1-ENT": {"name": "Hausmeister Enterprise", "desc": "Facility Management Firma", "product": "hausmeisterpro"},
    # B2B Partners
    "C2": {"name": "StB-Sabine", "desc": "Steuerberater", "product": "stb_portal"},
    "C3": {"name": "Makler-Marco", "desc": "Immobilienmakler", "product": "makler_portal"},
}

# ============================================================================
# KONTAKT-ATTRIBUTE
# ============================================================================

ATTRIBUTES = [
    # Core Attributes
    {"name": "PERSONA", "category": "normal", "type": "text"},
    {"name": "PRODUCT", "category": "normal", "type": "text"},
    {"name": "TIER", "category": "normal", "type": "text"},  # go, pro, enterprise
    # Subscription Attributes
    {"name": "SUBSCRIPTION_STATUS", "category": "normal", "type": "text"},
    {"name": "SUBSCRIPTION_PLAN", "category": "normal", "type": "text"},
    {"name": "TRIAL_END_DATE", "category": "normal", "type": "date"},
    # Usage Attributes
    {"name": "OBJECTS_COUNT", "category": "normal", "type": "float"},
    {"name": "TENANTS_COUNT", "category": "normal", "type": "float"},
    {"name": "TASKS_COUNT", "category": "normal", "type": "float"},  # For HausmeisterPro
    {"name": "EMPLOYEE_COUNT", "category": "normal", "type": "float"},  # For Enterprise
    # Activity Attributes
    {"name": "REGISTRATION_DATE", "category": "normal", "type": "date"},
    {"name": "LAST_LOGIN", "category": "normal", "type": "date"},
    {"name": "EMAIL_VERIFIED", "category": "normal", "type": "boolean"},
    # Referral Attributes
    {"name": "REFERRAL_CODE", "category": "normal", "type": "text"},
    {"name": "REFERRED_BY", "category": "normal", "type": "text"},
    # Lead Attributes
    {"name": "CALCULATOR_TYPE", "category": "normal", "type": "text"},
    {"name": "LEAD_SOURCE", "category": "normal", "type": "text"},
    # Employment (HausmeisterPro)
    {"name": "EMPLOYMENT_TYPE", "category": "normal", "type": "text"},  # employed, self-employed, company
    # Other
    {"name": "LANGUAGE", "category": "normal", "type": "text"},
]

# ============================================================================
# API FUNKTIONEN
# ============================================================================

def api_get(endpoint):
    """GET Request an Brevo API"""
    response = requests.get(f"{BREVO_API_URL}/{endpoint}", headers=HEADERS)
    return response

def api_post(endpoint, data):
    """POST Request an Brevo API"""
    response = requests.post(f"{BREVO_API_URL}/{endpoint}", headers=HEADERS, json=data)
    return response

def api_put(endpoint, data):
    """PUT Request an Brevo API"""
    response = requests.put(f"{BREVO_API_URL}/{endpoint}", headers=HEADERS, json=data)
    return response

# ============================================================================
# SETUP FUNKTIONEN
# ============================================================================

def create_folder(name):
    """Erstellt einen Ordner für Listen"""
    response = api_post("contacts/folders", {"name": name})
    if response.status_code == 201:
        data = response.json()
        print(f"  ✓ Ordner erstellt: {name} (ID: {data.get('id')})")
        return data.get("id")
    elif response.status_code == 400 and "already exists" in response.text.lower():
        # Ordner existiert bereits - ID abrufen
        folders = api_get("contacts/folders").json()
        for folder in folders.get("folders", []):
            if folder["name"] == name:
                print(f"  ℹ Ordner existiert: {name} (ID: {folder['id']})")
                return folder["id"]
    else:
        print(f"  ✗ Fehler bei Ordner {name}: {response.text}")
    return None

def create_list(name, folder_id):
    """Erstellt eine Kontaktliste"""
    response = api_post("contacts/lists", {"name": name, "folderId": folder_id})
    if response.status_code == 201:
        data = response.json()
        print(f"  ✓ Liste erstellt: {name} (ID: {data.get('id')})")
        return data.get("id")
    elif response.status_code == 400 and "already exists" in response.text.lower():
        # Liste existiert bereits
        lists = api_get(f"contacts/lists?limit=50").json()
        for lst in lists.get("lists", []):
            if lst["name"] == name:
                print(f"  ℹ Liste existiert: {name} (ID: {lst['id']})")
                return lst["id"]
    else:
        print(f"  ✗ Fehler bei Liste {name}: {response.text}")
    return None

def create_attribute(name, attr_type, category="normal"):
    """Erstellt ein Kontakt-Attribut"""
    response = api_post(f"contacts/attributes/{category}/{name}", {"type": attr_type})
    if response.status_code == 201:
        print(f"  ✓ Attribut erstellt: {name} ({attr_type})")
        return True
    elif response.status_code == 400 and "already exists" in response.text.lower():
        print(f"  ℹ Attribut existiert: {name}")
        return True
    else:
        print(f"  ✗ Fehler bei Attribut {name}: {response.text}")
    return False

# ============================================================================
# HAUPTPROGRAMM
# ============================================================================

def main():
    print("=" * 70)
    print("  FINTUTTO BREVO SETUP")
    print("=" * 70)
    print(f"  Gestartet: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    print()

    # ----- 1. KONTAKT-ATTRIBUTE -----
    print("█" * 70)
    print("  1. KONTAKT-ATTRIBUTE ERSTELLEN")
    print("█" * 70)
    print()

    for attr in ATTRIBUTES:
        create_attribute(attr["name"], attr["type"], attr.get("category", "normal"))

    print()

    # ----- 2. ORDNER ERSTELLEN -----
    print("█" * 70)
    print("  2. ORDNER ERSTELLEN")
    print("█" * 70)
    print()

    folders = {}
    folder_names = ["FinTuttO", "Vermietify", "MieterApp", "HausmeisterPro", "Rechner", "B2B"]

    for name in folder_names:
        folder_id = create_folder(name)
        if folder_id:
            folders[name] = folder_id

    print()

    # ----- 3. PERSONA-LISTEN ERSTELLEN -----
    print("█" * 70)
    print("  3. PERSONA-LISTEN ERSTELLEN")
    print("█" * 70)
    print()

    list_ids = {}

    for code, persona in PERSONAS.items():
        # Ordner basierend auf Produkt wählen
        product = persona["product"]
        if product == "vermietify":
            folder_id = folders.get("Vermietify")
        elif product == "mieterapp":
            folder_id = folders.get("MieterApp")
        elif product == "hausmeisterpro":
            folder_id = folders.get("HausmeisterPro")
        elif product in ["stb_portal", "makler_portal"]:
            folder_id = folders.get("B2B")
        elif product == "rechner":
            folder_id = folders.get("Rechner")
        else:
            folder_id = folders.get("FinTuttO")

        if folder_id:
            list_name = f"{code} - {persona['name']}"
            list_id = create_list(list_name, folder_id)
            if list_id:
                list_ids[code] = list_id

    print()

    # ----- 4. LIFECYCLE-LISTEN ERSTELLEN -----
    print("█" * 70)
    print("  4. LIFECYCLE-LISTEN ERSTELLEN")
    print("█" * 70)
    print()

    lifecycle_lists = [
        # Trial & Subscription Lifecycle
        "Trial - Aktiv",
        "Trial - Endet bald (3 Tage)",
        "Trial - Abgelaufen",
        "Abo - Aktiv",
        "Abo - Gekündigt",
        "Abo - Win-Back (30 Tage)",
        "Abo - Win-Back (90 Tage)",
        # Inactivity
        "Inaktiv - 14 Tage",
        "Inaktiv - 30 Tage",
        # Leads
        "Leads - Rechner Rendite",
        "Leads - Rechner Nebenkosten",
        "Leads - Rechner Mietspiegel",
        "Leads - Rechner Mieterhöhung",
        "Leads - Newsletter",
        # HausmeisterPro Tier-specific
        "HausmeisterPro - GO Trial",
        "HausmeisterPro - GO Aktiv",
        "HausmeisterPro - PRO Trial",
        "HausmeisterPro - PRO Aktiv",
        "HausmeisterPro - Enterprise Leads",
        "HausmeisterPro - Enterprise Aktiv",
        # Upgrades
        "Upgrade - GO to PRO",
        "Upgrade - PRO to Enterprise",
    ]

    fintutto_folder = folders.get("FinTuttO")
    if fintutto_folder:
        for list_name in lifecycle_lists:
            create_list(list_name, fintutto_folder)

    print()

    # ----- 5. ZUSAMMENFASSUNG -----
    print("█" * 70)
    print("  5. ZUSAMMENFASSUNG")
    print("█" * 70)
    print()
    print(f"  ✓ {len(ATTRIBUTES)} Attribute konfiguriert")
    print(f"  ✓ {len(folders)} Ordner erstellt")
    print(f"  ✓ {len(list_ids)} Persona-Listen erstellt")
    print(f"  ✓ {len(lifecycle_lists)} Lifecycle-Listen erstellt")
    print()

    # Listen-IDs ausgeben
    print("  LISTEN-IDs für Edge Functions:")
    print("  " + "-" * 40)
    for code, list_id in list_ids.items():
        print(f"  {code}: {list_id}")

    print()
    print("=" * 70)
    print("  ✓ FERTIG!")
    print("=" * 70)
    print()
    print("  Nächste Schritte:")
    print("  1. Prüfe die Listen: https://app.brevo.com/contacts/list")
    print("  2. Erstelle Automationen: https://app.brevo.com/automation/list")
    print("  3. Erstelle Templates: https://app.brevo.com/templates")
    print()

    # JSON Export
    result = {
        "folders": folders,
        "persona_lists": list_ids,
        "attributes": [a["name"] for a in ATTRIBUTES],
        "created_at": datetime.now().isoformat()
    }

    with open("brevo_setup_result.json", "w") as f:
        json.dump(result, f, indent=2)

    print("  Ergebnis gespeichert: brevo_setup_result.json")
    print()

if __name__ == "__main__":
    main()
