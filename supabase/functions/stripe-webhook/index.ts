// Stripe Webhook Handler für Fintutto
// Deployed als Supabase Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") as string;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// App-ID aus Price-ID ableiten
const getAppIdFromPriceId = (priceId: string): string => {
  const priceToApp: Record<string, string> = {
    // Vermietify
    "price_1Sr55p52lqSgjCzeX6tlI5tv": "vermietify", // Starter
    "price_1Sr58r52lqSgjCze0I3R3DZ2": "vermietify", // Basic
    "price_1Sr5Ev52lqSgjCzehlVFvukL": "vermietify", // Pro
    "price_1Sr5IT52lqSgjCzeM6lyI8aW": "vermietify", // Enterprise

    // HausmeisterPro
    "price_1St3Eg52lqSgjCze5l6pqANG": "hausmeister",
    "price_1St3Eh52lqSgjCze81ZS9yv1": "hausmeister",
    "price_1St3Eh52lqSgjCzekw9MpUXo": "hausmeister",

    // MieterApp
    "price_1SsEqV52lqSgjCze1hcR8CKj": "mieter",
    "price_1Ssyfy52lqSgjCzep96BTgyz": "mieter",
    "price_1SsyeP52lqSgjCzeAnWvqhlR": "mieter",
    "price_1Ssygw52lqSgjCzeCNpIiwcd": "mieter",

    // Zähler
    "price_1Stgdi52lqSgjCze9S2Lnz2z": "zaehler",
    "price_1Stgf952lqSgjCzevIVGzX9D": "zaehler",
    "price_1Stgg752lqSgjCzexFVLz7hl": "zaehler",

    // Nebenkosten
    "price_1StYO152lqSgjCzeyoBnLHtK": "nebenkosten",
    "price_1StYRO52lqSgjCzegIAtzgW7": "nebenkosten",

    // Formulare (Pakete)
    "price_1St4fk52lqSgjCzepd3xh6gB": "formulare",

    // Rechner
    "price_rechner_premium": "rechner",
  };

  return priceToApp[priceId] || "unknown";
};

// Plan-ID aus Price-ID ableiten
const getPlanIdFromPriceId = (priceId: string): string => {
  const priceToPlan: Record<string, string> = {
    // Vermietify
    "price_1Sr55p52lqSgjCzeX6tlI5tv": "free",
    "price_1Sr58r52lqSgjCze0I3R3DZ2": "basic",
    "price_1Sr5Ev52lqSgjCzehlVFvukL": "pro",
    "price_1Sr5IT52lqSgjCzeM6lyI8aW": "enterprise",

    // HausmeisterPro
    "price_1St3Eg52lqSgjCze5l6pqANG": "starter",
    "price_1St3Eh52lqSgjCze81ZS9yv1": "pro",
    "price_1St3Eh52lqSgjCzekw9MpUXo": "business",

    // MieterApp
    "price_1SsEqV52lqSgjCze1hcR8CKj": "free",
    "price_1Ssyfy52lqSgjCzep96BTgyz": "basic",
    "price_1SsyeP52lqSgjCzeAnWvqhlR": "pro",
    "price_1Ssygw52lqSgjCzeCNpIiwcd": "business",

    // Zähler
    "price_1Stgdi52lqSgjCze9S2Lnz2z": "basic",
    "price_1Stgf952lqSgjCzevIVGzX9D": "premium",
    "price_1Stgg752lqSgjCzexFVLz7hl": "business",
  };

  return priceToPlan[priceId] || "basic";
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Received event: ${event.type}`);

    switch (event.type) {
      // ═══════════════════════════════════════════════════════════════
      // CHECKOUT COMPLETED - Neue Subscription
      // ═══════════════════════════════════════════════════════════════
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const userId = session.metadata?.user_id;
          const priceId = subscription.items.data[0]?.price.id;
          const appId = getAppIdFromPriceId(priceId);
          const planId = getPlanIdFromPriceId(priceId);

          if (userId) {
            // Upsert Subscription
            const { error } = await supabase
              .from("user_subscriptions")
              .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription.id,
                app_id: appId,
                plan_id: planId,
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              }, {
                onConflict: "user_id,app_id"
              });

            if (error) {
              console.error("Error upserting subscription:", error);
            } else {
              console.log(`Subscription created: ${userId} -> ${appId}:${planId}`);
            }
          }
        }
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // SUBSCRIPTION UPDATED - Plan geändert
      // ═══════════════════════════════════════════════════════════════
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const appId = getAppIdFromPriceId(priceId);
        const planId = getPlanIdFromPriceId(priceId);

        const { error } = await supabase
          .from("user_subscriptions")
          .update({
            plan_id: planId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating subscription:", error);
        } else {
          console.log(`Subscription updated: ${subscription.id} -> ${planId}`);
        }
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // SUBSCRIPTION DELETED - Gekündigt
      // ═══════════════════════════════════════════════════════════════
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from("user_subscriptions")
          .update({
            status: "cancelled",
            plan_id: "free", // Zurück auf Free
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error cancelling subscription:", error);
        } else {
          console.log(`Subscription cancelled: ${subscription.id}`);
        }
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // INVOICE PAYMENT FAILED - Zahlung fehlgeschlagen
      // ═══════════════════════════════════════════════════════════════
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const { error } = await supabase
            .from("user_subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (error) {
            console.error("Error updating failed payment:", error);
          }
        }
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // INVOICE PAID - Zahlung erfolgreich (Renewal)
      // ═══════════════════════════════════════════════════════════════
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const { error } = await supabase
            .from("user_subscriptions")
            .update({
              status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (error) {
            console.error("Error updating paid invoice:", error);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
