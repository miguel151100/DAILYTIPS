const { deliveryEmailHtml, getProduct } = require("./_products");
const { getCourse } = require("./_courses");
const { getSupabase } = require("./_supabase");

async function savePurchase({ email, filename, paymentId }) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("compras").insert([{
      email,
      curso_filename: filename,
      mp_payment_id: String(paymentId)
    }]);
    if (error && error.code !== "23505") console.error("DB insert error:", error); // 23505 = duplicate
  } catch (err) {
    console.error("Error guardando compra en Supabase:", err.message);
  }
}

async function getCourseSignedUrl(filename) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from("cursos").createSignedUrl(filename, 3600 * 24);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

async function sendCourseEmail({ to, course, signedUrl, paymentId }) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY no configurado. Email de curso no enviado.", { to, course: course.title });
    return { skipped: true };
  }

  const downloadBlock = signedUrl
    ? `<p><a href="${signedUrl}" style="background:#7C3AED;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:bold">Descargar ${course.title}</a></p><p style="color:#666;font-size:13px">Este enlace expira en 24 horas. Si lo necesitas de nuevo, escríbenos por WhatsApp.</p>`
    : `<p>Escríbenos por WhatsApp para recibir tu enlace de descarga.</p>`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#06152e">
      <h1 style="margin:0 0 12px">¡Gracias por tu compra!</h1>
      <p>Tu pago fue aprobado${paymentId ? ` con referencia ${paymentId}` : ""}.</p>
      <p><strong>Curso:</strong> ${course.title}</p>
      <p>Descarga tu PDF aquí:</p>
      ${downloadBlock}
      <p>Si tienes dudas, escríbenos por WhatsApp: <a href="https://wa.me/525569862844">+52 55 6986 2844</a></p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "DailyTips <onboarding@resend.dev>",
      to,
      subject: `Tu curso: ${course.title}`,
      html
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

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

  const [referencePack = "standard", referenceCategory = ""] = String(payment.external_reference || "").split("-")[0].split(":");
  const packId = payment.metadata?.pack_id || referencePack;
  const categoryId = payment.metadata?.category_id || referenceCategory;
  const courseFilename = payment.metadata?.curso_filename || "";
  const email = payment.metadata?.buyer_email || payment.payer?.email;

  if (!email) {
    res.status(200).json({ ok: true, approved: true, message: "Pago aprobado sin correo disponible" });
    return;
  }

  // Course purchase: save to Supabase + send email with signed URL
  if (packId === "curso" && courseFilename) {
    const course = getCourse(courseFilename);
    await savePurchase({ email, filename: courseFilename, paymentId });
    const signedUrl = await getCourseSignedUrl(courseFilename);
    const courseEmailResult = await sendCourseEmail({ to: email, course: course || { title: courseFilename }, signedUrl, paymentId });
    res.status(200).json({ ok: true, approved: true, type: "curso", email: courseEmailResult });
    return;
  }

  // Regular product: existing delivery flow
  const product = getProduct(packId, categoryId);
  const emailResult = await sendDeliveryEmail({ to: email, product, paymentId });
  res.status(200).json({ ok: true, approved: true, email: emailResult });
};
