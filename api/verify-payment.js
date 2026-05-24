const { DELIVERY_ACCESS_CODE, getDeliveryLinks, getProduct } = require("./_products");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getPaymentId(req) {
  return req.query?.payment_id || req.query?.collection_id || req.query?.id;
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    res.status(500).json({ error: "Falta configurar MP_ACCESS_TOKEN" });
    return;
  }

  const paymentId = getPaymentId(req);
  if (!paymentId) {
    res.status(400).json({ error: "Falta payment_id para verificar el pago" });
    return;
  }

  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
  });
  const payment = await paymentResponse.json();

  if (!paymentResponse.ok) {
    res.status(502).json({ error: "No se pudo consultar el pago", details: payment });
    return;
  }

  const [referencePack = "standard", referenceCategory = ""] = String(payment.external_reference || "").split("-")[0].split(":");
  const packId = payment.metadata?.pack_id || referencePack;
  const categoryId = payment.metadata?.category_id || referenceCategory;
  const product = getProduct(packId, categoryId);

  if (payment.status !== "approved") {
    res.status(200).json({
      ok: true,
      approved: false,
      status: payment.status,
      product: {
        id: product.id,
        title: product.title
      }
    });
    return;
  }

  res.status(200).json({
    ok: true,
    approved: true,
    status: payment.status,
    paymentId,
    product: {
      id: product.id,
      title: product.title,
      description: product.description
    },
    accessCode: DELIVERY_ACCESS_CODE,
    downloads: getDeliveryLinks(product)
  });
};
