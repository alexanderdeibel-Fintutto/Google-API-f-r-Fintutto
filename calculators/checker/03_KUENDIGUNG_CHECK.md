# FT_CHECK_KUENDIGUNG - Kündigungsfrist-Check

## App-Info
- **Name:** ft_check_kuendigung
- **URL:** fintutto.de/check/kuendigung
- **SEO-Domain:** meinkuendigungsfristcheck.de
- **Stripe Product ID:** prod_Ts5xN3fjwDH0Du
- **Tier:** Plus/Pro (€0.99-€1.99/Monat)

---

## LOVABLE PROMPT

```
Erstelle einen professionellen Kündigungsfrist-Check für Mieter und Vermieter.

## ZWECK
Berechnet die korrekte Kündigungsfrist nach §573c BGB:
- Mieter: Immer 3 Monate (egal wie lange Mietdauer)
- Vermieter: 3-9 Monate (je nach Mietdauer)
- Sonderkündigungsrechte (Tod, Eigenbedarf, etc.)

## INPUT-FELDER

### Gruppe 1: Wer kündigt?
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| kuendiger | select | Wer kündigt? | - | Ja | Mieter/Vermieter |

### Gruppe 2: Mietverhältnis
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| mietbeginn | date | Mietbeginn | - | Ja | - |
| geplante_kuendigung | date | Geplantes Kündigungsdatum | - | Ja | Wann soll gekündigt werden? |

### Gruppe 3: Kündigungsgrund (nur Vermieter)
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| kuendigungsgrund | select | Kündigungsgrund | - | Ja* | Nur wenn Vermieter |

### Kündigungsgrund-Optionen (Vermieter)
```javascript
const KUENDIGUNGSGRUENDE = [
  { value: 'eigenbedarf', label: 'Eigenbedarf', extra_frist: 0 },
  { value: 'verwertung', label: 'Wirtschaftliche Verwertung', extra_frist: 0 },
  { value: 'vertragsverletzung', label: 'Vertragsverletzung', extra_frist: 0, fristlos_moeglich: true },
  { value: 'zahlungsverzug', label: 'Zahlungsverzug (2 Monate)', extra_frist: 0, fristlos_moeglich: true }
];
```

## BACKEND-FUNKTION

```javascript
// base44.functions.invoke('checkKuendigung', {...})

function checkKuendigung(input) {
  const { kuendiger, mietbeginn, geplante_kuendigung, kuendigungsgrund } = input;

  // Mietdauer berechnen
  const mietdauer_monate = monthsDiff(mietbeginn, geplante_kuendigung);
  const mietdauer_jahre = mietdauer_monate / 12;

  // Kündigungsfrist berechnen
  let kuendigungsfrist_monate;
  let frist_begruendung;

  if (kuendiger === 'mieter') {
    // Mieter: Immer 3 Monate
    kuendigungsfrist_monate = 3;
    frist_begruendung = 'Mieter können immer mit 3 Monaten Frist kündigen (§573c Abs. 1 BGB)';
  } else {
    // Vermieter: Gestaffelt nach Mietdauer
    if (mietdauer_jahre < 5) {
      kuendigungsfrist_monate = 3;
      frist_begruendung = 'Bis 5 Jahre Mietdauer: 3 Monate';
    } else if (mietdauer_jahre < 8) {
      kuendigungsfrist_monate = 6;
      frist_begruendung = '5-8 Jahre Mietdauer: 6 Monate';
    } else {
      kuendigungsfrist_monate = 9;
      frist_begruendung = 'Ab 8 Jahren Mietdauer: 9 Monate';
    }
  }

  // Kündigung muss zum Monatsende
  // Spätester Kündigungstermin für gewünschtes Auszugsdatum
  const gewuenschter_auszug = geplante_kuendigung;
  const spaeteste_kuendigung = subtractMonths(gewuenschter_auszug, kuendigungsfrist_monate);
  // Zum 3. Werktag des Monats
  const kuendigung_bis = setDate(spaeteste_kuendigung, 3);

  // Nächstmöglicher Auszugstermin ab heute
  const heute = new Date();
  const naechster_auszug = endOfMonth(addMonths(heute, kuendigungsfrist_monate));

  // Fristlose Kündigung möglich?
  const fristlos_moeglich = kuendiger === 'vermieter' &&
    ['vertragsverletzung', 'zahlungsverzug'].includes(kuendigungsgrund);

  // Kündigungsgrund erforderlich (Vermieter)?
  const grund_erforderlich = kuendiger === 'vermieter';
  const grund_angegeben = kuendigungsgrund && kuendigungsgrund !== '';

  return {
    kuendiger,
    mietbeginn,
    mietdauer_monate,
    mietdauer_jahre: round(mietdauer_jahre, 1),
    kuendigungsfrist_monate,
    frist_begruendung,
    gewuenschter_auszug: formatDate(gewuenschter_auszug),
    kuendigung_bis: formatDate(kuendigung_bis),
    naechster_auszug: formatDate(naechster_auszug),
    fristlos_moeglich,
    grund_erforderlich,
    grund_angegeben,
    kuendigungsgrund,
    hinweise: generateHinweise(kuendiger, kuendigungsgrund)
  };
}

function generateHinweise(kuendiger, grund) {
  const hinweise = [];

  if (kuendiger === 'mieter') {
    hinweise.push('Die Kündigung muss schriftlich erfolgen (eigenhändige Unterschrift!)');
    hinweise.push('Alle Mieter müssen unterschreiben');
    hinweise.push('Die Kündigung muss dem Vermieter bis zum 3. Werktag zugehen');
  } else {
    hinweise.push('Die Kündigung muss schriftlich erfolgen');
    hinweise.push('Der Kündigungsgrund muss genannt werden (§573 BGB)');

    if (grund === 'eigenbedarf') {
      hinweise.push('Bei Eigenbedarf: Person und Grund konkret nennen');
      hinweise.push('Mieter hat Widerspruchsrecht bei Härtefällen');
    }
  }

  return hinweise;
}
```

## ERGEBNIS-ANZEIGE

### Primary Result
- **Label:** "Kündigungsfrist"
- **Value:** `{kuendigungsfrist_monate} Monate`

### Fristen-Übersicht
```
📅 Wichtige Termine:

Kündigung spätestens bis:  {kuendigung_bis}
Gewünschter Auszug:        {gewuenschter_auszug}

-- ODER --

Wenn Sie heute kündigen:
Frühester Auszug möglich:  {naechster_auszug}
```

### Secondary Results (2x2 Grid)
1. Mietdauer: `{mietdauer_jahre} Jahre`
2. Frist: `{kuendigungsfrist_monate} Monate`
3. Kündigen bis: `{kuendigung_bis}`
4. Auszug: `{naechster_auszug}`

### Hinweise-Box
Liste aller Hinweise mit Checkboxen

### Vermieter-Warnung (falls Vermieter)
```
⚠️ Als Vermieter benötigen Sie einen gesetzlichen Kündigungsgrund!

Ohne Grund ist die Kündigung unwirksam.
Mögliche Gründe: Eigenbedarf, Vertragsverletzung, wirtschaftliche Verwertung.
```

## BESONDERHEITEN
- Toggle Mieter/Vermieter mit unterschiedlichen Feldern
- Kalender-Visualisierung der Fristen
- Muster-Kündigungsschreiben generieren (Premium)
- Hinweis auf Widerspruchsrecht (Härtefälle)

## CROSS-SELL
"Erstellen Sie rechtssichere Kündigungen mit unserem Formular-Generator"
→ Link zu /formulare/kuendigung
```

---

## STRIPE PRICE IDs
- Plus/Monat: price_1SuLlW52lqSgjCzetcjdhSTz (€0.99)
- Plus/Jahr: price_1SuLlX52lqSgjCzekPx8GHzz (€9.90)
- Pro/Monat: price_1SuLlX52lqSgjCzeyCPfrfkZ (€1.99)
- Pro/Jahr: price_1SuLlY52lqSgjCze56jP8MMj (€19.90)
- Lifetime: price_1SuLlY52lqSgjCzeVVpXW8cm (€9.90)
