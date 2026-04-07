// DEPRECATED — imports from non-existent _shared/billing.ts and queries legacy guild_premium table.
// Canonical replacement: billing-create-checkout/index.ts
// ACTION REQUIRED: remove this function from the Supabase Functions dashboard.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const _CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

Deno.serve((_req: Request) => {
  console.error('[lemon-create-checkout] DEPRECATED. Deploy billing-create-checkout instead.');
  return new Response(
    JSON.stringify({ error: 'Deprecated. Use billing-create-checkout endpoint.' }),
    { status: 410, headers: _CORS }
  );
});

