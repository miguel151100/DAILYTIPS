const SITE_URL = process.env.SITE_URL || "https://dailytips.lat";
const API_PUBLIC_URL = process.env.API_PUBLIC_URL || "";
const DELIVERY_ACCESS_CODE = process.env.DELIVERY_ACCESS_CODE || "DAILYTIPS2026";

const standardCategories = {
  dinero: {
    title: "Pack Finanzas en Orden MX",
    description: "Plantillas para quincena, gastos, deudas y ahorro"
  },
  ia: {
    title: "Pack IA Fácil",
    description: "Guías, prompts y recursos de inteligencia artificial para principiantes"
  },
  negocio: {
    title: "Pack Negocio Inteligente",
    description: "Control de inventario, pedidos, clientes, ventas y ganancias"
  },
  contenido: {
    title: "Pack Contenido Viral",
    description: "Calendarios, hooks, guiones e ideas para crear contenido"
  },
  reset: {
    title: "Pack Reset Productivo",
    description: "Herramientas de enfoque, hábitos, metas y organización personal"
  },
  vida: {
    title: "Pack Organiza tu Vida",
    description: "Planners, hábitos, rutinas y objetivos para organizar tu día"
  },
  estudiante: {
    title: "Pack Estudiante Pro",
    description: "Organizadores, horarios, Pomodoro y planeadores de examen"
  },
  emprendedor: {
    title: "Pack Emprendedor Digital",
    description: "Recursos de IA, negocio y contenido para empezar online"
  }
};

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

function getProduct(id, categoryId = "") {
  const product = products[id] || products.standard;
  const category = standardCategories[categoryId];

  if (product.id !== "standard" || !category) return product;

  return {
    ...product,
    title: category.title,
    description: category.description,
    category_id: categoryId
  };
}

function getDeliveryLinks(product) {
  const links = [
    {
      label: "Abrir entrega digital",
      url: `${SITE_URL}/entrega-digital.html`,
      description: "Ingresa tu código para ver las descargas protegidas."
    }
  ];

  if (product.id === "recipes") {
    links.push({
      label: "Descargar Recetas del Mundo",
      url: `${SITE_URL}/recetas-del-mundo-pack.zip`,
      description: "ZIP con 112 recetas por estados de México y países."
    });
  }

  if (product.id === "total") {
    links.push({
      label: "Descargar Pack Total",
      url: `${SITE_URL}/daily_tips_paquete_completo.zip`,
      description: "ZIP con la biblioteca completa DailyTips."
    });
  }

  links.push({
    label: "Biblioteca premium",
    url: `${SITE_URL}/premium.html`,
    description: "Descarga recursos individuales por categoría."
  });

  return links;
}

function deliveryEmailHtml({ product, paymentId, accessToken }) {
  const deliveryUrl = `${SITE_URL}/entrega-digital.html`;
  const links = getDeliveryLinks(product);
  const codeBlock = accessToken
    ? `<p><strong>Tu código de acceso:</strong></p><p style="font-family:monospace;background:#f5f5f5;padding:10px 16px;border-radius:8px;font-size:15px;word-break:break-all">${accessToken}</p><p style="font-size:13px;color:#666">Guarda este código para acceder a tus archivos en cualquier momento.</p>`
    : `<p><strong>Código de acceso:</strong> ${DELIVERY_ACCESS_CODE}</p>`;

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#06152e">
      <h1 style="margin:0 0 12px">Gracias por tu compra DailyTips</h1>
      <p>Tu pago fue aprobado${paymentId ? ` (referencia: ${paymentId})` : ""}.</p>
      <p><strong>Producto:</strong> ${product.title}</p>
      ${codeBlock}
      <p>Entra aquí para descargar tus archivos:</p>
      <p><a href="${deliveryUrl}" style="background:#7C3AED;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:bold">Ir a entrega digital</a></p>
      <p>Descargas directas:</p>
      <ul>
        ${links.map((link) => `<li><a href="${link.url}">${link.label}</a> — ${link.description || ""}</li>`).join("")}
      </ul>
      <p style="color:#666;font-size:13px">Si tienes dudas, escribe por <a href="https://wa.me/525569862844">WhatsApp: +52 55 6986 2844</a></p>
    </div>
  `;
}

module.exports = {
  API_PUBLIC_URL,
  DELIVERY_ACCESS_CODE,
  SITE_URL,
  deliveryEmailHtml,
  getDeliveryLinks,
  getProduct,
  products,
  standardCategories
};
