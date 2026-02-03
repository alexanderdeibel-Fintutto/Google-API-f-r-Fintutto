# FT_CHECK_SCHOENHEITSREPARATUREN - Schönheitsreparaturen-Check

## App-Info
- **Name:** ft_check_schoenheitsreparaturen
- **URL:** fintutto.de/check/schoenheitsreparaturen
- **Stripe Product ID:** prod_Ts5xShOjoCL81Y
- **Tier:** Plus/Pro (€0.99-€1.99/Monat)

---

## LOVABLE PROMPT

```
Erstelle einen professionellen Schönheitsreparaturen-Check für Mieter.

## ZWECK
Prüft, ob Klauseln zu Schönheitsreparaturen im Mietvertrag wirksam sind:
- Starre Fristenklauseln (unwirksam nach BGH)
- Farbwahlklauseln (teilweise unwirksam)
- Quotenklauseln (unwirksam)
- Endrenovierungsklauseln (meist unwirksam)
- Unrenoviert übernommen (wichtig seit BGH 2015)

## INPUT-FELDER

### Gruppe 1: Übernahme der Wohnung
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| uebernahme_zustand | select | Zustand bei Einzug | - | Ja | Renoviert/Unrenoviert |
| einzugsdatum | date | Einzugsdatum | - | Ja | - |
| renovierung_bei_einzug | boolean | Selbst renoviert bei Einzug? | - | Nein | - |

### Gruppe 2: Klauseln im Mietvertrag
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| hat_fristenplan | boolean | Fristenplan vorhanden? | - | Ja | "Alle X Jahre..." |
| fristen_starr | boolean | Starre Fristen? | - | Nein | "Spätestens nach X Jahren" |
| fristen_weich | boolean | Weiche Fristen? | - | Nein | "In der Regel nach X Jahren" |
| farbvorgabe | boolean | Farbvorgabe bei Auszug? | - | Nein | "Weiß/helle Farben" |
| quotenklausel | boolean | Quotenklausel? | - | Nein | "Anteilige Kosten bei Auszug" |
| endrenovierung | boolean | Endrenovierungsklausel? | - | Nein | "Bei Auszug renovieren" |

### Gruppe 3: Aktuelle Situation
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| wohnung_zustand_aktuell | select | Aktueller Zustand | - | Ja | Gut/Abgewohnt/Stark abgenutzt |
| letzte_renovierung | date | Letzte Renovierung | - | Nein | Falls selbst renoviert |

### Zustands-Optionen
```javascript
const ZUSTAENDE = [
  { value: 'renoviert', label: 'Renoviert übernommen' },
  { value: 'unrenoviert', label: 'Unrenoviert übernommen' },
  { value: 'teilrenoviert', label: 'Teilweise renoviert' }
];

const AKTUELLER_ZUSTAND = [
  { value: 'gut', label: 'Guter Zustand (wenig Gebrauchsspuren)' },
  { value: 'normal', label: 'Normale Abnutzung (übliche Spuren)' },
  { value: 'stark', label: 'Stark abgenutzt (deutliche Schäden)' }
];
```

## BACKEND-FUNKTION

```javascript
// base44.functions.invoke('checkSchoenheitsreparaturen', {...})

// BGH-Urteile zur Unwirksamkeit
const BGH_URTEILE = {
  starre_fristen: {
    urteil: 'BGH VIII ZR 360/03 vom 23.06.2004',
    text: 'Starre Fristenpläne sind unwirksam'
  },
  unrenoviert: {
    urteil: 'BGH VIII ZR 185/14 vom 18.03.2015',
    text: 'Bei unrenovierter Übernahme ist Schönheitsreparaturklausel unwirksam'
  },
  quotenklausel: {
    urteil: 'BGH VIII ZR 52/06 vom 18.10.2006',
    text: 'Quotenklauseln sind generell unwirksam'
  },
  endrenovierung: {
    urteil: 'BGH VIII ZR 316/06 vom 12.09.2007',
    text: 'Endrenovierungsklauseln sind unwirksam'
  },
  farbvorgabe_streng: {
    urteil: 'BGH VIII ZR 198/10 vom 18.06.2008',
    text: 'Farbvorgabe "weiß" während Mietzeit unwirksam, bei Auszug ggf. zulässig'
  }
};

function checkSchoenheitsreparaturen(input) {
  const {
    uebernahme_zustand, einzugsdatum, renovierung_bei_einzug,
    hat_fristenplan, fristen_starr, fristen_weich,
    farbvorgabe, quotenklausel, endrenovierung,
    wohnung_zustand_aktuell, letzte_renovierung
  } = input;

  const unwirksame_klauseln = [];
  const wirksame_klauseln = [];
  const hinweise = [];

  // 1. Unrenoviert übernommen? (BGH 2015)
  if (uebernahme_zustand === 'unrenoviert' && !renovierung_bei_einzug) {
    unwirksame_klauseln.push({
      klausel: 'Gesamte Schönheitsreparaturklausel',
      grund: 'Wohnung unrenoviert übernommen ohne Ausgleich',
      bgh: BGH_URTEILE.unrenoviert
    });
    hinweise.push('Bei unrenovierter Übernahme müssen Sie gar nicht renovieren!');
  }

  // 2. Starre Fristen
  if (fristen_starr) {
    unwirksame_klauseln.push({
      klausel: 'Starre Fristenklausel',
      grund: '"Spätestens nach X Jahren" ist zu starr',
      bgh: BGH_URTEILE.starre_fristen
    });
  }

  // 3. Weiche Fristen sind OK
  if (fristen_weich && uebernahme_zustand === 'renoviert') {
    wirksame_klauseln.push({
      klausel: 'Weicher Fristenplan',
      grund: '"In der Regel" oder "im Allgemeinen" ist zulässig'
    });
  }

  // 4. Quotenklausel
  if (quotenklausel) {
    unwirksame_klauseln.push({
      klausel: 'Quotenklausel',
      grund: 'Anteilige Kostenbeteiligung bei Auszug ist immer unwirksam',
      bgh: BGH_URTEILE.quotenklausel
    });
  }

  // 5. Endrenovierungsklausel
  if (endrenovierung) {
    unwirksame_klauseln.push({
      klausel: 'Endrenovierungsklausel',
      grund: 'Renovierungspflicht "bei Auszug" ohne Bedarfsprüfung unwirksam',
      bgh: BGH_URTEILE.endrenovierung
    });
  }

  // 6. Farbvorgabe
  if (farbvorgabe) {
    hinweise.push('Farbvorgabe bei Auszug (neutral/weiß) kann zulässig sein, wenn während Mietzeit freie Farbwahl');
  }

  // 7. Gesamtbewertung
  const muss_renovieren = unwirksame_klauseln.length === 0 &&
    wirksame_klauseln.length > 0 &&
    uebernahme_zustand === 'renoviert' &&
    wohnung_zustand_aktuell !== 'gut';

  // 8. Empfehlung
  let empfehlung;
  if (unwirksame_klauseln.length > 0) {
    empfehlung = 'Sie müssen wahrscheinlich NICHT renovieren. Die Klauseln sind unwirksam.';
  } else if (wohnung_zustand_aktuell === 'gut') {
    empfehlung = 'Keine Renovierung nötig, da normaler Zustand.';
  } else {
    empfehlung = 'Renovierung könnte erforderlich sein. Prüfen Sie den genauen Wortlaut.';
  }

  return {
    uebernahme_zustand,
    unwirksame_klauseln,
    wirksame_klauseln,
    hinweise,
    muss_renovieren,
    empfehlung,
    anzahl_unwirksam: unwirksame_klauseln.length,
    rechtslage_klar: unwirksame_klauseln.length > 0 || wohnung_zustand_aktuell === 'gut'
  };
}
```

## ERGEBNIS-ANZEIGE

### Primary Result
- **Keine Pflicht:** 🟢 "Keine Renovierungspflicht!" | {anzahl_unwirksam} unwirksame Klauseln
- **Pflicht:** 🟡 "Renovierung möglicherweise erforderlich"
- **Unklar:** ⚪ "Rechtslage unklar - Prüfung empfohlen"

### Unwirksame Klauseln (falls vorhanden)
```
❌ UNWIRKSAME KLAUSELN IN IHREM VERTRAG:

1. {klausel}
   Grund: {grund}
   BGH: {bgh.urteil}

2. ...
```

### Wirksame Klauseln (falls vorhanden)
```
✓ Diese Klauseln sind wirksam:

1. {klausel}
   {grund}
```

### Secondary Results (2x2 Grid)
1. Übernahme: `{uebernahme_zustand}`
2. Unwirksame Klauseln: `{anzahl_unwirksam}`
3. Aktueller Zustand: `{wohnung_zustand_aktuell}`
4. Muss renovieren: `Nein/Ja/Unklar`

### Empfehlung-Box
{empfehlung}

### BGH-Urteile Box
Liste der relevanten BGH-Urteile mit Links

### Hinweis
"Diese Prüfung ersetzt keine Rechtsberatung. Im Streitfall wenden Sie sich an einen Mieterverein oder Fachanwalt."

## BESONDERHEITEN
- Checkliste zum Abhaken der Klauseln aus dem Vertrag
- Upload Mietvertrag-Foto (OCR-Analyse in Pro)
- BGH-Urteile-Datenbank
- Muster: Widerspruch gegen Renovierungsforderung

## CROSS-SELL
"Prüfen Sie auch Ihre Nebenkostenabrechnung"
→ Link zu /check/nebenkosten
```

---

## STRIPE PRICE IDs
- Plus/Monat: price_1SuLlZ52lqSgjCzeNl5EOeyd (€0.99)
- Plus/Jahr: price_1SuLla52lqSgjCzeSLN6Sylb (€9.90)
- Pro/Monat: price_1SuLla52lqSgjCzeitpfOvKr (€1.99)
- Pro/Jahr: price_1SuLla52lqSgjCzeWhv8BPmg (€19.90)
- Lifetime: price_1SuLlb52lqSgjCzeG80qwfQS (€9.90)
