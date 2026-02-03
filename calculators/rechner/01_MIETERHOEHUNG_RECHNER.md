# FT_CALC_MIETERHOEHUNG - Mieterhöhungs-Rechner

## App-Info
- **Name:** ft_calc_mieterhoehung
- **URL:** fintutto.de/rechner/mieterhoehung
- **SEO-Domains:** mieterhoehung.eu, mieterhohung-berechnen.de
- **Stripe Product ID:** prod_Ts5wJl6XdESKew (Premium)
- **Tier:** Premium (€2.99/Monat, €29.90/Jahr, €49.90 Lifetime)

---

## LOVABLE PROMPT

```
Erstelle einen professionellen Mieterhöhungs-Rechner für Vermieter.

## ZWECK
Berechnet die maximal zulässige Mieterhöhung nach deutschem Mietrecht (§558 BGB).
Berücksichtigt:
- Kappungsgrenze (20% in 3 Jahren, in Ballungsgebieten 15%)
- Ortsübliche Vergleichsmiete (Mietspiegel)
- Wartezeit seit letzter Erhöhung (mind. 15 Monate)

## INPUT-FELDER

### Gruppe 1: Aktuelle Mietsituation
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| aktuelle_miete | number | Aktuelle Kaltmiete | €/Monat | Ja | Ohne Nebenkosten |
| wohnflaeche | number | Wohnfläche | m² | Ja | Laut Mietvertrag |
| letzte_erhoehung | date | Letzte Mieterhöhung | - | Nein | Falls keine: Mietbeginn |
| mietbeginn | date | Mietbeginn | - | Ja | - |

### Gruppe 2: Vergleichsmiete
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| plz | text | PLZ | - | Ja | Für Mietspiegel-Abfrage |
| vergleichsmiete_von | number | Mietspiegel von | €/m² | Ja | Untere Grenze |
| vergleichsmiete_bis | number | Mietspiegel bis | €/m² | Ja | Obere Grenze |
| ist_ballungsgebiet | boolean | Ballungsgebiet? | - | Nein | 15% statt 20% Kappung |

## BACKEND-FUNKTION

```javascript
// base44.functions.invoke('calculateMieterhoehung', {...})

function calculateMieterhoehung(input) {
  const {
    aktuelle_miete,
    wohnflaeche,
    letzte_erhoehung,
    mietbeginn,
    vergleichsmiete_von,
    vergleichsmiete_bis,
    ist_ballungsgebiet
  } = input;

  // Aktuelle Miete pro m²
  const aktuelle_miete_qm = aktuelle_miete / wohnflaeche;

  // Vergleichsmiete Durchschnitt
  const vergleichsmiete_avg = (vergleichsmiete_von + vergleichsmiete_bis) / 2;

  // Maximale Miete nach Mietspiegel
  const max_miete_mietspiegel = vergleichsmiete_bis * wohnflaeche;

  // Kappungsgrenze (15% oder 20% in 3 Jahren)
  const kappung_prozent = ist_ballungsgebiet ? 15 : 20;
  const max_miete_kappung = aktuelle_miete * (1 + kappung_prozent / 100);

  // Tatsächlich mögliche Erhöhung (Minimum aus beiden)
  const max_neue_miete = Math.min(max_miete_mietspiegel, max_miete_kappung);
  const max_erhoehung = max_neue_miete - aktuelle_miete;
  const erhoehung_prozent = (max_erhoehung / aktuelle_miete) * 100;

  // Wartezeit prüfen
  const referenz_datum = letzte_erhoehung || mietbeginn;
  const monate_seit_letzter = monthsDiff(referenz_datum, new Date());
  const wartezeit_erfuellt = monate_seit_letzter >= 15;

  return {
    aktuelle_miete_qm: round(aktuelle_miete_qm, 2),
    vergleichsmiete_avg: round(vergleichsmiete_avg, 2),
    max_neue_miete: round(max_neue_miete, 2),
    max_erhoehung: round(max_erhoehung, 2),
    erhoehung_prozent: round(erhoehung_prozent, 1),
    kappung_prozent,
    monate_seit_letzter,
    wartezeit_erfuellt,
    erhoehung_moeglich: wartezeit_erfuellt && max_erhoehung > 0,
    naechste_erhoehung_moeglich: wartezeit_erfuellt ? 'Jetzt' : addMonths(referenz_datum, 15)
  };
}
```

## ERGEBNIS-ANZEIGE

### Primary Result
- **Label:** "Maximale Erhöhung"
- **Value:** `{max_erhoehung} €/Monat` (grün wenn möglich, grau wenn nicht)

### Secondary Results (2x2 Grid)
1. Neue Miete: `{max_neue_miete} €`
2. Erhöhung: `{erhoehung_prozent}%`
3. Kappungsgrenze: `{kappung_prozent}%`
4. Status: "Möglich" / "Wartezeit"

### Breakdown
- Aktuelle Miete/m²: `{aktuelle_miete_qm} €`
- Mietspiegel Ø: `{vergleichsmiete_avg} €/m²`
- Monate seit letzter Erhöhung: `{monate_seit_letzter}`

### Warnung (falls nicht möglich)
- Rot: "Wartezeit nicht erfüllt. Nächste Erhöhung möglich ab: {datum}"
- Oder: "Miete liegt bereits über Mietspiegel"

## BESONDERHEITEN
- Integriere Mietspiegel-API-Abfrage nach PLZ (falls verfügbar)
- Zeige Hinweis auf Kappungsgrenzen-Verordnung
- Option: Mieterhöhungsschreiben generieren (Premium)

## CROSS-SELL
Nach Berechnung: "Nutzen Sie Vermietify für automatische Mieterhöhungs-Erinnerungen"
```

---

## STRIPE PRICE IDs
- Basic/Monat: price_1SuLkT52lqSgjCzezP96jcWj (€2.99)
- Basic/Jahr: price_1SuLkU52lqSgjCzeg6vhTdMy (€29.90)
- Pro/Monat: price_1SuLkU52lqSgjCzenGwL6wUW (€9.99)
- Pro/Jahr: price_1SuLkV52lqSgjCzezigYPTl2 (€99.90)
- Lifetime: price_1SuLkV52lqSgjCzercBQiYn0 (€49.90)
