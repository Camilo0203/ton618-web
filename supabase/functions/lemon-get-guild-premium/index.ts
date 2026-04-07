// DEPRECATED: imports _shared/billing.ts (does not exist) and queries legacy guild_premium table.
// Canonical endpoint: billing-guild-status/index.ts
// Remove this function from the Supabase Functions dashboard.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (_req: Request) => {
  console.error('[lemon-get-guild-premium] DEPRECATED. Use billing-guild-status instead.');
  return new Response(
    JSON.stringify({ error: 'Deprecated. Use billing-guild-status endpoint.' }),
    { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );

});
