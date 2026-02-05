// ============================================================================
// BREVO-SYNC EDGE FUNCTION - Cron Job Handler
// ============================================================================
// Verarbeitet pending syncs aus brevo_sync_log
// Aufruf via Supabase Cron: SELECT cron.schedule('brevo-sync', '*/5 * * * *', ...
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/utils/cors.ts';

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!;
const BREVO_API_URL = 'https://api.brevo.com/v3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface SyncLogEntry {
  id: string;
  email: string;
  event_type: string;
  payload: Record<string, unknown>;
  user_id?: string;
}

// ----------------------------------------------------------------------------
// Brevo API Calls
// ----------------------------------------------------------------------------

async function createOrUpdateContact(email: string, attributes: Record<string, unknown>) {
  const response = await fetch(`${BREVO_API_URL}/contacts`, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      attributes,
      updateEnabled: true,
    }),
  });

  return response.ok;
}

async function trackEvent(email: string, event: string, eventData: Record<string, unknown>) {
  const response = await fetch(`${BREVO_API_URL}/trackEvent`, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      event,
      eventdata: eventData,
    }),
  });

  return response.ok;
}

// ----------------------------------------------------------------------------
// Process Pending Syncs
// ----------------------------------------------------------------------------

async function processPendingSyncs(supabase: ReturnType<typeof createClient>) {
  // Get pending syncs (max 100 per run)
  const { data: pendingSyncs, error } = await supabase
    .from('brevo_sync_log')
    .select('*')
    .eq('success', false)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    console.error('Error fetching pending syncs:', error);
    return { processed: 0, errors: 1 };
  }

  if (!pendingSyncs || pendingSyncs.length === 0) {
    return { processed: 0, errors: 0 };
  }

  let processed = 0;
  let errors = 0;

  for (const sync of pendingSyncs as SyncLogEntry[]) {
    try {
      let success = false;

      // Process based on event type
      switch (sync.event_type) {
        case 'user.registered':
          success = await createOrUpdateContact(sync.email, {
            FIRSTNAME: sync.payload.firstName,
            LASTNAME: sync.payload.lastName,
            PERSONA: sync.payload.persona,
            PRODUCT: sync.payload.product,
            REGISTRATION_DATE: new Date().toISOString(),
          });

          if (success) {
            // Also track the event
            await trackEvent(sync.email, 'user_registered', sync.payload);
          }
          break;

        case 'subscription.created':
        case 'subscription.cancelled':
        case 'subscription.updated':
          success = await createOrUpdateContact(sync.email, {
            SUBSCRIPTION_STATUS: sync.payload.status,
            SUBSCRIPTION_PLAN: sync.payload.subscriptionPlan,
          });

          if (success) {
            await trackEvent(sync.email, sync.event_type.replace('.', '_'), sync.payload);
          }
          break;

        case 'object.created':
          success = await createOrUpdateContact(sync.email, {
            OBJECTS_COUNT: sync.payload.objectsCount,
          });

          if (success) {
            await trackEvent(sync.email, 'object_created', sync.payload);
          }
          break;

        case 'tenant.created':
          success = await createOrUpdateContact(sync.email, {
            TENANTS_COUNT: sync.payload.tenantsCount,
          });

          if (success) {
            await trackEvent(sync.email, 'tenant_created', sync.payload);
          }
          break;

        default:
          // Generic event tracking
          success = await trackEvent(sync.email, sync.event_type.replace('.', '_'), sync.payload);
      }

      // Update sync log
      await supabase
        .from('brevo_sync_log')
        .update({
          success,
          response: { processed_at: new Date().toISOString() },
        })
        .eq('id', sync.id);

      if (success) {
        processed++;
      } else {
        errors++;
      }
    } catch (err) {
      console.error(`Error processing sync ${sync.id}:`, err);

      await supabase
        .from('brevo_sync_log')
        .update({
          error_message: err instanceof Error ? err.message : 'Unknown error',
        })
        .eq('id', sync.id);

      errors++;
    }
  }

  return { processed, errors };
}

// ----------------------------------------------------------------------------
// Main Handler
// ----------------------------------------------------------------------------

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Verify this is a cron job or authorized request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader && req.method !== 'POST') {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const result = await processPendingSyncs(supabase);

    return jsonResponse({
      success: true,
      processed: result.processed,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in brevo-sync:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
});
