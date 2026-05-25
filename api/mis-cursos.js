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

  const email = String(req.query?.email || "").trim().toLowerCase();
  if (!email) {
    res.status(400).json({ error: "Parámetro email requerido" });
    return;
  }

  const supabase = getSupabase();
  const { data: purchases, error } = await supabase
    .from("compras")
    .select("curso_filename, fecha_compra, mp_payment_id")
    .eq("email", email)
    .order("fecha_compra", { ascending: false });

  if (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: "Error al consultar compras" });
    return;
  }

  if (!purchases || purchases.length === 0) {
    res.status(200).json({ ok: true, courses: [] });
    return;
  }

  const courses = await Promise.all(purchases.map(async (p) => {
    const course = getCourse(p.curso_filename);
    let downloadUrl = null;
    try {
      const { data: urlData } = await supabase.storage
        .from("cursos")
        .createSignedUrl(p.curso_filename, 3600);
      downloadUrl = urlData?.signedUrl || null;
    } catch (e) {
      console.error("Signed URL error:", e.message);
    }
    return {
      filename: p.curso_filename,
      title: course?.title || p.curso_filename,
      price: course?.unit_price || null,
      fechaCompra: p.fecha_compra,
      downloadUrl
    };
  }));

  res.status(200).json({ ok: true, email, courses });
};
