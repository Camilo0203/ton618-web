// Supabase Edge Function: Tebex Webhook
// Asigna roles en Discord automáticamente al recibir un pago exitoso

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TEBEX_SECRET_KEY = Deno.env.get("TEBEX_SECRET_KEY") || "";
const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN") || "";
const GUILD_ID = Deno.env.get("TEBEX_GUILD_ID") || "";

const ROLE_MAP = (() => {
  const raw = Deno.env.get("TEBEX_ROLE_MAP") || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    // fallback: formato "pkg1:role1,pkg2:role2"
    const map: Record<string, string> = {};
    raw.split(",").forEach((pair) => {
      const [pkg, role] = pair.trim().split(":");
      if (pkg && role) map[pkg.trim()] = role.trim();
    });
    return map;
  }
})();

async function verifySignature(body: string, signature: string): Promise<boolean> {
  if (!TEBEX_SECRET_KEY || !signature) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(TEBEX_SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expected = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === signature.toLowerCase();
}

async function assignDiscordRole(userId: string, roleId: string) {
  const url = `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
      "X-Audit-Log-Reason": "Tebex purchase",
    },
  });
  return { ok: res.ok, status: res.status, roleId };
}

serve(async (req) => {
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok", webhook: "tebex" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-tebex-signature") || "";

  if (!await verifySignature(rawBody, signature)) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const eventType = payload.type || payload.event || "unknown";

  if (eventType !== "payment.completed" && eventType !== "payment.success") {
    return new Response(
      JSON.stringify({ received: true, processed: false, reason: "Event ignored" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const tebexPayload = payload.payload || payload;
  const player = tebexPayload.player || tebexPayload.customer || tebexPayload.subject || {};
  const discordId = player.uuid || player.id || player.discord_id;

  if (!discordId) {
    return new Response(JSON.stringify({ error: "No Discord ID in payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const packages = tebexPayload.packages || tebexPayload.items || tebexPayload.products || [];
  const results = [];

  for (const pkg of packages) {
    const packageId = String(pkg.id || pkg.package_id || "");
    const roleId = ROLE_MAP[packageId];

    if (!roleId) {
      results.push({ packageId, skipped: true, reason: "No role mapping" });
      continue;
    }

    const result = await assignDiscordRole(discordId, roleId);
    results.push({ packageId, roleId, discordId, ...result });
  }

  // Siempre devolvemos 200 a Tebex para evitar reintentos
  return new Response(
    JSON.stringify({ received: true, processed: true, discordId, results }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
