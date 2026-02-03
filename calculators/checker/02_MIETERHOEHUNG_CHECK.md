# FT_CHECK_MIETERHOEHUNG - Mieterhöhungs-Check

## App-Info
- **Name:** ft_check_mieterhoehung
- **URL:** fintutto.de/check/mieterhoehung
- **SEO-Domain:** meinmieterhoehungscheck.de
- **Stripe Product ID:** prod_Ts5xpMee390YkL
- **Tier:** Plus/Pro (€0.99-€1.99/Monat)

---

## LOVABLE PROMPT

```
Erstelle einen professionellen Mieterhöhungs-Check für Mieter.

## ZWECK
Prüft, ob eine Mieterhöhung rechtmäßig ist:
- Ist die Wartezeit eingehalten (15 Monate)?
- Ist die Kappungsgrenze eingehalten (20%/15% in 3 Jahren)?
- Stimmt die Begründung (Mietspiegel, Vergleichswohnungen, Gutachten)?
- Sind die Formalien korrekt?

## INPUT-FELDER

### Gruppe 1: Aktuelle Situation
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| aktuelle_kaltmiete | number | Aktuelle Kaltmiete | € | Ja | Vor der Erhöhung |
| neue_kaltmiete | number | Geforderte neue Miete | € | Ja | Nach Erhöhung |
| wohnflaeche | number | Wohnfläche | m² | Ja | - |

### Gruppe 2: Zeitpunkte
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| letzte_erhoehung | date | Letzte Mieterhöhung | - | Nein | Falls keine: Mietbeginn |
| mietbeginn | date | Mietbeginn | - | Ja | - |
| erhoehung_erhalten | date | Erhöhung erhalten am | - | Ja | Datum des Schreibens |

### Gruppe 3: Standort
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| plz | text | PLZ | - | Ja | - |
| ist_ballungsgebiet | boolean | Ballungsgebiet? | - | Nein | 15% statt 20% Kappung |

### Gruppe 4: Begründung (aus dem Schreiben)
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| begruendung_art | select | Art der Begründung | - | Ja | Mietspiegel/Vergleich/Gutachten |
| mietspiegel_genannt | boolean | Mietspiegel angegeben? | - | Nein | - |
| vergleichsmiete_genannt | number | Genannte Vergleichsmiete | €/m² | Nein | - |

## BACKEND-FUNKTION

```javascript
// base44.functions.invoke('checkMieterhoehung', {...})

function checkMieterhoehung(input) {
  const {
    aktuelle_kaltmiete, neue_kaltmiete, wohnflaeche,
    letzte_erhoehung, mietbeginn, erhoehung_erhalten,
    plz, ist_ballungsgebiet,
    begruendung_art, mietspiegel_genannt, vergleichsmiete_genannt
  } = input;

  const fehler = [];
  const warnungen = [];

  // 1. Erhöhungsbetrag
  const erhoehung_betrag = neue_kaltmiete - aktuelle_kaltmiete;
  const erhoehung_prozent = (erhoehung_betrag / aktuelle_kaltmiete) * 100;
  const aktuelle_miete_qm = aktuelle_kaltmiete / wohnflaeche;
  const neue_miete_qm = neue_kaltmiete / wohnflaeche;

  // 2. Wartezeit prüfen (15 Monate)
  const referenz = letzte_erhoehung || mietbeginn;
  const monate_seit_letzter = monthsDiff(referenz, erhoehung_erhalten);
  const wartezeit_ok = monate_seit_letzter >= 15;

  if (!wartezeit_ok) {
    fehler.push({
      typ: 'wartezeit',
      text: `Wartezeit nicht eingehalten! Nur ${monate_seit_letzter} statt 15 Monate.`,
      schwere: 'kritisch'
    });
  }

  // 3. Kappungsgrenze prüfen (20% / 15% in 3 Jahren)
  const kappung_prozent = ist_ballungsgebiet ? 15 : 20;
  // Vereinfacht: Prüfe nur aktuelle Erhöhung gegen Kappung
  const kappung_ok = erhoehung_prozent <= kappung_prozent;

  if (!kappung_ok) {
    fehler.push({
      typ: 'kappung',
      text: `Kappungsgrenze überschritten! ${round(erhoehung_prozent, 1)}% statt max. ${kappung_prozent}%`,
      schwere: 'kritisch'
    });
  }

  // 4. Begründung prüfen
  if (begruendung_art === 'mietspiegel' && !mietspiegel_genannt) {
    fehler.push({
      typ: 'begruendung',
      text: 'Mietspiegel muss konkret benannt sein',
      schwere: 'mittel'
    });
  }

  if (begruendung_art === 'vergleichswohnungen') {
    warnungen.push({
      typ: 'vergleichswohnungen',
      text: 'Vergleichswohnungen müssen konkret benannt sein (mind. 3)'
    });
  }

  // 5. Formalien
  // Vereinfacht: Textform erforderlich
  warnungen.push({
    typ: 'formal',
    text: 'Prüfen Sie: Ist das Schreiben in Textform (Brief/E-Mail)?'
  });

  // 6. Zustimmungsfrist
  const zustimmungsfrist = addMonths(erhoehung_erhalten, 2);
  const frist_text = formatDate(zustimmungsfrist);

  // 7. Gesamtbewertung
  const ist_rechtmaessig = fehler.filter(f => f.schwere === 'kritisch').length === 0;

  return {
    aktuelle_kaltmiete,
    neue_kaltmiete,
    erhoehung_betrag: round(erhoehung_betrag, 2),
    erhoehung_prozent: round(erhoehung_prozent, 1),
    aktuelle_miete_qm: round(aktuelle_miete_qm, 2),
    neue_miete_qm: round(neue_miete_qm, 2),
    monate_seit_letzter,
    wartezeit_ok,
    kappung_prozent,
    kappung_ok,
    fehler,
    warnungen,
    ist_rechtmaessig,
    zustimmungsfrist: frist_text,
    empfehlung: ist_rechtmaessig
      ? 'Die Erhöhung erscheint formal korrekt. Prüfen Sie die Vergleichsmiete.'
      : 'Die Erhöhung hat formale Fehler. Zustimmung verweigern möglich.'
  };
}
```

## ERGEBNIS-ANZEIGE

### Primary Result
- **rechtmäßig:** 🟢 "Erhöhung formal korrekt" | +{erhoehung_betrag} €/Monat ({erhoehung_prozent}%)
- **nicht rechtmäßig:** 🔴 "Erhöhung fehlerhaft!" | {fehler.length} Fehler gefunden

### Fehler-Liste (falls vorhanden)
```
❌ Kritische Fehler:
- {fehler[0].text}
- {fehler[1].text}

⚠️ Warnungen:
- {warnungen[0].text}
```

### Secondary Results (2x2 Grid)
1. Erhöhung: `{erhoehung_prozent}%`
2. Kappungsgrenze: `{kappung_prozent}%`
3. Wartezeit: `{monate_seit_letzter} Monate` ✓/✗
4. Zustimmungsfrist: `{zustimmungsfrist}`

### Frist-Hinweis
```
📅 Ihre Zustimmungsfrist endet am: {zustimmungsfrist}

Sie müssen nicht sofort zustimmen!
- Bis zum Ablauf der Frist: Widerspruch möglich
- Danach: Vermieter kann klagen (3 Monate Zeit)
```

### Empfehlung-Box
Je nach Ergebnis:
- **Fehler:** "Widersprechen Sie der Erhöhung schriftlich unter Nennung der Fehler."
- **OK:** "Prüfen Sie, ob die genannte Vergleichsmiete stimmt."

## BESONDERHEITEN
- Checkliste zum Abhaken (alle Punkte aus dem Schreiben)
- Muster-Widerspruch generieren (Premium)
- Mietspiegel-Abfrage integrieren

## CROSS-SELL
"Berechnen Sie die maximal zulässige Miete mit dem Mieterhöhungs-Rechner"
→ Link zu /rechner/mieterhoehung
```

---

## STRIPE PRICE IDs
- Plus/Monat: price_1SuLle52lqSgjCzeuyeYag6M (€0.99)
- Plus/Jahr: price_1SuLlf52lqSgjCzeW5UytLRL (€9.90)
- Pro/Monat: price_1SuLlf52lqSgjCzed0jONR3n (€1.99)
- Pro/Jahr: price_1SuLlg52lqSgjCzehZ1HMZvM (€19.90)
- Lifetime: price_1SuLlg52lqSgjCzeSeEw5nmI (€9.90)
