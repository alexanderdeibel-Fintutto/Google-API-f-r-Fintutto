// ============================================================================
// BREVO TEMPLATE IDS - FinTuttO
// ============================================================================
// Mapping of template names to their Brevo IDs
// Generated from brevo_templates_personas.py
// ============================================================================

import type { PersonaCode } from '../types/brevo.ts';

// ----------------------------------------------------------------------------
// Template ID Constants
// ----------------------------------------------------------------------------

export const TEMPLATE_IDS = {
  // ========== VERMIETIFY ONBOARDING ==========
  VERMIETIFY_P01_WILLKOMMEN: 8,
  VERMIETIFY_P01_TAG3: 9,
  VERMIETIFY_P02_WILLKOMMEN: 10,
  VERMIETIFY_P03_WILLKOMMEN: 11,
  VERMIETIFY_P04_WILLKOMMEN: 12,
  VERMIETIFY_D1_WILLKOMMEN: 13,
  VERMIETIFY_TRIAL_ENDING: 14,
  VERMIETIFY_WINBACK: 15,

  // ========== MIETERAPP ==========
  MIETERAPP_P09_WILLKOMMEN: 16,
  MIETERAPP_P10_WILLKOMMEN: 17,
  MIETERAPP_SCHADENSMELDUNG: 18,

  // ========== HAUSMEISTERPRO ==========
  HAUSMEISTERPRO_GO_WILLKOMMEN: 19,
  HAUSMEISTERPRO_PRO_WILLKOMMEN: 20,
  HAUSMEISTERPRO_ENT_WILLKOMMEN: 21,
  HAUSMEISTERPRO_PRO_TRIAL_ENDING: 22,

  // ========== B2B ==========
  B2B_STEUERBERATER_WILLKOMMEN: 23,
  B2B_MAKLER_WILLKOMMEN: 24,

  // ========== RECHNER/LEADS ==========
  RECHNER_RENDITE: 25,
  RECHNER_MIETERHOEHUNG: 26,
  RECHNER_NEBENKOSTEN: 27,
  RECHNER_FOLLOWUP_TAG3: 28,

  // ========== TRANSACTIONAL ==========
  SYSTEM_EMAIL_VERIFICATION: 29,
  SYSTEM_PASSWORD_RESET: 30,
  SYSTEM_PAYMENT_SUCCESS: 31,
  SYSTEM_PAYMENT_FAILED: 32,
} as const;

export type TemplateId = typeof TEMPLATE_IDS[keyof typeof TEMPLATE_IDS];

// ----------------------------------------------------------------------------
// Persona to Onboarding Template Mapping
// ----------------------------------------------------------------------------

export const ONBOARDING_TEMPLATES: Record<PersonaCode, number | undefined> = {
  // Vermietify Personas
  P01: TEMPLATE_IDS.VERMIETIFY_P01_WILLKOMMEN,
  P02: TEMPLATE_IDS.VERMIETIFY_P02_WILLKOMMEN,
  P03: TEMPLATE_IDS.VERMIETIFY_P03_WILLKOMMEN,
  P04: TEMPLATE_IDS.VERMIETIFY_P04_WILLKOMMEN,
  P05: TEMPLATE_IDS.RECHNER_RENDITE, // Investor via Rechner
  D1: TEMPLATE_IDS.VERMIETIFY_D1_WILLKOMMEN,

  // MieterApp Personas
  P09: TEMPLATE_IDS.MIETERAPP_P09_WILLKOMMEN,
  P10: TEMPLATE_IDS.MIETERAPP_P10_WILLKOMMEN,

  // HausmeisterPro Tiers
  C1: TEMPLATE_IDS.HAUSMEISTERPRO_GO_WILLKOMMEN, // Default to GO
  'C1-GO': TEMPLATE_IDS.HAUSMEISTERPRO_GO_WILLKOMMEN,
  'C1-PRO': TEMPLATE_IDS.HAUSMEISTERPRO_PRO_WILLKOMMEN,
  'C1-ENT': TEMPLATE_IDS.HAUSMEISTERPRO_ENT_WILLKOMMEN,

  // B2B
  C2: TEMPLATE_IDS.B2B_STEUERBERATER_WILLKOMMEN,
  C3: TEMPLATE_IDS.B2B_MAKLER_WILLKOMMEN,
};

// ----------------------------------------------------------------------------
// Calculator Type to Template Mapping
// ----------------------------------------------------------------------------

export const CALCULATOR_TEMPLATES: Record<string, number> = {
  rendite: TEMPLATE_IDS.RECHNER_RENDITE,
  mieterhoehung: TEMPLATE_IDS.RECHNER_MIETERHOEHUNG,
  nebenkosten: TEMPLATE_IDS.RECHNER_NEBENKOSTEN,
  mietspiegel: TEMPLATE_IDS.RECHNER_RENDITE, // Fallback
  default: TEMPLATE_IDS.RECHNER_RENDITE,
};

// ----------------------------------------------------------------------------
// Lifecycle Templates
// ----------------------------------------------------------------------------

export const LIFECYCLE_TEMPLATES = {
  TRIAL_ENDING: TEMPLATE_IDS.VERMIETIFY_TRIAL_ENDING,
  WINBACK: TEMPLATE_IDS.VERMIETIFY_WINBACK,
  PAYMENT_SUCCESS: TEMPLATE_IDS.SYSTEM_PAYMENT_SUCCESS,
  PAYMENT_FAILED: TEMPLATE_IDS.SYSTEM_PAYMENT_FAILED,
  HAUSMEISTERPRO_TRIAL_ENDING: TEMPLATE_IDS.HAUSMEISTERPRO_PRO_TRIAL_ENDING,
};

// ----------------------------------------------------------------------------
// Transactional Templates
// ----------------------------------------------------------------------------

export const TRANSACTIONAL_TEMPLATES = {
  EMAIL_VERIFICATION: TEMPLATE_IDS.SYSTEM_EMAIL_VERIFICATION,
  PASSWORD_RESET: TEMPLATE_IDS.SYSTEM_PASSWORD_RESET,
  PAYMENT_SUCCESS: TEMPLATE_IDS.SYSTEM_PAYMENT_SUCCESS,
  PAYMENT_FAILED: TEMPLATE_IDS.SYSTEM_PAYMENT_FAILED,
};

// ----------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------

/**
 * Get onboarding template ID for a persona
 */
export function getOnboardingTemplateId(persona: PersonaCode): number | undefined {
  return ONBOARDING_TEMPLATES[persona];
}

/**
 * Get calculator result template ID
 */
export function getCalculatorTemplateId(calculatorType: string): number {
  return CALCULATOR_TEMPLATES[calculatorType] || CALCULATOR_TEMPLATES.default;
}

/**
 * Get follow-up template ID for calculator leads
 */
export function getCalculatorFollowUpTemplateId(): number {
  return TEMPLATE_IDS.RECHNER_FOLLOWUP_TAG3;
}
