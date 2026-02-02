// ============================================================================
// BREVO-WEBHOOK EDGE FUNCTION - FinTuttO
// ============================================================================
// Handles incoming webhooks from Brevo for:
//   - Email delivered/opened/clicked
//   - Email bounced/soft-bounced
//   - Contact unsubscribed
//   - Contact updated
//
// Setup in Brevo: Settings > Webhooks > Add new webhook
// URL: https://[project].supabase.co/functions/v1/brevo-webhook
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/utils/cors.ts';

// ----------------------------------------------------------------------------
// Brevo Webhook Event Types
// ----------------------------------------------------------------------------

type BrevoWebhookEvent =
  | 'delivered'
  | 'request'
  | 'soft_bounce'
  | 'hard_bounce'
  | 'blocked'
  | 'spam'
  | 'invalid_email'
  | 'deferred'
  | 'click'
  | 'opened'
  | 'unique_opened'
  | 'unsubscribed'
  | 'list_addition'
  | 'contact_updated'
  | 'contact_deleted';

interface BrevoWebhookPayload {
  event: BrevoWebhookEvent;
  email: string;
  id?: number;
  date?: string;
  ts?: number;
  'message-id'?: string;
  ts_event?: number;
  subject?: string;
  tag?: string;
  sending_ip?: string;
  ts_epoch?: number;
  template_id?: number;
  // Click specific
  link?: string;
  // Bounce specific
  reason?: string;
  // List specific
  list_id?: number[];
}

// ----------------------------------------------------------------------------
// Supabase Client
// ----------------------------------------------------------------------------

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// ----------------------------------------------------------------------------
// Event Handlers
// ----------------------------------------------------------------------------

async function handleDelivered(payload: BrevoWebhookPayload) {
  console.log(`Email delivered to ${payload.email}`);
  // Could update a delivery tracking table
  return { processed: true };
}

async function handleOpened(payload: BrevoWebhookPayload) {
  console.log(`Email opened by ${payload.email}`);

  // Track engagement in Supabase
  try {
    const supabase = getSupabaseClient();
    await supabase.from('brevo_email_events').insert({
      email: payload.email,
      event_type: 'opened',
      template_id: payload.template_id,
      subject: payload.subject,
      event_date: payload.date || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log open event:', error);
  }

  return { processed: true };
}

async function handleClicked(payload: BrevoWebhookPayload) {
  console.log(`Link clicked by ${payload.email}: ${payload.link}`);

  // Track click in Supabase
  try {
    const supabase = getSupabaseClient();
    await supabase.from('brevo_email_events').insert({
      email: payload.email,
      event_type: 'clicked',
      template_id: payload.template_id,
      link_url: payload.link,
      event_date: payload.date || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log click event:', error);
  }

  return { processed: true };
}

async function handleBounce(payload: BrevoWebhookPayload, isHard: boolean) {
  console.log(`Email ${isHard ? 'hard' : 'soft'} bounced for ${payload.email}: ${payload.reason}`);

  // Update user profile to mark email issues
  try {
    const supabase = getSupabaseClient();

    // Log bounce event
    await supabase.from('brevo_email_events').insert({
      email: payload.email,
      event_type: isHard ? 'hard_bounce' : 'soft_bounce',
      bounce_reason: payload.reason,
      event_date: payload.date || new Date().toISOString(),
    });

    // If hard bounce, mark user email as invalid
    if (isHard) {
      await supabase
        .from('user_profiles')
        .update({ email_valid: false, email_bounce_reason: payload.reason })
        .eq('email', payload.email);
    }
  } catch (error) {
    console.error('Failed to handle bounce:', error);
  }

  return { processed: true, hardBounce: isHard };
}

async function handleUnsubscribed(payload: BrevoWebhookPayload) {
  console.log(`User unsubscribed: ${payload.email}`);

  // Update user preferences
  try {
    const supabase = getSupabaseClient();

    // Log unsubscribe
    await supabase.from('brevo_email_events').insert({
      email: payload.email,
      event_type: 'unsubscribed',
      event_date: payload.date || new Date().toISOString(),
    });

    // Update user marketing preferences
    await supabase
      .from('user_profiles')
      .update({ marketing_opt_in: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', payload.email);
  } catch (error) {
    console.error('Failed to handle unsubscribe:', error);
  }

  return { processed: true };
}

async function handleSpam(payload: BrevoWebhookPayload) {
  console.log(`Email marked as spam by ${payload.email}`);

  try {
    const supabase = getSupabaseClient();

    await supabase.from('brevo_email_events').insert({
      email: payload.email,
      event_type: 'spam_complaint',
      event_date: payload.date || new Date().toISOString(),
    });

    // Immediately unsubscribe user
    await supabase
      .from('user_profiles')
      .update({
        marketing_opt_in: false,
        spam_complaint: true,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('email', payload.email);
  } catch (error) {
    console.error('Failed to handle spam complaint:', error);
  }

  return { processed: true };
}

// ----------------------------------------------------------------------------
// Main Handler
// ----------------------------------------------------------------------------

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Accept POST requests
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const payload = await req.json() as BrevoWebhookPayload;

    console.log('Received Brevo webhook:', payload.event, payload.email);

    // Route to appropriate handler
    let result;

    switch (payload.event) {
      case 'delivered':
      case 'request':
        result = await handleDelivered(payload);
        break;

      case 'opened':
      case 'unique_opened':
        result = await handleOpened(payload);
        break;

      case 'click':
        result = await handleClicked(payload);
        break;

      case 'soft_bounce':
      case 'deferred':
        result = await handleBounce(payload, false);
        break;

      case 'hard_bounce':
      case 'blocked':
      case 'invalid_email':
        result = await handleBounce(payload, true);
        break;

      case 'unsubscribed':
        result = await handleUnsubscribed(payload);
        break;

      case 'spam':
        result = await handleSpam(payload);
        break;

      case 'contact_updated':
      case 'contact_deleted':
      case 'list_addition':
        // Log but don't process
        console.log(`Contact event: ${payload.event} for ${payload.email}`);
        result = { processed: true, action: 'logged' };
        break;

      default:
        console.log(`Unknown event type: ${payload.event}`);
        result = { processed: false, reason: 'unknown_event' };
    }

    return jsonResponse({
      success: true,
      event: payload.event,
      ...result,
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
});
