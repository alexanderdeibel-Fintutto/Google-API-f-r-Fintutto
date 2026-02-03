# FT_CALC_EIGENKAPITAL - Eigenkapital-Rechner

## App-Info
- **Name:** ft_calc_eigenkapital
- **URL:** fintutto.de/rechner/eigenkapital
- **Stripe Product ID:** prod_Ts5wSzpcKCQEpt (Professional)
- **Tier:** Professional (€1.99/Monat, €19.90/Jahr, €19.90 Lifetime)

---

## LOVABLE PROMPT

```
Erstelle einen professionellen Eigenkapital-Rechner für Immobilieninvestoren.

## ZWECK
Berechnet das benötigte Eigenkapital für einen Immobilienkauf:
- Mindest-Eigenkapital (Nebenkosten)
- Empfohlenes Eigenkapital (20-30%)
- Auswirkung auf Finanzierung und Zinsen

## INPUT-FELDER

### Gruppe 1: Kaufpreis & Nebenkosten
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| kaufpreis | number | Kaufpreis | € | Ja | - |
| nebenkosten_prozent | number | Kaufnebenkosten | % | Ja | Default: 10% (inkl. Makler) |

### Gruppe 2: Finanzierung
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| eigenkapital_vorhanden | number | Vorhandenes Eigenkapital | € | Ja | Liquide Mittel |
| zinssatz_100 | number | Zinssatz bei 100% Finanzierung | % | Nein | Default: 4.5% |
| zinssatz_80 | number | Zinssatz bei 80% Finanzierung | % | Nein | Default: 3.8% |
| zinssatz_60 | number | Zinssatz bei 60% Finanzierung | % | Nein | Default: 3.2% |

### Gruppe 3: Erwartete Einnahmen (Optional)
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| jahresmiete | number | Erwartete Jahresmiete | € | Nein | Kaltmiete |

## BACKEND-FUNKTION

```javascript
// base44.functions.invoke('calculateEigenkapital', {...})

function calculateEigenkapital(input) {
  const {
    kaufpreis,
    nebenkosten_prozent = 10,
    eigenkapital_vorhanden,
    zinssatz_100 = 4.5,
    zinssatz_80 = 3.8,
    zinssatz_60 = 3.2,
    jahresmiete = 0
  } = input;

  // Gesamtkosten
  const nebenkosten = kaufpreis * (nebenkosten_prozent / 100);
  const gesamtkosten = kaufpreis + nebenkosten;

  // Mindest-EK (nur Nebenkosten)
  const ek_minimum = nebenkosten;

  // Empfohlene EK-Stufen
  const ek_20_prozent = gesamtkosten * 0.2;
  const ek_30_prozent = gesamtkosten * 0.3;

  // Aktuelle Situation
  const ek_quote = (eigenkapital_vorhanden / gesamtkosten) * 100;
  const darlehensbetrag = gesamtkosten - eigenkapital_vorhanden;
  const beleihungsauslauf = (darlehensbetrag / kaufpreis) * 100;

  // Zinssatz basierend auf Beleihung
  let aktueller_zinssatz;
  if (beleihungsauslauf > 90) {
    aktueller_zinssatz = zinssatz_100;
  } else if (beleihungsauslauf > 70) {
    aktueller_zinssatz = zinssatz_80;
  } else {
    aktueller_zinssatz = zinssatz_60;
  }

  // Monatliche Rate (bei 2% Tilgung)
  const tilgung = 2;
  const annuitaet_prozent = aktueller_zinssatz + tilgung;
  const monatliche_rate = (darlehensbetrag * (annuitaet_prozent / 100)) / 12;

  // Cashflow (wenn Miete angegeben)
  const monatlicher_cashflow = jahresmiete > 0
    ? (jahresmiete / 12) - monatliche_rate
    : null;

  // Bewertung
  let empfehlung;
  if (ek_quote < 10) {
    empfehlung = 'kritisch';
  } else if (ek_quote < 20) {
    empfehlung = 'ausreichend';
  } else if (ek_quote < 30) {
    empfehlung = 'gut';
  } else {
    empfehlung = 'sehr_gut';
  }

  return {
    kaufpreis,
    nebenkosten: round(nebenkosten, 2),
    gesamtkosten: round(gesamtkosten, 2),
    eigenkapital_vorhanden,
    ek_quote: round(ek_quote, 1),
    ek_minimum: round(ek_minimum, 2),
    ek_20_prozent: round(ek_20_prozent, 2),
    ek_30_prozent: round(ek_30_prozent, 2),
    darlehensbetrag: round(darlehensbetrag, 2),
    beleihungsauslauf: round(beleihungsauslauf, 1),
    aktueller_zinssatz,
    monatliche_rate: round(monatliche_rate, 2),
    monatlicher_cashflow: monatlicher_cashflow ? round(monatlicher_cashflow, 2) : null,
    empfehlung,
    fehlbetrag_minimum: Math.max(0, ek_minimum - eigenkapital_vorhanden),
    fehlbetrag_20: Math.max(0, ek_20_prozent - eigenkapital_vorhanden)
  };
}
```

## ERGEBNIS-ANZEIGE

### Primary Result
- **Label:** "Ihre Eigenkapitalquote"
- **Value:** `{ek_quote}%`
- **Color:** Rot (<10%), Orange (10-20%), Grün (>20%)

### Secondary Results (2x2 Grid)
1. Darlehensbetrag: `{darlehensbetrag} €`
2. Beleihungsauslauf: `{beleihungsauslauf}%`
3. Zinssatz: `{aktueller_zinssatz}%`
4. Monatliche Rate: `{monatliche_rate} €`

### Breakdown
- Gesamtkosten: `{gesamtkosten} €`
- - Eigenkapital: `{eigenkapital_vorhanden} €`
- = Darlehen: `{darlehensbetrag} €`

### Empfehlungs-Box
Je nach `empfehlung`:
- **kritisch:** "Sie sollten mindestens {fehlbetrag_minimum} € mehr EK einbringen"
- **ausreichend:** "Finanzierung möglich, aber hohe Zinsen"
- **gut:** "Solide Eigenkapitalquote"
- **sehr_gut:** "Optimale Finanzierungsvoraussetzungen"

### Vergleichstabelle
| EK-Quote | Benötigtes EK | Zinssatz | Rate/Monat |
|----------|---------------|----------|------------|
| 10% (Min) | {ek_minimum} € | {zinssatz_100}% | {rate_100} € |
| 20% | {ek_20_prozent} € | {zinssatz_80}% | {rate_80} € |
| 30% | {ek_30_prozent} € | {zinssatz_60}% | {rate_60} € |

## BESONDERHEITEN
- Slider für Eigenkapital mit visueller Anzeige
- Grafik: EK-Quote vs. Zinssatz
- Hinweis: "Viele Banken verlangen mind. 10-20% Eigenkapital"

## CROSS-SELL
"Planen Sie Ihre Finanzierung mit unserem Tilgungsrechner"
→ Link zu /rechner/tilgung
```

---

## STRIPE PRICE IDs
- Basic/Monat: price_1SuLke52lqSgjCzejNMg9aI1 (€1.99)
- Basic/Jahr: price_1SuLkf52lqSgjCzewLKM7yky (€19.90)
- Pro/Monat: price_1SuLkf52lqSgjCzeMWgtSbWX (€4.99)
- Pro/Jahr: price_1SuLkg52lqSgjCzebAorcaTj (€49.90)
- Lifetime: price_1SuLkg52lqSgjCzeQr7I6Qgb (€19.90)
