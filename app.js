(() => {
const { products, categoryMeta, icon, slug } = window.dailyTipsCatalog;

let activeCategory = "Todos";
let query = "";

const productGrid = document.querySelector("#product-grid");
const featuredGrid = document.querySelector("#featured-grid");
const bestSellers = document.querySelector("#best-sellers");
const freeTools = document.querySelector("#free-tools");
const categoryTabs = document.querySelector("#category-tabs");
const blogTabs = document.querySelector("#blog-tabs");
const articleGrid = document.querySelector("#article-grid");
const resultCount = document.querySelector("#result-count");
const searchInput = document.querySelector("#searchInput");
const clearFilters = document.querySelector("#clearFilters");
const totalProducts = document.querySelector("#total-products");
const premiumForm = document.querySelector("#premium-form");
const premiumPassword = document.querySelector("#premium-password");
const premiumError = document.querySelector("#premium-error");
const premiumGate = document.querySelector("#premium-gate");
const premiumLibrary = document.querySelector("#premium-library");
const premiumDownloads = document.querySelector("#premium-downloads");
const premiumLogout = document.querySelector("#premium-logout");

totalProducts.textContent = products.length;

const whatsAppText = encodeURIComponent("Hola, quiero comprar un producto Daily Tips.");
const whatsAppUrl = `https://wa.me/?text=${whatsAppText}`;

const articles = [
  {
    category: "Finanzas personales",
    title: "La quincena no se pierde sola: 7 fugas invisibles que casi nadie cuenta",
    image: "finanzas",
    excerpt: "Una lectura rápida para detectar gastos hormiga, pagos olvidados y decisiones pequeñas que vacían la cartera.",
    body: ["Antes de hacer otro presupuesto, necesitas ver tus fugas reales.", "Empieza por gastos pequeños: Oxxo, delivery, apps, comisiones, café y compras impulsivas.", "Después separa pagos obligatorios como CFE, renta, agua, internet y TDC."],
    products: ["Control financiero quincenal MX", "Control de gastos hormiga", "Organizador de pagos"]
  },
  {
    category: "IA para principiantes",
    title: "5 formas reales de usar ChatGPT si apenas estás empezando",
    image: "ia",
    excerpt: "No necesitas ser experto: puedes crear textos, estudiar, vender, organizar ideas y generar contenido.",
    body: ["La IA funciona mejor cuando le das contexto, objetivo y formato.", "Usa prompts para tareas repetibles: posts, mensajes, resúmenes, guiones y atención a clientes.", "El truco no es usar todas las herramientas, sino elegir una ruta simple."],
    products: ["Prompts premium para ChatGPT", "Herramientas IA más útiles", "IA para negocios pequeños"]
  },
  {
    category: "Negocios y revendedores",
    title: "Cómo saber si tu producto sí deja ganancia antes de venderlo",
    image: "negocio",
    excerpt: "Muchos negocios venden mucho, pero ganan poco por no contar comisiones, envíos y descuentos.",
    body: ["Tu ganancia no es precio menos costo: también entran comisión, entrega, empaque y descuentos.", "Controla inventario y pedidos para no perder dinero en productos lentos.", "Un dashboard simple te dice qué vender más y qué pausar."],
    products: ["Calculadora de ganancias", "Sistema para revendedores", "Dashboard de ventas"]
  },
  {
    category: "Creadores de contenido",
    title: "Publicar más no vende más: necesitas ganchos, CTA y seguimiento",
    image: "contenido",
    excerpt: "Convierte ideas sueltas en publicaciones que atraen comentarios, mensajes y clics.",
    body: ["Un buen post empieza con un problema que la gente ya siente.", "Después das una solución parcial y conectas con un recurso descargable.", "Mide comentarios, mensajes y ventas para repetir lo que funciona."],
    products: ["Calendario de contenido viral", "Hooks virales para TikTok", "Ideas virales para Facebook"]
  },
  {
    category: "Productividad y organización",
    title: "El método anti procrastinación para empezar sin motivación",
    image: "productividad",
    excerpt: "La clave es bajar la fricción: tareas pequeñas, tiempo corto y cierre visible.",
    body: ["No empieces con una lista gigante.", "Elige una acción mínima de 10 minutos y elimina una distracción.", "Registra avance para que el progreso sea visible."],
    products: ["Método anti procrastinación", "Planner diario premium", "Sistema de enfoque"]
  },
  {
    category: "Estudiantes",
    title: "Cómo estudiar con IA sin copiar y pegar",
    image: "estudiantes",
    excerpt: "Usa IA como tutor: explica, pregunta, corrige y crea práctica personalizada.",
    body: ["Pídele a la IA que explique con ejemplos, no que haga la tarea por ti.", "Convierte apuntes en preguntas de práctica.", "Usa Pomodoro para estudiar en bloques y repasar antes del examen."],
    products: ["Prompts IA para estudiar", "Sistema de estudio inteligente", "Método Pomodoro"]
  }
];

function productCard(product, featured = false) {
  const isFree = product.type === "free";
  const actionLabel = isFree ? "Descargar gratis" : "Comprar";
  const actionHref = isFree ? product.file : whatsAppUrl;
  const downloadAttr = isFree ? "download" : "target=\"_blank\" rel=\"noopener\"";
  return `
    <article class="card" data-category="${product.category}" data-name="${product.name}">
      <div class="card__top">
        <span class="icon-badge">${icon(product.icon)}</span>
        <span class="pill">${product.tag}</span>
      </div>
      <div class="mockup" aria-hidden="true">
        <div class="mockup-bars"><span></span><span></span><span></span><span></span></div>
      </div>
      <h3>${product.name}</h3>
      <p>${product.desc}</p>
      <div class="benefit">${product.benefit}</div>
      <div class="card-actions">
        <a class="download" href="${actionHref}" ${downloadAttr}>${actionLabel}</a>
        <a class="buy" href="#premium">${featured ? "Acceso" : "Premium"}</a>
      </div>
    </article>
  `;
}

function articleCard(article) {
  return `
    <article class="article-card">
      <div class="article-image article-image--${slug(article.category)}">
        <span>${article.category}</span>
      </div>
      <div class="article-body">
        <span class="article-category">${article.category}</span>
        <h3>${article.title}</h3>
        <p>${article.excerpt}</p>
        <div class="article-products">
          ${article.products.map((name) => `<span>${name}</span>`).join("")}
        </div>
        <button type="button" class="read-article" data-title="${article.title}">Leer artículo</button>
      </div>
    </article>
  `;
}

function renderArticles(category = "Todos") {
  const filtered = category === "Todos" ? articles : articles.filter((article) => article.category === category);
  articleGrid.innerHTML = filtered.map(articleCard).join("");
  articleGrid.querySelectorAll(".read-article").forEach((button) => {
    button.addEventListener("click", () => openArticle(button.dataset.title));
  });
}

function renderBlogTabs() {
  blogTabs.innerHTML = categoryMeta.map(([name, subtitle, iconName]) => `
    <button class="category-tab ${name === "Todos" ? "is-active" : ""}" type="button" data-blog-category="${name}" title="${subtitle}">
      <span class="tab-icon">${icon(iconName)}</span>
      ${name}
    </button>
  `).join("");
  blogTabs.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      blogTabs.querySelectorAll("button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderArticles(button.dataset.blogCategory);
    });
  });
}

function openArticle(title) {
  const article = articles.find((item) => item.title === title);
  if (!article) return;
  const related = article.products.map((name) => products.find((product) => product.name === name)).filter(Boolean);
  const existing = document.querySelector(".article-modal");
  existing?.remove();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="article-modal" role="dialog" aria-modal="true">
      <div class="article-modal__content">
        <button type="button" class="modal-close" aria-label="Cerrar">×</button>
        <div class="article-image article-image--${slug(article.category)}"><span>${article.category}</span></div>
        <p class="eyebrow">${article.category}</p>
        <h2>${article.title}</h2>
        ${article.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
        <div class="lead-box">
          <strong>Descarga gratis para empezar</strong>
          <p>Usa una herramienta gratuita, deja tu correo/WhatsApp y después entra a la biblioteca premium.</p>
          <a class="button" href="daily_tips_gratis_30_gastos_quincena.xlsx" download>Descargar recurso gratis</a>
        </div>
        <h3>Productos recomendados</h3>
        <div class="modal-products">
          ${related.map((product) => `<a href="${product.type === "free" ? product.file : whatsAppUrl}" ${product.type === "free" ? "download" : "target=\"_blank\" rel=\"noopener\""}>${product.name}</a>`).join("")}
        </div>
      </div>
    </div>
  `);
  document.querySelector(".modal-close").addEventListener("click", () => document.querySelector(".article-modal")?.remove());
  document.querySelector(".article-modal").addEventListener("click", (event) => {
    if (event.target.classList.contains("article-modal")) event.currentTarget.remove();
  });
}

function listItem(product) {
  return `
    <div class="list-item">
      <span class="icon-badge">${icon(product.icon)}</span>
      <div>
        <strong>${product.name}</strong>
        <span>${product.category}</span>
      </div>
      <a href="${product.file}" download>Descargar</a>
    </div>
  `;
}

function renderTabs() {
  categoryTabs.innerHTML = categoryMeta.map(([name, subtitle, iconName]) => `
    <button class="category-tab ${name === activeCategory ? "is-active" : ""}" type="button" data-category="${name}" title="${subtitle}">
      <span class="tab-icon">${icon(iconName)}</span>
      ${name}
    </button>
  `).join("");

  categoryTabs.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      render();
    });
  });
}

function getFilteredProducts() {
  const normalized = query.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const haystack = `${product.name} ${product.category} ${product.desc} ${product.benefit} ${product.tag}`.toLowerCase();
    return matchesCategory && (!normalized || haystack.includes(normalized));
  });
}

function renderProducts() {
  const filtered = getFilteredProducts();
  resultCount.textContent = `${filtered.length} archivo${filtered.length === 1 ? "" : "s"} encontrados`;
  productGrid.innerHTML = filtered.length
    ? filtered.map((product) => productCard(product)).join("")
    : `<div class="empty-state">No encontramos archivos con ese filtro. Prueba con “IA”, “deudas”, “contenido” o “estudiantes”.</div>`;
}

function renderFeatured() {
  const featured = [
    "Control financiero quincenal MX",
    "Prompts premium para ChatGPT",
    "Sistema para revendedores",
    "Calendario de contenido viral"
  ].map((name) => products.find((product) => product.name === name)).filter(Boolean);
  featuredGrid.innerHTML = featured.map((product) => productCard(product, true)).join("");
}

function renderLists() {
  const sellers = products.filter((product) => product.tag === "Más vendido").slice(0, 6);
  const free = products.filter((product) => product.type === "free");
  bestSellers.innerHTML = sellers.map(listItem).join("");
  freeTools.innerHTML = free.map(listItem).join("");
}

function renderPremiumDownloads() {
  const grouped = categoryMeta.filter(([name]) => name !== "Todos").map(([name]) => {
    const items = products.filter((product) => product.category === name);
    return `
      <section class="premium-category">
        <h3>${name}</h3>
        <div class="premium-file-grid">
          ${items.map((product) => `
            <a class="premium-file" href="${product.file}" download>
              <span class="icon-badge">${icon(product.icon)}</span>
              <strong>${product.name}</strong>
              <small>${product.benefit}</small>
            </a>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");
  premiumDownloads.innerHTML = grouped;
}

function unlockPremium() {
  premiumGate.hidden = true;
  premiumLibrary.hidden = false;
  localStorage.setItem("dailyTipsPremium", "yes");
  renderPremiumDownloads();
}

function render() {
  renderTabs();
  renderProducts();
}

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  renderProducts();
});

premiumForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (premiumPassword.value.trim().toUpperCase() === "DAILYTIPS2026") {
    premiumError.textContent = "";
    unlockPremium();
  } else {
    premiumError.textContent = "Contraseña incorrecta. Revisa el mensaje que recibiste después de comprar.";
  }
});

premiumLogout.addEventListener("click", () => {
  localStorage.removeItem("dailyTipsPremium");
  premiumLibrary.hidden = true;
  premiumGate.hidden = false;
  premiumPassword.value = "";
});

clearFilters.addEventListener("click", () => {
  activeCategory = "Todos";
  query = "";
  searchInput.value = "";
  render();
});

renderFeatured();
renderLists();
renderBlogTabs();
renderArticles();
if (localStorage.getItem("dailyTipsPremium") === "yes") unlockPremium();
render();
})();
