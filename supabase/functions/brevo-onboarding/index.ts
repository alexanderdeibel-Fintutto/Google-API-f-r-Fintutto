// ============================================================================
// BREVO-ONBOARDING EDGE FUNCTION - FinTuttO
// ============================================================================
// Specialized function for user onboarding with automatic:
//   - Persona detection based on user attributes
//   - Contact creation with proper attributes
//   - Onboarding email sending with correct template
//   - Automation event triggering
//
// Endpoint: POST /brevo-onboarding
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getBrevoClient } from '../_shared/utils/brevo-client.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/utils/cors.ts';
import { isValidEmail } from '../_shared/utils/validation.ts';
import {
  getPersona,
  determinePersona,
  determineHausmeisterTier,
  getOnboardingEvent,
} from '../_shared/config/personas.ts';
import { getSenderByProduct } from '../_shared/config/senders.ts';
import { getOnboardingTemplateId } from '../_shared/config/template-ids.ts';
import { getDiscountCode } from '../_shared/config/discount-codes.ts';
import type { PersonaCode, ContactAttributes, AutomationEvent } from '../_shared/types/brevo.ts';

// ----------------------------------------------------------------------------
// Request Types
// ----------------------------------------------------------------------------

interface OnboardingRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  // Optional: Explicit persona (if known)
  persona?: PersonaCode;
  // For automatic persona detection
  product?: 'vermietify' | 'mieterapp' | 'hausmeisterpro' | 'rechner';
  objectsCount?: number;
  age?: number;
  // MieterApp specific
  isInvited?: boolean;
  inviteCode?: string;
  landlordName?: string;
  // HausmeisterPro specific
  employmentType?: 'employed' | 'self-employed' | 'company';
  employeeCount?: number;
  // Lead source
  source?: string;
  calculatorType?: string;
  // B2B
  company?: string;
  // Other
  phone?: string;
  referralCode?: string;
  language?: 'de' | 'en';
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
    const body = await req.json() as OnboardingRequest;

    // Validate email
    if (!body.email || !isValidEmail(body.email)) {
      return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
    }

    const client = getBrevoClient();

    // ========================================================================
    // STEP 1: Determine Persona
    // ========================================================================

    let personaCode: PersonaCode;

    if (body.persona) {
      // Explicit persona provided
      personaCode = body.persona;
    } else if (body.product === 'hausmeisterpro') {
      // HausmeisterPro - determine tier
      personaCode = determineHausmeisterTier({
        employmentType: body.employmentType,
        employeeCount: body.employeeCount,
        objectsCount: body.objectsCount,
      });
    } else {
      // Auto-detect based on attributes
      personaCode = determinePersona({
        objectsCount: body.objectsCount,
        age: body.age,
        isInvited: body.isInvited,
        isTenant: body.product === 'mieterapp',
        userType: body.product,
        source: body.source || body.calculatorType,
        employmentType: body.employmentType,
      });
    }

    const persona = getPersona(personaCode);
    const sender = getSenderByProduct(persona?.product || 'fintutto');

    // ========================================================================
    // STEP 2: Build Contact Attributes
    // ========================================================================

    const attributes: ContactAttributes = {
      FIRSTNAME: body.firstName,
      LASTNAME: body.lastName,
      PERSONA: personaCode,
      PRODUCT: persona?.product || body.product,
      SUBSCRIPTION_STATUS: 'trial',
      OBJECTS_COUNT: body.objectsCount || 0,
      TENANTS_COUNT: 0,
      REGISTRATION_DATE: new Date().toISOString(),
      LANGUAGE: body.language || 'de',
    };

    // Add optional attributes
    if (body.phone) attributes.PHONE = body.phone;
    if (body.company) attributes.COMPANY = body.company;
    if (body.referralCode) attributes.REFERRED_BY = body.referralCode;
    if (body.calculatorType) {
      attributes.LEAD_SOURCE = 'calculator';
      attributes.CALCULATOR_TYPE = body.calculatorType;
    }
    if (body.source) attributes.LEAD_SOURCE = body.source;

    // HausmeisterPro specific
    if (body.employmentType) {
      (attributes as Record<string, unknown>).EMPLOYMENT_TYPE = body.employmentType;
    }
    if (body.employeeCount) {
      (attributes as Record<string, unknown>).EMPLOYEE_COUNT = body.employeeCount;
    }

    // Determine tier from persona
    if (personaCode.startsWith('C1-')) {
      const tier = personaCode.replace('C1-', '').toLowerCase();
      (attributes as Record<string, unknown>).TIER = tier;
    }

    // ========================================================================
    // STEP 3: Create Contact in Brevo
    // ========================================================================

    const createResult = await client.createContact({
      email: body.email,
      attributes,
      updateEnabled: true,
    });

    if (!createResult.success) {
      console.error('Failed to create contact:', createResult.error);
      // Continue anyway - contact might already exist
    }

    // ========================================================================
    // STEP 4: Trigger Onboarding Automation Event
    // ========================================================================

    const onboardingEvent = getOnboardingEvent(personaCode);
    if (onboardingEvent) {
      await client.triggerAutomationEvent(
        body.email,
        onboardingEvent as AutomationEvent,
        {
          persona: personaCode,
          product: persona?.product || 'vermietify',
          firstName: body.firstName || '',
        }
      );
    }

    // ========================================================================
    // STEP 5: Send Onboarding Email (Direct)
    // ========================================================================

    const templateId = getOnboardingTemplateId(personaCode);
    let emailSent = false;

    if (templateId) {
      const emailParams: Record<string, string | number | boolean> = {
        FIRSTNAME: body.firstName || 'Nutzer',
        PERSONA: personaCode,
      };

      // Add MieterApp specific params
      if (body.landlordName) {
        emailParams.LANDLORD_NAME = body.landlordName;
      }
      if (body.inviteCode) {
        emailParams.INVITE_CODE = body.inviteCode;
      }

      const emailResult = await client.sendEmail({
        to: [{ email: body.email, name: body.firstName }],
        templateId,
        params: emailParams,
        sender: {
          email: sender.email,
          name: sender.name,
        },
      });

      emailSent = emailResult.success;

      if (!emailResult.success) {
        console.error('Failed to send onboarding email:', emailResult.error);
      }
    }

    // ========================================================================
    // STEP 6: Prepare Discount Code (if applicable)
    // ========================================================================

    let discountCode: string | undefined;

    // New users from calculator get RECHNER50
    if (body.calculatorType || body.source === 'rechner') {
      discountCode = getDiscountCode('RECHNER50').code;
    }
    // First-time landlords get ERSTVERMIETER50
    else if (personaCode === 'P01') {
      discountCode = getDiscountCode('ERSTVERMIETER50').code;
    }
    // General welcome discount
    else if (['P02', 'P03', 'P04', 'D1'].includes(personaCode)) {
      discountCode = getDiscountCode('WILLKOMMEN50').code;
    }

    // ========================================================================
    // Response
    // ========================================================================

    return jsonResponse({
      success: true,
      data: {
        persona: personaCode,
        personaName: persona?.name,
        product: persona?.product,
        templateId,
        emailSent,
        onboardingEvent,
        discountCode,
        contactCreated: createResult.success,
      },
    });

  } catch (error) {
    console.error('Error processing onboarding:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
});
