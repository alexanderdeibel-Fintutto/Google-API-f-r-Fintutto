// ============================================================================
// VALIDATION UTILITIES - FinTuttO
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field as string);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate persona code
 */
export function isValidPersonaCode(code: string): boolean {
  const validCodes = ['P01', 'P02', 'P03', 'P04', 'P05', 'P09', 'P10', 'C1', 'C2', 'C3', 'D1'];
  return validCodes.includes(code);
}

/**
 * Validate action type
 */
export function isValidAction(action: string): boolean {
  const validActions = [
    'create_contact',
    'update_contact',
    'get_contact',
    'delete_contact',
    'send_email',
    'trigger_event',
    'add_to_list',
    'remove_from_list',
  ];
  return validActions.includes(action);
}

/**
 * Validate event type
 */
export function isValidEventType(event: string): boolean {
  const validEvents = [
    'user.registered',
    'user.verified',
    'user.inactive',
    'subscription.created',
    'subscription.cancelled',
    'subscription.upgraded',
    'subscription.downgraded',
    'payment.success',
    'payment.failed',
    'object.created',
    'object.deleted',
    'tenant.created',
    'tenant.invited',
    'tenant.accepted',
    'calculator.used',
    'referral.success',
    'trial.ending',
    'trial.ended',
    'limit.reached',
    'limit.objects.reached',
    'limit.ki.reached',
  ];
  return validEvents.includes(event);
}
