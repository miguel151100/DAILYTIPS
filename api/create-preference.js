const { API_PUBLIC_URL, SITE_URL, getProduct } = require("./_products");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    res.status(500).json({ error: "Falta configurar MP_ACCESS_TOKEN" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const product = getProduct(body.pack);
  const buyerEmail = String(body.email || "").trim();
  const buyerName = String(body.name || "").trim();
  const publicApiUrl = API_PUBLIC_URL || `https://${req.headers.host}`;

  const preference = {
    items: [
      {
        id: product.id,
        title: product.title,
        description: product.description,
        quantity: 1,
        currency_id: product.currency_id,
        unit_price: product.unit_price
      }
    ],
    payer: buyerEmail ? { email: buyerEmail, name: buyerName || undefined } : undefined,
    back_urls: {
      success: `${SITE_URL}/pago-exitoso.html?pack=${product.id}`,
      pending: `${SITE_URL}/pago-pendiente.html?pack=${product.id}`,
      failure: `${SITE_URL}/pago-rechazado.html?pack=${product.id}`
    },
    auto_return: "approved",
    notification_url: process.env.MP_WEBHOOK_URL || `${publicApiUrl}/api/mercadopago-webhook`,
    external_reference: `${product.id}-${Date.now()}`,
    metadata: {
      pack_id: product.id,
      buyer_email: buyerEmail,
      buyer_name: buyerName
    }
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(preference)
  });

  const data = await response.json();
  if (!response.ok) {
    res.status(response.status).json({ error: "Mercado Pago no pudo crear la preferencia", details: data });
    return;
  }

  res.status(200).json({
    id: data.id,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point
  });
};
