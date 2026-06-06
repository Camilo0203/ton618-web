// Supabase Edge Function: Tebex Checkout Proxy
// Crea un basket de Tebex server-side y retorna el ident para el modal de Tebex.js
// Evita errores de CORS al llamar la Headless API desde el storefront.

const TEBEX_TOKEN    = Deno.env.get("TEBEX_PUBLIC_TOKEN") || "";
const TEBEX_API      = "https://headless.tebex.io/api";
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
  if (!TEBEX_TOKEN) return json({ error: "checkout_unavailable" }, 503);

  try {
    const origin = ALLOWED_ORIGIN;

    // 0) Verificar que el paquete existe en el headless store
    const pkgVerifyRes = await fetch(`${TEBEX_API}/accounts/${TEBEX_TOKEN}/packages/${pkgId}`, {
      headers: { Accept: "application/json" },
    });
    const pkgVerifyData = await pkgVerifyRes.json();
    if (!pkgVerifyRes.ok) {
      return json({ error: "package_not_in_headless_store", httpStatus: pkgVerifyRes.status, requestedId: pkgId, detail: pkgVerifyData }, 400);
    }
    const confirmedPkgId = pkgVerifyData?.data?.id ?? pkgId;

    // 1) Crear basket limpio
    const basketRes = await fetch(`${TEBEX_API}/accounts/${TEBEX_TOKEN}/baskets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ complete_url: origin + "/", cancel_url: origin + "/" }),
    });
    const basketData = await basketRes.json();
    const ident    = basketData?.data?.ident;
    const checkout = basketData?.data?.links?.checkout ?? null;
    if (!ident) {
      return json({ error: "basket_creation_failed", httpStatus: basketRes.status, detail: basketData }, 502);
    }

    // 2) Agregar paquete
    const addRes = await fetch(`${TEBEX_API}/baskets/${ident}/packages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ package_id: confirmedPkgId, quantity: 1 }),
    });
    if (!addRes.ok) {
      const detail = await addRes.text();
      return json({ error: "package_add_failed", httpStatus: addRes.status, ident, checkout, detail }, 502);
    }

    return json({ ident, checkout });
  } catch (err) {
    return json({ error: "internal", detail: String(err).slice(0, 200) }, 500);
  }
});
