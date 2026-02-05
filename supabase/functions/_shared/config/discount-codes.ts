// ============================================================================
// DISCOUNT CODES CONFIGURATION - FinTuttO
// ============================================================================

import { DiscountCode, DiscountCodeConfig } from '../types/brevo.ts';

export const DISCOUNT_CODES: Record<DiscountCode, DiscountCodeConfig> = {
  WILLKOMMEN50: {
    code: 'WILLKOMMEN50',
    discount: '50% auf den ersten Monat',
    description: '50% Rabatt auf den ersten Monat',
    useCase: 'Onboarding Upgrade - Neukunden zum Upgrade motivieren',
  },
  ERSTVERMIETER50: {
    code: 'ERSTVERMIETER50',
    discount: '50% auf den ersten Monat',
    description: '50% Rabatt für Erstvermieter',
    useCase: 'Investor → Vermietify Conversion',
  },
  RECHNER50: {
    code: 'RECHNER50',
    discount: '50% auf den ersten Monat',
    description: '50% Rabatt für Rechner-Nutzer',
    useCase: 'Lead-Magnet Conversion (Rechner → Produkt)',
  },
  UPGRADE50: {
    code: 'UPGRADE50',
    discount: '50% auf den ersten Monat',
    description: '50% Rabatt beim Upgrade',
    useCase: 'Limit erreicht - Upgrade-Anreiz',
  },
  TRIAL25: {
    code: 'TRIAL25',
    discount: '25% auf Jahresabo',
    description: '25% Rabatt auf das Jahresabo',
    useCase: 'Trial Ende - Zum Jahresabo konvertieren',
  },
  COMEBACK2: {
    code: 'COMEBACK2',
    discount: '2 Monate gratis',
    description: '2 Monate kostenlos',
    useCase: 'Win-Back nach 30 Tagen Inaktivität',
  },
  COMEBACK3FOR1: {
    code: 'COMEBACK3FOR1',
    discount: '3 Monate zum Preis von 1',
    description: '3 für 1 Angebot',
    useCase: 'Win-Back nach 90 Tagen Inaktivität',
  },
};

/**
 * Get discount code configuration
 */
export function getDiscountCode(code: DiscountCode): DiscountCodeConfig {
  return DISCOUNT_CODES[code];
}

/**
 * Get all discount codes
 */
export function getAllDiscountCodes(): DiscountCodeConfig[] {
  return Object.values(DISCOUNT_CODES);
}

/**
 * Get discount code for specific use case
 */
export function getDiscountCodeForUseCase(useCase: string): DiscountCodeConfig | undefined {
  return Object.values(DISCOUNT_CODES).find((dc) =>
    dc.useCase.toLowerCase().includes(useCase.toLowerCase())
  );
}

/**
 * Validate discount code
 */
export function isValidDiscountCode(code: string): code is DiscountCode {
  return code in DISCOUNT_CODES;
}
