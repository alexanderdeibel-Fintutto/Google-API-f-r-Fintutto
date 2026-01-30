# FinTuttO Brevo Integration

Supabase Edge Functions für die Brevo (ehemals Sendinblue) E-Mail-Marketing-Integration.

## Projektstruktur

```
supabase/
├── config.toml                    # Supabase Konfiguration
└── functions/
    ├── _shared/
    │   ├── index.ts               # Shared Exports
    │   ├── types/
    │   │   └── brevo.ts           # TypeScript Types & Interfaces
    │   ├── config/
    │   │   ├── personas.ts        # Persona-Definitionen
    │   │   ├── senders.ts         # Absender-Konfiguration
    │   │   └── discount-codes.ts  # Rabattcode-Konfiguration
    │   └── utils/
    │       ├── brevo-client.ts    # Brevo API Client
    │       ├── cors.ts            # CORS Utilities
    │       └── validation.ts      # Validierungs-Utilities
    ├── brevo-core/
    │   └── index.ts               # Core API Endpoint
    └── brevo-events/
        └── index.ts               # Events Endpoint
```

## API Endpoints

**Base URL:** `https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/`

### POST /brevo-core

Grundlegende Brevo-Operationen.

**Actions:**
- `create_contact` - Neuen Kontakt erstellen
- `update_contact` - Kontakt aktualisieren
- `get_contact` - Kontakt abrufen
- `delete_contact` - Kontakt löschen
- `send_email` - E-Mail senden
- `trigger_event` - Event triggern
- `add_to_list` - Kontakt zu Liste hinzufügen
- `remove_from_list` - Kontakt aus Liste entfernen

**Beispiel:**
```bash
curl -X POST https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/brevo-core \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "action": "create_contact",
    "data": {
      "email": "max@beispiel.de",
      "attributes": {
        "FIRSTNAME": "Max",
        "LASTNAME": "Mustermann",
        "PERSONA": "P01"
      }
    }
  }'
```

### POST /brevo-events

Event-basierte Automationen triggern.

**Events:**
- `user.registered` - Benutzer registriert
- `user.verified` - E-Mail verifiziert
- `subscription.created` - Abo erstellt
- `subscription.cancelled` - Abo gekündigt
- `payment.success` - Zahlung erfolgreich
- `payment.failed` - Zahlung fehlgeschlagen
- `object.created` - Objekt erstellt
- `tenant.created` - Mieter erstellt
- `tenant.invited` - Mieter eingeladen
- `calculator.used` - Rechner genutzt
- `referral.success` - Empfehlung erfolgreich
- `trial.ending` - Trial endet bald
- `limit.reached` - Limit erreicht

**Beispiel:**
```bash
curl -X POST https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/brevo-events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "event": "user.registered",
    "email": "max@beispiel.de",
    "data": {
      "firstName": "Max",
      "lastName": "Mustermann",
      "persona": "P01",
      "product": "vermietify"
    }
  }'
```

## Personas

| Code | Name | Beschreibung | Produkt |
|------|------|--------------|---------|
| P01 | Starter Stefan | 1 Objekt, Neuling | vermietify |
| P02 | Hobby-Heike | 2-5 Objekte, Nebentätigkeit | vermietify |
| P03 | Profi-Paul | 6-30 Objekte, Portfolio | vermietify |
| P04 | Senior-Siegfried | 65+, Komfort | vermietify |
| P05 | Investor-Ingo | Kaufinteressent | rechner |
| P09 | Mieter (eingeladen) | Vom Vermieter eingeladen | mieterapp |
| P10 | Mieter (selbst) | Selbst registriert | mieterapp |
| C1 | Hausmeister-Hans | Facility Manager | hausmeisterpro |
| C2 | StB-Sabine | Steuerberater | stb_portal |
| C3 | Makler-Marco | Immobilienmakler | makler_portal |
| D1 | Erbin-Emma | Frisch geerbt | vermietify |

## Absender

| E-Mail | Name | Produkt |
|--------|------|---------|
| info@fintutto.de | FinTuttO | Default |
| info@vermietify.de | Vermietify | vermietify |
| info@mieterapp.de | MieterApp | mieterapp |
| info@hausmeisterpro.de | HausmeisterPro | hausmeisterpro |

## Rabattcodes

| Code | Rabatt | Verwendung |
|------|--------|------------|
| WILLKOMMEN50 | 50% 1. Monat | Onboarding Upgrade |
| ERSTVERMIETER50 | 50% 1. Monat | Investor → Vermietify |
| RECHNER50 | 50% 1. Monat | Lead-Magnet Conversion |
| UPGRADE50 | 50% 1. Monat | Limit erreicht |
| TRIAL25 | 25% Jahresabo | Trial Ende |
| COMEBACK2 | 2 Monate gratis | Win-Back 30d |
| COMEBACK3FOR1 | 3 für 1 | Win-Back 90d |

## Automation Events

| Event | Beschreibung |
|-------|--------------|
| onboarding_erstvermieter | P01 Sequenz |
| onboarding_privatvermieter | P02 Sequenz |
| onboarding_portfolio | P03 Sequenz |
| onboarding_senior | P04 Sequenz |
| onboarding_investor | P05 Sequenz |
| onboarding_mieter_eingeladen | P09 Sequenz |
| onboarding_mieter_selbst | P10 Sequenz |
| onboarding_hausmeister | C1 Sequenz |
| onboarding_steuerberater | C2 Sequenz |
| onboarding_makler | C3 Sequenz |
| onboarding_erbin | D1 Sequenz |
| email_verified | Willkommen |
| trial_ending | Upgrade Push |
| subscription_cancelled | Win-Back |
| user_inactive_14days | Re-Engagement |
| limit_objects_reached | Upgrade Nudge |
| limit_ki_reached | Upgrade Nudge |

## Lokale Entwicklung

### Voraussetzungen

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/)

### Setup

1. Supabase CLI installieren:
```bash
npm install -g supabase
```

2. Projekt starten:
```bash
supabase start
```

3. Edge Functions lokal testen:
```bash
supabase functions serve
```

### Environment Variables

Erstelle eine `.env` Datei im `functions` Ordner:

```env
BREVO_API_KEY=xkeysib-your-api-key
SUPABASE_URL=https://aaefocdqgdgexkcrjhks.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Deployment

```bash
# Einzelne Function deployen
supabase functions deploy brevo-core
supabase functions deploy brevo-events

# Alle Functions deployen
supabase functions deploy
```

## Brevo Dashboard Links

- [Dashboard](https://app.brevo.com/)
- [Contacts](https://app.brevo.com/contacts/list)
- [Templates](https://app.brevo.com/templates)
- [Automations](https://app.brevo.com/automation/list)
- [TX Logs](https://app.brevo.com/transactional/logs)
- [API Docs](https://developers.brevo.com/)

---

**FinTuttO** – alles. automatisch. ab jetzt.
