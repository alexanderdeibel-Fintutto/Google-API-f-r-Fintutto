// ============================================================================
// PERSONAS CONFIGURATION - FinTuttO
// ============================================================================

import { Persona, PersonaCode, ProductTier } from '../types/brevo.ts';

export const PERSONAS: Record<PersonaCode, Persona> = {
  // Vermietify - Vermieter Personas
  P01: {
    code: 'P01',
    name: 'Starter Stefan',
    description: '1 Objekt, Neuling im Vermietungsgeschäft',
    product: 'vermietify',
    onboardingEvent: 'onboarding_erstvermieter',
  },
  P02: {
    code: 'P02',
    name: 'Hobby-Heike',
    description: '2-5 Objekte, Vermietung als Nebentätigkeit',
    product: 'vermietify',
    onboardingEvent: 'onboarding_privatvermieter',
  },
  P03: {
    code: 'P03',
    name: 'Profi-Paul',
    description: '6-30 Objekte, professionelles Portfolio',
    product: 'vermietify',
    onboardingEvent: 'onboarding_portfolio',
  },
  P04: {
    code: 'P04',
    name: 'Senior-Siegfried',
    description: '65+, Fokus auf Komfort und Einfachheit',
    product: 'vermietify',
    onboardingEvent: 'onboarding_senior',
  },
  P05: {
    code: 'P05',
    name: 'Investor-Ingo',
    description: 'Kaufinteressent, nutzt Rechner',
    product: 'rechner',
    onboardingEvent: 'onboarding_investor',
  },

  // MieterApp - Mieter Personas
  P09: {
    code: 'P09',
    name: 'Mieter (eingeladen)',
    description: 'Vom Vermieter eingeladen',
    product: 'mieterapp',
    onboardingEvent: 'onboarding_mieter_eingeladen',
  },
  P10: {
    code: 'P10',
    name: 'Mieter (selbst)',
    description: 'Selbst registriert',
    product: 'mieterapp',
    onboardingEvent: 'onboarding_mieter_selbst',
  },

  // HausmeisterPro - Tiers
  C1: {
    code: 'C1',
    name: 'Hausmeister (allgemein)',
    description: 'Hausmeister ohne Tier-Zuordnung',
    product: 'hausmeisterpro',
    onboardingEvent: 'onboarding_hausmeister',
  },
  'C1-GO': {
    code: 'C1-GO',
    name: 'Hausmeister GO',
    description: 'Angestellter Hausmeister',
    product: 'hausmeisterpro',
    onboardingEvent: 'onboarding_hausmeister_go',
    tier: 'go',
  },
  'C1-PRO': {
    code: 'C1-PRO',
    name: 'Hausmeister PRO',
    description: 'Selbständiger Hausmeister',
    product: 'hausmeisterpro',
    onboardingEvent: 'onboarding_hausmeister_pro',
    tier: 'pro',
  },
  'C1-ENT': {
    code: 'C1-ENT',
    name: 'Hausmeister Enterprise',
    description: 'Facility Management Firma',
    product: 'hausmeisterpro',
    onboardingEvent: 'onboarding_hausmeister_ent',
    tier: 'enterprise',
  },

  // B2B Partners
  C2: {
    code: 'C2',
    name: 'StB-Sabine',
    description: 'Steuerberater',
    product: 'stb_portal',
    onboardingEvent: 'onboarding_steuerberater',
  },
  C3: {
    code: 'C3',
    name: 'Makler-Marco',
    description: 'Immobilienmakler',
    product: 'makler_portal',
    onboardingEvent: 'onboarding_makler',
  },

  // Special Personas
  D1: {
    code: 'D1',
    name: 'Erbin-Emma',
    description: 'Hat frisch geerbt, braucht Unterstützung',
    product: 'vermietify',
    onboardingEvent: 'onboarding_erbin',
  },
};

/**
 * Get persona by code
 */
export function getPersona(code: PersonaCode): Persona | undefined {
  return PERSONAS[code];
}

/**
 * Get all personas for a specific product
 */
export function getPersonasByProduct(product: string): Persona[] {
  return Object.values(PERSONAS).filter((p) => p.product === product);
}

/**
 * Get onboarding event for a persona
 */
export function getOnboardingEvent(code: PersonaCode): string | undefined {
  return PERSONAS[code]?.onboardingEvent;
}

/**
 * Determine persona based on user attributes
 */
export function determinePersona(attributes: {
  objectsCount?: number;
  age?: number;
  isInvited?: boolean;
  isTenant?: boolean;
  userType?: string;
  source?: string;
  employmentType?: 'employed' | 'self-employed' | 'company';
}): PersonaCode {
  const { objectsCount = 0, age, isInvited, isTenant, userType, source, employmentType } = attributes;

  // HausmeisterPro - with tier differentiation
  if (userType === 'hausmeister') {
    if (employmentType === 'employed') return 'C1-GO';
    if (employmentType === 'self-employed') return 'C1-PRO';
    if (employmentType === 'company') return 'C1-ENT';
    return 'C1'; // Default without tier
  }

  // B2B Partners
  if (userType === 'steuerberater') return 'C2';
  if (userType === 'makler') return 'C3';

  // Mieter
  if (isTenant) {
    return isInvited ? 'P09' : 'P10';
  }

  // Investor (came from calculator)
  if (source === 'rechner' || source === 'calculator') {
    return 'P05';
  }

  // Erbin (special case)
  if (source === 'erbschaft' || userType === 'erbe') {
    return 'D1';
  }

  // Age-based (Senior)
  if (age && age >= 65) {
    return 'P04';
  }

  // Object-based classification
  if (objectsCount === 0 || objectsCount === 1) {
    return 'P01'; // Starter Stefan
  } else if (objectsCount >= 2 && objectsCount <= 5) {
    return 'P02'; // Hobby-Heike
  } else if (objectsCount >= 6) {
    return 'P03'; // Profi-Paul
  }

  // Default
  return 'P01';
}

/**
 * Determine HausmeisterPro tier based on attributes
 */
export function determineHausmeisterTier(attributes: {
  employmentType?: 'employed' | 'self-employed' | 'company';
  employeeCount?: number;
  objectsCount?: number;
}): PersonaCode {
  const { employmentType, employeeCount = 0, objectsCount = 0 } = attributes;

  // Explicit employment type
  if (employmentType === 'employed') return 'C1-GO';
  if (employmentType === 'self-employed') return 'C1-PRO';
  if (employmentType === 'company') return 'C1-ENT';

  // Infer from employee count
  if (employeeCount > 0) return 'C1-ENT';

  // Infer from objects count
  if (objectsCount > 20) return 'C1-ENT';
  if (objectsCount > 5) return 'C1-PRO';

  // Default to GO (basic tier)
  return 'C1-GO';
}

/**
 * Get all personas for a specific tier
 */
export function getPersonasByTier(tier: ProductTier): Persona[] {
  return Object.values(PERSONAS).filter((p) => p.tier === tier);
}

/**
 * Get tier from persona code
 */
export function getTierFromPersona(code: PersonaCode): ProductTier | undefined {
  return PERSONAS[code]?.tier;
}
