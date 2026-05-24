const SITE_URL = process.env.SITE_URL || "https://miguel151100.github.io/DAILYTIPS";
const API_PUBLIC_URL = process.env.API_PUBLIC_URL || "";
const DELIVERY_ACCESS_CODE = process.env.DELIVERY_ACCESS_CODE || "DAILYTIPS2026";

const products = {
  standard: {
    id: "standard",
    title: "Paquete DailyTips individual",
    description: "Paquete digital individual DailyTips",
    unit_price: 35,
    currency_id: "MXN"
  },
  education: {
    id: "education",
    title: "Pack Educación DailyTips",
    description: "Ejercicios escolares por materia, nivel y tema",
    unit_price: 35,
    currency_id: "MXN"
  },
  total: {
    id: "total",
    title: "DAILYTIPS Pack Total",
    description: "Biblioteca completa de productos digitales DailyTips",
    unit_price: 99,
    currency_id: "MXN"
  },
  recipes: {
    id: "recipes",
    title: "Recetas del Mundo DailyTips",
    description: "Mega paquete con 112 recetas por estados y países",
    unit_price: 99,
    currency_id: "MXN"
  }
};

function getProduct(id) {
  return products[id] || products.standard;
}

function deliveryEmailHtml({ product, paymentId }) {
  const deliveryUrl = `${SITE_URL}/entrega-digital.html`;
  const recipesUrl = `${SITE_URL}/recetas-del-mundo-pack.zip`;
  const totalUrl = `${SITE_URL}/daily_tips_paquete_completo.zip`;

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#06152e">
      <h1 style="margin:0 0 12px">Gracias por tu compra DailyTips</h1>
      <p>Tu pago fue aprobado${paymentId ? ` con referencia ${paymentId}` : ""}.</p>
      <p><strong>Producto:</strong> ${product.title}</p>
      <p><strong>Código de acceso:</strong> ${DELIVERY_ACCESS_CODE}</p>
      <p>Entra aquí para descargar tus archivos:</p>
      <p><a href="${deliveryUrl}" style="background:#ff5a36;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:bold">Abrir entrega digital</a></p>
      <p>Enlaces rápidos:</p>
      <ul>
        <li><a href="${totalUrl}">Descargar DAILYTIPS Pack Total</a></li>
        <li><a href="${recipesUrl}">Descargar Recetas del Mundo</a></li>
      </ul>
      <p>Si tienes dudas, responde este correo o escribe por WhatsApp.</p>
    </div>
  `;
}

module.exports = {
  API_PUBLIC_URL,
  DELIVERY_ACCESS_CODE,
  SITE_URL,
  deliveryEmailHtml,
  getProduct,
  products
};
