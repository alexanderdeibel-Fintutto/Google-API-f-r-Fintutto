#!/bin/bash
# ============================================
# FINTUTTO GAMMA API SCRIPT
# Erstellt die 3 Übersichtsseiten automatisch
# ============================================

API_KEY="sk-gamma-bwEdmOpTtojO3JmeD3kafdFoFbQYr9zfq5lX3ewTL0"
BASE_URL="https://public-api.gamma.app/v1.0/generations"

echo "🚀 Fintutto Gamma API Script"
echo "============================"
echo ""

# ============================================
# 1. RECHNER.FINTUTTO.DE
# ============================================
echo "📊 Erstelle rechner.fintutto.de..."

RECHNER_RESPONSE=$(curl -s --request POST \
  --url "$BASE_URL" \
  --header "Content-Type: application/json" \
  --header "X-API-KEY: $API_KEY" \
  --data '{
    "inputText": "# Übersichtsseite: 22 Immobilien-Rechner\n\n## Headline\n22 kostenlose Immobilien-Rechner für Ihre Entscheidungen\n\n## Subline\nVon Rendite bis Nebenkosten: Alle Tools, die Sie als Vermieter und Investor brauchen – kostenlos und sofort nutzbar.\n\n## PREMIUM RECHNER\n- **Renditerechner** → [rendite.fintutto.de](https://rendite.fintutto.de) - Berechnen Sie die tatsächliche Rendite Ihrer Immobilie\n- **Cashflow-Rechner** → [cashflow.fintutto.de](https://cashflow.fintutto.de) - Monatlicher Überschuss auf einen Blick\n- **Mieterhöhungsrechner** → [rechner-mieterhoehung.fintutto.de](https://rechner-mieterhoehung.fintutto.de) - Rechtssichere Mieterhöhung berechnen\n\n## KAUF & FINANZIERUNG\n- Kaufpreisrechner → kaufpreis.fintutto.de\n- Kaufnebenkostenrechner → rechner-kaufnebenkosten.fintutto.de\n- Tilgungsrechner → tilgung.fintutto.de\n- Eigenkapitalrechner → eigenkapital.fintutto.de\n- Darlehensrechner → rechner-darlehen.fintutto.de\n- AfA-Rechner → afa.fintutto.de\n- Grundsteuerrechner → grundsteuer.fintutto.de\n- Spekulationssteuerrechner → rechner-spekulationssteuer.fintutto.de\n\n## MIETE & NEBENKOSTEN\n- Nebenkostenrechner → nebenkosten.fintutto.de\n- Mietspiegelrechner → mietspiegel.fintutto.de\n- Kautionsrechner → kaution.fintutto.de\n- Indexmieterechner → rechner-indexmiete.fintutto.de\n- Staffelmieterechner → rechner-staffelmiete.fintutto.de\n- Heizkostenrechner → rechner-heizkosten.fintutto.de\n- Wohnflächenrechner → rechner-wohnflaeche.fintutto.de\n- Provisionsrechner → rechner-provision.fintutto.de\n\n## WEITERE TOOLS\n- Kündigungsfristrechner → rechner-kuendigungsfrist.fintutto.de\n- Energieausweis-Rechner → rechner-energieausweis.fintutto.de\n- Modernisierungsrechner → rechner-modernisierung.fintutto.de\n\n## CTA\nAlle Rechner kostenlos nutzen → fintutto.de\n\n## Footer\nLinks: checker.fintutto.de | formulare.fintutto.de | fintutto.de\n\n**Marke: Fintutto - alles. automatisch. ab jetzt.**",
    "textMode": "preserve",
    "format": "webpage",
    "numCards": 8,
    "additionalInstructions": "Professionelles, modernes Design. Farbschema: Blau (#2563EB), Weiß, Grau. Jeder Rechner als klickbare Karte mit Icon. Deutsche Sprache. Ansprache: SIE (professionell, nicht Du).",
    "textOptions": {
      "amount": "detailed",
      "tone": "professional",
      "audience": "Vermieter, Immobilien-Investoren",
      "language": "de"
    },
    "imageOptions": {
      "source": "webSearch"
    },
    "cardOptions": {
      "dimensions": "fluid"
    }
  }')

RECHNER_ID=$(echo "$RECHNER_RESPONSE" | grep -o '"generationId":"[^"]*"' | cut -d'"' -f4)
echo "   Response: $RECHNER_RESPONSE"
echo "   Generation ID: $RECHNER_ID"
echo ""

# ============================================
# 2. CHECKER.FINTUTTO.DE
# ============================================
echo "✅ Erstelle checker.fintutto.de..."

CHECKER_RESPONSE=$(curl -s --request POST \
  --url "$BASE_URL" \
  --header "Content-Type: application/json" \
  --header "X-API-KEY: $API_KEY" \
  --data '{
    "inputText": "# Übersichtsseite: 10 Rechtliche Schnell-Checks\n\n## Headline\n10 Rechtliche Schnell-Checks für Vermieter & Mieter\n\n## Subline\nPrüfen Sie in Sekunden, ob Ihre Nebenkostenabrechnung korrekt ist, eine Kündigung rechtens wäre oder eine Mieterhöhung durchsetzbar ist.\n\n## FÜR MIETER\n- **Nebenkostencheck** → [checker-nebenkosten.fintutto.de](https://checker-nebenkosten.fintutto.de) - Ist Ihre Nebenkostenabrechnung korrekt? Häufige Fehler erkennen.\n- **Mietpreisbremsen-Check** → [checker-mietpreisbremse.fintutto.de](https://checker-mietpreisbremse.fintutto.de) - Zahlen Sie zu viel Miete?\n- **Kündigungs-Check** → [checker-kuendigung.fintutto.de](https://checker-kuendigung.fintutto.de) - Ist Ihre Kündigung rechtswirksam?\n- **Schönheitsreparaturen-Check** → [checker-schoenheitsreparaturen.fintutto.de](https://checker-schoenheitsreparaturen.fintutto.de) - Müssen Sie wirklich renovieren?\n- **Mietminderungs-Check** → [checker-mietminderung.fintutto.de](https://checker-mietminderung.fintutto.de) - Haben Sie Anspruch auf Mietminderung?\n\n## FÜR VERMIETER\n- **Mieterhöhungs-Check** → checker-mieterhoehung.fintutto.de - Ist Ihre geplante Mieterhöhung rechtssicher?\n- **Eigenbedarf-Check** → checker-eigenbedarf.fintutto.de - Können Sie Eigenbedarf anmelden?\n- **Kautions-Check** → checker-kaution.fintutto.de - Ist Ihre Kautionsvereinbarung wasserdicht?\n- **Modernisierungs-Check** → checker-modernisierung.fintutto.de - Können Sie die Kosten umlegen?\n- **Betriebskosten-Check** → checker-betriebskosten.fintutto.de - Sind Ihre Betriebskosten umlagefähig?\n\n## SO FUNKTIONIERT ES\n1. Fragen beantworten (2-3 Minuten)\n2. Sofort-Analyse erhalten\n3. Handlungsempfehlung bekommen\n\n## CTA\nRechtssicherheit in Sekunden → checker-nebenkosten.fintutto.de\n\n## Footer\nLinks: rechner.fintutto.de | formulare.fintutto.de | fintutto.de\n\n**Marke: Fintutto - alles. automatisch. ab jetzt.**",
    "textMode": "preserve",
    "format": "webpage",
    "numCards": 7,
    "additionalInstructions": "Professionelles Design mit grünen Checkmark-Icons. Farbschema: Blau, Weiß, Grün für Checks. Deutsche Sprache. Ansprache: SIE (professionell).",
    "textOptions": {
      "amount": "detailed",
      "tone": "professional",
      "audience": "Vermieter und Mieter",
      "language": "de"
    },
    "imageOptions": {
      "source": "webSearch"
    },
    "cardOptions": {
      "dimensions": "fluid"
    }
  }')

CHECKER_ID=$(echo "$CHECKER_RESPONSE" | grep -o '"generationId":"[^"]*"' | cut -d'"' -f4)
echo "   Response: $CHECKER_RESPONSE"
echo "   Generation ID: $CHECKER_ID"
echo ""

# ============================================
# 3. FORMULARE.FINTUTTO.DE
# ============================================
echo "📄 Erstelle formulare.fintutto.de..."

FORMULARE_RESPONSE=$(curl -s --request POST \
  --url "$BASE_URL" \
  --header "Content-Type: application/json" \
  --header "X-API-KEY: $API_KEY" \
  --data '{
    "inputText": "# Übersichtsseite: 28 Rechtssichere Formulare & Vorlagen\n\n## Headline\n28 rechtssichere Formulare & Vorlagen für Vermieter\n\n## Subline\nMietverträge, Kündigungen, Nebenkostenabrechnungen – alle Dokumente, die Sie brauchen. Anwaltlich geprüft, sofort einsatzbereit.\n\n## MIETVERTRÄGE (6)\n- **Mietvertrag** → formular-mietvertrag.fintutto.de - Der Standard-Mietvertrag für Wohnraum\n- **Gewerbemietvertrag** → formular-gewerbemietvertrag.fintutto.de\n- **Staffelmietvertrag** → formular-staffelmietvertrag.fintutto.de\n- **Indexmietvertrag** → formular-indexmietvertrag.fintutto.de\n- **Stellplatzmietvertrag** → formular-stellplatz.fintutto.de\n- **Mietvertragsnachtrag** → formular-nachtrag.fintutto.de\n\n## NEUVERMIETUNG & MIETERPRÜFUNG (5)\n- Selbstauskunft → formular-selbstauskunft.fintutto.de\n- SCHUFA-Auskunft → formular-schufa.fintutto.de\n- Mietbürgschaft → formular-mietbuergschaft.fintutto.de\n- Kautionsvereinbarung → formular-kaution.fintutto.de\n- Wohnungsgeberbestätigung → formular-wohnungsgeberbestaetigung.fintutto.de\n\n## MIETVERHÄLTNIS VERWALTEN (7)\n- Mieterhöhung → formular-mieterhoehung.fintutto.de\n- Modernisierungsankündigung → formular-modernisierung.fintutto.de\n- Übergabeprotokoll → formular-uebergabeprotokoll.fintutto.de\n- Untermieterlaubnis → formular-untermieterlaubnis.fintutto.de\n- Hausordnung → formular-hausordnung.fintutto.de\n- SEPA-Lastschriftmandat → formular-sepa.fintutto.de\n- Mietbescheinigung → formular-mietbescheinigung.fintutto.de\n\n## PROBLEME & BEENDIGUNG (6)\n- Mahnung → formular-mahnung.fintutto.de\n- Abmahnung → formular-abmahnung.fintutto.de\n- Mängelanzeige → formular-maengelanzeige.fintutto.de\n- Kündigung → formular-kuendigung.fintutto.de\n- Mietaufhebungsvertrag → formular-mietaufhebung.fintutto.de\n- Ratenzahlungsvereinbarung → formular-ratenzahlung.fintutto.de\n\n## BUCHHALTUNG & STEUERN (4)\n- Nebenkostenabrechnung → formular-nebenkostenabrechnung.fintutto.de\n- Anlage V → formular-anlage-v.fintutto.de\n- Bank-Exposé → formular-bank-expose.fintutto.de\n- Mietschuldenfreiheitsbescheinigung → formular-mietschuldenfreiheit.fintutto.de\n\n## VORTEILE\n- Anwaltlich geprüft\n- Sofort als PDF\n- Automatisch ausgefüllt\n- Regelmäßig aktualisiert\n\n## CTA\nAlle Formulare. Ein System. → fintutto.de\n\n## Footer\nLinks: rechner.fintutto.de | checker.fintutto.de | fintutto.de\n\n**Marke: Fintutto - alles. automatisch. ab jetzt.**",
    "textMode": "preserve",
    "format": "webpage",
    "numCards": 10,
    "additionalInstructions": "Professionelles Design. Dokument-Icons für jedes Formular. Kategorien klar getrennt. Deutsche Sprache. Ansprache: SIE (professionell).",
    "textOptions": {
      "amount": "detailed",
      "tone": "professional",
      "audience": "Vermieter, Immobilieneigentümer",
      "language": "de"
    },
    "imageOptions": {
      "source": "webSearch"
    },
    "cardOptions": {
      "dimensions": "fluid"
    }
  }')

FORMULARE_ID=$(echo "$FORMULARE_RESPONSE" | grep -o '"generationId":"[^"]*"' | cut -d'"' -f4)
echo "   Response: $FORMULARE_RESPONSE"
echo "   Generation ID: $FORMULARE_ID"
echo ""

# ============================================
# ERGEBNIS
# ============================================
echo "============================"
echo "✅ Alle 3 Seiten werden generiert!"
echo ""
echo "Generation IDs:"
echo "  - Rechner:   $RECHNER_ID"
echo "  - Checker:   $CHECKER_ID"
echo "  - Formulare: $FORMULARE_ID"
echo ""
echo "📌 Die Seiten werden in wenigen Minuten in deinem"
echo "   Gamma Dashboard erscheinen: https://gamma.app"
echo ""
echo "🔗 Nächste Schritte:"
echo "   1. Öffne gamma.app"
echo "   2. Finde die generierten Seiten"
echo "   3. Lade das Fintutto Logo hoch"
echo "   4. Verbinde die Subdomains"
echo ""
