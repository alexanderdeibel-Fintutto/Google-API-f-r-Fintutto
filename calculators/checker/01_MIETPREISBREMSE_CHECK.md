# FT_CHECK_MIETPREISBREMSE - Mietpreisbremsen-Check

## App-Info
- **Name:** ft_check_mietpreisbremse
- **URL:** fintutto.de/check/mietpreisbremse
- **Stripe Product ID:** prod_Ts5xJIW1emFUZI
- **Tier:** Plus/Pro (€0.99-€1.99/Monat)

---

## LOVABLE PROMPT

```
Erstelle einen professionellen Mietpreisbremsen-Check für Mieter.

## ZWECK
Prüft, ob die Mietpreisbremse greift und ob die Miete zu hoch ist:
- Liegt die Wohnung in einem Mietpreisbremsen-Gebiet?
- Wie hoch ist die ortsübliche Vergleichsmiete?
- Ist die Miete mehr als 10% über Vergleichsmiete?
- Welche Ausnahmen greifen (Neubau, Sanierung, Vormiete)?

## INPUT-FELDER

### Gruppe 1: Standort & Miete
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| plz | text | PLZ | - | Ja | Für Gebiets-Check |
| ort | text | Ort | - | Ja | - |
| kaltmiete | number | Kaltmiete | €/Monat | Ja | Nettokaltmiete |
| wohnflaeche | number | Wohnfläche | m² | Ja | - |

### Gruppe 2: Wohnungs-Details
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| baujahr | number | Baujahr | - | Ja | - |
| erstbezug_nach_2014 | boolean | Erstbezug nach 01.10.2014? | - | Ja | Neubau-Ausnahme |
| umfassend_modernisiert | boolean | Umfassend modernisiert? | - | Ja | Mehr als 1/3 Neubaukosten |
| vormiete_bekannt | boolean | Vormiete bekannt? | - | Nein | - |
| vormiete | number | Vormiete | €/Monat | Nein | Falls bekannt |

### Gruppe 3: Mietbeginn
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| mietbeginn | date | Mietbeginn | - | Ja | - |

## BACKEND-FUNKTION

```javascript
// base44.functions.invoke('checkMietpreisbremse', {...})

// Mietpreisbremsen-Gebiete (vereinfacht)
const MIETPREISBREMSEN_GEBIETE = {
  '10115': { aktiv: true, bis: '2025-12-31', vergleichsmiete: 12.50 },
  '80331': { aktiv: true, bis: '2025-12-31', vergleichsmiete: 14.00 },
  '20095': { aktiv: true, bis: '2025-12-31', vergleichsmiete: 11.80 },
  // ... weitere PLZ
};

function checkMietpreisbremse(input) {
  const {
    plz, ort, kaltmiete, wohnflaeche,
    baujahr, erstbezug_nach_2014, umfassend_modernisiert,
    vormiete_bekannt, vormiete, mietbeginn
  } = input;

  // 1. Gebiets-Check
  const gebiet = MIETPREISBREMSEN_GEBIETE[plz];
  const in_bremsen_gebiet = gebiet?.aktiv || false;

  // 2. Ausnahmen prüfen
  const ausnahmen = [];
  if (erstbezug_nach_2014) {
    ausnahmen.push({ typ: 'neubau', text: 'Neubau nach 01.10.2014' });
  }
  if (umfassend_modernisiert) {
    ausnahmen.push({ typ: 'modernisierung', text: 'Umfassend modernisiert' });
  }
  if (vormiete_bekannt && vormiete > 0) {
    ausnahmen.push({ typ: 'vormiete', text: `Vormiete war ${vormiete} €` });
  }

  const bremse_greift = in_bremsen_gebiet && ausnahmen.length === 0;

  // 3. Miete berechnen
  const miete_qm = kaltmiete / wohnflaeche;
  const vergleichsmiete = gebiet?.vergleichsmiete || 10.00;
  const max_miete_qm = vergleichsmiete * 1.10; // +10%
  const max_miete = max_miete_qm * wohnflaeche;

  // 4. Überhöhung berechnen
  const ueberhoehung = kaltmiete - max_miete;
  const ueberhoehung_prozent = ((miete_qm / vergleichsmiete) - 1) * 100;
  const miete_zu_hoch = bremse_greift && ueberhoehung > 0;

  // 5. Rückforderung (24 Monate rückwirkend möglich seit 2020)
  const monate_rueckforderung = Math.min(monthsSince(mietbeginn), 30);
  const rueckforderung_gesamt = miete_zu_hoch ? ueberhoehung * monate_rueckforderung : 0;

  // 6. Empfehlung
  let empfehlung;
  if (!in_bremsen_gebiet) {
    empfehlung = 'keine_bremse';
  } else if (ausnahmen.length > 0) {
    empfehlung = 'ausnahme';
  } else if (miete_zu_hoch) {
    empfehlung = 'zu_hoch';
  } else {
    empfehlung = 'ok';
  }

  return {
    plz, ort,
    in_bremsen_gebiet,
    bremse_gueltig_bis: gebiet?.bis,
    ausnahmen,
    bremse_greift,
    miete_qm: round(miete_qm, 2),
    vergleichsmiete,
    max_miete_qm: round(max_miete_qm, 2),
    max_miete: round(max_miete, 2),
    ueberhoehung: round(Math.max(0, ueberhoehung), 2),
    ueberhoehung_prozent: round(Math.max(0, ueberhoehung_prozent), 1),
    miete_zu_hoch,
    monate_rueckforderung,
    rueckforderung_gesamt: round(rueckforderung_gesamt, 2),
    empfehlung
  };
}
```

## ERGEBNIS-ANZEIGE

### Primary Result
Je nach Empfehlung:
- **zu_hoch:** 🔴 "Miete {ueberhoehung_prozent}% zu hoch!" | {ueberhoehung} €/Monat überhöht
- **ok:** 🟢 "Miete im zulässigen Rahmen"
- **ausnahme:** 🟡 "Mietpreisbremse greift nicht (Ausnahme)"
- **keine_bremse:** ⚪ "Kein Mietpreisbremsen-Gebiet"

### Warnung (falls zu_hoch)
```
⚠️ Sie zahlen monatlich {ueberhoehung} € zu viel!

Mögliche Rückforderung: bis zu {rueckforderung_gesamt} €
(für die letzten {monate_rueckforderung} Monate)

Empfehlung: Rüge an Vermieter senden (Muster verfügbar)
```

### Secondary Results (2x2 Grid)
1. Ihre Miete/m²: `{miete_qm} €`
2. Vergleichsmiete: `{vergleichsmiete} €/m²`
3. Max. erlaubt: `{max_miete} €`
4. Überhöhung: `{ueberhoehung} €`

### Breakdown
- Vergleichsmiete: {vergleichsmiete} €/m²
- + 10% Aufschlag: {max_miete_qm} €/m²
- × Wohnfläche: {wohnflaeche} m²
- = Max. Miete: {max_miete} €

### Ausnahmen-Box (falls vorhanden)
Liste der Ausnahmen mit Erklärung

### Hinweis
"Für eine rechtssichere Prüfung empfehlen wir die Beratung durch einen Mieterverein oder Anwalt."

## BESONDERHEITEN
- Automatische PLZ-Erkennung via Geolocation
- Mietspiegel-Datenbank im Backend
- Muster-Rügeschreiben generieren (Premium)
- Link zum Mieterverein

## CROSS-SELL
"Prüfen Sie auch Ihre Nebenkostenabrechnung"
→ Link zu /check/nebenkosten
```

---

## STRIPE PRICE IDs
- Plus/Monat: price_1SuLlU52lqSgjCze0bVBAdZ0 (€0.99)
- Plus/Jahr: price_1SuLlU52lqSgjCzeIMyA6CxG (€9.90)
- Pro/Monat: price_1SuLlV52lqSgjCzeIvc7hSnj (€1.99)
- Pro/Jahr: price_1SuLlV52lqSgjCzeqd0aN0XF (€19.90)
- Lifetime: price_1SuLlW52lqSgjCzetV7y2so2 (€9.90)
