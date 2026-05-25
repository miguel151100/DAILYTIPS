const { API_PUBLIC_URL, DELIVERY_ACCESS_CODE, getDeliveryLinks, getProduct } = require("./_products");

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
  const { formData, pack, category, buyerName } = body;

  if (!formData) {
    res.status(400).json({ error: "Falta formData del Payment Brick" });
    return;
  }

  const product = getProduct(pack || "standard", category || "");
  const externalReference = `${product.id}:${category || "general"}-${Date.now()}`;
  const publicApiUrl = API_PUBLIC_URL || `https://${req.headers.host}`;

  const payment = {
    ...formData,
    transaction_amount: product.unit_price,
    description: product.title,
    external_reference: externalReference,
    notification_url: process.env.MP_WEBHOOK_URL || `${publicApiUrl}/api/mercadopago-webhook`,
    metadata: {
      pack_id: product.id,
      category_id: category || "",
      buyer_email: formData?.payer?.email || "",
      buyer_name: buyerName || formData?.payer?.first_name || ""
    }
  };

  const response = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": externalReference
    },
    body: JSON.stringify(payment)
  });

  const data = await response.json();

  if (!response.ok) {
    res.status(response.status).json({ error: "Mercado Pago rechazó el pago", details: data });
    return;
  }

  const approved = data.status === "approved";
  const pending = data.status === "pending" || data.status === "in_process" || data.status === "authorized";

  if (approved) {
    res.status(200).json({
      ok: true,
      approved: true,
      pending: false,
      paymentId: data.id,
      product: { id: product.id, title: product.title },
      accessCode: DELIVERY_ACCESS_CODE,
      downloads: getDeliveryLinks(product)
    });
    return;
  }

  if (pending) {
    res.status(200).json({
      ok: true,
      approved: false,
      pending: true,
      status: data.status,
      statusDetail: data.status_detail,
      paymentId: data.id,
      product: { id: product.id, title: product.title },
      ticketUrl: data.transaction_details?.external_resource_url || null
    });
    return;
  }

  res.status(200).json({
    ok: true,
    approved: false,
    pending: false,
    status: data.status,
    statusDetail: data.status_detail,
    paymentId: data.id
  });
};
