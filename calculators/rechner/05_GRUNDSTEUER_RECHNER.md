# FT_CALC_GRUNDSTEUER - Grundsteuer-Rechner

## App-Info
- **Name:** ft_calc_grundsteuer
- **URL:** fintutto.de/rechner/grundsteuer
- **Stripe Product ID:** prod_Ts5wKaQNm59Oxg (Professional)
- **Tier:** Professional (€1.99/Monat, €19.90/Jahr, €19.90 Lifetime)

---

## LOVABLE PROMPT

```
Erstelle einen professionellen Grundsteuer-Rechner (nach Grundsteuerreform 2025).

## ZWECK
Berechnet die neue Grundsteuer nach dem Bundesmodell (§ 218 ff. BewG):
- Grundsteuerwert (Bodenrichtwert × Fläche + Gebäudewert)
- Steuermessbetrag
- Grundsteuer (mit Hebesatz der Gemeinde)

Unterstützt die Modelle:
- Bundesmodell (Standard für die meisten Bundesländer)
- Bayern (Flächenmodell)
- Baden-Württemberg (modifiziertes Bodenwertmodell)
- Hamburg, Niedersachsen, Hessen (eigene Modelle)

## INPUT-FELDER

### Gruppe 1: Grundstück
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| bundesland | select | Bundesland | - | Ja | Bestimmt Berechnungsmodell |
| grundstuecksflaeche | number | Grundstücksfläche | m² | Ja | Laut Grundbuch |
| bodenrichtwert | number | Bodenrichtwert | €/m² | Ja | BORIS-Portal |
| art | select | Grundstücksart | - | Ja | Wohngrundstück, etc. |

### Gruppe 2: Gebäude (für Bundesmodell)
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| wohnflaeche | number | Wohnfläche | m² | Ja* | Nur bei Bundesmodell |
| baujahr | number | Baujahr | - | Ja* | Für Alterswertminderung |
| mietniveau_stufe | select | Mietniveaustufe | 1-7 | Ja* | Laut Gemeinde |

### Gruppe 3: Hebesatz
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| gemeinde | text | Gemeinde | - | Ja | Für Hebesatz |
| hebesatz | number | Hebesatz | % | Ja | Default je nach Gemeinde |

### Grundstücksart-Optionen
```javascript
const GRUNDSTUECKSARTEN = [
  { value: 'einfamilienhaus', label: 'Einfamilienhaus', messzahl: 0.31 },
  { value: 'zweifamilienhaus', label: 'Zweifamilienhaus', messzahl: 0.31 },
  { value: 'mietwohngrundstuck', label: 'Mietwohngrundstück', messzahl: 0.31 },
  { value: 'wohnungseigentum', label: 'Wohnungseigentum', messzahl: 0.31 },
  { value: 'teileigentum', label: 'Teileigentum', messzahl: 0.34 },
  { value: 'geschaeftsgrundstuck', label: 'Geschäftsgrundstück', messzahl: 0.34 },
  { value: 'unbebautes_grundstuck', label: 'Unbebautes Grundstück', messzahl: 0.34 }
];

// Mietniveaustufen (Bundesmodell)
const MIETNIVEAUSTUFEN = {
  1: 3.50, 2: 4.46, 3: 5.00, 4: 5.52, 5: 6.05, 6: 6.90, 7: 8.00
};
```

## BACKEND-FUNKTION

```javascript
// base44.functions.invoke('calculateGrundsteuer', {...})

function calculateGrundsteuer(input) {
  const {
    bundesland,
    grundstuecksflaeche,
    bodenrichtwert,
    art,
    wohnflaeche = 0,
    baujahr = 2000,
    mietniveau_stufe = 4,
    hebesatz = 400
  } = input;

  // Bundesmodell-Berechnung (vereinfacht)
  // 1. Bodenwert
  const bodenwert = grundstuecksflaeche * bodenrichtwert;

  // 2. Gebäudewert (Ertragswert-Verfahren, vereinfacht)
  const rohmiete_qm = MIETNIVEAUSTUFEN[mietniveau_stufe];
  const jahresrohmiete = wohnflaeche * rohmiete_qm * 12;

  // Alterswertminderung (max 30%)
  const alter = new Date().getFullYear() - baujahr;
  const alterswertminderung = Math.min(alter * 0.5, 30) / 100;

  // Vervielfältiger (vereinfacht: 12.5 für Wohngrundstücke)
  const vervielfaeltiger = 12.5;
  const gebaeudewert = jahresrohmiete * vervielfaeltiger * (1 - alterswertminderung);

  // 3. Grundsteuerwert (Summe, abgerundet auf volle 100€)
  const grundsteuerwert_roh = bodenwert + gebaeudewert;
  const grundsteuerwert = Math.floor(grundsteuerwert_roh / 100) * 100;

  // 4. Steuermessbetrag
  const messzahl = GRUNDSTUECKSARTEN.find(a => a.value === art)?.messzahl || 0.31;
  const steuermessbetrag = grundsteuerwert * (messzahl / 1000);

  // 5. Grundsteuer
  const grundsteuer_jahr = steuermessbetrag * (hebesatz / 100);
  const grundsteuer_quartal = grundsteuer_jahr / 4;
  const grundsteuer_monat = grundsteuer_jahr / 12;

  return {
    bundesland,
    modell: 'bundesmodell', // oder 'bayern_flaechenmodell', etc.
    bodenwert: round(bodenwert, 2),
    gebaeudewert: round(gebaeudewert, 2),
    grundsteuerwert,
    messzahl,
    steuermessbetrag: round(steuermessbetrag, 2),
    hebesatz,
    grundsteuer_jahr: round(grundsteuer_jahr, 2),
    grundsteuer_quartal: round(grundsteuer_quartal, 2),
    grundsteuer_monat: round(grundsteuer_monat, 2),
    // Details
    rohmiete_qm,
    jahresrohmiete: round(jahresrohmiete, 2),
    alterswertminderung_prozent: round(alterswertminderung * 100, 1),
    // Vergleich zur alten Grundsteuer (geschätzt)
    aenderung_geschaetzt: 'Erhöhung wahrscheinlich bei innerstädtischen Lagen'
  };
}
```

## ERGEBNIS-ANZEIGE

### Primary Result
- **Label:** "Grundsteuer pro Jahr"
- **Value:** `{grundsteuer_jahr} €`

### Secondary Results (2x2 Grid)
1. Pro Quartal: `{grundsteuer_quartal} €`
2. Pro Monat: `{grundsteuer_monat} €`
3. Grundsteuerwert: `{grundsteuerwert} €`
4. Hebesatz: `{hebesatz}%`

### Breakdown - Berechnung
| Schritt | Wert |
|---------|------|
| Bodenwert | {bodenwert} € |
| + Gebäudewert | {gebaeudewert} € |
| = Grundsteuerwert | {grundsteuerwert} € |
| × Steuermesszahl | {messzahl}‰ |
| = Steuermessbetrag | {steuermessbetrag} € |
| × Hebesatz | {hebesatz}% |
| **= Grundsteuer** | **{grundsteuer_jahr} €** |

### Info-Box
"Die neue Grundsteuer gilt ab 2025. Erste Bescheide werden ab 2024 verschickt.
Ihr Hebesatz kann von der Gemeinde noch angepasst werden."

### Hinweis Modell
Je nach Bundesland:
- Bayern: "Bayern verwendet das Flächenmodell"
- Baden-Württemberg: "BW verwendet das modifizierte Bodenwertmodell"
- Andere: "Es gilt das Bundesmodell"

## BESONDERHEITEN
- BORIS-Link zum Bodenrichtwert
- Hebesatz-Suche nach Gemeinde (falls API verfügbar)
- Hinweis auf Einspruchsfristen
- Vergleich alt vs. neu (geschätzt)

## CROSS-SELL
"Berechnen Sie auch Ihre AfA mit unserem AfA-Rechner"
→ Link zu /rechner/afa
```

---

## STRIPE PRICE IDs
- Basic/Monat: price_1SuLkm52lqSgjCzecXph3FJi (€1.99)
- Basic/Jahr: price_1SuLkn52lqSgjCzelAYqyBmE (€19.90)
- Pro/Monat: price_1SuLkn52lqSgjCzeyDWC8XPC (€4.99)
- Pro/Jahr: price_1SuLkn52lqSgjCze5pA0TO82 (€49.90)
- Lifetime: price_1SuLko52lqSgjCzeRRci018N (€19.90)
