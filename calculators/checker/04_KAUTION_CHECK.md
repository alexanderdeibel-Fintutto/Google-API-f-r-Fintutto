# FT_CHECK_KAUTION - Kautions-Check

## App-Info
- **Name:** ft_check_kaution
- **URL:** fintutto.de/check/kaution
- **Stripe Product ID:** prod_Ts5x53vTuxwLzF
- **Tier:** Plus/Pro (€0.99-€1.99/Monat)

---

## LOVABLE PROMPT

```
Erstelle einen professionellen Kautions-Check für Mieter.

## ZWECK
Prüft, ob die Kaution rechtmäßig einbehalten oder zurückgefordert werden kann:
- Ist die Kaution zu hoch (max. 3 Nettokaltmieten)?
- Wurde die Kaution korrekt angelegt (getrennt, verzinst)?
- Darf der Vermieter nach Auszug einbehalten?
- Wie lange darf die Prüfungsfrist dauern?

## INPUT-FELDER

### Gruppe 1: Situation
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| situation | select | Ihre Situation | - | Ja | Einzug/Auszug/Während Mietzeit |

### Gruppe 2: Kautions-Details
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| kaltmiete | number | Nettokaltmiete | € | Ja | Ohne Nebenkosten |
| gezahlte_kaution | number | Gezahlte Kaution | € | Ja | - |
| kaution_auf_konto | boolean | Auf separatem Konto? | - | Nein | Kautionskonto? |
| zinsen_erhalten | boolean | Zinsen erhalten? | - | Nein | Bei Auszug |

### Gruppe 3: Bei Auszug
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| auszugsdatum | date | Auszugsdatum | - | Nein* | Nur bei Auszug |
| uebergabeprotokoll | boolean | Übergabeprotokoll? | - | Nein | Wurde eins erstellt? |
| maengel_vorhanden | boolean | Mängel festgestellt? | - | Nein | Im Protokoll |
| nk_abrechnung_offen | boolean | NK-Abrechnung noch offen? | - | Nein | - |

### Gruppe 4: Einbehalt
| Feld | Typ | Label | Einheit | Pflicht | Hint |
|------|-----|-------|---------|---------|------|
| vermieter_behaelt | number | Vermieter behält ein | € | Nein | Falls bekannt |
| einbehalt_grund | text | Begründung | - | Nein | Was behauptet der Vermieter? |

## BACKEND-FUNKTION

```javascript
// base44.functions.invoke('checkKaution', {...})

function checkKaution(input) {
  const {
    situation, kaltmiete, gezahlte_kaution,
    kaution_auf_konto, zinsen_erhalten,
    auszugsdatum, uebergabeprotokoll, maengel_vorhanden, nk_abrechnung_offen,
    vermieter_behaelt, einbehalt_grund
  } = input;

  const probleme = [];
  const empfehlungen = [];

  // 1. Maximale Kaution prüfen
  const max_kaution = kaltmiete * 3;
  const kaution_zu_hoch = gezahlte_kaution > max_kaution;
  const ueberzahlung = Math.max(0, gezahlte_kaution - max_kaution);

  if (kaution_zu_hoch) {
    probleme.push({
      typ: 'hoehe',
      text: `Kaution zu hoch! Max. erlaubt: ${max_kaution} €, gezahlt: ${gezahlte_kaution} €`,
      schwere: 'kritisch',
      rueckforderbar: ueberzahlung
    });
  }

  // 2. Anlage prüfen
  if (!kaution_auf_konto) {
    probleme.push({
      typ: 'anlage',
      text: 'Kaution muss auf separatem Konto angelegt werden (§551 Abs. 3 BGB)',
      schwere: 'mittel'
    });
  }

  // 3. Bei Auszug: Prüfungsfrist
  let rueckgabe_faellig = null;
  let angemessene_frist_monate = 3; // Standard

  if (situation === 'auszug' && auszugsdatum) {
    // Prüfungsfrist: "angemessen", i.d.R. 3-6 Monate
    if (nk_abrechnung_offen) {
      angemessene_frist_monate = 6; // Länger wenn NK noch offen
      empfehlungen.push('NK-Abrechnung kann Rückgabe verzögern (max. 12 Monate nach Abrechnungszeitraum)');
    }

    rueckgabe_faellig = addMonths(auszugsdatum, angemessene_frist_monate);

    const heute = new Date();
    const monate_seit_auszug = monthsDiff(auszugsdatum, heute);

    if (monate_seit_auszug > 6 && !nk_abrechnung_offen) {
      probleme.push({
        typ: 'frist',
        text: `${monate_seit_auszug} Monate seit Auszug - Kaution sollte längst zurück sein!`,
        schwere: 'kritisch'
      });
    }
  }

  // 4. Einbehalt prüfen
  let einbehalt_berechtigt = false;
  if (vermieter_behaelt > 0) {
    if (maengel_vorhanden && uebergabeprotokoll) {
      einbehalt_berechtigt = true;
      empfehlungen.push('Prüfen Sie: Sind die Mängel im Protokoll dokumentiert und Ihr Verschulden?');
    } else if (!uebergabeprotokoll) {
      empfehlungen.push('Ohne Übergabeprotokoll ist Einbehalt schwer durchsetzbar');
    }

    // Abzug für normale Abnutzung?
    if (einbehalt_grund && einbehalt_grund.toLowerCase().includes('abnutzung')) {
      probleme.push({
        typ: 'abnutzung',
        text: 'Normale Abnutzung ist KEIN Grund für Kautionseinbehalt!',
        schwere: 'mittel'
      });
    }
  }

  // 5. Zinsen
  // Durchschnittszins der letzten Jahre (sehr niedrig)
  const geschaetzte_zinsen = situation === 'auszug'
    ? gezahlte_kaution * 0.005 * (monthsDiff(new Date(2020, 0, 1), auszugsdatum) / 12)
    : 0;

  if (situation === 'auszug' && !zinsen_erhalten && geschaetzte_zinsen > 5) {
    empfehlungen.push(`Zinsen nicht vergessen! Geschätzt ca. ${round(geschaetzte_zinsen, 2)} € (Niedrigzinsphase)`);
  }

  // 6. Rückforderungsbetrag
  const rueckforderung_gesamt = gezahlte_kaution - (vermieter_behaelt || 0) + geschaetzte_zinsen;

  return {
    situation,
    kaltmiete,
    gezahlte_kaution,
    max_kaution,
    kaution_zu_hoch,
    ueberzahlung: round(ueberzahlung, 2),
    probleme,
    empfehlungen,
    angemessene_frist_monate,
    rueckgabe_faellig: rueckgabe_faellig ? formatDate(rueckgabe_faellig) : null,
    vermieter_behaelt: vermieter_behaelt || 0,
    einbehalt_berechtigt,
    geschaetzte_zinsen: round(geschaetzte_zinsen, 2),
    rueckforderung_gesamt: round(rueckforderung_gesamt, 2),
    bewertung: probleme.filter(p => p.schwere === 'kritisch').length > 0 ? 'problematisch' : 'ok'
  };
}
```

## ERGEBNIS-ANZEIGE

### Primary Result
Je nach Situation:
- **Einzug + zu hoch:** 🔴 "Kaution {ueberzahlung} € zu hoch!"
- **Auszug + überfällig:** 🔴 "Kaution überfällig! Mahnung senden!"
- **OK:** 🟢 "Kaution korrekt"

### Rückforderungs-Box (bei Auszug)
```
💰 Ihr Rückforderungsanspruch:

Gezahlte Kaution:     {gezahlte_kaution} €
- Einbehalt:          {vermieter_behaelt} €
+ Zinsen:             {geschaetzte_zinsen} €
─────────────────────────────────
= Zu erstatten:       {rueckforderung_gesamt} €

Rückgabe fällig bis:  {rueckgabe_faellig}
```

### Probleme-Liste
Liste aller Probleme mit Schweregrad und Handlungsempfehlung

### Secondary Results (2x2 Grid)
1. Gezahlt: `{gezahlte_kaution} €`
2. Maximum: `{max_kaution} €`
3. Einbehalten: `{vermieter_behaelt} €`
4. Zinsen: `{geschaetzte_zinsen} €`

### Empfehlungen-Box
Liste aller Empfehlungen

### Hinweis
"Die Kaution darf nur für berechtigte Ansprüche einbehalten werden:
- Mietschulden
- Schäden (über normale Abnutzung hinaus)
- Offene Nebenkosten-Nachzahlung"

## BESONDERHEITEN
- Situation-Toggle ändert angezeigte Felder
- Muster-Mahnung generieren (Premium)
- Fristenrechner integriert

## CROSS-SELL
"Berechnen Sie die korrekte Kaution mit dem Kautions-Rechner"
→ Link zu /rechner/kaution
```

---

## STRIPE PRICE IDs
- Plus/Monat: price_1SuLlh52lqSgjCzeb1XsRy4E (€0.99)
- Plus/Jahr: price_1SuLlh52lqSgjCze5AOi6Njw (€9.90)
- Pro/Monat: price_1SuLli52lqSgjCzekOWV0b2a (€1.99)
- Pro/Jahr: price_1SuLli52lqSgjCze90ODpXch (€19.90)
- Lifetime: price_1SuLlj52lqSgjCzehqSZYvqy (€9.90)
