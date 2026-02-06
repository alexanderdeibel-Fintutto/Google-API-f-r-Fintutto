# Supabase Setup für Fintutto Apps

## Übersicht

Jede Fintutto App braucht ein Supabase-Projekt für:
- **Authentication** (Login/Register)
- **Database** (Gespeicherte Berechnungen)
- **Edge Functions** (Stripe Checkout)

## Option 1: Ein Supabase-Projekt für alle Apps (empfohlen)

Erstelle ein Projekt namens `fintutto-production`:

### 1. Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Klicke **New Project**
3. Name: `fintutto-production`
4. Region: `Frankfurt (eu-central-1)`
5. Password: Sichere generieren und speichern!

### 2. Database Schema

Führe dieses SQL im **SQL Editor** aus:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Calculations table (für alle Apps)
CREATE TABLE calculations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_type TEXT NOT NULL, -- z.B. 'kautions-rechner', 'mieterhoehungs-check'
  name TEXT NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX idx_calculations_user_id ON calculations(user_id);
CREATE INDEX idx_calculations_app_type ON calculations(app_type);

-- RLS (Row Level Security) aktivieren
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Policy: Nutzer sehen nur ihre eigenen Berechnungen
CREATE POLICY "Users can view own calculations"
  ON calculations FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Nutzer können eigene Berechnungen erstellen
CREATE POLICY "Users can insert own calculations"
  ON calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Nutzer können eigene Berechnungen löschen
CREATE POLICY "Users can delete own calculations"
  ON calculations FOR DELETE
  USING (auth.uid() = user_id);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### 3. Edge Function für Stripe Checkout

Erstelle die Edge Function `create-checkout`:

```bash
supabase functions new create-checkout
```

**supabase/functions/create-checkout/index.ts:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, successUrl, cancelUrl, customerEmail } = await req.json()

    if (!priceId) {
      throw new Error('Price ID is required')
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/pricing`,
      customer_email: customerEmail,
      allow_promotion_codes: true,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### 4. Edge Function deployen

```bash
# Login
supabase login

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx

# Deploy
supabase functions deploy create-checkout
```

### 5. Environment Variables für Lovable

In jeder Lovable App unter **Settings → Environment Variables**:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Option 2: Separate Supabase-Projekte pro App

Falls du separate Projekte willst:

| App | Supabase Project |
|-----|------------------|
| kautions-rechner | fintutto-kautions-rechner |
| mieterhoehungs-rechner | fintutto-mieterhoehungs-rechner |
| ... | ... |

Wiederhole die Schritte 1-5 für jedes Projekt.

## Authentication Setup

### 1. Email Auth aktivieren

In Supabase Dashboard:
1. **Authentication → Providers**
2. **Email** aktivieren
3. **Confirm email** optional deaktivieren für schnelleres Testen

### 2. Google OAuth (optional)

1. **Authentication → Providers → Google**
2. Google Cloud Console: OAuth Credentials erstellen
3. Client ID und Secret eintragen

### 3. Redirect URLs konfigurieren

In **Authentication → URL Configuration**:

```
Site URL: https://kautions-rechner.fintutto.de

Redirect URLs:
- https://kautions-rechner.fintutto.de/**
- https://mieterhoehungs-rechner.fintutto.de/**
- https://kaufnebenkosten-rechner.fintutto.de/**
- https://eigenkapital-rechner.fintutto.de/**
- https://grundsteuer-rechner.fintutto.de/**
- https://rendite-rechner.fintutto.de/**
- https://mietpreisbremsen-check.fintutto.de/**
- https://mieterhoehungs-check.fintutto.de/**
- https://kuendigungsfrist-check.fintutto.de/**
- https://kautions-check.fintutto.de/**
- https://schoenheitsreparaturen-check.fintutto.de/**
- http://localhost:*/**
```

## Stripe Webhook Setup

### 1. Webhook Endpoint erstellen

Erstelle Edge Function `stripe-webhook`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Update subscription in database
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: session.client_reference_id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan_id: 'pro',
          status: 'active',
        })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', plan_id: 'free' })
        .eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
```

### 2. Webhook in Stripe Dashboard

1. Gehe zu [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. **Add endpoint**
3. URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
4. Events auswählen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Webhook Secret kopieren

### 3. Secret setzen

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Checkliste

- [ ] Supabase Projekt erstellt
- [ ] Database Schema ausgeführt
- [ ] Edge Functions deployed
- [ ] Environment Variables in Lovable gesetzt
- [ ] Auth Providers konfiguriert
- [ ] Redirect URLs eingetragen
- [ ] Stripe Webhook eingerichtet

## Troubleshooting

### "Invalid API key"
→ Prüfe VITE_SUPABASE_ANON_KEY in Lovable

### "User not found"
→ RLS Policies prüfen

### "CORS error"
→ Supabase Project Settings → API → CORS origins hinzufügen

### Edge Function Error
→ `supabase functions logs create-checkout` ausführen
