# FinTuttO Supabase + Brevo Setup Guide

## Schnellstart

### 1. SQL Migration ausführen

Öffne den SQL Editor in Supabase:
https://supabase.com/dashboard/project/aaefocdqgdgexkcrjhks/sql

Kopiere den Inhalt von `supabase/migrations/001_brevo_integration.sql` und führe ihn aus.

### 2. Edge Functions deployen

```bash
cd ~/Downloads/brevo-integration
export BREVO_API_KEY="xkeysib-..."
npx supabase functions deploy brevo-core --no-verify-jwt
npx supabase functions deploy brevo-events --no-verify-jwt
npx supabase functions deploy brevo-sync --no-verify-jwt
```

### 3. Cron Job einrichten (optional)

Im SQL Editor:

```sql
-- Brevo Sync alle 5 Minuten
SELECT cron.schedule(
  'brevo-sync-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/brevo-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

## Architektur

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Frontend      │────▶│   Supabase DB    │────▶│   Brevo     │
│   (App/Web)     │     │   + Triggers     │     │   (E-Mail)  │
└─────────────────┘     └──────────────────┘     └─────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Edge Functions  │
                        │  - brevo-core    │
                        │  - brevo-events  │
                        │  - brevo-sync    │
                        └──────────────────┘
```

---

## Datenbank-Tabellen

### user_profiles
Erweiterte User-Daten inkl. Brevo-Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| persona | TEXT | P01-P10, C1-C3, D1 |
| product | TEXT | vermietify, mieterapp, etc. |
| subscription_status | TEXT | trial, active, cancelled, expired |
| objects_count | INTEGER | Anzahl Immobilien |
| tenants_count | INTEGER | Anzahl Mieter |
| brevo_synced_at | TIMESTAMPTZ | Letzte Sync-Zeit |

### brevo_sync_log
Tracking aller Brevo-Syncs

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| event_type | TEXT | user.registered, subscription.created, etc. |
| payload | JSONB | Event-Daten |
| success | BOOLEAN | Sync erfolgreich? |
| error_message | TEXT | Fehlermeldung falls fehlgeschlagen |

### subscriptions
Stripe/Abo-Verwaltung

### properties
Immobilien (für Vermietify)

### tenants
Mieter-Verwaltung

### calculator_usage
Rechner-Nutzung für Lead-Tracking

---

## Automatische Triggers

### Bei neuen Usern
```
user_profiles INSERT → trigger_sync_user_to_brevo → brevo_sync_log
```

### Bei Abo-Änderungen
```
subscriptions INSERT/UPDATE → trigger_sync_subscription_to_brevo → brevo_sync_log
```

### Bei neuen Immobilien
```
properties INSERT → trigger_update_property_count → brevo_sync_log + user_profiles.objects_count++
```

### Bei neuen Mietern
```
tenants INSERT → trigger_update_tenant_count → brevo_sync_log + user_profiles.tenants_count++
```

---

## Edge Functions API

### brevo-core
**URL:** `POST /functions/v1/brevo-core`

```json
{
  "action": "create_contact",
  "data": {
    "email": "user@example.com",
    "attributes": {
      "FIRSTNAME": "Max",
      "PERSONA": "P01"
    }
  }
}
```

**Actions:**
- `create_contact` - Kontakt erstellen
- `update_contact` - Kontakt aktualisieren
- `get_contact` - Kontakt abrufen
- `delete_contact` - Kontakt löschen
- `send_email` - E-Mail senden
- `trigger_event` - Event triggern
- `add_to_list` - Zu Liste hinzufügen
- `remove_from_list` - Aus Liste entfernen

### brevo-events
**URL:** `POST /functions/v1/brevo-events`

```json
{
  "event": "user.registered",
  "email": "user@example.com",
  "data": {
    "firstName": "Max",
    "persona": "P01",
    "product": "vermietify"
  }
}
```

**Events:**
- `user.registered` → Onboarding-Sequenz starten
- `user.verified` → Willkommens-E-Mail
- `subscription.created` → Upgrade-Bestätigung
- `subscription.cancelled` → Win-Back-Sequenz
- `payment.success` / `payment.failed`
- `object.created` → Objekt-Limit prüfen
- `tenant.created` / `tenant.invited`
- `calculator.used` → Lead-Nurturing
- `trial.ending` → Upgrade-Reminder
- `limit.reached` → Upgrade-Nudge

### brevo-sync
**URL:** `POST /functions/v1/brevo-sync`

Verarbeitet alle pending Einträge aus `brevo_sync_log`.

---

## Personas → Automationen

| Persona | Onboarding Event | Sequenz |
|---------|------------------|---------|
| P01 Starter Stefan | `onboarding_erstvermieter` | 5 E-Mails über 14 Tage |
| P02 Hobby-Heike | `onboarding_privatvermieter` | 4 E-Mails über 10 Tage |
| P03 Profi-Paul | `onboarding_portfolio` | 6 E-Mails über 21 Tage |
| P04 Senior-Siegfried | `onboarding_senior` | 3 E-Mails über 7 Tage |
| P05 Investor-Ingo | `onboarding_investor` | Rechner → Vermietify |
| P09 Mieter eingeladen | `onboarding_mieter_eingeladen` | App-Download |
| P10 Mieter selbst | `onboarding_mieter_selbst` | Features |
| C1 Hausmeister | `onboarding_hausmeister` | B2B |
| C2 Steuerberater | `onboarding_steuerberater` | B2B |
| C3 Makler | `onboarding_makler` | B2B |
| D1 Erbin | `onboarding_erbin` | Spezial |

---

## Frontend-Integration

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// User registrieren (Trigger → Brevo automatisch)
const { data, error } = await supabase
  .from('user_profiles')
  .insert({
    id: user.id,
    email: user.email,
    first_name: 'Max',
    persona: 'P01',
    product: 'vermietify'
  });

// Property erstellen (Trigger → objects_count + Brevo)
await supabase
  .from('properties')
  .insert({
    user_id: user.id,
    name: 'Meine Wohnung',
    address: 'Musterstraße 1'
  });

// Direkter Brevo-Call (für spezielle Events)
await supabase.functions.invoke('brevo-events', {
  body: {
    event: 'calculator.used',
    email: 'lead@example.com',
    data: { calculatorType: 'rendite' }
  }
});
```

---

## Monitoring

### Pending Syncs prüfen

```sql
SELECT * FROM v_pending_brevo_syncs LIMIT 20;
```

### User Brevo Status

```sql
SELECT * FROM v_user_brevo_status WHERE email = 'user@example.com';
```

### Sync-Statistiken

```sql
SELECT
  event_type,
  COUNT(*) as total,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed
FROM brevo_sync_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type;
```

---

## Troubleshooting

### "Contact not synced"
1. Check `brevo_sync_log` für Fehler
2. Verify BREVO_API_KEY in Secrets
3. Manual sync: `curl -X POST .../brevo-sync`

### "Event not triggered"
1. Prüfe Trigger existiert: `\df sync_*`
2. Prüfe RLS Policies
3. Test mit Service Role Key

---

## Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/aaefocdqgdgexkcrjhks
- **Edge Functions:** https://supabase.com/dashboard/project/aaefocdqgdgexkcrjhks/functions
- **Brevo Dashboard:** https://app.brevo.com/
- **Brevo API Docs:** https://developers.brevo.com/

---

**FinTuttO** – alles. automatisch. ab jetzt.
