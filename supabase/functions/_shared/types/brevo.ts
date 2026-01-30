// ============================================================================
// BREVO API TYPES - FinTuttO Integration
// ============================================================================

// ----------------------------------------------------------------------------
// Persona Types
// ----------------------------------------------------------------------------

export type PersonaCode =
  | 'P01' // Starter Stefan
  | 'P02' // Hobby-Heike
  | 'P03' // Profi-Paul
  | 'P04' // Senior-Siegfried
  | 'P05' // Investor-Ingo
  | 'P09' // Mieter (eingeladen)
  | 'P10' // Mieter (selbst)
  | 'C1'  // Hausmeister-Hans
  | 'C2'  // StB-Sabine
  | 'C3'  // Makler-Marco
  | 'D1'; // Erbin-Emma

export interface Persona {
  code: PersonaCode;
  name: string;
  description: string;
  product: 'vermietify' | 'mieterapp' | 'hausmeisterpro' | 'rechner' | 'stb_portal' | 'makler_portal';
  onboardingEvent: string;
}

// ----------------------------------------------------------------------------
// Sender Types
// ----------------------------------------------------------------------------

export type SenderEmail =
  | 'info@fintutto.de'
  | 'info@vermietify.de'
  | 'info@mieterapp.de'
  | 'info@hausmeisterpro.de';

export interface Sender {
  email: SenderEmail;
  name: string;
  product: string;
  isDefault?: boolean;
}

// ----------------------------------------------------------------------------
// Discount Code Types
// ----------------------------------------------------------------------------

export type DiscountCode =
  | 'WILLKOMMEN50'
  | 'ERSTVERMIETER50'
  | 'RECHNER50'
  | 'UPGRADE50'
  | 'TRIAL25'
  | 'COMEBACK2'
  | 'COMEBACK3FOR1';

export interface DiscountCodeConfig {
  code: DiscountCode;
  discount: string;
  description: string;
  useCase: string;
}

// ----------------------------------------------------------------------------
// Contact Types
// ----------------------------------------------------------------------------

export interface BrevoContact {
  email: string;
  attributes?: ContactAttributes;
  listIds?: number[];
  updateEnabled?: boolean;
  smtpBlacklistSender?: string[];
}

export interface ContactAttributes {
  FIRSTNAME?: string;
  LASTNAME?: string;
  PERSONA?: PersonaCode;
  PRODUCT?: string;
  SUBSCRIPTION_STATUS?: 'trial' | 'active' | 'cancelled' | 'expired';
  SUBSCRIPTION_PLAN?: string;
  OBJECTS_COUNT?: number;
  TENANTS_COUNT?: number;
  REGISTRATION_DATE?: string;
  LAST_LOGIN?: string;
  LANGUAGE?: 'de' | 'en';
  PHONE?: string;
  COMPANY?: string;
  [key: string]: string | number | boolean | undefined;
}

// ----------------------------------------------------------------------------
// Email Types
// ----------------------------------------------------------------------------

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailRequest {
  to: EmailRecipient[];
  templateId?: number;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  sender?: {
    email: SenderEmail;
    name: string;
  };
  replyTo?: EmailRecipient;
  params?: Record<string, string | number | boolean>;
  tags?: string[];
  headers?: Record<string, string>;
  attachment?: EmailAttachment[];
}

export interface EmailAttachment {
  url?: string;
  content?: string;
  name: string;
}

export interface SendEmailResponse {
  messageId: string;
}

// ----------------------------------------------------------------------------
// Event Types
// ----------------------------------------------------------------------------

export type EventType =
  // User Events
  | 'user.registered'
  | 'user.verified'
  | 'user.inactive'
  // Subscription Events
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'subscription.upgraded'
  | 'subscription.downgraded'
  // Payment Events
  | 'payment.success'
  | 'payment.failed'
  // Object/Property Events
  | 'object.created'
  | 'object.deleted'
  // Tenant Events
  | 'tenant.created'
  | 'tenant.invited'
  | 'tenant.accepted'
  // Feature Events
  | 'calculator.used'
  | 'referral.success'
  // Lifecycle Events
  | 'trial.ending'
  | 'trial.ended'
  | 'limit.reached'
  | 'limit.objects.reached'
  | 'limit.ki.reached';

export interface TrackEventRequest {
  email: string;
  event: EventType;
  eventdata?: Record<string, string | number | boolean>;
  properties?: Record<string, string | number | boolean>;
}

// ----------------------------------------------------------------------------
// Automation Event Types (für Brevo Trigger)
// ----------------------------------------------------------------------------

export type AutomationEvent =
  | 'onboarding_erstvermieter'
  | 'onboarding_privatvermieter'
  | 'onboarding_portfolio'
  | 'onboarding_senior'
  | 'onboarding_investor'
  | 'onboarding_mieter_eingeladen'
  | 'onboarding_mieter_selbst'
  | 'onboarding_hausmeister'
  | 'onboarding_steuerberater'
  | 'onboarding_makler'
  | 'onboarding_erbin'
  | 'email_verified'
  | 'trial_ending'
  | 'subscription_cancelled'
  | 'user_inactive_14days'
  | 'limit_objects_reached'
  | 'limit_ki_reached'
  | 'calculator_rendite_used'
  | 'calculator_nebenkosten_used'
  | 'calculator_mietspiegel_used';

// ----------------------------------------------------------------------------
// API Action Types
// ----------------------------------------------------------------------------

export type BrevoAction =
  | 'create_contact'
  | 'update_contact'
  | 'get_contact'
  | 'delete_contact'
  | 'send_email'
  | 'trigger_event'
  | 'add_to_list'
  | 'remove_from_list';

export interface BrevoActionRequest {
  action: BrevoAction;
  data: Record<string, unknown>;
}

// ----------------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------------

export interface BrevoApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ----------------------------------------------------------------------------
// List Types
// ----------------------------------------------------------------------------

export interface BrevoList {
  id: number;
  name: string;
  folderId: number;
  totalBlacklisted: number;
  totalSubscribers: number;
}

export interface AddToListRequest {
  email: string;
  listId: number;
}

export interface RemoveFromListRequest {
  email: string;
  listId: number;
}
