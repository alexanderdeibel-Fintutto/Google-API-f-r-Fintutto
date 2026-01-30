// ============================================================================
// BREVO-EVENTS EDGE FUNCTION - FinTuttO
// ============================================================================
// Base URL: https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/brevo-events
//
// Events:
//   - user.registered, user.verified
//   - subscription.created, subscription.cancelled
//   - payment.success, payment.failed
//   - object.created, tenant.created, tenant.invited
//   - calculator.used, referral.success
//   - trial.ending, limit.reached, user.inactive
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getBrevoClient } from '../_shared/utils/brevo-client.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/utils/cors.ts';
import { isValidEmail, isValidEventType } from '../_shared/utils/validation.ts';
import { getPersona, determinePersona, getOnboardingEvent } from '../_shared/config/personas.ts';
import { getSenderByProduct } from '../_shared/config/senders.ts';
import { getDiscountCode } from '../_shared/config/discount-codes.ts';
import type { EventType, PersonaCode, ContactAttributes, AutomationEvent } from '../_shared/types/brevo.ts';

// ----------------------------------------------------------------------------
// Event Request Type
// ----------------------------------------------------------------------------

interface EventRequest {
  event: EventType;
  email: string;
  data?: {
    userId?: string;
    firstName?: string;
    lastName?: string;
    persona?: PersonaCode;
    product?: string;
    subscriptionPlan?: string;
    objectsCount?: number;
    tenantsCount?: number;
    calculatorType?: string;
    referralCode?: string;
    paymentAmount?: number;
    limitType?: 'objects' | 'ki';
    daysInactive?: number;
    [key: string]: unknown;
  };
}

// ----------------------------------------------------------------------------
// Event Handlers
// ----------------------------------------------------------------------------

async function handleUserRegistered(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  // Determine persona based on provided data or attributes
  const personaCode = data?.persona || determinePersona({
    objectsCount: data?.objectsCount,
    userType: data?.product,
    source: data?.calculatorType ? 'rechner' : undefined,
  });

  const persona = getPersona(personaCode);
  const sender = getSenderByProduct(persona?.product || 'fintutto');

  // Create contact with attributes
  const attributes: ContactAttributes = {
    FIRSTNAME: data?.firstName,
    LASTNAME: data?.lastName,
    PERSONA: personaCode,
    PRODUCT: persona?.product,
    SUBSCRIPTION_STATUS: 'trial',
    OBJECTS_COUNT: data?.objectsCount || 0,
    TENANTS_COUNT: data?.tenantsCount || 0,
    REGISTRATION_DATE: new Date().toISOString(),
    LANGUAGE: 'de',
  };

  // Create contact
  await client.createContact({
    email,
    attributes,
    updateEnabled: true,
  });

  // Trigger onboarding automation
  const onboardingEvent = getOnboardingEvent(personaCode);
  if (onboardingEvent) {
    await client.triggerAutomationEvent(email, onboardingEvent as AutomationEvent, {
      persona: personaCode,
      product: persona?.product || 'vermietify',
    });
  }

  return {
    success: true,
    persona: personaCode,
    onboardingEvent,
    sender: sender.email,
  };
}

async function handleUserVerified(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  // Update contact
  await client.updateContact(email, {
    EMAIL_VERIFIED: true,
    VERIFICATION_DATE: new Date().toISOString(),
  });

  // Trigger verification event
  await client.triggerAutomationEvent(email, 'email_verified' as AutomationEvent, {
    userId: data?.userId || '',
  });

  return { success: true };
}

async function handleSubscriptionCreated(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  await client.updateContact(email, {
    SUBSCRIPTION_STATUS: 'active',
    SUBSCRIPTION_PLAN: data?.subscriptionPlan || 'basic',
    SUBSCRIPTION_DATE: new Date().toISOString(),
  });

  await client.trackEvent({
    email,
    event: 'subscription.created',
    eventdata: {
      plan: data?.subscriptionPlan || 'basic',
    },
  });

  return { success: true };
}

async function handleSubscriptionCancelled(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  await client.updateContact(email, {
    SUBSCRIPTION_STATUS: 'cancelled',
    CANCELLATION_DATE: new Date().toISOString(),
  });

  // Trigger win-back automation
  await client.triggerAutomationEvent(email, 'subscription_cancelled' as AutomationEvent, {
    previousPlan: data?.subscriptionPlan || 'basic',
  });

  // Include win-back discount code info
  const comebackCode = getDiscountCode('COMEBACK2');

  return {
    success: true,
    discountCode: comebackCode.code,
  };
}

async function handlePaymentSuccess(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  await client.updateContact(email, {
    LAST_PAYMENT_DATE: new Date().toISOString(),
    LAST_PAYMENT_AMOUNT: data?.paymentAmount,
  });

  await client.trackEvent({
    email,
    event: 'payment.success',
    eventdata: {
      amount: data?.paymentAmount || 0,
    },
  });

  return { success: true };
}

async function handlePaymentFailed(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  await client.trackEvent({
    email,
    event: 'payment.failed',
    eventdata: {
      amount: data?.paymentAmount || 0,
    },
  });

  return { success: true };
}

async function handleObjectCreated(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  // Get current contact to update count
  const contact = await client.getContact(email);
  const currentCount = (contact.data?.attributes as ContactAttributes)?.OBJECTS_COUNT || 0;

  await client.updateContact(email, {
    OBJECTS_COUNT: currentCount + 1,
  });

  await client.trackEvent({
    email,
    event: 'object.created',
    eventdata: {
      totalObjects: currentCount + 1,
    },
  });

  return { success: true, objectsCount: currentCount + 1 };
}

async function handleTenantCreated(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  const contact = await client.getContact(email);
  const currentCount = (contact.data?.attributes as ContactAttributes)?.TENANTS_COUNT || 0;

  await client.updateContact(email, {
    TENANTS_COUNT: currentCount + 1,
  });

  await client.trackEvent({
    email,
    event: 'tenant.created',
    eventdata: {
      totalTenants: currentCount + 1,
    },
  });

  return { success: true, tenantsCount: currentCount + 1 };
}

async function handleTenantInvited(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  await client.trackEvent({
    email,
    event: 'tenant.invited',
    eventdata: {
      invitedBy: data?.userId || '',
    },
  });

  return { success: true };
}

async function handleCalculatorUsed(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  const calculatorType = data?.calculatorType || 'rendite';
  const eventName = `calculator_${calculatorType}_used` as AutomationEvent;

  // Create or update contact
  await client.createContact({
    email,
    attributes: {
      LEAD_SOURCE: 'calculator',
      CALCULATOR_TYPE: calculatorType,
      FIRST_CALCULATOR_DATE: new Date().toISOString(),
    },
    updateEnabled: true,
  });

  // Trigger calculator event
  await client.triggerAutomationEvent(email, eventName, {
    calculatorType,
  });

  // Include conversion discount code
  const discountCode = getDiscountCode('RECHNER50');

  return {
    success: true,
    discountCode: discountCode.code,
  };
}

async function handleReferralSuccess(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  await client.updateContact(email, {
    REFERRAL_COUNT: ((data?.referralCount as number) || 0) + 1,
    LAST_REFERRAL_DATE: new Date().toISOString(),
  });

  await client.trackEvent({
    email,
    event: 'referral.success',
    eventdata: {
      referralCode: data?.referralCode || '',
    },
  });

  return { success: true };
}

async function handleTrialEnding(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  await client.triggerAutomationEvent(email, 'trial_ending' as AutomationEvent, {
    daysRemaining: 3,
  });

  const discountCode = getDiscountCode('TRIAL25');

  return {
    success: true,
    discountCode: discountCode.code,
  };
}

async function handleLimitReached(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  const limitType = data?.limitType || 'objects';
  const eventName = `limit_${limitType}_reached` as AutomationEvent;

  await client.triggerAutomationEvent(email, eventName, {
    limitType,
  });

  const discountCode = getDiscountCode('UPGRADE50');

  return {
    success: true,
    discountCode: discountCode.code,
  };
}

async function handleUserInactive(email: string, data: EventRequest['data']) {
  const client = getBrevoClient();

  const daysInactive = data?.daysInactive || 14;

  if (daysInactive >= 14) {
    await client.triggerAutomationEvent(email, 'user_inactive_14days' as AutomationEvent, {
      daysInactive,
    });
  }

  return { success: true };
}

// ----------------------------------------------------------------------------
// Main Handler
// ----------------------------------------------------------------------------

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only accept POST requests
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = await req.json() as EventRequest;

    // Validate event
    if (!body.event || !isValidEventType(body.event)) {
      return errorResponse(
        'Invalid or missing event type',
        400,
        'INVALID_EVENT'
      );
    }

    // Validate email
    if (!body.email || !isValidEmail(body.email)) {
      return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
    }

    // Route to appropriate handler
    let result;

    switch (body.event) {
      case 'user.registered':
        result = await handleUserRegistered(body.email, body.data);
        break;
      case 'user.verified':
        result = await handleUserVerified(body.email, body.data);
        break;
      case 'subscription.created':
        result = await handleSubscriptionCreated(body.email, body.data);
        break;
      case 'subscription.cancelled':
        result = await handleSubscriptionCancelled(body.email, body.data);
        break;
      case 'payment.success':
        result = await handlePaymentSuccess(body.email, body.data);
        break;
      case 'payment.failed':
        result = await handlePaymentFailed(body.email, body.data);
        break;
      case 'object.created':
        result = await handleObjectCreated(body.email, body.data);
        break;
      case 'tenant.created':
        result = await handleTenantCreated(body.email, body.data);
        break;
      case 'tenant.invited':
        result = await handleTenantInvited(body.email, body.data);
        break;
      case 'calculator.used':
        result = await handleCalculatorUsed(body.email, body.data);
        break;
      case 'referral.success':
        result = await handleReferralSuccess(body.email, body.data);
        break;
      case 'trial.ending':
        result = await handleTrialEnding(body.email, body.data);
        break;
      case 'limit.reached':
      case 'limit.objects.reached':
      case 'limit.ki.reached':
        result = await handleLimitReached(body.email, body.data);
        break;
      case 'user.inactive':
        result = await handleUserInactive(body.email, body.data);
        break;
      default:
        return errorResponse('Event handler not implemented', 501);
    }

    return jsonResponse(result);
  } catch (error) {
    console.error('Error processing event:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
});
