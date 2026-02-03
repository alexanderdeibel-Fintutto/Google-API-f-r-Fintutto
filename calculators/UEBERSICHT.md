# FINTUTTO RECHNER & CHECKER - ÜBERSICHT

## 10 Neue Apps (Lovable-Projekte)

Stand: 03.02.2026

---

## 5 RECHNER

| # | Name | URL | Stripe Product | Tier | SEO-Domain |
|---|------|-----|----------------|------|------------|
| 1 | **Mieterhöhungs-Rechner** | /rechner/mieterhoehung | prod_Ts5wJl6XdESKew | Premium | mieterhoehung.eu |
| 2 | **Kaufnebenkosten-Rechner** | /rechner/kaufnebenkosten | prod_Ts5w5Mrc44kOYi | Professional | kaufnebenkosten-rechner.de |
| 3 | **Eigenkapital-Rechner** | /rechner/eigenkapital | prod_Ts5wSzpcKCQEpt | Professional | - |
| 4 | **Kautions-Rechner** | /rechner/kaution | prod_Ts5wJja4VPMrr1 | Standard | kautions-rechner.de |
| 5 | **Grundsteuer-Rechner** | /rechner/grundsteuer | prod_Ts5wKaQNm59Oxg | Professional | - |

---

## 5 CHECKER

| # | Name | URL | Stripe Product | Tier | SEO-Domain |
|---|------|-----|----------------|------|------------|
| 1 | **Mietpreisbremsen-Check** | /check/mietpreisbremse | prod_Ts5xJIW1emFUZI | Plus/Pro | - |
| 2 | **Mieterhöhungs-Check** | /check/mieterhoehung | prod_Ts5xpMee390YkL | Plus/Pro | meinmieterhoehungscheck.de |
| 3 | **Kündigungsfrist-Check** | /check/kuendigung | prod_Ts5xN3fjwDH0Du | Plus/Pro | meinkuendigungsfristcheck.de |
| 4 | **Kautions-Check** | /check/kaution | prod_Ts5x53vTuxwLzF | Plus/Pro | - |
| 5 | **Schönheitsreparaturen-Check** | /check/schoenheitsreparaturen | prod_Ts5xShOjoCL81Y | Plus/Pro | - |

---

## LOVABLE SETUP-ANLEITUNG

### Schritt 1: Neue App erstellen
1. Gehe zu lovable.dev
2. "New Project"
3. Name: `ft_calc_[name]` oder `ft_check_[name]`

### Schritt 2: Basis-Prompt kopieren
Kopiere aus `MASTER_LOVABLE_PROMPT.md`:
- Design-System
- Komponenten-Klassen
- Dateistruktur

### Schritt 3: Spezifischen Prompt hinzufügen
Kopiere aus dem jeweiligen Rechner/Checker-Prompt:
- Input-Felder
- Backend-Funktion
- Ergebnis-Anzeige

### Schritt 4: Backend-Funktion deployen
```bash
# In Supabase Edge Functions
supabase functions deploy calculate[Name]
supabase functions deploy check[Name]
```

### Schritt 5: Stripe integrieren
Die Stripe Product/Price IDs sind in jedem Prompt dokumentiert.

---

## BACKEND-FUNKTIONEN (Edge Functions)

### Rechner
```
calculateMieterhoehung(input)
calculateKaufnebenkosten(input)
calculateEigenkapital(input)
calculateKaution(input)
calculateGrundsteuer(input)
```

### Checker
```
checkMietpreisbremse(input)
checkMieterhoehung(input)
checkKuendigung(input)
checkKaution(input)
checkSchoenheitsreparaturen(input)
```

---

## DATENBANK-TABELLEN (falls benötigt)

### Für Mietpreisbremse
```sql
CREATE TABLE mietpreisbremsen_gebiete (
  plz TEXT PRIMARY KEY,
  ort TEXT,
  aktiv BOOLEAN DEFAULT true,
  gueltig_bis DATE,
  vergleichsmiete DECIMAL(10,2),
  verordnung TEXT,
  bundesland TEXT
);
```

### Für Grundsteuer
```sql
CREATE TABLE bodenrichtwerte (
  plz TEXT,
  gemeinde TEXT,
  bodenrichtwert DECIMAL(10,2),
  stand DATE,
  PRIMARY KEY (plz, gemeinde)
);

CREATE TABLE hebesaetze (
  gemeinde TEXT PRIMARY KEY,
  hebesatz_a INTEGER, -- Land- und Forstwirtschaft
  hebesatz_b INTEGER, -- Grundvermögen
  stand DATE
);
```

---

## CROSS-SELL MATRIX

| Von Tool | Cross-Sell zu |
|----------|--------------|
| Mieterhöhungs-Rechner | Mieterhöhungs-Check, Vermietify |
| Kaufnebenkosten-Rechner | Rendite-Rechner, Eigenkapital-Rechner |
| Eigenkapital-Rechner | Tilgungsrechner, Rendite-Rechner |
| Kautions-Rechner | Kautions-Check, Vermietify |
| Grundsteuer-Rechner | AfA-Rechner, Vermietify |
| Mietpreisbremsen-Check | Nebenkosten-Check, MieterApp |
| Mieterhöhungs-Check | Mieterhöhungs-Rechner, MieterApp |
| Kündigungsfrist-Check | Formular: Kündigung |
| Kautions-Check | Kautions-Rechner |
| Schönheitsreparaturen-Check | Nebenkosten-Check |

---

## NÄCHSTE SCHRITTE

1. [ ] Lovable-Apps erstellen (pro App ca. 30-60 Min)
2. [ ] Backend-Funktionen in Supabase deployen
3. [ ] Datenbank-Tabellen anlegen (Mietpreisbremse, Bodenrichtwerte)
4. [ ] Stripe Checkout integrieren
5. [ ] SEO-Domains konfigurieren (301-Redirects)
6. [ ] Lead-Capture mit Brevo verbinden
7. [ ] Testing

---

## DATEIEN IN DIESEM ORDNER

```
calculators/
├── MASTER_LOVABLE_PROMPT.md      # Basis für alle Apps
├── UEBERSICHT.md                 # Diese Datei
├── rechner/
│   ├── 01_MIETERHOEHUNG_RECHNER.md
│   ├── 02_KAUFNEBENKOSTEN_RECHNER.md
│   ├── 03_EIGENKAPITAL_RECHNER.md
│   ├── 04_KAUTION_RECHNER.md
│   └── 05_GRUNDSTEUER_RECHNER.md
└── checker/
    ├── 01_MIETPREISBREMSE_CHECK.md
    ├── 02_MIETERHOEHUNG_CHECK.md
    ├── 03_KUENDIGUNG_CHECK.md
    ├── 04_KAUTION_CHECK.md
    └── 05_SCHOENHEITSREPARATUREN_CHECK.md
```
