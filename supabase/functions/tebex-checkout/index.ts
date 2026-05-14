// Supabase Edge Function: Tebex Checkout Proxy
// Crea un basket de Tebex server-side y retorna el ident para el modal de Tebex.js
// Evita errores de CORS al llamar la Headless API desde el storefront.

const TEBEX_TOKEN   = Deno.env.get("TEBEX_PUBLIC_TOKEN") || "12ws8-71d9005ff427c9afbed0f6b9cd3c31b2b6869f2b";
const TEBEX_API     = "https://headless.tebex.io/api";
const ALLOWED_ORIGIN = "https://store.ton618bot.xyz";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Content-Type": "application/json",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const url   = new URL(req.url);
  const pkgId = parseInt(url.searchParams.get("pkg") ?? "", 10);
  if (!pkgId) return json({ error: "missing pkg" }, 400);

  try {
    const origin = ALLOWED_ORIGIN;

    // 1) Crear basket limpio
    const basketRes = await fetch(`${TEBEX_API}/accounts/${TEBEX_TOKEN}/baskets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ complete_url: origin + "/#premium", cancel_url: origin + "/#premium" }),
    });
    const basketData = await basketRes.json();
    const ident = basketData?.data?.ident;
    if (!ident) {
      return json({ error: "basket_creation_failed", detail: basketData }, 502);
    }

    // 2) Agregar paquete
    const addRes = await fetch(`${TEBEX_API}/baskets/${ident}/packages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ package_id: pkgId, quantity: 1 }),
    });
    if (!addRes.ok) {
      const detail = await addRes.text();
      return json({ error: "package_add_failed", status: addRes.status, detail }, 502);
    }

    return json({ ident });
  } catch (err) {
    return json({ error: "internal", detail: String(err).slice(0, 200) }, 500);
  }
});
