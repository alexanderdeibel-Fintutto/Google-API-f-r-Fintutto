// ============================================================================
// BREVO-LIFECYCLE EDGE FUNCTION - FinTuttO
// ============================================================================
// Handles lifecycle email triggers:
//   - trial_ending: 3 days before trial ends
//   - trial_ended: Trial has expired
//   - subscription_upgraded: User upgraded plan
//   - subscription_downgraded: User downgraded plan
//   - subscription_cancelled: User cancelled
//   - winback_30: 30 days after cancellation
//   - winback_90: 90 days after cancellation
//   - inactive_14: 14 days inactive
//   - inactive_30: 30 days inactive
//
// Can be triggered via:
//   - Supabase Cron (pg_cron)
//   - Direct API call
//   - Database trigger
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBrevoClient } from '../_shared/utils/brevo-client.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/utils/cors.ts';
import { isValidEmail } from '../_shared/utils/validation.ts';
import { LIFECYCLE_TEMPLATES, TEMPLATE_IDS } from '../_shared/config/template-ids.ts';
import { getDiscountCode } from '../_shared/config/discount-codes.ts';
import type { AutomationEvent } from '../_shared/types/brevo.ts';

// ----------------------------------------------------------------------------
// Request Types
// ----------------------------------------------------------------------------

type LifecycleEventType =
  | 'trial_ending'
  | 'trial_ended'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'subscription_cancelled'
  | 'winback_30'
  | 'winback_90'
  | 'inactive_14'
  | 'inactive_30'
  | 'payment_failed'
  | 'payment_retry';

interface LifecycleRequest {
  event: LifecycleEventType;
  email: string;
  data?: {
    firstName?: string;
    userId?: string;
    objectsCount?: number;
    tenantsCount?: number;
    currentPlan?: string;
    newPlan?: string;
    trialEndDate?: string;
    daysRemaining?: number;
    paymentAmount?: number;
    failureReason?: string;
    product?: string;
  };
}

// Batch processing request
interface BatchRequest {
  batch: true;
  event: LifecycleEventType;
  // If not provided, will query database for matching users
  emails?: string[];
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

async function handleTrialEnding(email: string, data: LifecycleRequest['data']) {
  const client = getBrevoClient();

  // Update contact
  await client.updateContact(email, {
    TRIAL_ENDING_NOTIFIED: true,
  });

  // Trigger automation
  await client.triggerAutomationEvent(email, 'trial_ending' as AutomationEvent, {
    daysRemaining: data?.daysRemaining || 3,
  });

  // Send email directly
  const discountCode = getDiscountCode('TRIAL25');
  await client.sendEmail({
    to: [{ email, name: data?.firstName }],
    templateId: LIFECYCLE_TEMPLATES.TRIAL_ENDING,
    params: {
      FIRSTNAME: data?.firstName || 'Nutzer',
      OBJECTS_COUNT: data?.objectsCount || 0,
      TENANTS_COUNT: data?.tenantsCount || 0,
      DAYS_REMAINING: data?.daysRemaining || 3,
      DISCOUNT_CODE: discountCode.code,
    },
  });

  return {
    success: true,
    templateId: LIFECYCLE_TEMPLATES.TRIAL_ENDING,
    discountCode: discountCode.code,
  };
}

async function handleTrialEnded(email: string, data: LifecycleRequest['data']) {
  const client = getBrevoClient();

  // Update contact status
  await client.updateContact(email, {
    SUBSCRIPTION_STATUS: 'expired',
    TRIAL_ENDED_DATE: new Date().toISOString(),
  });

  // Trigger automation
  await client.triggerAutomationEvent(email, 'trial_ended' as AutomationEvent, {});

  return { success: true };
}

async function handleSubscriptionCancelled(email: string, data: LifecycleRequest['data']) {
  const client = getBrevoClient();

  // Update contact
  await client.updateContact(email, {
    SUBSCRIPTION_STATUS: 'cancelled',
    CANCELLATION_DATE: new Date().toISOString(),
    PREVIOUS_PLAN: data?.currentPlan,
  });

  // Trigger automation for win-back sequence
  await client.triggerAutomationEvent(email, 'subscription_cancelled' as AutomationEvent, {
    previousPlan: data?.currentPlan || 'basic',
  });

  return { success: true };
}

async function handleWinback(email: string, data: LifecycleRequest['data'], days: 30 | 90) {
  const client = getBrevoClient();

  const discountCode = days === 30
    ? getDiscountCode('COMEBACK2')
    : getDiscountCode('COMEBACK3FOR1');

  // Send win-back email
  await client.sendEmail({
    to: [{ email, name: data?.firstName }],
    templateId: LIFECYCLE_TEMPLATES.WINBACK,
    params: {
      FIRSTNAME: data?.firstName || 'Nutzer',
      DISCOUNT_CODE: discountCode.code,
      DISCOUNT_DESCRIPTION: discountCode.description,
    },
  });

  return {
    success: true,
    templateId: LIFECYCLE_TEMPLATES.WINBACK,
    discountCode: discountCode.code,
  };
}

async function handleInactive(email: string, data: LifecycleRequest['data'], days: 14 | 30) {
  const client = getBrevoClient();

  const eventName = days === 14 ? 'user_inactive_14days' : 'user_inactive_30days';

  // Update contact
  await client.updateContact(email, {
    INACTIVE_DAYS: days,
    LAST_INACTIVE_NOTIFICATION: new Date().toISOString(),
  });

  // Trigger automation
  await client.triggerAutomationEvent(email, eventName as AutomationEvent, {
    daysInactive: days,
  });

  return { success: true, event: eventName };
}

async function handlePaymentFailed(email: string, data: LifecycleRequest['data']) {
  const client = getBrevoClient();

  // Send payment failed email
  await client.sendEmail({
    to: [{ email, name: data?.firstName }],
    templateId: LIFECYCLE_TEMPLATES.PAYMENT_FAILED,
    params: {
      FIRSTNAME: data?.firstName || 'Nutzer',
      AMOUNT: data?.paymentAmount || 0,
      FAILURE_REASON: data?.failureReason || 'Unbekannter Fehler',
    },
  });

  return { success: true, templateId: LIFECYCLE_TEMPLATES.PAYMENT_FAILED };
}

async function handleSubscriptionUpgraded(email: string, data: LifecycleRequest['data']) {
  const client = getBrevoClient();

  // Update contact
  await client.updateContact(email, {
    SUBSCRIPTION_STATUS: 'active',
    SUBSCRIPTION_PLAN: data?.newPlan,
    UPGRADE_DATE: new Date().toISOString(),
  });

  // Trigger automation
  await client.triggerAutomationEvent(email, 'subscription_upgraded' as AutomationEvent, {
    newPlan: data?.newPlan || 'pro',
    previousPlan: data?.currentPlan || 'basic',
  });

  return { success: true };
}

// ----------------------------------------------------------------------------
// Batch Processing
// ----------------------------------------------------------------------------

async function processBatch(event: LifecycleEventType): Promise<{
  processed: number;
  failed: number;
  emails: string[];
}> {
  const supabase = getSupabaseClient();
  let query;

  // Build query based on event type
  switch (event) {
    case 'trial_ending':
      // Users whose trial ends in 3 days
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 3);
      query = supabase
        .from('subscriptions')
        .select('user_id, user_profiles!inner(email, first_name)')
        .eq('status', 'trial')
        .lte('trial_ends_at', trialEndDate.toISOString())
        .is('trial_ending_notified', null);
      break;

    case 'inactive_14':
      const inactive14Date = new Date();
      inactive14Date.setDate(inactive14Date.getDate() - 14);
      query = supabase
        .from('user_profiles')
        .select('email, first_name')
        .lt('last_login', inactive14Date.toISOString())
        .is('inactive_14_notified', null);
      break;

    case 'inactive_30':
      const inactive30Date = new Date();
      inactive30Date.setDate(inactive30Date.getDate() - 30);
      query = supabase
        .from('user_profiles')
        .select('email, first_name')
        .lt('last_login', inactive30Date.toISOString())
        .is('inactive_30_notified', null);
      break;

    case 'winback_30':
      const winback30Date = new Date();
      winback30Date.setDate(winback30Date.getDate() - 30);
      query = supabase
        .from('subscriptions')
        .select('user_id, user_profiles!inner(email, first_name)')
        .eq('status', 'cancelled')
        .lte('cancelled_at', winback30Date.toISOString())
        .is('winback_30_sent', null);
      break;

    default:
      return { processed: 0, failed: 0, emails: [] };
  }

  const { data: users, error } = await query;

  if (error || !users) {
    console.error('Failed to query users:', error);
    return { processed: 0, failed: 0, emails: [] };
  }

  let processed = 0;
  let failed = 0;
  const processedEmails: string[] = [];

  for (const user of users) {
    const email = (user as Record<string, unknown>).email as string ||
      ((user as Record<string, unknown>).user_profiles as Record<string, unknown>)?.email as string;
    const firstName = (user as Record<string, unknown>).first_name as string ||
      ((user as Record<string, unknown>).user_profiles as Record<string, unknown>)?.first_name as string;

    if (!email) continue;

    try {
      const request: LifecycleRequest = {
        event,
        email,
        data: { firstName },
      };

      await processLifecycleEvent(request);
      processed++;
      processedEmails.push(email);
    } catch (error) {
      console.error(`Failed to process ${email}:`, error);
      failed++;
    }
  }

  return { processed, failed, emails: processedEmails };
}

// ----------------------------------------------------------------------------
// Main Processing Function
// ----------------------------------------------------------------------------

async function processLifecycleEvent(request: LifecycleRequest) {
  const { event, email, data } = request;

  switch (event) {
    case 'trial_ending':
      return handleTrialEnding(email, data);
    case 'trial_ended':
      return handleTrialEnded(email, data);
    case 'subscription_cancelled':
      return handleSubscriptionCancelled(email, data);
    case 'subscription_upgraded':
    case 'subscription_downgraded':
      return handleSubscriptionUpgraded(email, data);
    case 'winback_30':
      return handleWinback(email, data, 30);
    case 'winback_90':
      return handleWinback(email, data, 90);
    case 'inactive_14':
      return handleInactive(email, data, 14);
    case 'inactive_30':
      return handleInactive(email, data, 30);
    case 'payment_failed':
    case 'payment_retry':
      return handlePaymentFailed(email, data);
    default:
      throw new Error(`Unknown lifecycle event: ${event}`);
  }
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
    const body = await req.json();

    // Check if batch processing
    if ('batch' in body && body.batch === true) {
      const batchRequest = body as BatchRequest;
      const result = await processBatch(batchRequest.event);
      return jsonResponse({
        success: true,
        batch: true,
        ...result,
      });
    }

    // Single event processing
    const request = body as LifecycleRequest;

    if (!request.event) {
      return errorResponse('Event type is required', 400, 'MISSING_EVENT');
    }

    if (!request.email || !isValidEmail(request.email)) {
      return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
    }

    const result = await processLifecycleEvent(request);
    return jsonResponse(result);

  } catch (error) {
    console.error('Error processing lifecycle event:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
});
