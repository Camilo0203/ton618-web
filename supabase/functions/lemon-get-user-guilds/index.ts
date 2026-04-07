// DEPRECATED — imports non-existent _shared/billing.ts and queries legacy guild_premium table.
// Canonical replacement: billing-get-guilds/index.ts
// ACTION REQUIRED: remove this function from the Supabase Functions dashboard.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const _CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

Deno.serve((_req: Request) => {
  console.error('[lemon-get-user-guilds] DEPRECATED. Use billing-get-guilds instead.');
  return new Response(
    JSON.stringify({ error: 'Deprecated. Use billing-get-guilds endpoint.' }),
    { status: 410, headers: _CORS }
  );
});
