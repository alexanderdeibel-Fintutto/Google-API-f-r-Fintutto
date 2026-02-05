# Fintutto SEO-Domains Setup

## Übersicht

Jede App bekommt eine sprechende Subdomain unter fintutto.de für bessere SEO.

## Domain-Struktur

```
fintutto.de
├── kautions-rechner.fintutto.de
├── mieterhoehungs-rechner.fintutto.de
├── kaufnebenkosten-rechner.fintutto.de
├── eigenkapital-rechner.fintutto.de
├── grundsteuer-rechner.fintutto.de
├── rendite-rechner.fintutto.de
├── mietpreisbremsen-check.fintutto.de
├── mieterhoehungs-check.fintutto.de
├── kuendigungsfrist-check.fintutto.de
├── kautions-check.fintutto.de
└── schoenheitsreparaturen-check.fintutto.de
```

## Lovable App URLs

| SEO-Domain | Lovable App | GitHub Repo |
|------------|-------------|-------------|
| kautions-rechner.fintutto.de | my-deposit-calculator.lovable.app | my-deposit-calculator |
| mieterhoehungs-rechner.fintutto.de | check-mieterhoehung2-fintutto.lovable.app | check-mieterhoehung2-fintutto |
| kaufnebenkosten-rechner.fintutto.de | your-property-costs.lovable.app | your-property-costs |
| eigenkapital-rechner.fintutto.de | property-equity-partner.lovable.app | property-equity-partner |
| grundsteuer-rechner.fintutto.de | grundsteuer-easy.lovable.app | grundsteuer-easy |
| rendite-rechner.fintutto.de | kaution-klar.lovable.app | kaution-klar |
| mietpreisbremsen-check.fintutto.de | miet-check-pro.lovable.app | miet-check-pro |
| mieterhoehungs-check.fintutto.de | rent-check-buddy.lovable.app | rent-check-buddy |
| kuendigungsfrist-check.fintutto.de | k-ndigungs-check-pro.lovable.app | k-ndigungs-check-pro |
| kautions-check.fintutto.de | deposit-check-pro.lovable.app | deposit-check-pro |
| schoenheitsreparaturen-check.fintutto.de | schoenheit-fintutto.lovable.app | schoenheit-fintutto |

## Option 1: Lovable Custom Domains

Lovable unterstützt Custom Domains direkt:

1. Öffne die App in Lovable
2. Gehe zu **Settings** → **Domains**
3. Füge die Custom Domain hinzu
4. Erstelle den CNAME-Record bei deinem DNS-Provider

### DNS-Records (CNAME)

```
kautions-rechner.fintutto.de      CNAME  my-deposit-calculator.lovable.app
mieterhoehungs-rechner.fintutto.de CNAME check-mieterhoehung2-fintutto.lovable.app
kaufnebenkosten-rechner.fintutto.de CNAME your-property-costs.lovable.app
eigenkapital-rechner.fintutto.de   CNAME property-equity-partner.lovable.app
grundsteuer-rechner.fintutto.de    CNAME grundsteuer-easy.lovable.app
rendite-rechner.fintutto.de        CNAME kaution-klar.lovable.app
mietpreisbremsen-check.fintutto.de CNAME miet-check-pro.lovable.app
mieterhoehungs-check.fintutto.de   CNAME rent-check-buddy.lovable.app
kuendigungsfrist-check.fintutto.de CNAME k-ndigungs-check-pro.lovable.app
kautions-check.fintutto.de         CNAME deposit-check-pro.lovable.app
schoenheitsreparaturen-check.fintutto.de CNAME schoenheit-fintutto.lovable.app
```

## Option 2: Cloudflare Redirects (wenn Custom Domains nicht möglich)

Falls Lovable keine Custom Domains unterstützt, nutze Cloudflare Page Rules:

### Cloudflare Setup

1. Füge fintutto.de zu Cloudflare hinzu
2. Erstelle DNS-Records (A-Record auf 192.0.2.1 als Proxy)
3. Erstelle Page Rules für Redirects

### Page Rules

```
URL: kautions-rechner.fintutto.de/*
Forwarding URL (301): https://my-deposit-calculator.lovable.app/$1

URL: mieterhoehungs-rechner.fintutto.de/*
Forwarding URL (301): https://check-mieterhoehung2-fintutto.lovable.app/$1

...
```

## Option 3: Vercel/Netlify als Reverse Proxy

Erstelle eine `_redirects` oder `vercel.json` Datei:

### Vercel (vercel.json)

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://my-deposit-calculator.lovable.app/:path*",
      "permanent": true
    }
  ]
}
```

## SSL-Zertifikate

- **Lovable Custom Domains**: Automatisch über Let's Encrypt
- **Cloudflare**: Automatisch mit Full SSL
- **Vercel/Netlify**: Automatisch

## SEO-Optimierung

### Meta-Tags (in jeder App)

```html
<meta name="description" content="Kostenloser [Tool-Name] von Fintutto - [Beschreibung]">
<meta name="keywords" content="[Tool], Mietrecht, Deutschland, kostenlos, Rechner">
<link rel="canonical" href="https://[subdomain].fintutto.de/">
```

### robots.txt

```
User-agent: *
Allow: /
Sitemap: https://fintutto.de/sitemap.xml
```

### Sitemap

Erstelle eine zentrale Sitemap unter fintutto.de/sitemap.xml:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kautions-rechner.fintutto.de/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- weitere URLs -->
</urlset>
```

## Checkliste

- [ ] DNS-Provider Zugang vorhanden
- [ ] fintutto.de Domain verifiziert
- [ ] Alle CNAME-Records erstellt
- [ ] Lovable Custom Domains konfiguriert
- [ ] SSL-Zertifikate aktiv
- [ ] SEO Meta-Tags in allen Apps
- [ ] Google Search Console eingerichtet
- [ ] Sitemap erstellt und eingereicht
