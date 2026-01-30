// ============================================================================
// BREVO API CLIENT - FinTuttO
// ============================================================================

import {
  BrevoContact,
  ContactAttributes,
  SendEmailRequest,
  SendEmailResponse,
  TrackEventRequest,
  BrevoApiResponse,
  EventType,
  AutomationEvent,
} from '../types/brevo.ts';
import { getDefaultSender } from '../config/senders.ts';

const BREVO_API_URL = 'https://api.brevo.com/v3';

interface BrevoClientConfig {
  apiKey: string;
}

export class BrevoClient {
  private apiKey: string;

  constructor(config: BrevoClientConfig) {
    this.apiKey = config.apiKey;
  }

  // --------------------------------------------------------------------------
  // Private Helper Methods
  // --------------------------------------------------------------------------

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<BrevoApiResponse<T>> {
    try {
      const response = await fetch(`${BREVO_API_URL}${endpoint}`, {
        method,
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: errorData.message || response.statusText,
          },
        };
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json();
      return { success: true, data: data as T };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  // --------------------------------------------------------------------------
  // Contact Management
  // --------------------------------------------------------------------------

  /**
   * Create a new contact in Brevo
   */
  async createContact(contact: BrevoContact): Promise<BrevoApiResponse<{ id: number }>> {
    return this.request('/contacts', 'POST', {
      email: contact.email,
      attributes: contact.attributes,
      listIds: contact.listIds,
      updateEnabled: contact.updateEnabled ?? true,
    });
  }

  /**
   * Update an existing contact
   */
  async updateContact(
    email: string,
    attributes: ContactAttributes
  ): Promise<BrevoApiResponse<void>> {
    const encodedEmail = encodeURIComponent(email);
    return this.request(`/contacts/${encodedEmail}`, 'PUT', {
      attributes,
    });
  }

  /**
   * Get contact by email
   */
  async getContact(email: string): Promise<BrevoApiResponse<BrevoContact>> {
    const encodedEmail = encodeURIComponent(email);
    return this.request(`/contacts/${encodedEmail}`, 'GET');
  }

  /**
   * Delete contact by email
   */
  async deleteContact(email: string): Promise<BrevoApiResponse<void>> {
    const encodedEmail = encodeURIComponent(email);
    return this.request(`/contacts/${encodedEmail}`, 'DELETE');
  }

  /**
   * Add contact to a list
   */
  async addToList(email: string, listId: number): Promise<BrevoApiResponse<void>> {
    return this.request(`/contacts/lists/${listId}/contacts/add`, 'POST', {
      emails: [email],
    });
  }

  /**
   * Remove contact from a list
   */
  async removeFromList(email: string, listId: number): Promise<BrevoApiResponse<void>> {
    return this.request(`/contacts/lists/${listId}/contacts/remove`, 'POST', {
      emails: [email],
    });
  }

  // --------------------------------------------------------------------------
  // Email Sending
  // --------------------------------------------------------------------------

  /**
   * Send transactional email
   */
  async sendEmail(request: SendEmailRequest): Promise<BrevoApiResponse<SendEmailResponse>> {
    const defaultSender = getDefaultSender();

    const payload: Record<string, unknown> = {
      to: request.to,
      sender: request.sender || {
        email: defaultSender.email,
        name: defaultSender.name,
      },
    };

    if (request.templateId) {
      payload.templateId = request.templateId;
    } else {
      payload.subject = request.subject;
      payload.htmlContent = request.htmlContent;
      payload.textContent = request.textContent;
    }

    if (request.params) {
      payload.params = request.params;
    }

    if (request.tags) {
      payload.tags = request.tags;
    }

    if (request.replyTo) {
      payload.replyTo = request.replyTo;
    }

    if (request.attachment) {
      payload.attachment = request.attachment;
    }

    if (request.headers) {
      payload.headers = request.headers;
    }

    return this.request('/smtp/email', 'POST', payload);
  }

  /**
   * Send transactional email using template
   */
  async sendTemplateEmail(
    to: { email: string; name?: string }[],
    templateId: number,
    params?: Record<string, string | number | boolean>
  ): Promise<BrevoApiResponse<SendEmailResponse>> {
    return this.sendEmail({
      to,
      templateId,
      params,
    });
  }

  // --------------------------------------------------------------------------
  // Event Tracking
  // --------------------------------------------------------------------------

  /**
   * Track an event for a contact (for automation triggers)
   */
  async trackEvent(request: TrackEventRequest): Promise<BrevoApiResponse<void>> {
    return this.request('/trackEvent', 'POST', {
      email: request.email,
      event: request.event,
      eventdata: request.eventdata,
      properties: request.properties,
    });
  }

  /**
   * Trigger automation event
   */
  async triggerAutomationEvent(
    email: string,
    event: AutomationEvent,
    data?: Record<string, string | number | boolean>
  ): Promise<BrevoApiResponse<void>> {
    return this.trackEvent({
      email,
      event: event as EventType,
      eventdata: data,
    });
  }

  // --------------------------------------------------------------------------
  // List Management
  // --------------------------------------------------------------------------

  /**
   * Get all contact lists
   */
  async getLists(): Promise<BrevoApiResponse<{ lists: Array<{ id: number; name: string }> }>> {
    return this.request('/contacts/lists', 'GET');
  }

  /**
   * Create a new list
   */
  async createList(name: string, folderId: number): Promise<BrevoApiResponse<{ id: number }>> {
    return this.request('/contacts/lists', 'POST', {
      name,
      folderId,
    });
  }
}

// Singleton instance
let brevoClientInstance: BrevoClient | null = null;

/**
 * Get or create Brevo client instance
 */
export function getBrevoClient(): BrevoClient {
  if (!brevoClientInstance) {
    const apiKey = Deno.env.get('BREVO_API_KEY');
    if (!apiKey) {
      throw new Error('BREVO_API_KEY environment variable is not set');
    }
    brevoClientInstance = new BrevoClient({ apiKey });
  }
  return brevoClientInstance;
}

/**
 * Create Brevo client with specific API key
 */
export function createBrevoClient(apiKey: string): BrevoClient {
  return new BrevoClient({ apiKey });
}
