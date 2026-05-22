import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
await import(`file://${path.join(__dirname, "catalog.js")}?v=${Date.now()}`);
const { products, icon } = globalThis.dailyTipsCatalog;

const whatsapp = "https://wa.me/?text=Hola%2C%20tengo%20dudas%20sobre%20un%20paquete%20Daily%20Tips";
const bloggerUrl = "https://dailytipsmx.blogspot.com/";
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

const hookProducts = [
  {
    name: "Control financiero quincenal",
    product: "Control financiero quincenal MX",
    benefit: "Ordena ingresos, gastos y pagos sin perder la quincena.",
    price: "desde $49 MXN"
  },
  {
    name: "Prompts de IA para vender y crear contenido",
    product: "Prompts premium para ChatGPT",
    benefit: "Textos, ideas y respuestas listas para vender mejor.",
    price: "desde $49 MXN"
  },
  {
    name: "Guía para crear tu primera página web con IA",
    product: "Cómo crear páginas web con IA",
    benefit: "Convierte una idea en estructura, textos y publicación.",
    price: "desde $49 MXN"
  },
  {
    name: "Checklist de gastos hormiga",
    product: "Control de gastos hormiga",
    benefit: "Encuentra fugas de dinero pequeñas antes de que pesen.",
    price: "desde $49 MXN"
  },
  {
    name: "Plantilla para organizar pagos y deudas",
    product: "Organizador de pagos",
    benefit: "Evita recargos y ten fechas importantes bajo control.",
    price: "desde $49 MXN"
  }
];

const simpleCategories = [
  ["Dinero y ahorro", "Finanzas personales", "Presupuestos, deudas, pagos y hábitos para cuidar la quincena."],
  ["Ventas y negocio", "Negocios y revendedores", "Inventario, clientes, pedidos y ganancias para vender con orden."],
  ["Inteligencia artificial", "IA para principiantes", "Prompts, guías y herramientas para usar IA sin complicarte."],
  ["Estudio y organización", "Estudiantes", "Tareas, exámenes, horarios y recursos para estudiar mejor."],
  ["Contenido digital", "Creadores de contenido", "Ideas, guiones, calendarios y métricas para publicar con intención."],
  ["Productividad diaria", "Productividad y organización", "Hábitos, enfoque, metas y planeación para avanzar cada semana."]
];

const educationLevels = [
  ["Secundaria", "Ejercicios de matemáticas, español, ciencias, historia, geografía e inglés para reforzar temas clave.", "secundaria", "assets/img/educacion/educacion-ejercicios.png", "Ejercicios escolares para secundaria por materia y tema"],
  ["Preparatoria", "Guías y ejercicios de álgebra, física, química, biología, literatura, filosofía y más.", "preparatoria", "assets/img/educacion/preparatoria-examenes.png", "Guías y simuladores para preparatoria y exámenes"],
  ["Matemáticas", "Fracciones, porcentajes, ecuaciones, geometría, regla de tres y problemas paso a paso.", "matematicas secundaria preparatoria", "assets/img/educacion/matematicas.png", "Ejercicios de matemáticas para secundaria y preparatoria"],
  ["Ciencias", "Biología, física y química con ejercicios por tema, fórmulas, ejemplos y práctica.", "ciencias secundaria preparatoria", "assets/img/educacion/ciencias.png", "Guías de ciencias con biología física y química"],
  ["Español e Inglés", "Comprensión lectora, vocabulario, gramática, redacción y ejercicios de idioma.", "humanidades espanol-e-ingles secundaria preparatoria", "assets/img/educacion/espanol-ingles.png", "Ejercicios de español e inglés con comprensión lectora"],
  ["Exámenes", "Simuladores, bancos de preguntas y ejercicios para prepararte antes de una evaluación.", "examenes", "assets/img/educacion/preparatoria-examenes.png", "Simuladores de examen para secundaria y preparatoria"]
];

const educationSubjects = [
  ["Matemáticas", "Secundaria / Preparatoria", "Fracciones, porcentajes, álgebra, geometría, probabilidad y regla de tres.", "matematicas secundaria preparatoria"],
  ["Español", "Secundaria", "Lectura, ortografía, redacción, comprensión y ejercicios de comunicación.", "humanidades espanol-e-ingles secundaria"],
  ["Física", "Preparatoria", "Velocidad, aceleración, fuerza, energía y leyes de Newton.", "ciencias preparatoria"],
  ["Química", "Preparatoria", "Tabla periódica, enlaces químicos, balanceo y nomenclatura básica.", "ciencias preparatoria"],
  ["Biología", "Secundaria / Preparatoria", "Células, genética, cuerpo humano, ecosistemas y evolución.", "ciencias secundaria preparatoria"],
  ["Historia", "General", "Líneas del tiempo, hechos clave, personajes y procesos históricos.", "humanidades espanol-e-ingles secundaria preparatoria"],
  ["Geografía", "Secundaria", "Mapas, regiones, clima, población y recursos naturales.", "humanidades espanol-e-ingles secundaria"],
  ["Inglés", "General", "Vocabulario, gramática, lectura y práctica de frases.", "humanidades espanol-e-ingles secundaria preparatoria"],
  ["Literatura", "Preparatoria", "Lecturas, análisis, géneros literarios y comprensión de textos.", "humanidades preparatoria"],
  ["Filosofía", "Preparatoria", "Conceptos, corrientes, autores y preguntas guía para estudiar.", "humanidades preparatoria"],
  ["Administración", "General", "Conceptos básicos, organización, procesos y casos prácticos.", "general preparatoria"],
  ["Contabilidad", "General", "Ejercicios de cargos, abonos, cuentas y registros básicos.", "matematicas general"],
  ["Estadística", "General", "Promedios, gráficas, probabilidad y análisis de datos.", "matematicas general"]
];

const educationTopics = [
  ["Matemáticas", ["Fracciones", "Porcentajes", "Ecuaciones", "Regla de tres", "Geometría", "Probabilidad"]],
  ["Física", ["Velocidad", "Aceleración", "Fuerza", "Energía", "Leyes de Newton"]],
  ["Química", ["Tabla periódica", "Enlaces químicos", "Balanceo", "Nomenclatura"]]
];

const educationProducts = [
  ["Ejercicios de fracciones para secundaria", "Desde $29 MXN", "Práctica con fracciones, simplificación, suma, resta, multiplicación y división.", "secundaria matematicas", "assets/img/educacion/matematicas.png", "Ejercicios de fracciones para secundaria"],
  ["Pack Matemáticas Secundaria", "Desde $99 MXN", "Ejercicios por tema: fracciones, porcentajes, ecuaciones, geometría y regla de tres.", "secundaria matematicas", "assets/img/educacion/matematicas.png", "Pack de ejercicios de matemáticas para secundaria"],
  ["Álgebra básica para preparatoria", "Desde $49 MXN", "Operaciones algebraicas, productos notables, factorización y ecuaciones.", "preparatoria matematicas", "assets/img/educacion/matematicas.png", "Álgebra básica para preparatoria con ejercicios"],
  ["Ciencias básicas", "Desde $79 MXN", "Ejercicios de biología, física y química para secundaria y preparatoria.", "preparatoria secundaria ciencias", "assets/img/educacion/ciencias.png", "Ejercicios de ciencias básicas para secundaria y preparatoria"],
  ["Español e Inglés", "Desde $49 MXN", "Comprensión lectora, gramática, vocabulario y redacción.", "humanidades espanol-e-ingles secundaria preparatoria", "assets/img/educacion/espanol-ingles.png", "Ejercicios de español e inglés para estudiar"],
  ["Simulador de examen", "Desde $59 MXN", "Banco de preguntas con respuestas para practicar antes de un examen.", "examenes secundaria preparatoria", "assets/img/educacion/preparatoria-examenes.png", "Simulador de examen escolar con banco de preguntas"]
];

const productImages = {
  dinero: ["assets/img/productos/dinero-ahorro.png", "Plantillas para organizar dinero y ahorro"],
  ia: ["assets/img/productos/ia-facil.png", "Recursos de inteligencia artificial para emprendedores"],
  negocio: ["assets/img/productos/ventas-negocio.png", "Recursos digitales para ventas y negocio"],
  contenido: ["assets/img/productos/contenido-digital.png", "Plantillas para contenido digital y redes sociales"],
  reset: ["assets/img/productos/productividad.png", "Recursos de productividad diaria y organización"],
  total: ["assets/img/productos/pack-total.png", "Pack completo de recursos digitales DailyTips"],
  educacion: ["assets/img/educacion/educacion-ejercicios.png", "Pack educación con ejercicios escolares por materia"]
};

const educationPack = {
  id: "educacion",
  name: "Pack Educación",
  page: "educacion.html#pack-educacion",
  price: "Desde $199 MXN",
  headline: "Ejercicios por materia para secundaria, preparatoria, regularización y preparación de exámenes.",
  bullets: ["Matemáticas", "Ciencias", "Español e Inglés", "Exámenes de práctica", "Guías por tema", "Ejercicios descargables"],
  image: "assets/img/educacion/educacion-ejercicios.png",
  alt: "Pack educación con ejercicios escolares descargables"
};

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
  <link rel="icon" href="assets/dailytips-logo-cropped.png">
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <script src="catalog.js" defer></script>
  <script src="app.js" defer></script>
  ${extraHead}
</head>
<body data-page="${active}">
  <div class="ambient ambient--one"></div>
  <div class="ambient ambient--two"></div>
  <div class="site-announcement"><span aria-hidden="true">↓</span> Recursos digitales y ejercicios listos para descargar</div>
  <header class="topbar">
    <a class="brand" href="index.html" aria-label="Daily Tips inicio"><img class="brand-logo" src="assets/dailytips-logo-cropped.png" alt="DailyTips recursos digitales"><span>Daily Tips</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menú</button>
    <nav id="primary-nav" aria-label="Principal">
      <a class="${active === "index" ? "is-active" : ""}" href="index.html">Inicio</a>
      <div class="nav-dropdown">
        <button class="${active.startsWith("categoria") || packDefs.some((pack) => pack.id === active) || active === "paquetes" ? "is-active" : ""}" type="button">Productos</button>
        <div class="mega-menu mega-menu--compact">
          ${[
            ["Dinero y Ahorro", "dinero-ahorro.html"],
            ["IA Fácil", "ia-facil.html"],
            ["Ventas y Negocio", "negocio-inteligente.html"],
            ["Contenido Digital", "contenido-viral.html"],
            ["Productividad", "reset-productivo.html"],
            ["Todos los productos", "paquetes.html"]
          ].map(([label, href]) => `<a class="mega-link" href="${href}">${label}</a>`).join("")}
        </div>
      </div>
      <div class="nav-dropdown">
        <button class="${active === "educacion" ? "is-active" : ""}" type="button">Educación</button>
        <div class="mega-menu mega-menu--compact">
          ${[
            ["Educación y Ejercicios", "educacion.html"],
            ["Secundaria", "educacion.html#materias"],
            ["Preparatoria", "educacion.html#materias"],
            ["Matemáticas", "educacion.html#materias"],
            ["Ciencias", "educacion.html#materias"],
            ["Español e Inglés", "educacion.html#materias"],
            ["Exámenes", "educacion.html#ejercicios"],
            ["Regularización", "educacion.html#materias"]
          ].map(([label, href]) => `<a class="mega-link" href="${href}">${label}</a>`).join("")}
        </div>
      </div>
      <a class="${active === "recursos-gratis" ? "is-active" : ""}" href="recursos-gratis.html">Gratis</a>
      <a class="${active === "blog" ? "is-active" : ""}" href="${bloggerUrl}" target="_blank" rel="noopener">Blog</a>
      <a class="${active === "premium" ? "is-active" : ""}" href="premium.html">Acceso</a>
      <a class="nav-cta" href="${packTotal.gumroad}" target="_blank" rel="noopener">${cartIcon()} Comprar Pack Completo</a>
    </nav>
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
  const [image, alt] = packImage(pack);
  return `<article class="pack-card ${total ? "pack-card--total" : ""}">
    <span class="pill">${pack.badge}</span>
    <img class="pack-image" src="${image}" alt="${alt}" loading="lazy">
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
      <a class="text-link" href="${bloggerUrl}" target="_blank" rel="noopener">Leer en Blogger</a>
    </div>
  </article>`).join("");
}

function slug(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function cartIcon() {
  return `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"></circle><circle cx="18" cy="20" r="1.5"></circle><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H7"></path></svg>`;
}

function packImage(pack) {
  return productImages[pack.id] ?? productImages.total;
}

function visualProductCard(product) {
  const pack = packForCategory(product.category);
  const [image, alt] = packImage(pack);
  return `<article class="visual-card">
    <img src="${image}" alt="${alt}" loading="lazy">
    <div>
      <span class="pill">${product.category}</span>
      <h3>${product.name}</h3>
      <p>${product.desc}</p>
      <strong>${product.tag === "Gratis" ? "Gratis" : "Desde $49 MXN"}</strong>
      <div class="card-actions">
        <a class="button" href="${pack.gumroad}" target="_blank" rel="noopener">Comprar</a>
        <a class="button button--ghost" href="${productPageSlug(product)}">Ver detalles</a>
      </div>
    </div>
  </article>`;
}

function whatImproveCard([label, href, text]) {
  return `<a class="choice-card" href="${href}">
    <strong>${label}</strong>
    <span>${text}</span>
  </a>`;
}

function educationHomeCard([title, text, tag, image, alt]) {
  const label = title === "Español e Inglés" ? "Idiomas" : title;
  return `<article class="education-card" data-education-tags="${tag}">
    <img src="${image}" alt="${alt}" loading="lazy">
    <div>
      <span class="icon-badge">${title.slice(0, 2).toUpperCase()}</span>
      <span class="pill">${label}</span>
      <h3>${title}</h3>
      <p>${text}</p>
      <div class="card-actions">
        <a class="button button--ghost" href="educacion.html#ejercicios">Ver ejercicios</a>
        <a class="text-link" href="${whatsapp}" target="_blank" rel="noopener">Preguntar por WhatsApp</a>
      </div>
    </div>
  </article>`;
}

function educationPackCard() {
  return `<article class="pack-card pack-card--education" id="pack-educacion">
    <span class="pill">Nuevo</span>
    <img class="pack-image" src="${educationPack.image}" alt="${educationPack.alt}" loading="lazy">
    <h3>${educationPack.name}</h3>
    <p>${educationPack.headline}</p>
    <div class="price"><strong>${educationPack.price}</strong><span>paquete educativo</span></div>
    <ul>${educationPack.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>
    <div class="pack-actions">
      <a class="button button--ghost" href="educacion.html#ejercicios">Ver Pack Educación</a>
      <a class="button" href="${whatsapp}" target="_blank" rel="noopener">Preguntar por WhatsApp</a>
    </div>
    <!-- TODO: Agregar enlace real de Gumroad para Pack Educación cuando exista. -->
  </article>`;
}

function home() {
  const best = products.filter((product) => product.tag === "Más vendido").slice(0, 4);
  return layout({
    title: "DailyTips | Productos digitales, plantillas y ejercicios escolares",
    description: "Compra productos digitales, plantillas, guías y ejercicios escolares para organizar tu dinero, vender mejor, usar IA y estudiar por materia en secundaria y preparatoria.",
    active: "index",
    body: `
    <section class="hero hero-commercial hero-atelier">
      <div class="hero__copy">
        <h1>Archivos digitales y ejercicios listos para organizarte, vender mejor y estudiar con claridad.</h1>
        <p class="lead">Plantillas, guías, recursos de IA y ejercicios escolares para secundaria, preparatoria, negocio y vida diaria.</p>
        <div class="hero__actions">
          <a class="button" href="#productos">Ver productos</a>
          <a class="button button--ghost" href="#educacion-ejercicios">Ver educación</a>
          <a class="button button--yellow" href="${packTotal.gumroad}" target="_blank" rel="noopener">${cartIcon()} Comprar Pack Completo</a>
        </div>
        <div class="trust"><span>Pago único</span><span>Acceso digital</span><span>Soporte por WhatsApp</span><span>Compatible con celular y computadora</span></div>
      </div>
      <figure class="hero-media">
        <img src="assets/img/educacion/educacion-ejercicios.png" alt="DailyTips productos digitales, ejercicios escolares, guías y recursos descargables">
      </figure>
    </section>
    <section class="section quick-choices">
      <div class="section__title"><h2>¿Qué quieres mejorar hoy?</h2><p>Elige un camino claro y llega rápido al recurso que necesitas.</p></div>
      <div class="choice-grid">${[
        ["Organizar mi dinero", "dinero-ahorro.html", "Presupuesto, ahorro y gastos."],
        ["Vender mejor", "negocio-inteligente.html", "Clientes, inventario y ganancias."],
        ["Usar IA", "ia-facil.html", "Prompts y guías prácticas."],
        ["Crear contenido", "contenido-viral.html", "Ideas, hooks y guiones."],
        ["Estudiar mejor", "reset-productivo.html", "Rutinas, tareas y enfoque."],
        ["Practicar ejercicios escolares", "educacion.html", "Materias, temas y exámenes."]
      ].map(whatImproveCard).join("")}</div>
    </section>
    <section class="section" id="productos">
      <div class="section__title"><p class="eyebrow">Más vendidos</p><h2>Productos digitales fáciles de entender y comprar.</h2><p>Plantillas digitales, recursos de IA, guías escolares digitales y herramientas para resolver problemas reales.</p></div>
      <div class="visual-grid">${best.map(visualProductCard).join("")}</div>
    </section>
    <section class="section education-preview" id="educacion-ejercicios">
      <div class="education-preview__copy">
        <h2>Educación y Ejercicios</h2>
        <p>Ejercicios prácticos por materia, nivel y tema para secundaria, preparatoria, regularización y preparación de exámenes.</p>
        <p>Encuentra materiales digitales listos para aprender, practicar, imprimir o resolver desde tu dispositivo. Ideal para estudiantes, padres, maestros y personas que quieren reforzar conocimientos.</p>
        <div class="hero__actions"><a class="button" href="educacion.html">Ver educación</a><a class="button button--ghost" href="${whatsapp}" target="_blank" rel="noopener">Preguntar por WhatsApp</a></div>
      </div>
      ${educationFilters()}
      <div class="education-home-grid">${educationLevels.map(educationHomeCard).join("")}</div>
    </section>
    <section class="section" id="ejercicios-destacados">
      <div class="section__title"><p class="eyebrow">Ejercicios destacados</p><h2>Material escolar de entrada para vender por Facebook y WhatsApp.</h2></div>
      ${educationFilters()}
      <div class="edu-product-grid">${educationProducts.map(educationProductCard).join("")}</div>
    </section>
    <section class="section" id="paquetes">
      <div class="section__title"><p class="eyebrow">Paquetes destacados</p><h2>Compra por tema o llévate todo.</h2></div>
      <div class="pack-grid">${packDefs.slice(0, 3).map((pack) => packCard(pack)).join("")}${educationPackCard()}${packCard(packTotal, true)}</div>
    </section>
    <section class="section lead-free">
      <div><p class="eyebrow">Recurso gratis</p><h2>Empieza con una descarga puntual.</h2><p>Usa un recurso gratuito para resolver algo pequeño y conocer el estilo DailyTips.</p></div>
      <div class="hero__actions"><a class="button" href="daily_tips_gratis_30_gastos_quincena.xlsx" download>Descargar recurso gratis</a><a class="button button--ghost" href="recursos-gratis.html">Ver más gratis</a></div>
    </section>
    ${howReceive()}
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
  const pack = packForCategory(product.category);
  const [image, alt] = packImage(pack);
  return `<a class="product-card" href="${productPageSlug(product)}">
    <img src="${image}" alt="${alt}" loading="lazy">
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
    title: "Blog Daily Tips | Blogger oficial",
    description: "Blog oficial de DailyTips en Blogger con contenido sobre productos digitales, educación, finanzas, IA y productividad.",
    active: "blog",
    body: `<section class="page-hero"><p class="eyebrow">Blog oficial</p><h1>El blog de DailyTips ahora está en Blogger.</h1><p>Usa este acceso para leer publicaciones, compartir contenido en Facebook y traer tráfico hacia tus productos digitales.</p><div class="hero__actions"><a class="button" href="${bloggerUrl}" target="_blank" rel="noopener">Abrir blog en Blogger</a><a class="button button--ghost" href="index.html#productos">Ver productos</a></div></section>`
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
  const pack = packForCategory(doc.category);
  const [image, alt] = packImage(pack);
  return `<article class="free-card">
    <img src="${image}" alt="${alt}" loading="lazy">
    <span>${doc.category}</span>
    <h3>${doc.title}</h3>
    <p>${doc.problem}</p>
    <a class="button button--ghost" href="${doc.file}" download>${doc.CTA}</a>
  </article>`;
}

function hookProductCard(item) {
  const product = products.find((entry) => entry.name === item.product);
  const pack = product ? packForCategory(product.category) : packTotal;
  return `<article class="hook-card">
    <span>${item.price}</span>
    <h3>${item.name}</h3>
    <p>${item.benefit}</p>
    <div class="hook-actions"><a class="button" href="${pack.gumroad}" target="_blank" rel="noopener">Comprar</a><a class="text-link" href="${whatsapp}" target="_blank" rel="noopener">WhatsApp</a></div>
  </article>`;
}

function educationLevelCard([title, text, tag, image, alt]) {
  return `<article class="education-level-card" data-education-tags="${tag}">
    <img src="${image}" alt="${alt}" loading="lazy">
    <span>${title}</span>
    <p>${text}</p>
  </article>`;
}

function educationSubjectCard([name, level, text, tags]) {
  return `<article class="subject-card" data-education-tags="${tags}">
    <span>${level}</span>
    <h3>${name}</h3>
    <p>${text}</p>
    <a class="button button--ghost" href="educacion.html#temas">Ver temas</a>
  </article>`;
}

function educationProductCard([name, price, text, tags, image, alt]) {
  return `<article class="edu-product-card" data-education-tags="${tags}">
    <img src="${image}" alt="${alt}" loading="lazy">
    <span>${price}</span>
    <h3>${name}</h3>
    <p>${text}</p>
    <div class="hook-actions">
      <!-- TODO: reemplazar # con el enlace real de Gumroad o descarga para ${name}. -->
      <a class="button" href="#">Comprar</a>
      <a class="button button--ghost" href="educacion.html#temas">Ver detalles</a>
      <a class="text-link" href="${whatsapp}" target="_blank" rel="noopener">Preguntar por WhatsApp</a>
    </div>
  </article>`;
}

function educationFilters() {
  return `<div class="education-filters" aria-label="Filtros de educación">
    ${["Todos", "Secundaria", "Preparatoria", "Matemáticas", "Ciencias", "Español e Inglés", "Exámenes"].map((filter, index) => `<button class="${index === 0 ? "is-active" : ""}" type="button" data-education-filter="${slug(filter)}">${filter}</button>`).join("")}
  </div>`;
}

function educacion() {
  return layout({
    title: "Educación y Ejercicios | DailyTips",
    description: "Ejercicios escolares, ejercicios de secundaria, ejercicios de preparatoria, ejercicios de matemáticas y guías escolares digitales por materia y tema.",
    active: "educacion",
    body: `<section class="hero hero-commercial education-hero">
      <div class="hero__copy">
        <h1>Ejercicios escolares por materia y tema</h1>
        <p class="lead">Practica matemáticas, ciencias, español, historia, inglés y más con guías y ejercicios descargables para secundaria y preparatoria.</p>
        <div class="hero__actions"><a class="button" href="#materias">Ver materias</a><a class="button button--ghost" href="#ejercicios">Ver paquetes</a><a class="button button--light" href="${whatsapp}" target="_blank" rel="noopener">Preguntar por WhatsApp</a></div>
      </div>
      <figure class="hero-media"><img src="assets/img/educacion/educacion-ejercicios.png" alt="Educación y ejercicios escolares por materia nivel y tema para secundaria y preparatoria"></figure>
    </section>
    <section class="section"><div class="section__title"><p class="eyebrow">Por nivel</p><h2>Material para estudiar a tu ritmo.</h2></div><div class="education-level-grid">${educationLevels.map(educationLevelCard).join("")}</div></section>
    <section class="section" id="materias"><div class="section__title"><p class="eyebrow">Explora por materia</p><h2>Ejercicios de secundaria, preparatoria y estudio general.</h2></div>${educationFilters()}<div class="subject-grid">${educationSubjects.map(educationSubjectCard).join("")}</div></section>
    <section class="section" id="temas"><div class="section__title"><p class="eyebrow">Por tema</p><h2>Temas escolares listos para practicar.</h2></div><div class="topic-grid">${educationTopics.map(([subject, topics]) => `<article class="topic-card"><h3>${subject}</h3><div>${topics.map((topic) => `<span>${topic}</span>`).join("")}</div></article>`).join("")}</div></section>
    <section class="section" id="ejercicios"><div class="section__title"><p class="eyebrow">Ejercicios destacados</p><h2>Productos educativos de entrada.</h2></div>${educationFilters()}<div class="edu-product-grid">${educationProducts.map(educationProductCard).join("")}</div></section>
    <section class="section audience-section"><div class="section__title"><p class="eyebrow">Para quién es</p><h2>Recursos para aprender, enseñar o prepararte mejor.</h2></div><div class="audience-list">${["estudiantes", "padres", "maestros", "personas en regularización", "personas que preparan exámenes"].map((item) => `<span>${item}</span>`).join("")}</div></section>
    <section class="section process-section"><div class="section__title"><p class="eyebrow">Cómo funciona</p><h2>Estudia en 3 pasos.</h2></div><div class="process-grid"><article><span>1</span><strong>Elige la materia</strong></article><article><span>2</span><strong>Descarga el recurso</strong></article><article><span>3</span><strong>Practica a tu ritmo</strong></article></div></section>
    <section class="section faq-section"><div class="section__title"><p class="eyebrow">Preguntas frecuentes</p><h2>Dudas sobre los ejercicios.</h2></div><div class="faq-grid"><details open><summary>¿Los ejercicios incluyen respuestas?</summary><p>La idea es vender cuadernillos con respuestas o guía de solución cuando el producto lo indique.</p></details><details><summary>¿Puedo imprimirlos?</summary><p>Sí, estarán pensados para descargar, imprimir o resolver desde el dispositivo.</p></details><details><summary>¿Son para secundaria o preparatoria?</summary><p>Habrá recursos para secundaria, preparatoria, exámenes y regularización.</p></details><details><summary>¿Puedo usarlos desde el celular?</summary><p>Sí, aunque para resolver ejercicios largos se recomienda tablet o computadora.</p></details><details><summary>¿Cómo recibo el archivo?</summary><p>Cuando agregues el enlace real de compra, Gumroad o tu sistema de entrega enviará el archivo automáticamente.</p></details></div></section>`
  });
}

function articleCard(article) {
  return `<article class="article-card">
    <div class="article-image ${article.image}"><span>${article.category}</span></div>
    <div class="article-body"><span class="article-category">${article.category}</span><h3>${article.title}</h3><p>${article.excerpt}</p><a class="text-link" href="${bloggerUrl}" target="_blank" rel="noopener">Leer en Blogger</a></div>
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
  return `<section class="section process-section"><div class="section__title"><p class="eyebrow">Cómo funciona</p><h2>Compra simple en 3 pasos.</h2></div><div class="process-grid"><article><span>1</span><strong>Elige tu recurso o paquete</strong></article><article><span>2</span><strong>Realiza tu pago de forma segura</strong></article><article><span>3</span><strong>Recibe el archivo y empieza a usarlo</strong></article></div></section>`;
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
  ["educacion.html", educacion()],
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
