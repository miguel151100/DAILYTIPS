const crypto = require("crypto");
const { deliveryEmailHtml, getProduct } = require("./_products");
const { getCourse } = require("./_courses");
const { getSupabase } = require("./_supabase");
const { approveOrderByPaymentId, generateAccessToken } = require("./_orders");

// ── Signature validation ─────────────────────────────────────────────────────
function validateSignature(req) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // Skip if not configured

  const xSignature = req.headers?.["x-signature"];
  const xRequestId = req.headers?.["x-request-id"] || "";
  if (!xSignature) return false;

  const parts = {};
  xSignature.split(",").forEach(p => {
    const [k, v] = p.trim().split("=");
    if (k && v) parts[k] = v;
  });

  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const dataId = req.query?.["data.id"] || req.body?.data?.id || "";
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hmac = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(v1, "hex"));
}

// ── DB helpers ───────────────────────────────────────────────────────────────
async function savePurchase({ email, filename, paymentId }) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("compras").insert([{
      email,
      curso_filename: filename,
      mp_payment_id: String(paymentId)
    }]);
    if (error && error.code !== "23505") console.error("webhook: DB compras error:", error);
  } catch (err) {
    console.error("webhook: Error guardando compra:", err.message);
  }
}

async function getCourseSignedUrl(filename) {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.storage.from("cursos").createSignedUrl(filename, 3600 * 24);
    return data?.signedUrl || null;
  } catch { return null; }
}

// ── Email helpers ─────────────────────────────────────────────────────────────
async function sendCourseEmail({ to, course, signedUrl, paymentId }) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY no configurado. Email de curso omitido.", { to, course: course.title });
    return { skipped: true };
  }

  const downloadBlock = signedUrl
    ? `<p><a href="${signedUrl}" style="background:#7C3AED;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:bold">Descargar ${course.title}</a></p><p style="color:#666;font-size:13px">Este enlace expira en 24 horas.</p>`
    : `<p>Escríbenos por WhatsApp para recibir tu enlace de descarga.</p>`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#06152e">
      <h1 style="margin:0 0 12px">¡Gracias por tu compra!</h1>
      <p>Tu pago fue aprobado${paymentId ? ` (referencia: ${paymentId})` : ""}.</p>
      <p><strong>Curso:</strong> ${course.title}</p>
      ${downloadBlock}
      <p>Si tienes dudas: <a href="https://wa.me/525569862844">WhatsApp +52 55 6986 2844</a></p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "DailyTips <onboarding@resend.dev>",
      to,
      subject: `Tu curso: ${course.title}`,
      html
    })
  });
  const emailData = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(emailData));
  return emailData;
}

async function sendDeliveryEmail({ to, product, paymentId, accessToken }) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY no configurado. Email de entrega omitido.", { to, product: product.id, paymentId });
    return { skipped: true };
  }

  const SITE_URL = process.env.SITE_URL || "https://dailytips.lat";
  const html = deliveryEmailHtml({ product, paymentId, accessToken });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "DailyTips <onboarding@resend.dev>",
      to,
      subject: `Tu compra DailyTips: ${product.title}`,
      html
    })
  });
  const emailData = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(emailData));
  return emailData;
}

// ── Extract payment ID ───────────────────────────────────────────────────────
function getPaymentId(req, body) {
  return req.query?.["data.id"] || req.query?.id || body?.data?.id || body?.id || body?.resource?.split("/").pop();
}

// ── Handler ───────────────────────────────────────────────────────────────────
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

  // Signature validation (warns but doesn't block if secret not configured)
  if (req.method === "POST" && !validateSignature(req)) {
    console.warn("webhook: Firma inválida o faltante");
    // Non-blocking: continue processing anyway (log for investigation)
  }

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

  // external_reference is the orderRef set in create-order.js
  const orderRef      = payment.external_reference || "";
  const packId        = payment.metadata?.pack_id || orderRef.split("-")[0] || "standard";
  const categoryId    = payment.metadata?.category_id || "";
  const courseFilename = payment.metadata?.curso_filename || "";
  const email         = payment.metadata?.buyer_email || payment.payer?.email || "";

  if (!email) {
    res.status(200).json({ ok: true, approved: true, message: "Pago aprobado sin correo disponible" });
    return;
  }

  const accessToken = generateAccessToken();

  // Update order record for all product types
  try {
    await approveOrderByPaymentId({ mpPaymentId: paymentId, orderRef: orderRef || null, accessToken });
  } catch (e) {
    console.error("webhook: Error aprobando orden:", e.message);
  }

  // Course: save to compras table + send course email
  if (packId === "curso" && courseFilename) {
    const course = getCourse(courseFilename);
    await savePurchase({ email, filename: courseFilename, paymentId });
    const signedUrl = await getCourseSignedUrl(courseFilename);
    const emailResult = await sendCourseEmail({
      to: email,
      course: course || { title: courseFilename },
      signedUrl,
      paymentId
    });
    res.status(200).json({ ok: true, approved: true, type: "curso", email: emailResult });
    return;
  }

  // Pack or other product: send delivery email
  const product = getProduct(packId, categoryId);
  const emailResult = await sendDeliveryEmail({ to: email, product, paymentId, accessToken });
  res.status(200).json({ ok: true, approved: true, type: "pack", email: emailResult });
};
