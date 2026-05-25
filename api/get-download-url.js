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
  const filename = String(req.query?.filename || "").trim();

  if (!email || !filename) {
    res.status(400).json({ error: "Parámetros requeridos: email y filename" });
    return;
  }

  const course = getCourse(filename);
  if (!course) {
    res.status(404).json({ error: "Curso no encontrado" });
    return;
  }

  const supabase = getSupabase();

  const { data: purchases, error: dbError } = await supabase
    .from("compras")
    .select("id")
    .eq("email", email)
    .eq("curso_filename", filename)
    .limit(1);

  if (dbError) {
    console.error("DB error:", dbError);
    res.status(500).json({ error: "Error al verificar la compra" });
    return;
  }

  if (!purchases || purchases.length === 0) {
    res.status(403).json({ error: "No se encontró una compra para este correo y curso" });
    return;
  }

  const { data: urlData, error: storageError } = await supabase.storage
    .from("cursos")
    .createSignedUrl(filename, 3600);

  if (storageError || !urlData?.signedUrl) {
    console.error("Storage error:", storageError);
    res.status(500).json({ error: "No se pudo generar el enlace de descarga" });
    return;
  }

  res.status(200).json({
    ok: true,
    course: { title: course.title, filename },
    downloadUrl: urlData.signedUrl,
    expiresIn: 3600
  });
};
