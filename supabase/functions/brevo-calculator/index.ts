// ============================================================================
// BREVO-CALCULATOR EDGE FUNCTION - FinTuttO
// ============================================================================
// Handles lead capture from calculator tools:
//   - Rendite-Rechner (meinrenditerechner.de)
//   - Mieterhöhungs-Rechner (mieterhoehung.eu)
//   - Nebenkosten-Rechner
//   - Mietspiegel-Rechner (meinmietspiegel.de)
//
// Flow:
//   1. User completes calculator
//   2. User enters email for result
//   3. This function creates/updates contact
//   4. Sends calculator result email
//   5. Starts nurturing sequence
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBrevoClient } from '../_shared/utils/brevo-client.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/utils/cors.ts';
import { isValidEmail } from '../_shared/utils/validation.ts';
import {
  getCalculatorTemplateId,
  getCalculatorFollowUpTemplateId,
  TEMPLATE_IDS,
} from '../_shared/config/template-ids.ts';
import { getDiscountCode } from '../_shared/config/discount-codes.ts';
import type { AutomationEvent } from '../_shared/types/brevo.ts';

// ----------------------------------------------------------------------------
// Request Types
// ----------------------------------------------------------------------------

type CalculatorType =
  | 'rendite'
  | 'mieterhoehung'
  | 'nebenkosten'
  | 'mietspiegel'
  | 'uebergabeprotokoll';

interface CalculatorRequest {
  email: string;
  calculatorType: CalculatorType;
  // User data
  firstName?: string;
  lastName?: string;
  phone?: string;
  // Calculator specific data
  calculatorData?: {
    // Rendite
    purchasePrice?: number;
    monthlyRent?: number;
    calculatedYield?: number;
    // Mieterhöhung
    currentRent?: number;
    possibleIncrease?: number;
    localRentIndex?: number;
    // Nebenkosten
    totalCosts?: number;
    costPerSqm?: number;
    // Generic
    propertyType?: string;
    location?: string;
    sqm?: number;
    [key: string]: unknown;
  };
  // Source tracking
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

// ----------------------------------------------------------------------------
// Domain to Calculator Type Mapping
// ----------------------------------------------------------------------------

const DOMAIN_CALCULATOR_MAP: Record<string, CalculatorType> = {
  'meinrenditerechner.de': 'rendite',
  'mieterhoehung.eu': 'mieterhoehung',
  'meinmietspiegel.de': 'mietspiegel',
  'meinuebergabeprotokoll.de': 'uebergabeprotokoll',
};

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
// Lead Processing
// ----------------------------------------------------------------------------

async function processCalculatorLead(request: CalculatorRequest) {
  const client = getBrevoClient();
  const supabase = getSupabaseClient();
  const discountCode = getDiscountCode('RECHNER50');

  // ========================================================================
  // STEP 1: Create/Update Contact in Brevo
  // ========================================================================

  const contactResult = await client.createContact({
    email: request.email,
    attributes: {
      FIRSTNAME: request.firstName,
      LASTNAME: request.lastName,
      PHONE: request.phone,
      PERSONA: 'P05', // Investor-Ingo
      PRODUCT: 'rechner',
      LEAD_SOURCE: 'calculator',
      CALCULATOR_TYPE: request.calculatorType,
      FIRST_CALCULATOR_DATE: new Date().toISOString(),
      LANGUAGE: 'de',
      // UTM tracking
      ...(request.utmSource && { UTM_SOURCE: request.utmSource }),
      ...(request.utmMedium && { UTM_MEDIUM: request.utmMedium }),
      ...(request.utmCampaign && { UTM_CAMPAIGN: request.utmCampaign }),
    },
    updateEnabled: true,
  });

  // ========================================================================
  // STEP 2: Log Calculator Usage in Supabase
  // ========================================================================

  try {
    await supabase.from('calculator_usage').insert({
      email: request.email,
      calculator_type: request.calculatorType,
      calculator_data: request.calculatorData,
      source: request.source,
      utm_source: request.utmSource,
      utm_medium: request.utmMedium,
      utm_campaign: request.utmCampaign,
      referrer: request.referrer,
    });
  } catch (error) {
    console.error('Failed to log calculator usage:', error);
    // Continue - this is not critical
  }

  // ========================================================================
  // STEP 3: Trigger Brevo Automation Event
  // ========================================================================

  const eventName = `calculator_${request.calculatorType}_used` as AutomationEvent;

  await client.triggerAutomationEvent(request.email, eventName, {
    calculatorType: request.calculatorType,
    source: request.source || 'direct',
  });

  // ========================================================================
  // STEP 4: Send Calculator Result Email
  // ========================================================================

  const templateId = getCalculatorTemplateId(request.calculatorType);

  // Build email params based on calculator type
  const emailParams: Record<string, string | number | boolean> = {
    FIRSTNAME: request.firstName || '',
    CALCULATOR_TYPE: request.calculatorType,
    DISCOUNT_CODE: discountCode.code,
  };

  // Add calculator-specific params
  if (request.calculatorData) {
    const data = request.calculatorData;

    switch (request.calculatorType) {
      case 'rendite':
        if (data.purchasePrice) emailParams.PURCHASE_PRICE = data.purchasePrice;
        if (data.monthlyRent) emailParams.MONTHLY_RENT = data.monthlyRent;
        if (data.calculatedYield) emailParams.YIELD_PERCENT = data.calculatedYield;
        break;

      case 'mieterhoehung':
        if (data.currentRent) emailParams.CURRENT_RENT = data.currentRent;
        if (data.possibleIncrease) emailParams.POSSIBLE_INCREASE = data.possibleIncrease;
        break;

      case 'nebenkosten':
        if (data.totalCosts) emailParams.TOTAL_COSTS = data.totalCosts;
        if (data.costPerSqm) emailParams.COST_PER_SQM = data.costPerSqm;
        break;

      case 'mietspiegel':
        if (data.localRentIndex) emailParams.LOCAL_RENT_INDEX = data.localRentIndex;
        break;
    }

    // Common params
    if (data.location) emailParams.LOCATION = data.location;
    if (data.sqm) emailParams.SQM = data.sqm;
    if (data.propertyType) emailParams.PROPERTY_TYPE = data.propertyType;
  }

  const emailResult = await client.sendEmail({
    to: [{ email: request.email, name: request.firstName }],
    templateId,
    params: emailParams,
  });

  // ========================================================================
  // STEP 5: Add to Calculator Leads List
  // ========================================================================

  // List IDs would be configured based on your Brevo setup
  // These are placeholder IDs
  const listIds: Record<CalculatorType, number> = {
    rendite: 10,
    mieterhoehung: 11,
    nebenkosten: 12,
    mietspiegel: 13,
    uebergabeprotokoll: 14,
  };

  const listId = listIds[request.calculatorType];
  if (listId) {
    await client.addToList(request.email, listId);
  }

  // ========================================================================
  // Response
  // ========================================================================

  return {
    success: true,
    data: {
      contactCreated: contactResult.success,
      emailSent: emailResult.success,
      templateId,
      discountCode: discountCode.code,
      automationEvent: eventName,
      followUpScheduled: true,
    },
  };
}

// ----------------------------------------------------------------------------
// Batch/Cron Handler for Follow-ups
// ----------------------------------------------------------------------------

async function sendFollowUpEmails() {
  const supabase = getSupabaseClient();
  const client = getBrevoClient();

  // Find leads from 3 days ago who haven't converted
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const startOfDay = new Date(threeDaysAgo);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(threeDaysAgo);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: leads, error } = await supabase
    .from('calculator_usage')
    .select('email, calculator_type')
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())
    .is('followup_sent', null);

  if (error || !leads) {
    console.error('Failed to query leads:', error);
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  for (const lead of leads) {
    try {
      await client.sendEmail({
        to: [{ email: lead.email }],
        templateId: getCalculatorFollowUpTemplateId(),
        params: {
          CALCULATOR_TYPE: lead.calculator_type,
          DISCOUNT_CODE: 'RECHNER50',
        },
      });

      // Mark as sent
      await supabase
        .from('calculator_usage')
        .update({ followup_sent: new Date().toISOString() })
        .eq('email', lead.email)
        .eq('calculator_type', lead.calculator_type);

      processed++;
    } catch (error) {
      console.error(`Failed to send follow-up to ${lead.email}:`, error);
      failed++;
    }
  }

  return { processed, failed };
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

    // Check for cron/batch request
    if ('cron' in body && body.cron === 'followup') {
      const result = await sendFollowUpEmails();
      return jsonResponse({
        success: true,
        batch: true,
        ...result,
      });
    }

    // Single lead processing
    const request = body as CalculatorRequest;

    // Validate email
    if (!request.email || !isValidEmail(request.email)) {
      return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
    }

    // Validate calculator type
    const validTypes: CalculatorType[] = ['rendite', 'mieterhoehung', 'nebenkosten', 'mietspiegel', 'uebergabeprotokoll'];
    if (!request.calculatorType || !validTypes.includes(request.calculatorType)) {
      return errorResponse(
        `Invalid calculator type. Valid types: ${validTypes.join(', ')}`,
        400,
        'INVALID_CALCULATOR_TYPE'
      );
    }

    const result = await processCalculatorLead(request);
    return jsonResponse(result);

  } catch (error) {
    console.error('Error processing calculator lead:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
});
