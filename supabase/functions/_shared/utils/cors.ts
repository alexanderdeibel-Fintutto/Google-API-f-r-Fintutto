// ============================================================================
// CORS UTILITIES - FinTuttO
// ============================================================================

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-auth',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

/**
 * Handle CORS preflight request
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

/**
 * Create JSON response with CORS headers
 */
export function jsonResponse<T>(
  data: T,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create error response with CORS headers
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code?: string
): Response {
  return jsonResponse(
    {
      success: false,
      error: {
        code: code || `HTTP_${status}`,
        message,
      },
    },
    status
  );
}
