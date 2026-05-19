import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
await import(`file://${path.join(__dirname, "catalog.js")}?v=${Date.now()}`);
const { products, icon } = globalThis.dailyTipsCatalog;

const whatsapp = "https://wa.me/?text=Hola%2C%20quiero%20comprar%20un%20paquete%20Daily%20Tips";
const premiumPassword = "DAILYTIPS2026";

const packDefs = [
  {
    id: "dinero",
    name: "Dinero y Ahorro",
    page: "dinero-ahorro.html",
    category: "Finanzas personales",
    headline: "Ordena tu quincena, ahorro, pagos y deudas sin enredarte.",
    emotional: "Para personas que sienten que el dinero se va antes de entender en que. Este paquete convierte la quincena en un mapa claro de decisiones.",
    price: 149,
    normal: 249,
    badge: "Más vendido",
    gradient: "grad-money",
    bullets: ["Control quincenal", "Gasto hormiga", "Ahorro", "Deudas", "Pagos mexicanos"],
    articles: ["La quincena no se pierde sola", "Cómo evitar recargos por pagos olvidados"]
  },
  {
    id: "ia",
    name: "IA Fácil",
    page: "ia-facil.html",
    category: "IA para principiantes",
    headline: "Aprende a usar IA para crear, estudiar, vender y ahorrar tiempo.",
    emotional: "Hecho para principiantes que quieren usar ChatGPT y herramientas IA sin sentirse perdidos ni técnicos.",
    price: 179,
    normal: 299,
    badge: "Nuevo",
    gradient: "grad-ai",
    bullets: ["Prompts premium", "IA para contenido", "IA para negocios", "Automatizaciones", "Estudio con IA"],
    articles: ["5 formas reales de usar ChatGPT", "Prompts que sí ayudan a vender"]
  },
  {
    id: "negocio",
    name: "Negocio Inteligente",
    page: "negocio-inteligente.html",
    category: "Negocios y revendedores",
    headline: "Controla ventas, inventario, clientes y ganancias como negocio serio.",
    emotional: "Para revendedores, emprendedores caseros y pequeños negocios que venden por Facebook, WhatsApp o entregas locales.",
    price: 199,
    normal: 349,
    badge: "Recomendado",
    gradient: "grad-business",
    bullets: ["Inventario", "Ganancias", "Pedidos", "Clientes", "Dashboard ventas"],
    articles: ["Cómo saber si tu producto sí deja ganancia", "El error que mata a los revendedores"]
  },
  {
    id: "contenido",
    name: "Contenido Viral",
    page: "contenido-viral.html",
    category: "Creadores de contenido",
    headline: "Publica con intención: ideas, hooks, guiones, reels y métricas.",
    emotional: "Para creadores, vendedores y páginas de Facebook que quieren atraer comentarios, mensajes y ventas sin publicar al azar.",
    price: 179,
    normal: 299,
    badge: "Viral",
    gradient: "grad-content",
    bullets: ["Calendario 30 días", "Hooks virales", "Guiones", "Reels", "Métricas"],
    articles: ["Publicar más no vende más", "Cómo transformar un tip en venta"]
  },
  {
    id: "reset",
    name: "Reset Productivo",
    page: "reset-productivo.html",
    categories: ["Productividad y organización", "Estudiantes"],
    headline: "Reinicia tu semana con hábitos, enfoque, estudio y metas claras.",
    emotional: "Para quien quiere dejar de procrastinar, estudiar mejor, organizar tareas y recuperar control del día.",
    price: 169,
    normal: 279,
    badge: "Popular",
    gradient: "grad-reset",
    bullets: ["Planner diario", "Hábitos", "Pomodoro", "Metas", "Exámenes"],
    articles: ["El método anti procrastinación", "Cómo estudiar con IA sin copiar"]
  }
];

const packTotal = {
  name: "DAILYTIPS Pack Total",
  page: "pack-total.html",
  price: 399,
  normal: 1470,
  perceived: 2488,
  badge: "Mejor valor",
  headline: "Toda la biblioteca Daily Tips en un solo paquete.",
  emotional: "La forma más completa de vender, organizar, estudiar, crear contenido y resolver problemas diarios con herramientas digitales listas."
};

const articles = [
  {
    category: "Finanzas personales",
    title: "La quincena no se pierde sola: 7 fugas invisibles",
    excerpt: "Detecta gastos hormiga, pagos olvidados y deudas que rompen el mes.",
    pack: "Dinero y Ahorro",
    page: "dinero-ahorro.html",
    image: "grad-money",
    body: ["La mayoría no necesita ganar más para empezar: necesita ver mejor.", "Oxxo, apps, delivery, comisiones y pagos olvidados pueden parecer pequeños, pero juntos cambian todo.", "El primer paso es usar una herramienta que separe quincena, gastos fijos, deuda y ahorro."]
  },
  {
    category: "IA para principiantes",
    title: "5 formas reales de usar ChatGPT si apenas empiezas",
    excerpt: "Ideas prácticas para vender, estudiar, crear contenido y organizar tareas.",
    pack: "IA Fácil",
    page: "ia-facil.html",
    image: "grad-ai",
    body: ["No necesitas aprender programación para usar IA.", "Puedes pedir ideas, mejorar textos, crear guiones, resumir temas y preparar mensajes de venta.", "Lo importante es tener prompts listos y una estructura simple."]
  },
  {
    category: "Negocios y revendedores",
    title: "Cómo saber si tu producto sí deja ganancia",
    excerpt: "Precio, costo, comisión, entrega y descuento en una sola lectura.",
    pack: "Negocio Inteligente",
    page: "negocio-inteligente.html",
    image: "grad-business",
    body: ["Vender mucho no siempre significa ganar bien.", "Si no cuentas comisión, envío, empaque y descuentos, puedes estar trabajando sin utilidad.", "Un sistema de revendedores te muestra margen y seguimiento."]
  },
  {
    category: "Creadores de contenido",
    title: "Publicar más no vende más: necesitas ganchos y CTA",
    excerpt: "Convierte publicaciones en comentarios, mensajes y ventas.",
    pack: "Contenido Viral",
    page: "contenido-viral.html",
    image: "grad-content",
    body: ["El contenido viral empieza con un problema que la gente ya siente.", "Después das una solución parcial y cierras con un CTA claro.", "Un calendario de contenido evita improvisar y ayuda a medir qué vende."]
  },
  {
    category: "Productividad",
    title: "El método anti procrastinación para empezar sin motivación",
    excerpt: "Tareas mínimas, enfoque y seguimiento visible.",
    pack: "Reset Productivo",
    page: "reset-productivo.html",
    image: "grad-reset",
    body: ["No necesitas motivación, necesitas reducir fricción.", "Empieza con bloques pequeños, una acción mínima y una revisión diaria.", "Cuando ves progreso, sostener el hábito es más fácil."]
  },
  {
    category: "Estudiantes",
    title: "Cómo estudiar con IA sin copiar y pegar",
    excerpt: "Usa IA como tutor para resumir, explicar y practicar.",
    pack: "Reset Productivo",
    page: "reset-productivo.html",
    image: "grad-study",
    body: ["La IA no debe reemplazar tu aprendizaje; debe hacerlo más claro.", "Úsala para generar preguntas, explicar temas difíciles y crear repasos.", "Combínala con Pomodoro y un plan de exámenes."]
  }
];

function byPack(pack) {
  return products.filter((product) => {
    if (pack.category) return product.category === pack.category;
    return pack.categories.includes(product.category);
  });
}

function money(value) {
  return `$${value.toLocaleString("es-MX")} MXN`;
}

function layout({ title, description, active, body, extraHead = "" }) {
  const nav = [
    ["Inicio", "index.html"],
    ["Paquetes", "paquetes.html"],
    ["Pack Total", "pack-total.html"],
    ["Blog", "blog.html"],
    ["Gratis", "recursos-gratis.html"],
    ["Premium", "premium.html"],
    ["FAQ", "faq.html"],
    ["Contacto", "contacto.html"]
  ];
  return `<!doctype html>
<html lang="es-MX">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <script src="catalog.js" defer></script>
  <script src="app.js" defer></script>
  ${extraHead}
</head>
<body data-page="${active}">
  <div class="ambient ambient--one"></div>
  <div class="ambient ambient--two"></div>
  <header class="topbar">
    <a class="brand" href="index.html" aria-label="Daily Tips inicio"><span class="brand-mark">D</span><span>Daily Tips</span></a>
    <nav aria-label="Principal">
      ${nav.map(([label, href]) => `<a class="${active === href.replace(".html", "") ? "is-active" : ""}" href="${href}">${label}</a>`).join("")}
    </nav>
    <a class="topbar-cta" href="${whatsapp}" target="_blank" rel="noopener">Comprar por WhatsApp</a>
  </header>
  <main>${body}</main>
  <footer class="footer">
    <p><strong>Daily Tips</strong> · Plataforma de productos digitales para México.</p>
    <p>Archivos editables y recursos de organización. No sustituyen asesoría financiera, legal, fiscal ni médica.</p>
    <p><a href="faq.html">FAQ</a> · <a href="contacto.html">Contacto</a> · <a href="premium.html">Acceso premium</a></p>
  </footer>
</body>
</html>`;
}

function mockup(className = "grad-money") {
  return `<div class="pack-mockup ${className}">
    <div class="mock-window"><span></span><span></span><span></span><div class="mock-chart"></div><div class="mock-lines"></div></div>
  </div>`;
}

function productMini(product) {
  return `<article class="mini-product">
    <span class="icon-badge">${icon(product.icon)}</span>
    <div><strong>${product.name}</strong><p>${product.benefit}</p></div>
  </article>`;
}

function packCard(pack, total = false) {
  const count = total ? products.length : byPack(pack).length;
  return `<article class="pack-card ${total ? "pack-card--total" : ""}">
    <span class="pill">${pack.badge}</span>
    ${mockup(pack.gradient ?? "grad-total")}
    <h3>${pack.name}</h3>
    <p>${pack.headline}</p>
    <div class="price"><strong>${money(pack.price)}</strong><span>normal ${money(pack.normal)}</span></div>
    <ul>${(pack.bullets ?? ["48 herramientas", "Todas las categorías", "Actualizaciones", "Zona premium"]).map((item) => `<li>${item}</li>`).join("")}</ul>
    <div class="pack-actions">
      <a class="button" href="${whatsapp}" target="_blank" rel="noopener">Comprar</a>
      <a class="button button--ghost" href="${pack.page}">Ver paquete</a>
    </div>
    <small>${count} archivos incluidos</small>
  </article>`;
}

function blogCards(limit = articles.length) {
  return articles.slice(0, limit).map((article) => `<article class="article-card">
    <div class="article-image ${article.image}"><span>${article.category}</span></div>
    <div class="article-body">
      <span class="article-category">${article.category}</span>
      <h3>${article.title}</h3>
      <p>${article.excerpt}</p>
      <a class="text-link" href="blog.html#${slug(article.title)}">Leer artículo</a>
    </div>
  </article>`).join("");
}

function slug(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function home() {
  const best = products.filter((product) => product.tag === "Más vendido").slice(0, 4);
  return layout({
    title: "Daily Tips | Productos digitales para vender, ahorrar y organizarte",
    description: "Paquetes digitales por categoría y DAILYTIPS Pack Total para México.",
    active: "index",
    body: `
    <section class="hero hero-commercial">
      <div class="hero__copy">
        <p class="eyebrow">Plataforma comercial de productos digitales</p>
        <h1>Vende soluciones digitales, no archivos sueltos.</h1>
        <p class="lead">Daily Tips organiza herramientas descargables en paquetes claros para finanzas, IA, negocios, contenido, productividad y estudio. Ideal para vender desde Facebook y entregar en una zona premium.</p>
        <div class="hero__actions">
          <a class="button" href="pack-total.html">Ver Pack Total</a>
          <a class="button button--ghost" href="paquetes.html">Explorar paquetes</a>
        </div>
        <div class="trust"><span>5 paquetes</span><span>48 herramientas</span><span>Blog público</span><span>Premium privado</span></div>
      </div>
      ${mockup("grad-total")}
    </section>
    <section class="section">
      <div class="section__title"><p class="eyebrow">Categorías visuales</p><h2>Paquetes por problema, listos para promocionar.</h2></div>
      <div class="category-showcase">${packDefs.map((pack) => `<a class="category-tile ${pack.gradient}" href="${pack.page}"><span>${pack.badge}</span><strong>${pack.name}</strong><p>${pack.headline}</p></a>`).join("")}</div>
    </section>
    <section class="section">
      <div class="section__title"><p class="eyebrow">Más vendidos</p><h2>Los productos más fáciles de convertir desde Facebook.</h2></div>
      <div class="mini-grid">${best.map(productMini).join("")}</div>
    </section>
    <section class="section">
      <div class="section__title"><p class="eyebrow">Paquetes destacados</p><h2>Vende por categoría o sube el ticket con el Pack Total.</h2></div>
      <div class="pack-grid">${packDefs.slice(0, 3).map((pack) => packCard(pack)).join("")}${packCard(packTotal, true)}</div>
    </section>
    <section class="section lead-free">
      <div><p class="eyebrow">Recurso gratis</p><h2>Capta leads antes de vender.</h2><p>Usa el archivo gratis “30 gastos que se comen tu quincena” para pedir correo o WhatsApp y después ofrecer Dinero y Ahorro o Pack Total.</p></div>
      <a class="button" href="daily_tips_gratis_30_gastos_quincena.xlsx" download>Descargar gratis</a>
    </section>
    <section class="section">
      <div class="section__title"><p class="eyebrow">Artículos recientes</p><h2>Contenido para traer tráfico desde Facebook.</h2></div>
      <div class="article-grid">${blogCards(3)}</div>
    </section>`
  });
}

function paquetes() {
  return layout({
    title: "Paquetes Daily Tips | Compra por categoría",
    description: "Paquetes digitales por categoría y comparación contra el Pack Total.",
    active: "paquetes",
    body: `
    <section class="page-hero"><p class="eyebrow">Paquetes comerciales</p><h1>Elige un paquete o llévate toda la biblioteca.</h1><p>La estrategia es simple: paquetes por problema para vender fácil y Pack Total para maximizar valor.</p></section>
    <section class="section"><div class="pack-grid">${packDefs.map((pack) => packCard(pack)).join("")}</div></section>
    <section class="section compare-section">
      <div class="section__title"><p class="eyebrow">Comparativa</p><h2>Por qué recomendar el Pack Total.</h2></div>
      <div class="compare-table">
        <div class="compare-row head"><span>Opción</span><span>Incluye</span><span>Precio</span><span>Mejor para</span></div>
        ${packDefs.map((pack) => `<div class="compare-row"><span>${pack.name}</span><span>${byPack(pack).length} archivos</span><span>${money(pack.price)}</span><span>Resolver un problema específico</span></div>`).join("")}
        <div class="compare-row total"><span>DAILYTIPS Pack Total</span><span>48 archivos + bonos</span><span>${money(packTotal.price)}</span><span>Máximo valor y biblioteca completa</span></div>
      </div>
    </section>
    <section class="section lead-free"><div><p class="eyebrow">Recomendado</p><h2>Si dudas, ofrece primero Pack Total.</h2><p>El valor percibido es mayor, simplifica la entrega y convierte mejor cuando el cliente quiere “todo”.</p></div><a class="button" href="pack-total.html">Ver Pack Total</a></section>`
  });
}

function packTotalPage() {
  const individual = packDefs.reduce((sum, pack) => sum + pack.normal, 0);
  return layout({
    title: "DAILYTIPS Pack Total | Toda la biblioteca digital",
    description: "La página principal de venta del paquete completo Daily Tips.",
    active: "pack-total",
    body: `
    <section class="hero hero-commercial">
      <div class="hero__copy">
        <span class="pill">${packTotal.badge}</span>
        <h1>${packTotal.headline}</h1>
        <p class="lead">${packTotal.emotional}</p>
        <div class="price hero-price"><strong>${money(packTotal.price)}</strong><span>Valor percibido ${money(packTotal.perceived)}</span></div>
        <div class="hero__actions"><a class="button" href="${whatsapp}" target="_blank" rel="noopener">Comprar Pack Total</a><a class="button button--ghost" href="premium.html">Ver acceso premium</a></div>
      </div>
      ${mockup("grad-total")}
    </section>
    <section class="section"><div class="section__title"><p class="eyebrow">Todo lo que incluye</p><h2>48 archivos en 6 áreas de alto interés.</h2></div><div class="category-showcase">${packDefs.map((pack) => `<a class="category-tile ${pack.gradient}" href="${pack.page}"><span>${byPack(pack).length} archivos</span><strong>${pack.name}</strong><p>${pack.headline}</p></a>`).join("")}</div></section>
    <section class="section compare-section"><div class="section__title"><p class="eyebrow">Comparación de valor</p><h2>Comprar por separado cuesta más.</h2></div><div class="value-grid"><article><strong>${money(individual)}</strong><span>Comprando paquetes por separado</span></article><article><strong>${money(packTotal.price)}</strong><span>Pack Total lanzamiento</span></article><article><strong>${money(individual - packTotal.price)}</strong><span>Ahorro estimado</span></article></div></section>
    <section class="section"><div class="section__title"><p class="eyebrow">Beneficios</p><h2>Diseñado para compradores de Facebook.</h2></div><div class="benefit-grid"><article>Descarga inmediata desde zona premium</article><article>Productos por categorías claras</article><article>Recursos gratis para captar leads</article><article>Archivos editables en Excel</article></div></section>
    ${faqBlock()}`
  });
}

function categoryPage(pack) {
  const items = byPack(pack);
  const related = articles.filter((article) => article.pack === pack.name);
  return layout({
    title: `${pack.name} | Paquete Daily Tips`,
    description: pack.headline,
    active: pack.id,
    body: `
    <section class="hero hero-commercial">
      <div class="hero__copy"><span class="pill">${pack.badge}</span><h1>${pack.name}</h1><p class="lead">${pack.emotional}</p><div class="price hero-price"><strong>${money(pack.price)}</strong><span>normal ${money(pack.normal)}</span></div><div class="hero__actions"><a class="button" href="${whatsapp}" target="_blank" rel="noopener">Comprar paquete</a><a class="button button--ghost" href="pack-total.html">Mejor: Pack Total</a></div></div>
      ${mockup(pack.gradient)}
    </section>
    <section class="section"><div class="section__title"><p class="eyebrow">Archivos incluidos</p><h2>${items.length} herramientas para resolver este problema.</h2></div><div class="mini-grid">${items.map(productMini).join("")}</div></section>
    <section class="section"><div class="section__title"><p class="eyebrow">Artículos relacionados</p><h2>Contenido para atraer tráfico a este paquete.</h2></div><div class="article-grid">${related.length ? related.map((article) => blogCards(articles.indexOf(article) + 1).split("</article>").slice(-2, -1)[0] + "</article>").join("") : blogCards(2)}</div></section>
    <section class="section lead-free"><div><p class="eyebrow">Recomendación</p><h2>Si quieres más valor, compra Pack Total.</h2><p>Incluye este paquete y todos los demás por un precio más conveniente.</p></div><a class="button" href="pack-total.html">Ver Pack Total</a></section>`
  });
}

function blog() {
  return layout({
    title: "Blog Daily Tips | Artículos para vender desde Facebook",
    description: "Artículos públicos conectados a productos y paquetes Daily Tips.",
    active: "blog",
    body: `<section class="page-hero"><p class="eyebrow">Blog público</p><h1>Artículos diseñados para atraer tráfico y convertir.</h1><p>Cada entrada tiene CTA, productos relacionados y una ruta clara hacia compra o recurso gratis.</p></section>
    <section class="section blog-long">${articles.map((article) => `<article id="${slug(article.title)}" class="blog-post"><div class="article-image ${article.image}"><span>${article.category}</span></div><div><p class="eyebrow">${article.category}</p><h2>${article.title}</h2><p>${article.excerpt}</p>${article.body.map((p) => `<p>${p}</p>`).join("")}<div class="article-cta"><a class="button" href="${article.page}">Ver ${article.pack}</a><a class="button button--ghost" href="recursos-gratis.html">Descargar recurso gratis</a></div></div></article>`).join("")}</section>`
  });
}

function recursosGratis() {
  const free = products.filter((product) => product.type === "free").concat(products.find((p) => p.file === "daily_tips_gratis_30_gastos_quincena.xlsx")).filter(Boolean);
  return layout({
    title: "Recursos gratis Daily Tips | Captura leads",
    description: "Herramientas gratuitas para captar correo o WhatsApp antes de vender.",
    active: "recursos-gratis",
    body: `<section class="page-hero"><p class="eyebrow">Lead magnets</p><h1>Recursos gratis para atraer compradores.</h1><p>Úsalos en Facebook: “Comenta GRATIS” y manda esta página para captar correo o WhatsApp.</p></section>
    <section class="section newsletter"><div><h2>Recibe el recurso gratis</h2><p>Formulario demostrativo para capturar correo o WhatsApp antes de entregar descargas.</p></div><form class="newsletter-form"><input type="email" placeholder="Correo"><input type="tel" placeholder="WhatsApp"><button>Quiero mi recurso</button></form></section>
    <section class="section"><div class="mini-grid">${free.map(productMini).join("")}</div></section>`
  });
}

function premium() {
  return layout({
    title: "Acceso Premium Daily Tips | Descargas para clientes",
    description: "Zona privada de descargas para clientes Daily Tips.",
    active: "premium",
    body: `<section class="page-hero"><p class="eyebrow">Zona privada</p><h1>Acceso premium para compradores.</h1><p>Contraseña para clientes: <strong>${premiumPassword}</strong></p></section>
    <section id="premium" class="section premium-section"><div class="premium-gate" id="premium-gate"><div><p class="eyebrow">Biblioteca privada</p><h2>Descarga tus archivos comprados.</h2><p>Introduce la contraseña enviada por Facebook o WhatsApp después de comprar.</p></div><form class="premium-form" id="premium-form"><label for="premium-password">Contraseña</label><input id="premium-password" type="password" placeholder="Contraseña"><button type="submit">Entrar</button><p class="form-error" id="premium-error"></p></form></div><div class="premium-library" id="premium-library" hidden><div class="section__title"><p class="eyebrow">Descargas</p><h2>Biblioteca premium completa.</h2><p>Descarga el ZIP o baja archivos por categoría. Llena las celdas amarillas de cada Excel.</p></div><div class="premium-actions"><a class="button" href="daily_tips_paquete_completo.zip" download>Descargar ZIP completo</a><button class="button button--ghost" id="premium-logout" type="button">Cerrar acceso</button></div><div class="premium-downloads" id="premium-downloads"></div></div></section>`
  });
}

function faqBlock() {
  return `<section class="section faq-section"><div class="section__title"><p class="eyebrow">Preguntas frecuentes</p><h2>Dudas antes de comprar.</h2></div><div class="faq-grid"><details open><summary>¿Qué recibo?</summary><p>Acceso a la zona premium y descargas del paquete comprado.</p></details><details><summary>¿Funciona en celular?</summary><p>Sí, aunque recomendamos computadora para editar mejor en Excel.</p></details><details><summary>¿Puedo compartirlo?</summary><p>No. La compra es para uso personal y no permite redistribuir archivos.</p></details><details><summary>¿Hay soporte?</summary><p>Si un archivo no abre, manda captura por Facebook o WhatsApp.</p></details></div></section>`;
}

function faq() {
  return layout({ title: "FAQ Daily Tips", description: "Preguntas frecuentes de Daily Tips.", active: "faq", body: `<section class="page-hero"><p class="eyebrow">FAQ</p><h1>Preguntas frecuentes, garantías y aclaraciones.</h1></section>${faqBlock()}<section class="section testimonials"><div class="testimonial-grid"><article><p>“Compré el pack y ya tenía todo organizado por categorías.”</p><strong>Cliente Daily Tips</strong></article><article><p>“Lo más útil fue tener el recurso gratis para empezar y luego el paquete completo.”</p><strong>Compradora por Facebook</strong></article><article><p>“Las plantillas son directas: llenar amarillo y revisar resumen.”</p><strong>Usuario Excel básico</strong></article></div></section>` });
}

function contacto() {
  return layout({
    title: "Contacto Daily Tips",
    description: "Compra y soporte Daily Tips por Facebook o WhatsApp.",
    active: "contacto",
    body: `<section class="page-hero"><p class="eyebrow">Contacto y soporte</p><h1>Compra por Facebook o WhatsApp y recibe acceso premium.</h1><p>Usa esta página para resolver dudas, pedir soporte y recibir instrucciones después de comprar.</p><div class="hero__actions"><a class="button" href="${whatsapp}" target="_blank" rel="noopener">Comprar por WhatsApp</a><a class="button button--ghost" href="premium.html">Ir a Premium</a></div></section><section class="section page-grid"><article><h3>Cómo funciona</h3><p>Elige paquete, compra por Facebook/WhatsApp, recibe contraseña y descarga en Premium.</p></article><article><h3>Soporte</h3><p>Envía captura si un archivo no abre o si no encuentras una descarga.</p></article><article><h3>Términos</h3><p>Uso personal. No redistribuir, revender ni compartir contraseña.</p></article><article><h3>Privacidad</h3><p>Los datos de contacto se usan para entrega, soporte y novedades.</p></article><article><h3>Después de comprar</h3><p>Guarda el enlace premium y descarga el ZIP completo como respaldo.</p></article><article><h3>Garantía técnica</h3><p>Si falta un archivo o no descarga, se corrige o se reenvía.</p></article></section>`
  });
}

const pages = new Map([
  ["index.html", home()],
  ["paquetes.html", paquetes()],
  ["pack-total.html", packTotalPage()],
  ["blog.html", blog()],
  ["recursos-gratis.html", recursosGratis()],
  ["premium.html", premium()],
  ["faq.html", faq()],
  ["contacto.html", contacto()]
]);

for (const pack of packDefs) pages.set(pack.page, categoryPage(pack));
for (const [file, html] of pages) await fs.writeFile(path.join(__dirname, file), html, "utf8");

console.log(`Generated ${pages.size} pages`);
