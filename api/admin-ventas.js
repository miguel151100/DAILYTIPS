const { getSupabase } = require("./_supabase");
const { getCourse } = require("./_courses");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Método no permitido" }); return; }

  const token = String(req.query?.token || "").trim();
  const adminToken = process.env.ADMIN_TOKEN || process.env.DELIVERY_ACCESS_CODE;

  if (!token || token !== adminToken) {
    res.status(401).json({ error: "Token inválido" });
    return;
  }

  const supabase = getSupabase();
  const { data: purchases, error } = await supabase
    .from("compras")
    .select("*")
    .order("fecha_compra", { ascending: false })
    .limit(500);

  if (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: "Error al consultar ventas" });
    return;
  }

  const rows = (purchases || []).map(p => {
    const course = getCourse(p.curso_filename);
    return {
      id: p.id,
      email: p.email,
      filename: p.curso_filename,
      title: course?.title || p.curso_filename,
      price: course?.unit_price || 0,
      fechaCompra: p.fecha_compra,
      paymentId: p.mp_payment_id
    };
  });

  const totalRecaudado = rows.reduce((sum, r) => sum + (r.price || 0), 0);
  const uniqueEmails = new Set(rows.map(r => r.email)).size;

  res.status(200).json({
    ok: true,
    total: rows.length,
    totalRecaudado,
    uniqueEmails,
    ventas: rows
  });
};
