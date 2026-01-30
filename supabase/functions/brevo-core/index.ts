// ============================================================================
// BREVO-CORE EDGE FUNCTION - FinTuttO
// ============================================================================
// Base URL: https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/brevo-core
//
// Actions:
//   - create_contact: Create a new contact
//   - update_contact: Update existing contact
//   - get_contact: Get contact by email
//   - delete_contact: Delete contact
//   - send_email: Send transactional email
//   - trigger_event: Track event for automation
//   - add_to_list: Add contact to list
//   - remove_from_list: Remove contact from list
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getBrevoClient } from '../_shared/utils/brevo-client.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/utils/cors.ts';
import {
  isValidEmail,
  isValidAction,
  validateRequiredFields,
} from '../_shared/utils/validation.ts';
import type {
  BrevoAction,
  BrevoContact,
  ContactAttributes,
  SendEmailRequest,
  TrackEventRequest,
} from '../_shared/types/brevo.ts';

// ----------------------------------------------------------------------------
// Request Types
// ----------------------------------------------------------------------------

interface ActionRequest {
  action: BrevoAction;
  data: Record<string, unknown>;
}

// ----------------------------------------------------------------------------
// Action Handlers
// ----------------------------------------------------------------------------

async function handleCreateContact(data: Record<string, unknown>) {
  const { email, attributes, listIds } = data as {
    email: string;
    attributes?: ContactAttributes;
    listIds?: number[];
  };

  if (!email || !isValidEmail(email)) {
    return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
  }

  const client = getBrevoClient();
  const contact: BrevoContact = {
    email,
    attributes,
    listIds,
    updateEnabled: true,
  };

  const result = await client.createContact(contact);

  if (!result.success) {
    return errorResponse(result.error?.message || 'Failed to create contact', 400);
  }

  return jsonResponse({ success: true, data: result.data });
}

async function handleUpdateContact(data: Record<string, unknown>) {
  const { email, attributes } = data as {
    email: string;
    attributes: ContactAttributes;
  };

  if (!email || !isValidEmail(email)) {
    return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
  }

  if (!attributes || Object.keys(attributes).length === 0) {
    return errorResponse('Attributes are required', 400, 'MISSING_ATTRIBUTES');
  }

  const client = getBrevoClient();
  const result = await client.updateContact(email, attributes);

  if (!result.success) {
    return errorResponse(result.error?.message || 'Failed to update contact', 400);
  }

  return jsonResponse({ success: true });
}

async function handleGetContact(data: Record<string, unknown>) {
  const { email } = data as { email: string };

  if (!email || !isValidEmail(email)) {
    return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
  }

  const client = getBrevoClient();
  const result = await client.getContact(email);

  if (!result.success) {
    if (result.error?.code === 'HTTP_404') {
      return errorResponse('Contact not found', 404, 'CONTACT_NOT_FOUND');
    }
    return errorResponse(result.error?.message || 'Failed to get contact', 400);
  }

  return jsonResponse({ success: true, data: result.data });
}

async function handleDeleteContact(data: Record<string, unknown>) {
  const { email } = data as { email: string };

  if (!email || !isValidEmail(email)) {
    return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
  }

  const client = getBrevoClient();
  const result = await client.deleteContact(email);

  if (!result.success) {
    return errorResponse(result.error?.message || 'Failed to delete contact', 400);
  }

  return jsonResponse({ success: true });
}

async function handleSendEmail(data: Record<string, unknown>) {
  const emailRequest = data as SendEmailRequest;

  const validation = validateRequiredFields(emailRequest, ['to']);
  if (!validation.valid) {
    return errorResponse(`Missing required fields: ${validation.missing.join(', ')}`, 400);
  }

  if (!emailRequest.templateId && !emailRequest.htmlContent && !emailRequest.subject) {
    return errorResponse(
      'Either templateId or (subject + htmlContent) is required',
      400,
      'MISSING_EMAIL_CONTENT'
    );
  }

  // Validate recipients
  for (const recipient of emailRequest.to) {
    if (!isValidEmail(recipient.email)) {
      return errorResponse(`Invalid recipient email: ${recipient.email}`, 400, 'INVALID_EMAIL');
    }
  }

  const client = getBrevoClient();
  const result = await client.sendEmail(emailRequest);

  if (!result.success) {
    return errorResponse(result.error?.message || 'Failed to send email', 400);
  }

  return jsonResponse({ success: true, data: result.data });
}

async function handleTriggerEvent(data: Record<string, unknown>) {
  const eventRequest = data as TrackEventRequest;

  if (!eventRequest.email || !isValidEmail(eventRequest.email)) {
    return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
  }

  if (!eventRequest.event) {
    return errorResponse('Event name is required', 400, 'MISSING_EVENT');
  }

  const client = getBrevoClient();
  const result = await client.trackEvent(eventRequest);

  if (!result.success) {
    return errorResponse(result.error?.message || 'Failed to trigger event', 400);
  }

  return jsonResponse({ success: true });
}

async function handleAddToList(data: Record<string, unknown>) {
  const { email, listId } = data as { email: string; listId: number };

  if (!email || !isValidEmail(email)) {
    return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
  }

  if (!listId || typeof listId !== 'number') {
    return errorResponse('Valid listId is required', 400, 'INVALID_LIST_ID');
  }

  const client = getBrevoClient();
  const result = await client.addToList(email, listId);

  if (!result.success) {
    return errorResponse(result.error?.message || 'Failed to add to list', 400);
  }

  return jsonResponse({ success: true });
}

async function handleRemoveFromList(data: Record<string, unknown>) {
  const { email, listId } = data as { email: string; listId: number };

  if (!email || !isValidEmail(email)) {
    return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
  }

  if (!listId || typeof listId !== 'number') {
    return errorResponse('Valid listId is required', 400, 'INVALID_LIST_ID');
  }

  const client = getBrevoClient();
  const result = await client.removeFromList(email, listId);

  if (!result.success) {
    return errorResponse(result.error?.message || 'Failed to remove from list', 400);
  }

  return jsonResponse({ success: true });
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
    const body = await req.json() as ActionRequest;

    // Validate action
    if (!body.action || !isValidAction(body.action)) {
      return errorResponse(
        'Invalid or missing action. Valid actions: create_contact, update_contact, get_contact, delete_contact, send_email, trigger_event, add_to_list, remove_from_list',
        400,
        'INVALID_ACTION'
      );
    }

    if (!body.data) {
      return errorResponse('Data object is required', 400, 'MISSING_DATA');
    }

    // Route to appropriate handler
    switch (body.action) {
      case 'create_contact':
        return await handleCreateContact(body.data);
      case 'update_contact':
        return await handleUpdateContact(body.data);
      case 'get_contact':
        return await handleGetContact(body.data);
      case 'delete_contact':
        return await handleDeleteContact(body.data);
      case 'send_email':
        return await handleSendEmail(body.data);
      case 'trigger_event':
        return await handleTriggerEvent(body.data);
      case 'add_to_list':
        return await handleAddToList(body.data);
      case 'remove_from_list':
        return await handleRemoveFromList(body.data);
      default:
        return errorResponse('Action not implemented', 501);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
});
