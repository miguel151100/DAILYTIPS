const { deliveryEmailHtml, getProduct } = require("./_products");

async function sendDeliveryEmail({ to, product, paymentId }) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY no configurado. Email no enviado.", { to, product: product.id, paymentId });
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "DailyTips <onboarding@resend.dev>",
      to,
      subject: `Tu compra DailyTips: ${product.title}`,
      html: deliveryEmailHtml({ product, paymentId })
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

function getPaymentId(req, body) {
  return req.query?.["data.id"] || req.query?.id || body?.data?.id || body?.id || body?.resource?.split("/").pop();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    res.status(500).json({ error: "Falta configurar MP_ACCESS_TOKEN" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const paymentId = getPaymentId(req, body);

  if (!paymentId) {
    res.status(200).json({ ok: true, ignored: "Sin payment id" });
    return;
  }

  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
  });
  const payment = await paymentResponse.json();

  if (!paymentResponse.ok) {
    res.status(200).json({ ok: false, ignored: "No se pudo consultar el pago", details: payment });
    return;
  }

  if (payment.status !== "approved") {
    res.status(200).json({ ok: true, status: payment.status, message: "Pago aún no aprobado" });
    return;
  }

  const packId = payment.metadata?.pack_id || payment.external_reference?.split("-")[0] || "standard";
  const product = getProduct(packId);
  const email = payment.metadata?.buyer_email || payment.payer?.email;

  if (!email) {
    res.status(200).json({ ok: true, approved: true, message: "Pago aprobado sin correo disponible" });
    return;
  }

  const emailResult = await sendDeliveryEmail({ to: email, product, paymentId });
  res.status(200).json({ ok: true, approved: true, email: emailResult });
};
