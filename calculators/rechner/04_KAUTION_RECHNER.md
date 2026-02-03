# FT_CALC_KAUTION - Kautions-Rechner

## App-Info
- **Name:** ft_calc_kaution
- **URL:** fintutto.de/rechner/kaution
- **SEO-Domain:** kautions-rechner.de
- **Stripe Product ID:** prod_Ts5wJja4VPMrr1 (Standard)
- **Tier:** Standard (€0.99/Monat, €9.90/Jahr, €9.90 Lifetime)

---

## LOVABLE PROMPT

```
Erstelle einen professionellen Kautions-Rechner für Vermieter und Mieter.

## ZWECK
Berechnet die Mietkaution nach deutschem Mietrecht:
- Maximale Kaution (3 Nettokaltmieten, §551 BGB)
- Ratenzahlung (3 Raten erlaubt)
- Verzinsung der Kaution
- Verwahrungsformen (Sparkonto, Kautionsbürgschaft)

## INPUT-FELDER

### Gruppe 1: Miete
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| kaltmiete | number | Nettokaltmiete | €/Monat | Ja | Ohne Nebenkosten! |
| warmmiete | number | Warmmiete (optional) | €/Monat | Nein | Zur Info |

### Gruppe 2: Kautions-Details
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| vereinbarte_kaution | number | Vereinbarte Kaution | Monatsmieten | Nein | Default: 3 (Maximum) |
| mietbeginn | date | Mietbeginn | - | Ja | Für Zinsberechnung |
| kautions_art | select | Kautionsart | - | Ja | Siehe Optionen |

### Kautionsart-Optionen
```javascript
const KAUTIONS_ARTEN = [
  { value: 'sparkonto', label: 'Mietkautionskonto (Bank)', zinssatz: 0.5 },
  { value: 'buergschaft', label: 'Kautionsbürgschaft', kosten_prozent: 5 },
  { value: 'sparbuch', label: 'Sparbuch (verpfändet)', zinssatz: 0.01 },
  { value: 'barzahlung', label: 'Barzahlung (nicht empfohlen)', zinssatz: 0 }
];
```

## BACKEND-FUNKTION

```javascript
// base44.functions.invoke('calculateKaution', {...})

function calculateKaution(input) {
  const {
    kaltmiete,
    warmmiete = null,
    vereinbarte_kaution = 3,
    mietbeginn,
    kautions_art = 'sparkonto'
  } = input;

  // Maximale Kaution
  const max_kaution_monate = 3;
  const max_kaution_betrag = kaltmiete * max_kaution_monate;

  // Vereinbarte Kaution
  const kaution_monate = Math.min(vereinbarte_kaution, max_kaution_monate);
  const kaution_betrag = kaltmiete * kaution_monate;

  // Prüfung: Kaution zu hoch?
  const kaution_zu_hoch = vereinbarte_kaution > 3;
  const ueberzahlung = kaution_zu_hoch ? (vereinbarte_kaution - 3) * kaltmiete : 0;

  // Ratenzahlung
  const erste_rate = kaution_betrag / 3;
  const raten = [
    { monat: 1, betrag: erste_rate, faellig: mietbeginn },
    { monat: 2, betrag: erste_rate, faellig: addMonths(mietbeginn, 1) },
    { monat: 3, betrag: erste_rate, faellig: addMonths(mietbeginn, 2) }
  ];

  // Zinsen/Kosten je nach Art
  const kautionsDetails = KAUTIONS_ARTEN.find(k => k.value === kautions_art);
  let jaehrliche_zinsen = 0;
  let jaehrliche_kosten = 0;

  if (kautionsDetails.zinssatz) {
    jaehrliche_zinsen = kaution_betrag * (kautionsDetails.zinssatz / 100);
  }
  if (kautionsDetails.kosten_prozent) {
    jaehrliche_kosten = kaution_betrag * (kautionsDetails.kosten_prozent / 100);
  }

  // Laufzeit-Berechnung (angenommen 5 Jahre)
  const jahre = 5;
  const zinsen_gesamt = jaehrliche_zinsen * jahre;
  const kosten_gesamt = jaehrliche_kosten * jahre;

  return {
    kaltmiete,
    warmmiete,
    max_kaution_betrag: round(max_kaution_betrag, 2),
    kaution_betrag: round(kaution_betrag, 2),
    kaution_monate,
    kaution_zu_hoch,
    ueberzahlung: round(ueberzahlung, 2),
    raten,
    erste_rate: round(erste_rate, 2),
    kautions_art,
    kautions_art_label: kautionsDetails.label,
    jaehrliche_zinsen: round(jaehrliche_zinsen, 2),
    jaehrliche_kosten: round(jaehrliche_kosten, 2),
    zinsen_5_jahre: round(zinsen_gesamt, 2),
    kosten_5_jahre: round(kosten_gesamt, 2),
    empfehlung: kautions_art === 'buergschaft' && kaltmiete > 1000
      ? 'Kautionsbürgschaft kann sich lohnen'
      : 'Klassisches Mietkautionskonto empfohlen'
  };
}
```

## ERGEBNIS-ANZEIGE

### Primary Result
- **Label:** "Kaution"
- **Value:** `{kaution_betrag} €`
- **Sub:** `({kaution_monate} Monatsmieten)`

### Warnung (falls kaution_zu_hoch)
🚨 "Die vereinbarte Kaution von {vereinbarte_kaution} Monatsmieten ist unzulässig!
    Maximum: 3 Monatsmieten. Sie zahlen {ueberzahlung} € zu viel!"

### Secondary Results (2x2 Grid)
1. Erste Rate: `{erste_rate} €`
2. Max. erlaubt: `{max_kaution_betrag} €`
3. Zinsen/Jahr: `{jaehrliche_zinsen} €` (oder Kosten)
4. Nach 5 Jahren: `{kaution_betrag + zinsen_5_jahre} €`

### Breakdown - Ratenzahlung
| Rate | Fällig | Betrag |
|------|--------|--------|
| 1. Rate | {raten[0].faellig} | {raten[0].betrag} € |
| 2. Rate | {raten[1].faellig} | {raten[1].betrag} € |
| 3. Rate | {raten[2].faellig} | {raten[2].betrag} € |

### Info-Box
"Nach §551 BGB dürfen Sie die Kaution in 3 Raten zahlen.
Die erste Rate ist bei Mietbeginn fällig."

## BESONDERHEITEN
- Toggle: "Ich bin Vermieter" / "Ich bin Mieter"
  - Vermieter-Ansicht: Wie viel kann ich verlangen?
  - Mieter-Ansicht: Wie viel muss ich zahlen?
- Vergleich: Sparkonto vs. Bürgschaft
- Hinweis auf Kautionsrückgabe nach Mietende

## CROSS-SELL
"Verwalten Sie Ihre Kautionen digital mit Vermietify"
→ Link zu Vermietify
```

---

## STRIPE PRICE IDs
- Basic/Monat: price_1SuLkr52lqSgjCze8I1U5eJa (€0.99)
- Basic/Jahr: price_1SuLks52lqSgjCzeWoez9l9K (€9.90)
- Pro/Monat: price_1SuLks52lqSgjCzeKLj4qZaU (€2.99)
- Pro/Jahr: price_1SuLkt52lqSgjCzef7bi1ZyD (€29.90)
- Lifetime: price_1SuLkt52lqSgjCzeAIl6bOd5 (€9.90)
