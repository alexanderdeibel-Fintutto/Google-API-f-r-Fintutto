# FINTUTTO APP-PORTFOLIO - MASTER DOKUMENTATION

> Erstellt: 2026-02-02
> Basierend auf: A-Docs (offizielle Fintutto-Dokumentation)
> Ziel: Migration von Base44 zu Lovable

---

## TEIL 1: FINTUTTO DESIGN SYSTEM

### 1.1 Die 6 Ring-Farben (Kategorien)

Das Fintutto-Logo besteht aus 6 farbigen Ringen. Jede Farbe steht fuer eine Kategorie:

| Kategorie | Farbe | HEX | RGB | Pantone |
|-----------|-------|-----|-----|---------|
| **Immobilien** | Blau | `#2563EB` | RGB(37, 99, 235) | Blue 072 C |
| **Mieter** | Tuerkis | `#06B6D4` | RGB(6, 182, 212) | 3115 C |
| **Dokumente** | Gruen | `#10B981` | RGB(16, 185, 129) | 3395 C |
| **Vermoegen** | Gelb | `#EAB308` | RGB(234, 179, 8) | 7549 C |
| **Finanzen** | Orange | `#F97316` | RGB(249, 115, 22) | Orange 021 C |
| **Steuer** | Lila | `#8B5CF6` | RGB(139, 92, 246) | 2665 C |

### 1.2 Design Tokens (UI-Elemente)

```css
:root {
  /* ═══════════════════════════════════════════════════════════════════
     BRAND COLORS - FinTuttO Hauptfarben
     ═══════════════════════════════════════════════════════════════════ */

  --ft-primary: #4F46E5;           /* Indigo - Hauptfarbe */
  --ft-primary-hover: #4338CA;     /* Indigo dunkel - Hover */
  --ft-primary-light: #818CF8;     /* Indigo hell - Backgrounds */
  --ft-primary-50: #EEF2FF;        /* Indigo sehr hell - Subtle BG */

  --ft-secondary: #7C3AED;         /* Violett - Akzent */
  --ft-secondary-hover: #6D28D9;
  --ft-secondary-light: #A78BFA;

  /* ═══════════════════════════════════════════════════════════════════
     SEMANTIC COLORS - Bedeutungsfarben
     ═══════════════════════════════════════════════════════════════════ */

  /* Erfolg / Positiv */
  --ft-success: #10B981;           /* Gruen */
  --ft-success-hover: #059669;
  --ft-success-light: #D1FAE5;
  --ft-success-text: #065F46;

  /* Warnung / Neutral */
  --ft-warning: #F59E0B;           /* Orange */
  --ft-warning-hover: #D97706;
  --ft-warning-light: #FEF3C7;
  --ft-warning-text: #92400E;

  /* Fehler / Negativ */
  --ft-danger: #EF4444;            /* Rot */
  --ft-danger-hover: #DC2626;
  --ft-danger-light: #FEE2E2;
  --ft-danger-text: #991B1B;

  /* Info / Neutral */
  --ft-info: #3B82F6;              /* Blau */
  --ft-info-hover: #2563EB;
  --ft-info-light: #DBEAFE;
  --ft-info-text: #1E40AF;

  /* ═══════════════════════════════════════════════════════════════════
     NEUTRAL COLORS - Graustufen
     ═══════════════════════════════════════════════════════════════════ */

  --ft-gray-50: #F9FAFB;
  --ft-gray-100: #F3F4F6;
  --ft-gray-200: #E5E7EB;
  --ft-gray-300: #D1D5DB;
  --ft-gray-400: #9CA3AF;
  --ft-gray-500: #6B7280;
  --ft-gray-600: #4B5563;
  --ft-gray-700: #374151;
  --ft-gray-800: #1F2937;
  --ft-gray-900: #111827;

  --ft-white: #FFFFFF;
  --ft-black: #000000;

  /* ═══════════════════════════════════════════════════════════════════
     BEWERTUNGS-FARBEN - Fuer Ampel-System
     ═══════════════════════════════════════════════════════════════════ */

  --ft-rating-excellent: #10B981;  /* Hervorragend - Gruen */
  --ft-rating-good: #22C55E;       /* Gut - Hellgruen */
  --ft-rating-ok: #F59E0B;         /* OK - Orange */
  --ft-rating-weak: #F97316;       /* Schwach - Dunkelorange */
  --ft-rating-bad: #EF4444;        /* Schlecht - Rot */

  /* ═══════════════════════════════════════════════════════════════════
     KOMPONENTEN-SPEZIFISCHE TOKENS
     ═══════════════════════════════════════════════════════════════════ */

  --ft-hero-gradient: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  --ft-hero-text: #FFFFFF;

  --ft-card-bg: var(--ft-white);
  --ft-card-border: var(--ft-gray-200);
  --ft-card-radius: 12px;
  --ft-card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  --ft-premium-bg: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
}
```

### 1.3 Typografie

```css
--ft-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--ft-font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

--ft-text-xs: 0.75rem;    /* 12px */
--ft-text-sm: 0.875rem;   /* 14px */
--ft-text-base: 1rem;     /* 16px */
--ft-text-lg: 1.125rem;   /* 18px */
--ft-text-xl: 1.25rem;    /* 20px */
--ft-text-2xl: 1.5rem;    /* 24px */
--ft-text-3xl: 1.875rem;  /* 30px */
--ft-text-4xl: 2.25rem;   /* 36px */
```

---

## TEIL 2: ZENTRALE INFRASTRUKTUR

### 2.1 Supabase

| Setting | Wert |
|---------|------|
| Projekt-Name | Fintutto (User-Hub) |
| Projekt-Ref | `aaefocdqgdgexkcrjhks` |
| API URL | `https://aaefocdqgdgexkcrjhks.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/aaefocdqgdgexkcrjhks |

### 2.2 Stripe

| Setting | Wert |
|---------|------|
| Dashboard | https://dashboard.stripe.com |
| Live-Webhook-ID | `we_1Sr5mS52lqSgjCzeRjXXHmP2` |

### 2.3 Domains (bei Strato.de)

**Zentrale Plattform:**
- `fintutto.cloud` - App-Plattform
- `fintutto.de` - Corporate Website
- `fintutto.info` - Dokumentation

**Haupt-Apps:**
- `vermietify.de` - Vermieter-App
- `hausmeisterpro.de` - Hausmeister-App
- `zaehlerstand.app` - Zaehler-App

**SEO-Domains (Rechner):**
- `mietrendite.de`, `kaufpreis.de`, `kaufnebenkosten.de`, `tilgungsplan.de`
- `eigenkapital.de`, `nebenkosten.de`, `mietspiegel.de`, `mieterhoehung.de`
- `mietkaution.de`, `indexmiete.de`, `kuendigungsfrist.de`, `afa-rechner.de`

---

## TEIL 3: HAUPT-APPS

### 3.1 VERMIETIFY - Vermieter-App

| Setting | Wert |
|---------|------|
| Base44 App-ID | `694ec0b3e6d09c2e6b8e0485` |
| Hauptfarbe | `#2563EB` (Blau) |
| Zielgruppe | Private Vermieter (5,5 Mio. in DE) |
| Domain | fintutto.cloud/vermietify |

**Stripe-Produkte:**
- Starter (Free): 0 EUR/Monat
- Basic: 9,99 EUR/Monat
- Pro: 29,00 EUR/Monat
- Business: 89,00 EUR/Monat

**Features:**
- Immobilienverwaltung (Gebaeude, Wohnungen)
- Mieterverwaltung & Vertraege
- Finanzmanagement (Bankkonten, Transaktionen)
- Nebenkostenabrechnung
- Steueroptimierung (Anlage V, KAP, SO)
- KI-Tools (BelegScanner, SteuerOptimierer)
- Hausmeister-Seats (je nach Plan)

---

### 3.2 HAUSMEISTERPRO - Hausmeister-App

| Setting | Wert |
|---------|------|
| Base44 App-ID | `696fb16c734074a341d24cf9` |
| Hauptfarbe | `#059669` (Emerald/Gruen) |
| Zielgruppe | Hausmeister, Facility Manager |
| Domain | fintutto.cloud/hausmeister |

**Features:**
- Aufgabenverwaltung
- Terminkalender
- Objektrundgaenge
- Reparatur-Tracking
- Zeiterfassung
- Mobile-First, Offline-faehig

**Seat-System (in Vermietify inkludiert):**
- Vermietify Free/Starter: 0 Seats
- Vermietify Basic: 1 Seat
- Vermietify Pro: 2 Seats
- Vermietify Business: 5 Seats

---

### 3.3 MIETERAPP - Mieter-Portal

| Setting | Wert |
|---------|------|
| Base44 App-ID | `696feb63b8085b338cf6c4e7` |
| Hauptfarbe | `#06B6D4` (Tuerkis) |
| Zielgruppe | Mieter (ueber Vermietify eingeladen) |
| Domain | fintutto.cloud/mieter |

**Features:**
- Dashboard mit Mietuebersicht
- Zahlungshistorie
- Schadensmeldung mit Foto
- Zaehlerablesung (OCR)
- Chat mit Hausverwaltung/Hausmeister
- Community-Features
- Dokumentenverwaltung

---

### 3.4 FT_FORMULARE - Dokumentvorlagen

| Setting | Wert |
|---------|------|
| Base44 App-ID | `69738942257c5676efe9835b` |
| Hauptfarbe | `#10B981` (Gruen - Dokumente) |
| Domain | fintutto.cloud/formulare |

**Formular-Kategorien:**
- Mietvertraege (Standard, Moebliert, WG, Gewerbe)
- Kuendigungen (Mieter, Vermieter, Sonder)
- Abrechnungen (Nebenkosten, Heizkosten)
- Protokolle (Uebergabe, Maengel)
- Sonstiges (Mieterhoehung, Kaution, Mahnung)

**Stripe-Preise (Einzelformulare):**
- Basic Tier: 1,99-2,49 EUR
- Standard Tier: 3,99-4,99 EUR
- Pakete: 49,99-99,99 EUR

---

### 3.5 FT_NK_ABRECHNUNG - Nebenkostenabrechnung

| Setting | Wert |
|---------|------|
| Base44 App-ID | `697656748422cf46cd7eecfc` |
| Hauptfarbe | `#F97316` (Orange - Finanzen) |
| Domain | fintutto.cloud/nebenkostenabrechnung |

**8-Schritt Wizard:**
1. Objekt & Zeitraum
2. Mietvertraege
3. Betriebskosten (BetrKV)
4. Direktkosten
5. Heizkosten (HeizkostenV)
6. Ergebnisse
7. Vorschau (PDF)
8. Versand (Email/Post)

**Stripe-Preise:**
- NK-Abrechnung Einzel: 4,90 EUR
- NK-Abrechnung Pro: 6,90 EUR/Monat
- Briefversand: 1,20 EUR/Brief
- Einschreiben: 4,50 EUR

---

### 3.6 FT_OCR_ZAEHLER - Zaehlerstand-App

| Setting | Wert |
|---------|------|
| Base44 App-ID | `6976455cb77a3d4ec1a18e92` |
| Hauptfarbe | `#EAB308` (Gelb - Vermoegen) |
| Domain | zaehlerstand.app |

**Features:**
- OCR-Erkennung (Kamera)
- Multi-Zaehlertypen (Strom, Gas, Wasser, Waerme)
- Offline-faehig
- Verbrauchshistorie
- Plausibilitaetspruefung

**Stripe-Preise:**
- Basic: 2,99 EUR/Monat
- Premium: 6,99 EUR/Monat
- Business: 19,90 EUR/Monat
- Lifetime: TBD

---

### 3.7 FT_CALC_RENDITE - Rendite-Rechner (Template)

| Setting | Wert |
|---------|------|
| Base44 App-ID | `69717747c88c98939bb37c94` |
| Hauptfarbe | `#4F46E5` (Indigo - Primary) |
| Domain | mietrendite.de |

**Rechner-Tiers:**

| Tier | Rechner | Preise |
|------|---------|--------|
| **Premium** | Rendite, Cashflow, Mieterhoehung | Basic 2,99 EUR/Mo, Pro 6,99 EUR/Mo, Lifetime 29,90 EUR |
| **Professional** | Kaufpreis, Nebenkosten, Tilgung, Eigenkapital, AfA, Grundsteuer, Mietspiegel | Basic 1,99 EUR/Mo, Pro 4,99 EUR/Mo, Lifetime 19,90 EUR |
| **Standard** | Kaution, Indexmiete, Kuendigungsfrist, Heizkosten, Wohnflaeche | Basic 0,99 EUR/Mo, Pro 2,99 EUR/Mo, Lifetime 9,90 EUR |

---

## TEIL 4: LOVABLE PROMPTS

### Allgemeine Anweisungen (fuer alle Apps):

```
WICHTIG - Fintutto Design System:

1. TECHNOLOGIE:
   - React + TypeScript + Tailwind CSS + shadcn/ui
   - Supabase fuer Backend (Auth, Database, Storage)
   - Stripe fuer Payments

2. FARBEN (CSS Custom Properties):
   - Primary: #4F46E5 (Indigo)
   - Secondary: #7C3AED (Violett)
   - Success: #10B981 (Gruen)
   - Warning: #F59E0B (Orange)
   - Danger: #EF4444 (Rot)
   - Info: #3B82F6 (Blau)
   - Hero Gradient: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)

3. TYPOGRAFIE:
   - Font: Inter (Google Fonts)
   - Monospace: JetBrains Mono

4. KOMPONENTEN:
   - Cards mit border-radius: 12px und shadow
   - Buttons mit hover-states
   - Konsistente Spacing (Tailwind scale)

5. SPRACHE:
   - Deutsche Sprache fuer alle UI-Texte
   - Formelle Anrede (Sie)
```

---

### PROMPT 1: VERMIETIFY

```
Erstelle "Vermietify" - eine Immobilienverwaltungs-Plattform fuer deutsche Vermieter.

DESIGN:
- Hauptfarbe: #2563EB (Blau)
- Akzentfarbe: #4F46E5 (Indigo)
- Hero Gradient: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)
- Font: Inter
- Deutsche Sprache

NAVIGATION (Sidebar):
1. Dashboard - KPIs, Charts, Schnellzugriff
2. Immobilien - Gebaeude & Wohnungen verwalten
3. Mieter - Mieterdatenbank, Vertraege
4. Finanzen - Einnahmen, Ausgaben, Bankkonten
5. Dokumente - Upload, Verwaltung
6. Abrechnungen - Nebenkostenabrechnung
7. Steuern - Anlage V, KAP, SO
8. Kommunikation - Nachrichten an Mieter
9. Einstellungen

DASHBOARD:
- 4 KPI-Karten: Gesamtmiete, Leerstand, Offene Reparaturen, Ausstehende Zahlungen
- Liniendiagramm: Mieteinnahmen 12 Monate
- Tabelle: Naechste Faelligkeiten
- Liste: Offene Aufgaben

IMMOBILIEN-SEITE:
- Karten-Grid mit Gebaeuden
- Gebaude hinzufuegen Dialog
- Pro Gebaeude: Wohnungen mit Status

MIETER-SEITE:
- Mieterliste mit Suche
- Mieter-Profil
- Mietvertrag erstellen (Wizard)

SUPABASE-TABELLEN:
- users, organizations
- buildings (name, address, city, postal_code)
- units (building_id, unit_number, area, rooms, rent_amount, status)
- tenants (first_name, last_name, email, phone)
- leases (unit_id, tenant_id, start_date, end_date, rent_amount, deposit)
- transactions (lease_id, amount, type, date)
- documents (title, file_url, type)

Erstelle die komplette App mit allen Seiten und Supabase-Integration.
```

---

### PROMPT 2: MIETER-APP

```
Erstelle "Fintutto Mieter" - eine Mobile-First App fuer Mieter.

DESIGN:
- Hauptfarbe: #06B6D4 (Tuerkis)
- Akzentfarbe: #10B981 (Gruen)
- Hero Gradient: linear-gradient(135deg, #06B6D4 0%, #10B981 100%)
- Mobile-First mit Bottom-Navigation
- Deutsche Sprache

BOTTOM-NAVIGATION (5 Tabs):
1. Home (Dashboard)
2. Finanzen
3. Melden (+ Button, hervorgehoben)
4. Chat
5. Mehr

HOME-DASHBOARD:
- Begruessung "Hallo, [Name]!"
- Karte: Naechste Mietzahlung (Betrag, Faellig am)
- Karte: Offene Meldungen
- Quick Actions: Zaehler ablesen, Mangel melden
- Letzte Nachrichten

FINANZEN:
- Kontostand (Guthaben/Nachzahlung)
- Miete Aufschluesselung (Kalt + NK)
- Zahlungshistorie

MELDEN (Floating Action Menu):
- Mangel melden (Kategorie, Beschreibung, Foto, Dringlichkeit)
- Zaehler ablesen (Typ, Foto, Wert)
- Dokument anfragen

ZAEHLER ABLESEN:
- Zaehlertyp waehlen (Strom, Gas, Kaltwasser, Warmwasser)
- Foto aufnehmen
- Zählerstand eingeben
- Vorheriger Stand + Verbrauch

CHAT:
- Konversationsliste
- Chat mit Hausverwaltung
- Chat mit Hausmeister

MEHR-MENUE:
- Meine Wohnung
- Dokumente
- Hausordnung
- Notfallkontakte
- Einstellungen

SUPABASE-TABELLEN:
- issues (user_id, unit_id, category, description, image_url, priority, status)
- meter_readings (user_id, meter_type, value, image_url, reading_date)
- messages (sender_id, recipient_id, content, is_read)

Erstelle die komplette Mobile-App.
```

---

### PROMPT 3: FORMULARE

```
Erstelle "Fintutto Formulare" - eine App fuer deutsche Mietrecht-Formulare und Rechner.

DESIGN:
- Hauptfarbe: #10B981 (Gruen)
- Akzentfarbe: #4F46E5 (Indigo)
- Aufgeraeumtes, formular-optimiertes Design
- Deutsche Sprache

NAVIGATION (Tabs):
1. Formulare
2. Rechner
3. Meine Dokumente

FORMULARE-SEITE:
Kategorien als Accordion:
- Mietvertraege (Standard, Moebliert, WG, Gewerbe)
- Kuendigungen (Mieter, Vermieter, Sonder)
- Abrechnungen (Nebenkosten, Heizkosten)
- Protokolle (Uebergabe, Maengel)
- Sonstiges (Mieterhoehung, Mietminderung, Kaution, Mahnung)

Jedes Formular:
- Interaktiver Formular-Builder mit Feldern
- Live-Vorschau rechts
- PDF-Download Button
- Speichern in "Meine Dokumente"

RECHNER-SEITE (Grid mit Karten):
1. Renditerechner (Kaufpreis, Nebenkosten, Jahreskaltmiete -> Brutto/Netto-Rendite)
2. Finanzierungsrechner (Darlehen, Zins, Tilgung -> Monatsrate)
3. Nebenkostenrechner (Gesamtkosten, Flaechen -> Mieteranteil)
4. Kaufnebenkostenrechner (Kaufpreis, Bundesland -> Grunderwerbsteuer etc.)

MEINE DOKUMENTE:
- Tabelle: Name, Typ, Erstellt, Aktionen
- Ansehen, Bearbeiten, PDF, Loeschen

SUPABASE:
- documents (user_id, title, type, content_json)
- calculations (user_id, type, input_json, result_json)

Erstelle die komplette App.
```

---

### PROMPT 4: NEBENKOSTENABRECHNUNG

```
Erstelle "Fintutto Nebenkosten" - eine App fuer Nebenkostenabrechnungen nach deutschem Recht (BetrKV).

DESIGN:
- Hauptfarbe: #F97316 (Orange)
- Akzentfarbe: #4F46E5 (Indigo)
- Wizard-Style mit Fortschrittsanzeige
- Deutsche Sprache

STRUKTUR:
- Sidebar: Abrechnungen (Liste)
- Hauptbereich: 8-Schritt Wizard

8-SCHRITT WIZARD:

SCHRITT 1: OBJEKT & ZEITRAUM
- Gebaeude auswaehlen (Dropdown)
- Abrechnungszeitraum (Von-Bis)

SCHRITT 2: MIETVERTRAEGE
- Tabelle mit Checkbox
- Zeitraeume bei Mieterwechsel

SCHRITT 3: BETRIEBSKOSTEN
- Accordion mit BetrKV Kategorien (17 Stueck)
- Pro Kategorie: Betrag + Umlageschluessel

SCHRITT 4: DIREKTKOSTEN
- Mieter-spezifische Kosten

SCHRITT 5: HEIZKOSTEN
- Gesamte Heizkosten
- Aufteilung (30/70, 50/50 etc.)
- Zaehlerstaende

SCHRITT 6: ERGEBNISSE
- Tabelle pro Mieter
- Vorauszahlung, Anteil, Saldo
- Gruen = Guthaben, Rot = Nachzahlung

SCHRITT 7: VORSCHAU
- PDF-Vorschau
- Checkliste

SCHRITT 8: VERSAND
- Email, PDF, Post

SUPABASE:
- operating_costs (building_id, period_start, period_end, status)
- operating_cost_items (operating_cost_id, cost_type, amount, allocation_key)
- operating_cost_results (operating_cost_id, lease_id, prepayment, cost_share, balance)

Erstelle den kompletten 8-Schritt Wizard.
```

---

### PROMPT 5: HAUSMEISTER-APP

```
Erstelle "Fintutto Hausmeister" - eine Mobile-App fuer Hausmeister.

DESIGN:
- Hauptfarbe: #059669 (Emerald/Gruen)
- Akzentfarbe: #10B981 (Hellgruen)
- Mobile-First, grosse Touch-Targets
- Deutsche Sprache

BOTTOM-NAVIGATION:
1. Aufgaben
2. Objekte
3. Kalender
4. Nachrichten
5. Profil

AUFGABEN-SEITE:
- Filter-Tabs: Alle, Offen, In Arbeit, Erledigt
- Aufgaben-Karten:
  - Titel, Objekt/Wohnung
  - Prioritaet (Farbcode)
  - Melder (Mieter-Name)
- Swipe: Annehmen, Erledigt

AUFGABEN-DETAIL:
- Beschreibung
- Fotos vom Mieter
- Status aendern
- Notizen hinzufuegen
- Foto dokumentieren
- Zeiterfassung (Start/Stop)

OBJEKTE-SEITE:
- Liste aller Gebaeude
- Pro Gebaeude: Adresse, Einheiten, Offene Aufgaben

KALENDER:
- Monatsansicht
- Termine (Wartung, Begehung)

SUPABASE:
- tasks (unit_id, title, description, priority, status, assigned_to)
- task_photos (task_id, url, type)
- task_notes (task_id, content)
- time_entries (task_id, user_id, start_time, end_time)

Erstelle die komplette Hausmeister-App.
```

---

### PROMPT 6: OCR ZAEHLER-APP

```
Erstelle "Fintutto Zaehlerstand" - eine App zum Ablesen von Zaehlerstaenden mit OCR.

DESIGN:
- Hauptfarbe: #EAB308 (Gelb)
- Akzentfarbe: #F97316 (Orange)
- Mobile-First, Kamera-optimiert
- Deutsche Sprache

HAUPTFUNKTION:
1. Zaehlertyp waehlen (Strom, Gas, Kaltwasser, Warmwasser, Heizung)
2. Foto aufnehmen oder hochladen
3. OCR erkennt automatisch den Zaehlerstand
4. Benutzer bestaetigt oder korrigiert
5. Speichern mit Datum

DASHBOARD:
- Uebersicht aller Zaehler
- Letzter Stand + Datum
- Verbrauch seit letzter Ablesung

ZAEHLER-DETAIL:
- Historie aller Ablesungen
- Verbrauchs-Chart (Liniendiagramm)
- Vergleich mit Vorjahr

ABLESEN-FLOW:
- Kamera-Ansicht mit Rahmen
- "Foto aufnehmen" Button
- Ladebalken waehrend OCR
- Ergebnis mit Konfidenz-Anzeige
- Bearbeiten-Option
- Speichern

SUPABASE:
- meters (unit_id, meter_number, meter_type)
- meter_readings (meter_id, reading_date, value, image_url, source, confidence)

Erstelle die komplette Zaehler-App mit OCR-Simulation.
```

---

## TEIL 5: GEMEINSAMES SUPABASE-SCHEMA

```sql
-- ═══════════════════════════════════════════════════════════════════
-- ORGANISATIONEN & BENUTZER
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT, -- 'vermieter', 'hausverwaltung', 'makler'
  stripe_customer_id TEXT,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user', -- 'admin', 'vermieter', 'mieter', 'hausmeister'
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- IMMOBILIEN
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'DE',
  total_units INTEGER DEFAULT 0,
  total_area DECIMAL(10,2),
  year_built INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  unit_number TEXT NOT NULL,
  floor INTEGER,
  area DECIMAL(10,2),
  rooms DECIMAL(3,1),
  type TEXT DEFAULT 'apartment', -- 'apartment', 'commercial', 'parking'
  status TEXT DEFAULT 'available', -- 'rented', 'available', 'maintenance'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- MIETVERTRAEGE
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id),
  tenant_id UUID REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount DECIMAL(10,2) NOT NULL,
  utilities_advance DECIMAL(10,2) DEFAULT 0,
  deposit_amount DECIMAL(10,2),
  payment_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active', -- 'active', 'terminated', 'pending'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- ZAEHLER & ABLESUNGEN
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id),
  meter_number TEXT NOT NULL,
  meter_type TEXT NOT NULL, -- 'electricity', 'gas', 'water_cold', 'water_hot', 'heating'
  installation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meter_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id UUID REFERENCES meters(id),
  reading_date DATE NOT NULL,
  reading_value DECIMAL(12,3) NOT NULL,
  submitted_by UUID REFERENCES users(id),
  source TEXT DEFAULT 'manual', -- 'manual', 'ocr', 'api'
  confidence DECIMAL(3,2),
  image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- BETRIEBSKOSTEN
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE operating_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'calculated', 'sent'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE operating_cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operating_cost_id UUID REFERENCES operating_costs(id),
  cost_type TEXT NOT NULL, -- BetrKV Kategorien
  amount DECIMAL(12,2) NOT NULL,
  allocation_key TEXT DEFAULT 'area', -- 'area', 'units', 'persons', 'consumption'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- AUFGABEN & REPARATUREN
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id),
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'repair', 'maintenance', 'inspection'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'completed'
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- DOKUMENTE & NACHRICHTEN
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  document_type TEXT,
  file_url TEXT,
  file_size INTEGER,
  content_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## TEIL 6: NAECHSTE SCHRITTE

### Fuer Lovable:

1. **6 Lovable-Projekte erstellen** (eins pro App)
2. **Jeden Prompt kopieren** und in Lovable einfuegen
3. **Supabase verbinden** mit:
   - URL: `https://aaefocdqgdgexkcrjhks.supabase.co`
   - Anon Key: [Dein Key]
4. **Feintuning** der UI
5. **Testing**
6. **Custom Domains** verbinden

### Base44 App-IDs (Referenz):

| App | Base44 ID |
|-----|-----------|
| Vermietify | `694ec0b3e6d09c2e6b8e0485` |
| HausmeisterPro | `696fb16c734074a341d24cf9` |
| MieterApp | `696feb63b8085b338cf6c4e7` |
| FT_Formulare | `69738942257c5676efe9835b` |
| FT_NK_Abrechnung | `697656748422cf46cd7eecfc` |
| FT_OCR_Zaehler | `6976455cb77a3d4ec1a18e92` |
| FT_CALC_Rendite | `69717747c88c98939bb37c94` |

---

*Dokumentation basierend auf A-Docs - erstellt von Claude Code fuer Fintutto*
