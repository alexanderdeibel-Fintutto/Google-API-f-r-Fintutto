# Fintutto Apps - Deployment Guide

## Status der Apps

| App | Repo | Stripe IDs | Branding | Pricing | Cross-Sell |
|-----|------|------------|----------|---------|------------|
| Kautions-Rechner | my-deposit-calculator | ✅ | ✅ | ✅ | ✅ |
| Mieterhöhungs-Rechner | check-mieterhoehung2-fintutto | ✅ | ✅ | ✅ | ✅ |
| Kaufnebenkosten-Rechner | your-property-costs | ✅ | ✅ | ✅ | ✅ |
| Eigenkapital-Rechner | property-equity-partner | ✅ | ✅ | ✅ | ✅ |
| Grundsteuer-Rechner | grundsteuer-easy | ✅ | ✅ | ✅ | ✅ |
| Rendite-Rechner | kaution-klar | ✅ | ✅ | ✅ | ✅ |
| Mietpreisbremsen-Check | miet-check-pro | ✅ | ✅ | ✅ | ✅ |
| Mieterhöhungs-Check | rent-check-buddy | ✅ | ✅ | ✅ | ✅ |
| Kündigungsfrist-Check | k-ndigungs-check-pro | ✅ | ✅ | ✅ | ✅ |
| Kautions-Check | deposit-check-pro | ✅ | ✅ | ✅ | ✅ |
| Schönheitsreparaturen-Check | schoenheit-fintutto | ✅ | ✅ | ✅ | ✅ |

## Stripe Price IDs

### Rechner (Calculators)
| Tool | Monthly Price ID | Yearly Price ID |
|------|------------------|-----------------|
| Kautions-Rechner | price_1SuLks52lqSgjCzeKLj4qZaU | price_1SuLkt52lqSgjCzef7bi1ZyD |
| Mieterhöhungs-Rechner | price_1SuLkU52lqSgjCzenGwL6wUW | price_1SuLkV52lqSgjCzezigYPTl2 |
| Kaufnebenkosten-Rechner | price_1SuLkZ52lqSgjCzeLul4szO8 | price_1SuLka52lqSgjCzeV9h69O9l |
| Eigenkapital-Rechner | price_1SuLkf52lqSgjCzeMWgtSbWX | price_1SuLkg52lqSgjCzebAorcaTj |
| Grundsteuer-Rechner | price_1SuLkn52lqSgjCzeyDWC8XPC | price_1SuLkn52lqSgjCze5pA0TO82 |
| Rendite-Rechner | price_1SuLks52lqSgjCzeKLj4qZaU | price_1SuLkt52lqSgjCzef7bi1ZyD |

### Checker
| Tool | Monthly Price ID | Yearly Price ID |
|------|------------------|-----------------|
| Mietpreisbremsen-Check | price_1SuLlV52lqSgjCzeIvc7hSnj | price_1SuLlV52lqSgjCzeqd0aN0XF |
| Mieterhöhungs-Check | price_1SuLlf52lqSgjCzed0jONR3n | price_1SuLlg52lqSgjCzehZ1HMZvM |
| Kündigungsfrist-Check | price_1SuLlX52lqSgjCzeyCPfrfkZ | price_1SuLlY52lqSgjCze56jP8MMj |
| Kautions-Check | price_1SuLli52lqSgjCzekOWV0b2a | price_1SuLli52lqSgjCze90ODpXch |
| Schönheitsreparaturen-Check | price_1SuLla52lqSgjCzeitpfOvKr | price_1SuLla52lqSgjCzeWhv8BPmg |

## Deployment-Schritte

### 1. Patches anwenden

```bash
# Klone dieses Repo
git clone https://github.com/alexanderdeibel-Fintutto/Google-API-f-r-Fintutto.git
cd Google-API-f-r-Fintutto
git checkout claude/add-property-calculators-tBPtN

# Für jede App:
cd ~/path/to/check-mieterhoehung2-fintutto
git am ~/Google-API-f-r-Fintutto/patches/check-mieterhoehung2-fintutto/*.patch
git push origin main
```

### 2. Oder: Lovable direkt verwenden

Öffne jede App in Lovable und füge die Änderungen manuell ein:

1. **index.css**: Ändere `--primary: 160 84% 39%` (Emerald)
2. **subscription.ts**: Trage die korrekten Stripe Price IDs ein
3. **deposit-check-pro**: Füge alle neuen Dateien hinzu (siehe patches/deposit-check-pro/)

## SEO-Domains Setup

Empfohlene Domains für Redirects:

| Tool | SEO-Domain |
|------|------------|
| Kautions-Rechner | kautions-rechner.fintutto.de |
| Mieterhöhungs-Rechner | mieterhoehungs-rechner.fintutto.de |
| Kaufnebenkosten-Rechner | kaufnebenkosten-rechner.fintutto.de |
| Eigenkapital-Rechner | eigenkapital-rechner.fintutto.de |
| Grundsteuer-Rechner | grundsteuer-rechner.fintutto.de |
| Mietpreisbremsen-Check | mietpreisbremsen-check.fintutto.de |
| Mieterhöhungs-Check | mieterhoehungs-check.fintutto.de |
| Kündigungsfrist-Check | kuendigungsfrist-check.fintutto.de |
| Kautions-Check | kautions-check.fintutto.de |
| Schönheitsreparaturen-Check | schoenheitsreparaturen-check.fintutto.de |

### DNS-Einrichtung (bei deinem Domain-Provider)

1. Erstelle CNAME-Records für jede Subdomain
2. Zeige auf die Lovable-App-URL oder nutze Cloudflare für Redirects

## Supabase-Konfiguration

Jede App benötigt:
1. Supabase-Projekt mit Auth aktiviert
2. Edge Function für Stripe-Checkout
3. Umgebungsvariablen in Lovable setzen

## Go-Live Checkliste

- [ ] Alle Patches angewendet
- [ ] Stripe-Produkte und Preise erstellt
- [ ] Supabase-Projekte konfiguriert
- [ ] DNS-Records eingerichtet
- [ ] SSL-Zertifikate aktiv
- [ ] Tests durchgeführt
