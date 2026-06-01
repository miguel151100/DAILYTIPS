const { API_PUBLIC_URL, SITE_URL, getProduct } = require("./_products");
const { getCourse } = require("./_courses");
const { createOrder, generateOrderRef } = require("./_orders");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Método no permitido" }); return; }

  if (!process.env.MP_ACCESS_TOKEN) {
    res.status(500).json({ error: "Falta configurar MP_ACCESS_TOKEN" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const packParam    = String(body.pack || "standard").trim();
  const categoryId   = String(body.category || "").trim();
  const email        = String(body.email || "").trim();
  const name         = String(body.name || "").trim();
  const publicApiUrl = API_PUBLIC_URL || `https://${req.headers.host}`;

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Correo electrónico requerido" });
    return;
  }

  let product;
  let courseFilename = "";

  if (packParam === "curso") {
    courseFilename = String(body.filename || "").trim();
    const course = getCourse(courseFilename);
    if (!course) { res.status(400).json({ error: "Curso no encontrado" }); return; }
    product = { id: "curso", ...course };
  } else {
    product = getProduct(packParam, categoryId);
  }

  const orderRef = generateOrderRef(product.id);

  const preference = {
    items: [{
      id: product.id,
      title: product.title,
      description: product.description,
      quantity: 1,
      currency_id: product.currency_id || "MXN",
      unit_price: product.unit_price
    }],
    payer: { email, name: name || undefined },
    back_urls: {
      success: `${SITE_URL}/gracias.html?order=${orderRef}`,
      pending: `${SITE_URL}/pago-pendiente.html?order=${orderRef}`,
      failure: `${SITE_URL}/pago-rechazado.html`
    },
    auto_return: "approved",
    notification_url: process.env.MP_WEBHOOK_URL || `${publicApiUrl}/api/mercadopago-webhook`,
    external_reference: orderRef,
    metadata: {
      order_ref: orderRef,
      pack_id: product.id,
      category_id: categoryId,
      curso_filename: courseFilename,
      buyer_email: email,
      buyer_name: name
    }
  };

  const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(preference)
  });

  const mpData = await mpResponse.json();

  if (!mpResponse.ok) {
    res.status(mpResponse.status).json({ error: "Mercado Pago no pudo crear la preferencia", details: mpData });
    return;
  }

  // Persist order — non-blocking (payment preference already created)
  try {
    await createOrder({
      orderRef,
      email,
      name,
      packId: product.id,
      categoryId,
      courseFilename,
      productTitle: product.title,
      amount: product.unit_price,
      mpPreferenceId: mpData.id
    });
  } catch (dbErr) {
    console.error("create-order: DB error (non-fatal):", dbErr.message);
  }

  res.status(200).json({
    orderId: orderRef,
    preferenceId: mpData.id,
    sandboxInitPoint: mpData.sandbox_init_point,
    amount: product.unit_price,
    product: { id: product.id, title: product.title }
  });
};
