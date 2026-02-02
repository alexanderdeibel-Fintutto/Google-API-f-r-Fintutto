# FINTUTTO APP-PORTFOLIO - MASTER DOKUMENTATION

> Erstellt: 2026-02-02
> Ziel: Migration von Base44 zu Lovable

---

## 🎨 EINHEITLICHES DESIGN-SYSTEM

### Fintutto Farbschema (ALLE Apps)
```css
/* Primärfarben - Dunkelblau */
--ft-primary: #1E3A8A       /* Dunkelblau */
--ft-primary-hover: #1E40AF
--ft-primary-light: #3B82F6

/* Akzentfarben - Gold/Orange */
--ft-accent: #D4AF37        /* Gold */
--ft-accent-hover: #B8972E
--ft-accent-light: #F59E0B  /* Orange */

/* Funktionale Farben */
--ft-success: #10B981       /* Grün */
--ft-warning: #F59E0B       /* Orange */
--ft-danger: #EF4444        /* Rot */
--ft-info: #3B82F6          /* Blau */

/* Neutrale */
--ft-background: #FFFFFF
--ft-foreground: #111827
--ft-muted: #6B7280
--ft-border: #E5E7EB
```

### Typography
- **Hauptfont**: Inter oder Raleway
- **Monospace**: JetBrains Mono

---

## 📱 APP 1: VERMIETIFY (ft_vermietify)

### Übersicht
- **Typ**: Enterprise Vermietungs-Plattform
- **Seiten**: 631
- **Zielgruppe**: Vermieter, Immobilienmanager
- **Komplexität**: ⭐⭐⭐⭐⭐ (Sehr hoch)

### Kernmodule

#### 1. Immobilienverwaltung
- Gebäude & Wohnungen verwalten
- Grundbuch-Integration
- Lageplan & Kartendarstellung

#### 2. Mieterverwaltung
- Mieterdatenbank
- Mietverträge (Erstellung, Analyse, Verwaltung)
- Mieter-Self-Service-Portal

#### 3. Finanzmanagement
- Bankkonten-Anbindung (FinAPI)
- Transaktionsverwaltung
- Cashflow-Analyse
- Budget-Planung

#### 4. Steueroptimierung (DACH)
- Deutschland: Anlage V, Anlage KAP, Anlage SO
- Österreich: E1a, E1b, E1c
- Schweiz: Steuererklärung Liegenschaften
- AI-Steuerberater
- ELSTER-Export

#### 5. Betriebskosten
- NK-Abrechnung
- Umlageschlüssel
- Heizkosten-Verordnung

#### 6. KI-Features (12+ Tools)
- BelegScanner (OCR)
- BuchungsKategorisierer
- SteuerOptimierer
- VertragsAnalyse
- MietpreisCheck
- EnergieAusweis-Analyse

#### 7. Kommunikation
- Messaging-Hub
- WhatsApp-Integration
- Bulk-Nachrichten
- Email-Vorlagen

### Tech-Stack (Original)
- React 18.2 + Vite
- Tailwind CSS + Radix UI
- Supabase (PostgreSQL)
- Firebase Cloud Functions
- Stripe Payments

---

## 📱 APP 2: FORMULARE (ft_fromulare_alle)

### Übersicht
- **Typ**: Deutsche Mietrecht-Formulare
- **Seiten**: 277
- **Zielgruppe**: Vermieter, Mieter, Makler
- **Komplexität**: ⭐⭐⭐⭐ (Hoch)

### Formular-Kategorien

#### Mietverträge
- Standard-Mietvertrag
- Staffelmietvertrag
- Möblierter Mietvertrag
- WG-Mietvertrag
- Gewerbemietvertrag
- Untermietvertrag

#### Kündigungen
- Mieter-Kündigung
- Vermieter-Kündigung
- Sonderkündigung
- Kündigungswiderspruch

#### Abrechnungen
- Nebenkostenabrechnung
- Heizkostenabrechnung
- Betriebskostenabrechnung

#### Protokolle
- Übergabeprotokoll
- Schönheitsreparatur-Protokoll
- Mängelprotokoll

#### Weitere Formulare
- Mieterhöhungsverlangen
- Mietminderung
- Mieterselbstauskunft
- Mietbürgschaft
- Kautionsvereinbarung
- Hausordnung

### Rechner-Tools
- Renditerechner (Brutto/Netto)
- Finanzierungsrechner
- Amortisationsrechner
- Eigenkapitalrentabilität
- Kaufnebenkosten-Rechner
- Indexmiet-Rechner
- CO2-Rechner

### Features
- PDF-Export aller Formulare
- Vorlagen-System
- Dokumenten-Sharing
- AI-Formular-Builder

---

## 📱 APP 3: MIETER (ft_mieter)

### Übersicht
- **Typ**: Mieter-Portal & Community
- **Seiten**: 193
- **Zielgruppe**: Mieter
- **Komplexität**: ⭐⭐⭐⭐ (Hoch)

### Kernfunktionen

#### Finanzen
- Mietübersicht
- Zahlungshistorie
- Nebenkosten-Einsicht
- Auto-Pay Setup
- Rechnungsauszüge

#### Reparaturen & Mängel
- Schadensmeldung mit Foto
- Reparatur-Status-Tracking
- Handwerker-Termine

#### Zählerablesung
- Strom, Gas, Wasser, Wärme
- OCR-Kamera-Erfassung
- Verbrauchshistorie
- Plausibilitätsprüfung

#### Community
- Nachbarschaftsforum ("Schwarzes Brett")
- Events & Veranstaltungen
- Gruppen & Projekte
- Marktplatz (Kaufen/Verkaufen/Tauschen)

#### Kommunikation
- Chat mit Hausverwaltung
- Chat mit Hausmeister
- Ankündigungen
- Push-Benachrichtigungen

#### Weitere Features
- Dokumentenverwaltung
- Kalender & Termine
- Notfall-Kontakte
- Mietrecht-Info

### Gamification
- Achievements & Badges
- Streaks
- Quick-Start-Challenges

---

## 📱 APP 4: NEBENKOSTENABRECHNUNG (ft_nebenkostenabrechnung)

### Übersicht
- **Typ**: Spezialisierte NK-Abrechnung
- **Seiten**: 47
- **Zielgruppe**: Vermieter, Hausverwalter
- **Komplexität**: ⭐⭐⭐ (Mittel)

### 8-Schritt NK-Wizard

1. **Objekt & Zeitraum**
   - Gebäude auswählen
   - Abrechnungszeitraum festlegen

2. **Mietverträge**
   - Relevante Verträge auswählen
   - Mieterwechsel berücksichtigen

3. **Betriebskosten**
   - Kostenarten nach BetrKV
   - Umlageschlüssel festlegen

4. **Direktkosten**
   - Mieter-spezifische Kosten
   - Individuelle Verbräuche

5. **Heizkosten**
   - Heizkosten-Verordnung
   - Verbrauch vs. Fläche (30/70, 50/50, etc.)

6. **Ergebnisse**
   - Berechnung pro Mieter
   - Nachzahlung/Guthaben

7. **Vorschau**
   - PDF-Vorschau
   - Letzte Prüfung

8. **Versand**
   - Per Email
   - Per Post (LetterXpress)
   - Download als PDF

### Features
- AI-Kostenallokation
- Automatische Plausibilitätsprüfung
- DATEV-Export
- Mieter-Portal Integration
- Einspruch-Management

---

## 📱 APP 5: ADMIN-HUB (ft_admin-hub)

### Status: ⚠️ NOCH NICHT ENTWICKELT

### Geplante Funktionen
- Zentrales Admin-Dashboard
- Benutzer- & Rollenverwaltung
- Organisation-Management
- Cross-App Einstellungen
- API-Key-Verwaltung
- Audit-Logs
- System-Health-Monitoring

---

## 📱 APP 6: HAUSMEISTER (ft_hausmeister)

### Status: ⚠️ NOCH NICHT ENTWICKELT

### Geplante Funktionen
- Aufgabenverwaltung
- Terminkalender
- Objektrundgänge
- Reparatur-Tracking
- Materialverwaltung
- Zeiterfassung
- Mieter-Kommunikation
- Dokumentation mit Fotos

---

## 📱 APP 7: OCR ZÄHLER (ft_ocr_zaehler)

### Status: ℹ️ IN FT_MIETER INTEGRIERT

Die OCR-Zähler-Funktionalität ist Teil der Mieter-App.

### Funktionen
- Kamera-basierte Zählererfassung
- AI-OCR mit Konfidenz-Score
- Manuelle Korrektur
- Offline-Modus
- Verbrauchsberechnung
- Plausibilitätsprüfung

---

## 🗄️ GEMEINSAMES SUPABASE-SCHEMA

### Kern-Tabellen

```sql
-- Organisationen & Benutzer
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT, -- 'vermieter', 'hausverwaltung', 'makler'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user', -- 'admin', 'vermieter', 'mieter', 'hausmeister'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immobilien
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
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
  type TEXT, -- 'apartment', 'commercial', 'parking'
  status TEXT DEFAULT 'available', -- 'rented', 'available', 'maintenance'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mietverträge
CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id),
  tenant_id UUID REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  payment_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active', -- 'active', 'terminated', 'pending'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zähler & Ablesungen
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

-- Betriebskosten
CREATE TABLE operating_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'calculated', 'sent', 'disputed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE operating_cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operating_cost_id UUID REFERENCES operating_costs(id),
  cost_type TEXT NOT NULL, -- BetrKV Kategorien
  amount DECIMAL(12,2) NOT NULL,
  allocation_key TEXT, -- 'area', 'units', 'persons', 'consumption'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dokumente
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  document_type TEXT,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nachrichten
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aufgaben/Reparaturen
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id),
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'cancelled'
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Views

```sql
-- Aktive Mietverträge mit Details
CREATE VIEW v_active_leases AS
SELECT
  l.*,
  u.unit_number,
  u.area,
  b.name as building_name,
  b.address,
  usr.full_name as tenant_name,
  usr.email as tenant_email
FROM leases l
JOIN units u ON l.unit_id = u.id
JOIN buildings b ON u.building_id = b.id
JOIN users usr ON l.tenant_id = usr.id
WHERE l.status = 'active';

-- Gebäude-Übersicht
CREATE VIEW v_buildings_summary AS
SELECT
  b.*,
  COUNT(DISTINCT u.id) as unit_count,
  COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as occupied_units,
  SUM(CASE WHEN l.status = 'active' THEN l.rent_amount ELSE 0 END) as total_rent
FROM buildings b
LEFT JOIN units u ON b.id = u.building_id
LEFT JOIN leases l ON u.id = l.unit_id
GROUP BY b.id;

-- Zähler mit letzter Ablesung
CREATE VIEW v_meters_with_readings AS
SELECT
  m.*,
  mr.reading_value as last_reading,
  mr.reading_date as last_reading_date
FROM meters m
LEFT JOIN LATERAL (
  SELECT reading_value, reading_date
  FROM meter_readings
  WHERE meter_id = m.id
  ORDER BY reading_date DESC
  LIMIT 1
) mr ON true;
```

---

## 🚀 LOVABLE PROMPTS

### Allgemeine Anweisungen für alle Apps:

```
WICHTIG FÜR ALLE APPS:
- Nutze React + TypeScript + Tailwind CSS + shadcn/ui
- Verbinde mit Supabase (URL und Anon Key werden separat eingegeben)
- Farbschema: Dunkelblau (#1E3A8A) + Gold (#D4AF37)
- Deutsche Sprache für alle Texte
- Mobile-First Design
- Dark Mode Support
```

---

### PROMPT 1: VERMIETIFY (Haupt-App)

```
Erstelle "Vermietify" - eine vollständige Immobilienverwaltungs-Plattform für deutsche Vermieter.

DESIGN:
- Primärfarbe: Dunkelblau (#1E3A8A)
- Akzentfarbe: Gold (#D4AF37)
- Modern, professionell, mit Glassmorphism-Elementen
- Dark Mode Support

STRUKTUR (Sidebar-Navigation):
1. Dashboard - Übersicht mit KPIs (Mieteinnahmen, Leerstand, offene Aufgaben)
2. Immobilien - Gebäude und Wohnungen verwalten
3. Mieter - Mieterdatenbank und Verträge
4. Finanzen - Einnahmen, Ausgaben, Bankkonten
5. Dokumente - Dokumentenverwaltung mit Upload
6. Abrechnungen - Nebenkostenabrechnung
7. Steuern - Steueroptimierung Deutschland
8. Kommunikation - Nachrichten an Mieter
9. Einstellungen - Profil und App-Einstellungen

FEATURES PRO SEITE:

Dashboard:
- 4 KPI-Karten (Gesamtmiete, Leerstandsquote, Offene Reparaturen, Ausstehende Zahlungen)
- Liniendiagramm: Mieteinnahmen letzte 12 Monate
- Tabelle: Nächste Mietfälligkeiten
- Liste: Offene Aufgaben

Immobilien:
- Kartenansicht aller Gebäude mit Kartenvorschau
- Gebäude hinzufügen/bearbeiten Dialog
- Wohnungen pro Gebäude mit Status (vermietet/leer)
- Gebäude-Detail mit allen Einheiten

Mieter:
- Mieterliste mit Suchfunktion
- Mieter-Profil mit Vertragsdaten
- Mietvertrag erstellen (Formular mit: Mieter, Wohnung, Startdatum, Miete, Kaution)

Finanzen:
- Monatliche Einnahmen/Ausgaben Übersicht
- Transaktionsliste mit Filter
- Bankkonten verknüpfen (UI-Placeholder)
- Rechnung erstellen

SUPABASE-TABELLEN:
- buildings (id, name, address, city, postal_code)
- units (id, building_id, unit_number, area, rooms, rent_amount, status)
- tenants (id, first_name, last_name, email, phone)
- leases (id, unit_id, tenant_id, start_date, end_date, rent_amount, deposit)
- transactions (id, lease_id, amount, type, date, description)
- documents (id, title, file_url, type, created_at)

AUTH:
- Supabase Auth mit Email/Password
- Protected Routes für eingeloggte User

Erstelle die komplette App mit allen genannten Seiten und Funktionen.
```

---

### PROMPT 2: FORMULARE

```
Erstelle "Fintutto Formulare" - eine Web-App für deutsche Mietrecht-Formulare und Immobilien-Rechner.

DESIGN:
- Primärfarbe: Dunkelblau (#1E3A8A)
- Akzentfarbe: Gold (#D4AF37)
- Aufgeräumt, formular-optimiert
- Responsive für Desktop und Mobile

NAVIGATION (Tabs oben):
1. Formulare
2. Rechner
3. Meine Dokumente

FORMULARE-SEITE:
Kategorien als Accordion:
- Mietverträge (Standard, Möbliert, WG, Gewerbe)
- Kündigungen (Mieter, Vermieter, Sonder)
- Abrechnungen (Nebenkosten, Heizkosten)
- Protokolle (Übergabe, Mängel)
- Sonstiges (Mieterhöhung, Mietminderung, Kaution)

Jedes Formular:
- Interaktiver Formular-Builder
- Pflichtfelder markiert
- Live-Vorschau rechts
- PDF-Download Button
- In "Meine Dokumente" speichern

BEISPIEL-FORMULAR "Mietvertrag":
Felder:
- Vermieter (Name, Adresse)
- Mieter (Name, Adresse, Geburtsdatum)
- Mietobjekt (Adresse, Etage, Fläche, Zimmer)
- Mietbeginn, Mietende (optional)
- Kaltmiete, Nebenkosten-Vorauszahlung
- Kaution
- Besondere Vereinbarungen (Textarea)

RECHNER-SEITE:
Grid mit Rechner-Karten:

1. Renditerechner
   - Kaufpreis, Kaufnebenkosten, Jahreskaltmiete, Instandhaltung
   - Output: Brutto-Rendite, Netto-Rendite, Faktor

2. Finanzierungsrechner
   - Darlehensbetrag, Zinssatz, Tilgung, Laufzeit
   - Output: Monatliche Rate, Gesamtkosten, Restschuld

3. Nebenkostenrechner
   - Gesamtkosten, Fläche Gebäude, Fläche Wohnung, Mietmonate
   - Output: Anteil Mieter, Monatliche Vorauszahlung

4. Kaufnebenkosten-Rechner
   - Kaufpreis, Bundesland
   - Output: Grunderwerbsteuer, Notar, Grundbuch, Makler, Gesamt

MEINE DOKUMENTE:
- Tabelle mit allen erstellten Dokumenten
- Spalten: Name, Typ, Erstellt am, Aktionen
- Aktionen: Ansehen, Bearbeiten, PDF, Löschen

SUPABASE:
- documents (id, user_id, title, type, content_json, created_at)
- calculations (id, user_id, type, input_json, result_json, created_at)

Erstelle die komplette App mit allen Formularen und Rechnern.
```

---

### PROMPT 3: MIETER-APP

```
Erstelle "Fintutto Mieter" - eine Mobile-First App für Mieter zur Kommunikation mit ihrer Hausverwaltung.

DESIGN:
- Primärfarbe: Dunkelblau (#1E3A8A)
- Akzentfarbe: Gold (#D4AF37)
- Mobile-First mit Bottom-Navigation
- Freundlich und zugänglich

BOTTOM-NAVIGATION (5 Tabs):
1. Home (Dashboard)
2. Finanzen
3. Melden (+ Button, hervorgehoben)
4. Chat
5. Mehr

HOME-DASHBOARD:
- Begrüßung "Hallo, [Name]!"
- Karte: Nächste Mietzahlung (Betrag, Fällig am)
- Karte: Offene Meldungen (Anzahl)
- Quick Actions: Zähler ablesen, Mangel melden
- Letzte Nachrichten (3 Stück)
- Ankündigungen der Hausverwaltung

FINANZEN:
- Aktueller Kontostand (Guthaben/Nachzahlung)
- Monatliche Miete Aufschlüsselung (Kaltmiete, Nebenkosten)
- Zahlungshistorie (Liste)
- Button: Zahlungsnachweis hochladen

MELDEN (Floating Action Menu):
- Mangel melden
- Zähler ablesen
- Dokument anfragen

MANGEL MELDEN:
- Kategorie (Dropdown: Heizung, Wasser, Elektrik, Fenster/Türen, Sonstiges)
- Beschreibung (Textarea)
- Foto hochladen (Kamera oder Galerie)
- Dringlichkeit (Niedrig, Mittel, Hoch, Notfall)
- Absenden Button

ZÄHLER ABLESEN:
- Zählertyp auswählen (Strom, Gas, Kaltwasser, Warmwasser)
- Zählernummer anzeigen
- Foto aufnehmen (mit Kamera)
- Zählerstand eingeben
- Vorheriger Stand + Verbrauch anzeigen
- Absenden

CHAT:
- Konversationsliste
- Chat mit Hausverwaltung
- Chat mit Hausmeister
- Nachrichten mit Zeitstempel
- Nachricht senden (Text + Anhang)

MEHR (Menüliste):
- Meine Wohnung (Details)
- Dokumente
- Hausordnung
- Notfallkontakte
- Einstellungen
- Abmelden

SUPABASE:
- users (id, email, name, unit_id, role)
- units (id, building_id, number, address)
- issues (id, user_id, unit_id, category, description, image_url, priority, status, created_at)
- meter_readings (id, user_id, meter_type, value, image_url, reading_date)
- messages (id, sender_id, recipient_id, content, created_at, is_read)
- announcements (id, title, content, created_at)

AUTH:
- Supabase Auth
- Nur Mieter-Rolle kann diese App nutzen

Erstelle die komplette Mobile-App mit allen Features.
```

---

### PROMPT 4: NEBENKOSTENABRECHNUNG

```
Erstelle "Fintutto Nebenkosten" - eine spezialisierte App für die Erstellung von Nebenkostenabrechnungen nach deutschem Recht (BetrKV).

DESIGN:
- Primärfarbe: Dunkelblau (#1E3A8A)
- Akzentfarbe: Gold (#D4AF37)
- Wizard-Style mit Fortschrittsanzeige
- Übersichtlich trotz komplexer Daten

HAUPTSTRUKTUR:
- Sidebar: Abrechnungen (Liste)
- Hauptbereich: 8-Schritt Wizard

SIDEBAR:
- "Neue Abrechnung" Button
- Liste vergangener Abrechnungen
- Filter: Jahr, Gebäude, Status

8-SCHRITT WIZARD:

SCHRITT 1: OBJEKT & ZEITRAUM
- Gebäude auswählen (Dropdown)
- Abrechnungszeitraum (Von-Bis Datepicker)
- Weiter Button

SCHRITT 2: MIETVERTRÄGE
- Tabelle: Alle Mietverträge im Gebäude
- Checkbox: In Abrechnung einbeziehen
- Bei Mieterwechsel: Zeiträume automatisch aufteilen
- Info: Anzahl ausgewählte Verträge

SCHRITT 3: BETRIEBSKOSTEN
- Accordion mit BetrKV Kategorien:
  1. Laufende öffentliche Lasten
  2. Wasserversorgung
  3. Entwässerung
  4. Heizung (separater Schritt)
  5. Warmwasser
  6. Aufzug
  7. Straßenreinigung
  8. Müllabfuhr
  9. Gebäudereinigung
  10. Gartenpflege
  11. Beleuchtung
  12. Schornsteinreinigung
  13. Versicherungen
  14. Hauswart
  15. Sonstige

Pro Kategorie:
- Gesamtbetrag eingeben
- Umlageschlüssel (Fläche, Einheiten, Personen, Verbrauch)

SCHRITT 4: DIREKTKOSTEN
- Tabelle: Mieter-spezifische Kosten
- Mieter auswählen, Betrag, Beschreibung
- Beispiel: Kabelanschluss, Garage

SCHRITT 5: HEIZKOSTEN
- Heizkosten-Verordnung Info
- Gesamte Heizkosten eingeben
- Aufteilung festlegen (Slider: 30/70, 50/50, etc.)
- Grundkosten (nach Fläche)
- Verbrauchskosten (nach Verbrauch)
- Zählerstände importieren oder manuell

SCHRITT 6: ERGEBNISSE
- Tabelle: Ergebnis pro Mieter
- Spalten: Mieter, Vorauszahlung, Anteil Kosten, Saldo
- Grün = Guthaben, Rot = Nachzahlung
- Summen-Zeile

SCHRITT 7: VORSCHAU
- PDF-Vorschau der Abrechnung
- Für jeden Mieter separat
- Prüfliste:
  ✓ Abrechnungszeitraum korrekt
  ✓ Alle Kosten erfasst
  ✓ Umlageschlüssel plausibel
  ✓ Vorauszahlungen korrekt

SCHRITT 8: VERSAND
- Versandoptionen:
  - Per Email
  - Als PDF Download
  - Per Post (Placeholder)
- Mieter auswählen
- Absenden Button
- Status: Versendet

SUPABASE:
- buildings, units, leases (wie zuvor)
- operating_costs (id, building_id, period_start, period_end, status)
- operating_cost_items (id, operating_cost_id, cost_type, amount, allocation_key)
- operating_cost_results (id, operating_cost_id, lease_id, prepayment, cost_share, balance)

Erstelle die komplette Wizard-App mit allen 8 Schritten.
```

---

### PROMPT 5: HAUSMEISTER-APP

```
Erstelle "Fintutto Hausmeister" - eine Mobile-App für Hausmeister zur Aufgabenverwaltung und Kommunikation.

DESIGN:
- Primärfarbe: Dunkelblau (#1E3A8A)
- Akzentfarbe: Gold (#D4AF37)
- Mobile-First, einfach zu bedienen
- Große Touch-Targets

BOTTOM-NAVIGATION:
1. Aufgaben
2. Objekte
3. Kalender
4. Nachrichten
5. Profil

AUFGABEN-SEITE:
- Filter-Tabs: Alle, Offen, In Arbeit, Erledigt
- Aufgaben-Karten:
  - Titel
  - Objekt/Wohnung
  - Priorität (Farbcode)
  - Erstellt am
  - Melder (Mieter-Name)
- Swipe-Aktionen: Annehmen, Erledigt

AUFGABEN-DETAIL:
- Beschreibung
- Fotos vom Mieter
- Status ändern (Dropdown)
- Notizen hinzufügen
- Foto hinzufügen (Dokumentation)
- Material erfassen
- Zeiterfassung (Start/Stop)
- Als erledigt markieren

OBJEKTE-SEITE:
- Liste aller betreuten Gebäude
- Pro Gebäude: Adresse, Einheiten, Offene Aufgaben

OBJEKT-DETAIL:
- Gebäude-Info
- Liste aller Wohnungen
- Kontakt Hausverwaltung
- Rundgang starten (Checkliste)

KALENDER:
- Monatsansicht
- Termine anzeigen (Wartung, Begehung, etc.)
- Termin erstellen

NACHRICHTEN:
- Chat mit Hausverwaltung
- Chat mit Mietern (bei Rückfragen)

PROFIL:
- Name, Kontakt
- Arbeitszeitübersicht
- Erledigte Aufgaben (Statistik)
- Abmelden

SUPABASE:
- users (mit role='hausmeister')
- buildings, units
- tasks (id, unit_id, title, description, priority, status, created_by, assigned_to, created_at, completed_at)
- task_photos (id, task_id, url, type, uploaded_at)
- task_notes (id, task_id, content, created_at)
- time_entries (id, task_id, user_id, start_time, end_time)

Erstelle die komplette Hausmeister-App.
```

---

### PROMPT 6: ADMIN-HUB

```
Erstelle "Fintutto Admin Hub" - ein zentrales Administrations-Dashboard für das gesamte Fintutto-Ökosystem.

DESIGN:
- Primärfarbe: Dunkelblau (#1E3A8A)
- Akzentfarbe: Gold (#D4AF37)
- Professionell, Dashboard-orientiert
- Daten-fokussiert

SIDEBAR-NAVIGATION:
1. Dashboard
2. Benutzer
3. Organisationen
4. Apps
5. API & Webhooks
6. Logs & Audit
7. System
8. Einstellungen

DASHBOARD:
- KPI-Karten:
  - Aktive Benutzer
  - Organisationen
  - API-Calls heute
  - System-Status
- Grafik: Benutzer-Wachstum
- Grafik: API-Nutzung
- Letzte Aktivitäten

BENUTZER:
- Tabelle: Alle Benutzer
- Spalten: Name, Email, Organisation, Rolle, Status, Erstellt
- Such- und Filter-Funktion
- Benutzer bearbeiten Modal
- Benutzer sperren/entsperren

ORGANISATIONEN:
- Tabelle: Alle Organisationen
- Spalten: Name, Typ, Benutzer, Gebäude, Plan, Erstellt
- Organisation-Detail:
  - Übersicht
  - Benutzer der Organisation
  - Gebäude
  - Rechnungen
  - Einstellungen

APPS:
- Karten für jede Fintutto-App:
  - Vermietify
  - Formulare
  - Mieter
  - Nebenkosten
  - Hausmeister
- Pro App: Aktive Nutzer, Status, Version
- App aktivieren/deaktivieren pro Organisation

API & WEBHOOKS:
- API-Keys verwalten
- Webhook-Endpunkte konfigurieren
- Request-Log der letzten 100 Anfragen

LOGS & AUDIT:
- Aktivitäts-Log (wer hat was wann gemacht)
- Filter: Benutzer, Aktion, Zeitraum
- Export als CSV

SYSTEM:
- System-Status aller Services
- Datenbank-Statistiken
- Cache-Management
- Jobs & Background-Tasks

EINSTELLUNGEN:
- Globale Einstellungen
- Email-Templates
- Benachrichtigungs-Einstellungen
- Backup-Konfiguration

SUPABASE:
- Alle bestehenden Tabellen
- api_keys (id, organization_id, key, name, scopes, created_at, expires_at)
- webhooks (id, organization_id, url, events, active)
- audit_logs (id, user_id, action, resource, details, created_at)

Erstelle das komplette Admin-Dashboard.
```

---

## 🔗 SUPABASE VERBINDUNG

### Deine Supabase-Daten:
```
Project URL: https://aaefocdqgdgexkcrjhks.supabase.co
Anon Key: [Dein Anon Key hier einfügen]
```

### In Lovable verbinden:
1. Projekt öffnen
2. Settings (Zahnrad) → Supabase
3. URL und Anon Key eingeben
4. Verbinden

---

## ✅ NÄCHSTE SCHRITTE

1. [ ] Lovable Account einrichten (Team/Workspace)
2. [ ] 6 neue Projekte erstellen (eine pro App)
3. [ ] Jeden Prompt in das entsprechende Projekt einfügen
4. [ ] Supabase verbinden
5. [ ] Feintuning der Apps
6. [ ] Testing
7. [ ] Deployment

---

*Dokumentation erstellt von Claude Code für Fintutto*
