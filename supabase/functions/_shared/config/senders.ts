// ============================================================================
// SENDER CONFIGURATION - FinTuttO
// ============================================================================

import { Sender, SenderEmail } from '../types/brevo.ts';

export const SENDERS: Record<SenderEmail, Sender> = {
  'info@fintutto.de': {
    email: 'info@fintutto.de',
    name: 'FinTuttO',
    product: 'fintutto',
    isDefault: true,
  },
  'info@vermietify.de': {
    email: 'info@vermietify.de',
    name: 'Vermietify',
    product: 'vermietify',
  },
  'info@mieterapp.de': {
    email: 'info@mieterapp.de',
    name: 'MieterApp',
    product: 'mieterapp',
  },
  'info@hausmeisterpro.de': {
    email: 'info@hausmeisterpro.de',
    name: 'HausmeisterPro',
    product: 'hausmeisterpro',
  },
};

/**
 * Get sender by email
 */
export function getSender(email: SenderEmail): Sender {
  return SENDERS[email];
}

/**
 * Get default sender
 */
export function getDefaultSender(): Sender {
  return SENDERS['info@fintutto.de'];
}

/**
 * Get sender for a specific product
 */
export function getSenderByProduct(product: string): Sender {
  const sender = Object.values(SENDERS).find((s) => s.product === product);
  return sender || getDefaultSender();
}

/**
 * Get all senders
 */
export function getAllSenders(): Sender[] {
  return Object.values(SENDERS);
}
