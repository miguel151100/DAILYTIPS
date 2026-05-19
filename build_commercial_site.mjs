import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
await import(`file://${path.join(__dirname, "catalog.js")}?v=${Date.now()}`);
const { products, icon } = globalThis.dailyTipsCatalog;

const whatsapp = "https://wa.me/?text=Hola%2C%20tengo%20dudas%20sobre%20un%20paquete%20Daily%20Tips";
const gumroadLinks = {
  total: "https://gumroad.com/l/dailytips-pack-total",
  dinero: "https://gumroad.com/l/pack-dinero-ahorro",
  ia: "https://gumroad.com/l/pack-ia-facil",
  negocio: "https://gumroad.com/l/pack-negocio-inteligente",
  contenido: "https://gumroad.com/l/pack-contenido-viral",
  reset: "https://gumroad.com/l/pack-reset-productivo"
};
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
    gumroad: gumroadLinks.dinero,
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
    gumroad: gumroadLinks.ia,
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
    gumroad: gumroadLinks.negocio,
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
    gumroad: gumroadLinks.contenido,
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
    gumroad: gumroadLinks.reset,
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
  emotional: "La forma más completa de vender, organizar, estudiar, crear contenido y resolver problemas diarios con herramientas digitales listas.",
  gumroad: gumroadLinks.total
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

const freeDocs = [
  {
    title: "Checklist: 30 gastos que se comen tu quincena",
    problem: "Para detectar fugas de dinero en menos de 10 minutos.",
    file: "daily_tips_gratis_30_gastos_quincena.xlsx",
    category: "Finanzas personales",
    CTA: "Descargar checklist"
  },
  {
    title: "Calculadora gratis de ganancia real",
    problem: "Para saber si un producto deja utilidad después de comisión, envío y descuento.",
    file: "daily_tips_calculadora_ganancias.xlsx",
    category: "Negocios y revendedores",
    CTA: "Calcular ganancia"
  },
  {
    title: "Lista rápida de herramientas IA útiles",
    problem: "Para empezar con IA sin perderte entre apps que no necesitas.",
    file: "daily_tips_herramientas_ia_utiles.xlsx",
    category: "IA para principiantes",
    CTA: "Ver herramientas"
  },
  {
    title: "Mini planeador de tareas escolares",
    problem: "Para organizar entregas, materias y pendientes de la semana.",
    file: "daily_tips_planeador_tareas.xlsx",
    category: "Estudiantes",
    CTA: "Organizar tareas"
  },
  {
    title: "Control express de suscripciones",
    problem: "Para encontrar cobros mensuales que ya no usas.",
    file: "daily_tips_control_suscripciones.xlsx",
    category: "Finanzas personales",
    CTA: "Revisar cobros"
  },
  {
    title: "Despensa por quincena MX",
    problem: "Para planear compras de súper sin romper el presupuesto.",
    file: "daily_tips_despensa_por_quincena.xlsx",
    category: "Productividad y organización",
    CTA: "Planear despensa"
  }
];

function byPack(pack) {
  return products.filter((product) => {
    if (pack.category) return product.category === pack.category;
    return pack.categories.includes(product.category);
  });
}

function packForCategory(category) {
  return packDefs.find((pack) => pack.category === category || pack.categories?.includes(category)) ?? packDefs[0];
}

function categoryPageSlug(category) {
  return `categoria-${slug(category)}.html`;
}

function productPageSlug(product) {
  return `archivo-${slug(product.name)}.html`;
}

function money(value) {
  return `$${value.toLocaleString("es-MX")} MXN`;
}

function layout({ title, description, active, body, extraHead = "" }) {
  const categoryGroups = globalThis.dailyTipsCatalog.categoryMeta.filter(([name]) => name !== "Todos");
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
      <a class="${active === "index" ? "is-active" : ""}" href="index.html">Home</a>
      <div class="nav-dropdown">
        <button class="${active.startsWith("categoria") ? "is-active" : ""}" type="button">Categorías</button>
        <div class="mega-menu">
          ${categoryGroups.map(([name, tagline]) => {
            const items = products.filter((product) => product.category === name);
            return `<section class="mega-group">
              <a class="mega-title" href="${categoryPageSlug(name)}">${name}</a>
              <p>${tagline}</p>
              ${items.map((product) => `<a class="mega-item" href="${productPageSlug(product)}">${product.name}</a>`).join("")}
            </section>`;
          }).join("")}
        </div>
      </div>
      <a class="${active === "paquetes" ? "is-active" : ""}" href="paquetes.html">Paquetes</a>
      <a class="${active === "pack-total" ? "is-active" : ""}" href="pack-total.html">Pack Total</a>
      <a class="${active === "recursos-gratis" ? "is-active" : ""}" href="recursos-gratis.html">Gratis</a>
      <a class="${active === "blog" ? "is-active" : ""}" href="blog.html">Blog</a>
      <a class="${active === "premium" ? "is-active" : ""}" href="premium.html">Acceso</a>
    </nav>
    <a class="topbar-cta" href="${packTotal.gumroad}" target="_blank" rel="noopener">Comprar Pack Total</a>
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
    <div class="mock-window"><div class="mock-toolbar"><span></span><span></span><span></span></div><div class="mock-kpi"><strong>Daily Tips</strong><em>MX</em></div><div class="mock-chart"></div><div class="mock-lines"></div></div>
  </div>`;
}

function productMini(product) {
  return `<a class="mini-product" href="${productPageSlug(product)}">
    <span class="icon-badge">${icon(product.icon)}</span>
    <div><strong>${product.name}</strong><p>${product.benefit}</p></div>
  </a>`;
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
      <a class="button" href="${pack.gumroad}" target="_blank" rel="noopener">Comprar ahora</a>
      <a class="button button--ghost" href="${whatsapp}" target="_blank" rel="noopener">Dudas por WhatsApp</a>
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
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function home() {
  const best = products.filter((product) => product.tag === "Más vendido").slice(0, 4);
  return layout({
    title: "Daily Tips | Productos digitales para vender, ahorrar y organizarte",
    description: "Paquetes digitales por categoría y DAILYTIPS Pack Total para México.",
    active: "index",
    body: `
    <section class="hero hero-commercial hero-atelier">
      <div class="hero__copy">
        <p class="eyebrow">Biblioteca digital para la vida real en México</p>
        <h1>Herramientas listas para ordenar dinero, ventas, estudio y contenido.</h1>
        <p class="lead">Daily Tips funciona como una colección curada de archivos prácticos: cada paquete resuelve un problema concreto, se compra en Gumroad y se recibe automáticamente por correo.</p>
        <div class="hero__actions">
          <a class="button" href="${packTotal.gumroad}" target="_blank" rel="noopener">Comprar ahora</a>
          <a class="button button--ghost" href="recursos-gratis.html">Probar gratis</a>
        </div>
        <div class="trust"><span>48 archivos</span><span>6 categorías</span><span>Entrega Gumroad</span><span>Recursos gratis</span></div>
      </div>
      ${mockup("grad-total")}
    </section>
    <section class="section">
      <div class="section__title"><p class="eyebrow">Categorías</p><h2>Entra por el problema que quieres resolver.</h2></div>
      <div class="category-showcase">${globalThis.dailyTipsCatalog.categoryMeta.filter(([name]) => name !== "Todos").map(([name, tagline]) => {
        const pack = packForCategory(name);
        return `<a class="category-tile ${pack.gradient}" href="${categoryPageSlug(name)}"><span>${byPack(pack).length} archivos</span><strong>${name}</strong><p>${tagline}</p></a>`;
      }).join("")}</div>
    </section>
    <section class="section free-strip">
      <div class="section__title"><p class="eyebrow">Gratis para atraer compradores</p><h2>Recursos puntuales para publicar en Facebook.</h2></div>
      <div class="free-grid">${freeDocs.slice(0, 3).map(freeDocCard).join("")}</div>
    </section>
    <section class="section">
      <div class="section__title"><p class="eyebrow">Más vendidos</p><h2>Los productos más fáciles de convertir desde Facebook.</h2></div>
      <div class="mini-grid">${best.map(productMini).join("")}</div>
    </section>
    <section class="section">
      <div class="section__title"><p class="eyebrow">Paquetes destacados</p><h2>Vende por categoría o sube el ticket con el Pack Total.</h2></div>
      <div class="pack-grid">${packDefs.slice(0, 3).map((pack) => packCard(pack)).join("")}${packCard(packTotal, true)}</div>
    </section>
    ${howReceive()}
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
    ${howReceive()}
    <section class="section lead-free"><div><p class="eyebrow">Recomendado</p><h2>Si dudas, ofrece primero Pack Total.</h2><p>El valor percibido es mayor, simplifica la entrega y convierte mejor cuando el cliente quiere “todo”.</p></div><a class="button" href="${packTotal.gumroad}" target="_blank" rel="noopener">Comprar ahora</a></section>`
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
        <div class="hero__actions"><a class="button" href="${packTotal.gumroad}" target="_blank" rel="noopener">Comprar ahora</a><a class="button button--ghost" href="${whatsapp}" target="_blank" rel="noopener">Dudas por WhatsApp</a></div>
      </div>
      ${mockup("grad-total")}
    </section>
    <section class="section"><div class="section__title"><p class="eyebrow">Todo lo que incluye</p><h2>48 archivos en 6 áreas de alto interés.</h2></div><div class="category-showcase">${packDefs.map((pack) => `<a class="category-tile ${pack.gradient}" href="${pack.page}"><span>${byPack(pack).length} archivos</span><strong>${pack.name}</strong><p>${pack.headline}</p></a>`).join("")}</div></section>
    <section class="section compare-section"><div class="section__title"><p class="eyebrow">Comparación de valor</p><h2>Comprar por separado cuesta más.</h2></div><div class="value-grid"><article><strong>${money(individual)}</strong><span>Comprando paquetes por separado</span></article><article><strong>${money(packTotal.price)}</strong><span>Pack Total lanzamiento</span></article><article><strong>${money(individual - packTotal.price)}</strong><span>Ahorro estimado</span></article></div></section>
    <section class="section"><div class="section__title"><p class="eyebrow">Beneficios</p><h2>Diseñado para compradores de Facebook.</h2></div><div class="benefit-grid"><article>Pago seguro en Gumroad</article><article>Entrega automática por correo</article><article>Productos por categorías claras</article><article>Archivos editables en Excel</article></div></section>
    ${howReceive()}
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
      <div class="hero__copy"><span class="pill">${pack.badge}</span><h1>${pack.name}</h1><p class="lead">${pack.emotional}</p><div class="price hero-price"><strong>${money(pack.price)}</strong><span>normal ${money(pack.normal)}</span></div><div class="hero__actions"><a class="button" href="${pack.gumroad}" target="_blank" rel="noopener">Comprar ahora</a><a class="button button--ghost" href="${whatsapp}" target="_blank" rel="noopener">Dudas por WhatsApp</a></div></div>
      ${mockup(pack.gradient)}
    </section>
    <section class="section"><div class="section__title"><p class="eyebrow">Archivos incluidos</p><h2>${items.length} herramientas para resolver este problema.</h2></div><div class="mini-grid">${items.map(productMini).join("")}</div></section>
    <section class="section"><div class="section__title"><p class="eyebrow">Artículos relacionados</p><h2>Contenido para atraer tráfico a este paquete.</h2></div><div class="article-grid">${related.length ? related.map((article) => blogCards(articles.indexOf(article) + 1).split("</article>").slice(-2, -1)[0] + "</article>").join("") : blogCards(2)}</div></section>
    ${howReceive()}
    <section class="section lead-free"><div><p class="eyebrow">Recomendación</p><h2>Si quieres más valor, compra Pack Total.</h2><p>Incluye este paquete y todos los demás por un precio más conveniente.</p></div><div class="hero__actions"><a class="button" href="${packTotal.gumroad}" target="_blank" rel="noopener">Comprar ahora</a><a class="button button--ghost" href="${whatsapp}" target="_blank" rel="noopener">Dudas por WhatsApp</a></div></section>`
  });
}

function categoryLanding(category) {
  const items = products.filter((product) => product.category === category);
  const pack = packForCategory(category);
  const related = articles.filter((article) => article.category === category || article.pack === pack.name);
  return layout({
    title: `${category} | Categoría Daily Tips`,
    description: `Archivos digitales de Daily Tips para ${category}.`,
    active: `categoria-${slug(category)}`,
    body: `<section class="page-hero category-hero">
      <p class="eyebrow">Categoría Daily Tips</p>
      <h1>${category}</h1>
      <p>${globalThis.dailyTipsCatalog.categoryMeta.find(([name]) => name === category)?.[1] ?? pack.headline}</p>
      <div class="hero__actions"><a class="button" href="${pack.gumroad}" target="_blank" rel="noopener">Comprar paquete relacionado</a><a class="button button--ghost" href="recursos-gratis.html">Ver recursos gratis</a></div>
    </section>
    <section class="section product-index">
      <div class="section__title"><p class="eyebrow">Temas y archivos</p><h2>Cada archivo tiene su propia página con explicación.</h2></div>
      <div class="product-page-grid">${items.map(productCard).join("")}</div>
    </section>
    <section class="section"><div class="section__title"><p class="eyebrow">Artículos para tráfico</p><h2>Ideas conectadas a esta categoría.</h2></div><div class="article-grid">${related.length ? related.map(articleCard).join("") : blogCards(2)}</div></section>
    <section class="section lead-free"><div><p class="eyebrow">Paquete recomendado</p><h2>${pack.name}</h2><p>${pack.headline}</p></div><div class="hero__actions"><a class="button" href="${pack.gumroad}" target="_blank" rel="noopener">Comprar ahora</a><a class="button button--ghost" href="${pack.page}">Ver paquete</a></div></section>`
  });
}

function productCard(product) {
  return `<a class="product-card" href="${productPageSlug(product)}">
    <span class="icon-badge">${icon(product.icon)}</span>
    <span class="pill">${product.tag}</span>
    <h3>${product.name}</h3>
    <p>${product.desc}</p>
    <strong>${product.benefit}</strong>
  </a>`;
}

function productPage(product) {
  const pack = packForCategory(product.category);
  const siblings = products.filter((item) => item.category === product.category && item.name !== product.name).slice(0, 3);
  return layout({
    title: `${product.name} | Daily Tips`,
    description: product.desc,
    active: `archivo-${slug(product.name)}`,
    body: `<section class="hero hero-commercial product-hero">
      <div class="hero__copy">
        <p class="eyebrow">${product.category}</p>
        <h1>${product.name}</h1>
        <p class="lead">${product.desc}</p>
        <div class="proof-list"><span>${product.tag}</span><span>${product.benefit}</span><span>Archivo editable</span></div>
        <div class="hero__actions"><a class="button" href="${pack.gumroad}" target="_blank" rel="noopener">Comprar paquete</a><a class="button button--ghost" href="${whatsapp}" target="_blank" rel="noopener">Dudas por WhatsApp</a></div>
      </div>
      ${mockup(pack.gradient)}
    </section>
    <section class="section product-detail">
      <div class="detail-panel"><p class="eyebrow">Para qué sirve</p><h2>Una herramienta concreta, sin explicar de más.</h2><p>${product.benefit} El archivo está pensado para llenar datos simples y revisar el resultado sin tener que construir nada desde cero.</p></div>
      <div class="detail-panel"><p class="eyebrow">Cómo usarlo</p><ol><li>Abre el archivo en Excel o una app compatible.</li><li>Llena las celdas editables con tus datos.</li><li>Revisa el resumen, semáforos o pendientes.</li><li>Actualízalo cada semana o quincena.</li></ol></div>
    </section>
    <section class="section"><div class="section__title"><p class="eyebrow">Más de ${product.category}</p><h2>Archivos relacionados.</h2></div><div class="mini-grid">${siblings.map(productMini).join("")}</div></section>
    <section class="section lead-free"><div><p class="eyebrow">Incluido en</p><h2>${pack.name}</h2><p>${pack.headline}</p></div><div class="hero__actions"><a class="button" href="${pack.gumroad}" target="_blank" rel="noopener">Comprar ahora</a><a class="button button--ghost" href="${pack.page}">Ver paquete</a></div></section>`
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
  return layout({
    title: "Recursos gratis Daily Tips | Captura leads",
    description: "Herramientas gratuitas para captar correo o WhatsApp antes de vender.",
    active: "recursos-gratis",
    body: `<section class="page-hero free-hero"><p class="eyebrow">Documentos gratis</p><h1>Recursos puntuales para llamar la atención desde Facebook.</h1><p>Cada descarga resuelve un problema pequeño y abre la puerta a vender el paquete completo.</p></section>
    <section class="section newsletter"><div><h2>Recibe recursos y novedades</h2><p>Formulario demostrativo para captar correo o WhatsApp antes de entregar descargas.</p></div><form class="newsletter-form"><input type="email" placeholder="Correo"><input type="tel" placeholder="WhatsApp"><button>Quiero recursos gratis</button></form></section>
    <section class="section"><div class="free-grid">${freeDocs.map(freeDocCard).join("")}</div></section>
    <section class="section lead-free"><div><p class="eyebrow">Siguiente paso</p><h2>Después del recurso gratis, ofrece el Pack Total.</h2><p>La estrategia es dar una solución rápida y luego mostrar la biblioteca completa.</p></div><a class="button" href="${packTotal.gumroad}" target="_blank" rel="noopener">Comprar ahora</a></section>`
  });
}

function freeDocCard(doc) {
  return `<article class="free-card">
    <span>${doc.category}</span>
    <h3>${doc.title}</h3>
    <p>${doc.problem}</p>
    <a class="button button--ghost" href="${doc.file}" download>${doc.CTA}</a>
  </article>`;
}

function articleCard(article) {
  return `<article class="article-card">
    <div class="article-image ${article.image}"><span>${article.category}</span></div>
    <div class="article-body"><span class="article-category">${article.category}</span><h3>${article.title}</h3><p>${article.excerpt}</p><a class="text-link" href="blog.html#${slug(article.title)}">Leer artículo</a></div>
  </article>`;
}

function premium() {
  return layout({
    title: "Acceso Premium Daily Tips | Descargas para clientes",
    description: "Zona privada de descargas para clientes Daily Tips.",
    active: "premium",
    body: `<section class="page-hero"><p class="eyebrow">Zona privada</p><h1>Acceso premium para compradores.</h1><p>Contraseña para clientes: <strong>${premiumPassword}</strong></p></section>
    <section id="premium" class="section premium-section"><div class="premium-gate" id="premium-gate"><div><p class="eyebrow">Biblioteca privada</p><h2>Descarga tus archivos comprados.</h2><p>Introduce la contraseña si compraste una versión con acceso privado. En Gumroad la entrega es automática por correo.</p></div><form class="premium-form" id="premium-form"><label for="premium-password">Contraseña</label><input id="premium-password" type="password" placeholder="Contraseña"><button type="submit">Entrar</button><p class="form-error" id="premium-error"></p></form></div><div class="premium-library" id="premium-library" hidden><div class="section__title"><p class="eyebrow">Descargas</p><h2>Biblioteca premium completa.</h2><p>Descarga el ZIP o baja archivos por categoría. Llena las celdas amarillas de cada Excel.</p></div><div class="premium-actions"><a class="button" href="daily_tips_paquete_completo.zip" download>Descargar ZIP completo</a><button class="button button--ghost" id="premium-logout" type="button">Cerrar acceso</button></div><div class="premium-downloads" id="premium-downloads"></div></div></section>`
  });
}

function howReceive() {
  return `<section class="section process-section"><div class="section__title"><p class="eyebrow">Cómo recibes tus archivos</p><h2>Compra simple, entrega automática.</h2></div><div class="process-grid"><article><span>1</span><strong>Eliges tu paquete</strong></article><article><span>2</span><strong>Pagas de forma segura en Gumroad</strong></article><article><span>3</span><strong>Recibes acceso automático por correo</strong></article><article><span>4</span><strong>Descargas tus archivos</strong></article><article><span>5</span><strong>Puedes pedir soporte por WhatsApp</strong></article></div></section>`;
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
    body: `<section class="page-hero"><p class="eyebrow">Contacto y soporte</p><h1>Compra en Gumroad y recibe tus archivos automáticamente.</h1><p>Usa esta página para resolver dudas por WhatsApp o encontrar acceso premium si ya compraste antes.</p><div class="hero__actions"><a class="button" href="${whatsapp}" target="_blank" rel="noopener">Dudas por WhatsApp</a><a class="button button--ghost" href="premium.html">Ir a Premium</a></div></section><section class="section page-grid"><article><h3>Cómo funciona</h3><p>Elige paquete, paga de forma segura en Gumroad y recibe tus archivos automáticamente por correo.</p></article><article><h3>Soporte</h3><p>Envía captura si un archivo no abre o si no encuentras una descarga.</p></article><article><h3>Términos</h3><p>Uso personal. No redistribuir, revender ni compartir contraseña.</p></article><article><h3>Privacidad</h3><p>Los datos de contacto se usan para entrega, soporte y novedades.</p></article><article><h3>Después de comprar</h3><p>Guarda el enlace premium y descarga el ZIP completo como respaldo.</p></article><article><h3>Garantía técnica</h3><p>Si falta un archivo o no descarga, se corrige o se reenvía.</p></article></section>`
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
for (const [category] of globalThis.dailyTipsCatalog.categoryMeta.filter(([name]) => name !== "Todos")) pages.set(categoryPageSlug(category), categoryLanding(category));
for (const product of products) pages.set(productPageSlug(product), productPage(product));
for (const [file, html] of pages) await fs.writeFile(path.join(__dirname, file), html, "utf8");

console.log(`Generated ${pages.size} pages`);
