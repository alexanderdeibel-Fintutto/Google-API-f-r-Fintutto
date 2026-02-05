// ============================================================================
// BREVO API TYPES - FinTuttO Integration
// ============================================================================

// ----------------------------------------------------------------------------
// Persona Types
// ----------------------------------------------------------------------------

export type PersonaCode =
  // Vermietify - Vermieter Personas
  | 'P01' // Starter Stefan - 1 Objekt, Neuling
  | 'P02' // Hobby-Heike - 2-5 Objekte, Nebentätigkeit
  | 'P03' // Profi-Paul - 6-30 Objekte, Portfolio
  | 'P04' // Senior-Siegfried - 65+, Komfort
  | 'P05' // Investor-Ingo - Kaufinteressent via Rechner
  // MieterApp - Mieter Personas
  | 'P09' // Mieter (eingeladen)
  | 'P10' // Mieter (selbst registriert)
  // HausmeisterPro - Tiers
  | 'C1'     // Hausmeister (general)
  | 'C1-GO'  // Angestellter Hausmeister
  | 'C1-PRO' // Selbständiger Hausmeister
  | 'C1-ENT' // Facility Management Firma
  // B2B Partners
  | 'C2'  // StB-Sabine - Steuerberater
  | 'C3'  // Makler-Marco - Immobilienmakler
  // Special Personas
  | 'D1'; // Erbin-Emma - Frisch geerbt

export type ProductTier = 'go' | 'pro' | 'enterprise';

export interface Persona {
  code: PersonaCode;
  name: string;
  description: string;
  product: 'vermietify' | 'mieterapp' | 'hausmeisterpro' | 'rechner' | 'stb_portal' | 'makler_portal';
  onboardingEvent: string;
  tier?: ProductTier;
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
  // Vermietify Onboarding (by persona)
  | 'onboarding_erstvermieter'      // P01
  | 'onboarding_privatvermieter'    // P02
  | 'onboarding_portfolio'          // P03
  | 'onboarding_senior'             // P04
  | 'onboarding_investor'           // P05
  | 'onboarding_erbin'              // D1
  // MieterApp Onboarding
  | 'onboarding_mieter_eingeladen'  // P09
  | 'onboarding_mieter_selbst'      // P10
  // HausmeisterPro Onboarding (by tier)
  | 'onboarding_hausmeister'        // C1 (general)
  | 'onboarding_hausmeister_go'     // C1-GO (angestellt)
  | 'onboarding_hausmeister_pro'    // C1-PRO (selbständig)
  | 'onboarding_hausmeister_ent'    // C1-ENT (Firma)
  // B2B Onboarding
  | 'onboarding_steuerberater'      // C2
  | 'onboarding_makler'             // C3
  // Lifecycle Events
  | 'email_verified'
  | 'trial_ending'
  | 'trial_ended'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'subscription_upgraded'
  | 'user_inactive_14days'
  | 'user_inactive_30days'
  // Limit Events
  | 'limit_objects_reached'
  | 'limit_ki_reached'
  // Calculator/Lead Events
  | 'calculator_rendite_used'
  | 'calculator_nebenkosten_used'
  | 'calculator_mietspiegel_used'
  | 'calculator_mieterhoehung_used';

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
