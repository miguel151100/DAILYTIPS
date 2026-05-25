const { API_PUBLIC_URL, DELIVERY_ACCESS_CODE, getDeliveryLinks, getProduct } = require("./_products");
const { getCourse } = require("./_courses");
const { getSupabase } = require("./_supabase");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function savePurchase({ email, filename, paymentId }) {
  try {
    const supabase = getSupabase();
    await supabase.from("compras").insert([{
      email,
      curso_filename: filename,
      mp_payment_id: String(paymentId)
    }]);
  } catch (err) {
    console.error("Error guardando compra en Supabase:", err.message);
  }
}

async function getCourseSignedUrl(filename) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from("cursos").createSignedUrl(filename, 3600);
  if (error || !data?.signedUrl) throw new Error("No se pudo generar URL de descarga");
  return data.signedUrl;
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
  const { formData, pack, category, buyerName, filename } = body;

  if (!formData) {
    res.status(400).json({ error: "Falta formData del Payment Brick" });
    return;
  }

  // Resolve product — cursos use _courses.js
  let product;
  let courseFilename = "";
  if (pack === "curso") {
    courseFilename = String(filename || "").trim();
    const course = getCourse(courseFilename);
    if (!course) {
      res.status(400).json({ error: "Curso no encontrado" });
      return;
    }
    product = { id: "curso", ...course };
  } else {
    product = getProduct(pack || "standard", category || "");
  }

  const externalReference = `${product.id}:${category || courseFilename || "general"}-${Date.now()}`;
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
      curso_filename: courseFilename,
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
    const buyerEmail = formData?.payer?.email || "";

    if (courseFilename) {
      // Save purchase to Supabase and return signed URL
      await savePurchase({ email: buyerEmail, filename: courseFilename, paymentId: data.id });
      let signedUrl = null;
      try { signedUrl = await getCourseSignedUrl(courseFilename); } catch (e) { console.error(e.message); }
      res.status(200).json({
        ok: true,
        approved: true,
        pending: false,
        paymentId: data.id,
        product: { id: product.id, title: product.title },
        downloads: signedUrl ? [{ label: `Descargar ${product.title}`, url: signedUrl }] : []
      });
    } else {
      res.status(200).json({
        ok: true,
        approved: true,
        pending: false,
        paymentId: data.id,
        product: { id: product.id, title: product.title },
        accessCode: DELIVERY_ACCESS_CODE,
        downloads: getDeliveryLinks(product)
      });
    }
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
