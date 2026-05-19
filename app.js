(() => {
const { products, categoryMeta, icon, slug } = window.dailyTipsCatalog;

let activeCategory = "Todos";
let query = "";

const productGrid = document.querySelector("#product-grid");
const featuredGrid = document.querySelector("#featured-grid");
const bestSellers = document.querySelector("#best-sellers");
const freeTools = document.querySelector("#free-tools");
const categoryTabs = document.querySelector("#category-tabs");
const resultCount = document.querySelector("#result-count");
const searchInput = document.querySelector("#searchInput");
const clearFilters = document.querySelector("#clearFilters");
const totalProducts = document.querySelector("#total-products");

totalProducts.textContent = products.length;

function productCard(product, featured = false) {
  const actionLabel = product.type === "free" ? "Descargar gratis" : "Descargar";
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
        <a class="download" href="${product.file}" download>${actionLabel}</a>
        <a class="buy" href="#newsletter">${featured ? "Ver uso" : "Info"}</a>
      </div>
    </article>
  `;
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

function render() {
  renderTabs();
  renderProducts();
}

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  renderProducts();
});

clearFilters.addEventListener("click", () => {
  activeCategory = "Todos";
  query = "";
  searchInput.value = "";
  render();
});

renderFeatured();
renderLists();
render();
})();
