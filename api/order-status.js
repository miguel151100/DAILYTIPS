const { getOrderByRef, getOrderByToken, getOrderByEmailAndRef } = require("./_orders");
const { getCourse } = require("./_courses");
const { getSupabase } = require("./_supabase");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function getCourseSignedUrl(filename) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from("cursos").createSignedUrl(filename, 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

function buildDownloads(order) {
  const SITE_URL = process.env.SITE_URL || "https://dailytips.lat";
  const downloads = [];

  if (order.pack_id === "total") {
    downloads.push({
      label: "Descargar Pack Total DailyTips",
      url: `${SITE_URL}/daily_tips_paquete_completo.zip`,
      type: "zip"
    });
  } else if (order.pack_id === "recipes") {
    downloads.push({
      label: "Descargar Recetas del Mundo",
      url: `${SITE_URL}/recetas-del-mundo-pack.zip`,
      type: "zip"
    });
  }

  downloads.push({
    label: "Abrir biblioteca premium",
    url: `${SITE_URL}/premium.html`,
    type: "page",
    description: "Descarga archivos individuales por categoría"
  });

  return downloads;
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Método no permitido" }); return; }

  const orderId = String(req.query?.orderId || "").trim();
  const token   = String(req.query?.token   || "").trim();
  const email   = String(req.query?.email   || "").trim().toLowerCase();

  let order = null;

  if (token) {
    // Token lookup — always returns full info if approved
    try { order = await getOrderByToken(token); } catch (e) { console.error(e.message); }
    if (!order) {
      res.status(404).json({ error: "Token no válido o expirado" });
      return;
    }
  } else if (orderId && email) {
    // orderId + email lookup — verifies ownership
    try { order = await getOrderByEmailAndRef(email, orderId); } catch (e) { console.error(e.message); }
    if (!order) {
      res.status(404).json({ error: "No encontramos una compra con ese correo y número de orden" });
      return;
    }
  } else if (orderId) {
    // orderId only — returns status but NOT download links (security)
    try { order = await getOrderByRef(orderId); } catch (e) { console.error(e.message); }
    if (!order) {
      res.status(404).json({ error: "Orden no encontrada" });
      return;
    }
    res.status(200).json({
      orderId: order.order_ref,
      status: order.status,
      product: { id: order.pack_id, title: order.product_title, amount: order.amount },
      accessReady: order.status === "approved"
    });
    return;
  } else {
    res.status(400).json({ error: "Parámetros requeridos: token, o bien orderId + email" });
    return;
  }

  const base = {
    orderId: order.order_ref,
    status: order.status,
    product: { id: order.pack_id, title: order.product_title, amount: order.amount },
    accessReady: order.status === "approved"
  };

  if (order.status !== "approved") {
    return res.status(200).json(base);
  }

  // Build downloads
  let downloads = [];
  if (order.pack_id === "curso" && order.curso_filename) {
    try {
      const signedUrl = await getCourseSignedUrl(order.curso_filename);
      if (signedUrl) {
        const course = getCourse(order.curso_filename);
        downloads.push({
          label: `Descargar ${course?.title || order.product_title}`,
          url: signedUrl,
          type: "pdf"
        });
      }
    } catch (e) { console.error(e.message); }
  } else {
    downloads = buildDownloads(order);
  }

  res.status(200).json({
    ...base,
    accessToken: order.access_token,
    downloads
  });
};
