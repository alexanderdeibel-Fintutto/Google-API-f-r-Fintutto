# FT_CALC_KAUFNEBENKOSTEN - Kaufnebenkosten-Rechner

## App-Info
- **Name:** ft_calc_kaufnebenkosten
- **URL:** fintutto.de/rechner/kaufnebenkosten
- **SEO-Domain:** kaufnebenkosten-rechner.de
- **Stripe Product ID:** prod_Ts5w5Mrc44kOYi (Professional)
- **Tier:** Professional (€1.99/Monat, €19.90/Jahr, €19.90 Lifetime)

---

## LOVABLE PROMPT

```
Erstelle einen professionellen Kaufnebenkosten-Rechner für Immobilienkäufer.

## ZWECK
Berechnet alle Nebenkosten beim Immobilienkauf:
- Grunderwerbsteuer (bundeslandabhängig: 3,5% - 6,5%)
- Notarkosten (ca. 1,5-2%)
- Grundbuchkosten (ca. 0,5%)
- Maklerkosten (bundeslandüblich oder individuell)

## INPUT-FELDER

### Gruppe 1: Kaufpreis & Standort
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| kaufpreis | number | Kaufpreis | € | Ja | Gesamtkaufpreis der Immobilie |
| bundesland | select | Bundesland | - | Ja | Für Grunderwerbsteuer |

### Gruppe 2: Makler (Optional)
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| mit_makler | boolean | Mit Makler? | - | Nein | Default: Ja |
| makler_prozent | number | Maklerprovision | % | Nein | Käuferanteil (üblich 3,57%) |

### Bundesland-Optionen (Grunderwerbsteuer)
```javascript
const GRUNDERWERBSTEUER = {
  'baden-wuerttemberg': 5.0,
  'bayern': 3.5,
  'berlin': 6.0,
  'brandenburg': 6.5,
  'bremen': 5.0,
  'hamburg': 5.5,
  'hessen': 6.0,
  'mecklenburg-vorpommern': 6.0,
  'niedersachsen': 5.0,
  'nordrhein-westfalen': 6.5,
  'rheinland-pfalz': 5.0,
  'saarland': 6.5,
  'sachsen': 5.5,
  'sachsen-anhalt': 5.0,
  'schleswig-holstein': 6.5,
  'thueringen': 5.0
};
```

## BACKEND-FUNKTION

```javascript
// base44.functions.invoke('calculateKaufnebenkosten', {...})

function calculateKaufnebenkosten(input) {
  const { kaufpreis, bundesland, mit_makler = true, makler_prozent = 3.57 } = input;

  // Grunderwerbsteuer
  const grest_prozent = GRUNDERWERBSTEUER[bundesland];
  const grunderwerbsteuer = kaufpreis * (grest_prozent / 100);

  // Notarkosten (ca. 1.5% - degressiv, vereinfacht)
  const notar_prozent = 1.5;
  const notarkosten = kaufpreis * (notar_prozent / 100);

  // Grundbuchkosten (ca. 0.5%)
  const grundbuch_prozent = 0.5;
  const grundbuchkosten = kaufpreis * (grundbuch_prozent / 100);

  // Maklerkosten
  const maklerkosten = mit_makler ? kaufpreis * (makler_prozent / 100) : 0;

  // Summen
  const nebenkosten_ohne_makler = grunderwerbsteuer + notarkosten + grundbuchkosten;
  const nebenkosten_gesamt = nebenkosten_ohne_makler + maklerkosten;
  const nebenkosten_prozent = (nebenkosten_gesamt / kaufpreis) * 100;
  const gesamtkosten = kaufpreis + nebenkosten_gesamt;

  return {
    kaufpreis,
    bundesland,
    grunderwerbsteuer: round(grunderwerbsteuer, 2),
    grest_prozent,
    notarkosten: round(notarkosten, 2),
    notar_prozent,
    grundbuchkosten: round(grundbuchkosten, 2),
    grundbuch_prozent,
    maklerkosten: round(maklerkosten, 2),
    makler_prozent: mit_makler ? makler_prozent : 0,
    nebenkosten_ohne_makler: round(nebenkosten_ohne_makler, 2),
    nebenkosten_gesamt: round(nebenkosten_gesamt, 2),
    nebenkosten_prozent: round(nebenkosten_prozent, 1),
    gesamtkosten: round(gesamtkosten, 2)
  };
}
```

## ERGEBNIS-ANZEIGE

### Primary Result
- **Label:** "Kaufnebenkosten gesamt"
- **Value:** `{nebenkosten_gesamt} €`
- **Sub:** `{nebenkosten_prozent}% vom Kaufpreis`

### Secondary Results (2x2 Grid)
1. Grunderwerbsteuer: `{grunderwerbsteuer} €` ({grest_prozent}%)
2. Notar: `{notarkosten} €` ({notar_prozent}%)
3. Grundbuch: `{grundbuchkosten} €` ({grundbuch_prozent}%)
4. Makler: `{maklerkosten} €` ({makler_prozent}%)

### Breakdown
- Kaufpreis: `{kaufpreis} €`
- + Nebenkosten: `{nebenkosten_gesamt} €`
- **= Gesamtkosten: `{gesamtkosten} €`**

### Visualisierung
- Pie-Chart mit Aufteilung der Nebenkosten
- Oder: Stacked Bar (Kaufpreis + Nebenkosten)

## BESONDERHEITEN
- Bundesland-Dropdown mit Karte-Icon
- Automatische Aktualisierung bei Bundesland-Wechsel
- Info-Tooltips zu jedem Kostenpunkt
- Hinweis: "Nebenkosten nicht aus Darlehen finanzierbar (bei vielen Banken)"

## CROSS-SELL
"Berechnen Sie auch die Rendite mit unserem Rendite-Rechner"
→ Link zu /rechner/rendite
```

---

## STRIPE PRICE IDs
- Basic/Monat: price_1SuLkZ52lqSgjCzerxYFLox7 (€1.99)
- Basic/Jahr: price_1SuLkZ52lqSgjCzeqfhIYEN3 (€19.90)
- Pro/Monat: price_1SuLkZ52lqSgjCzeLul4szO8 (€4.99)
- Pro/Jahr: price_1SuLka52lqSgjCzeV9h69O9l (€49.90)
- Lifetime: price_1SuLka52lqSgjCze6lSQhn3o (€19.90)
