(() => {
const catalog = window.dailyTipsCatalog;
if (!catalog) return;
const { products, categoryMeta, icon } = catalog;

const whatsapp = "https://wa.me/525569862844?text=Hola%2C%20quiero%20comprar%20un%20paquete%20Daily%20Tips";
const premiumPassword = "DAILYTIPS2026";

const menuToggle = document.querySelector(".menu-toggle");
const topbar = document.querySelector(".topbar");
if (menuToggle && topbar) {
  menuToggle.addEventListener("click", () => {
    const isOpen = topbar.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll(".nav-dropdown > button").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const dropdown = button.closest(".nav-dropdown");
    const isOpen = dropdown.classList.contains("is-open");
    document.querySelectorAll(".nav-dropdown.is-open").forEach((item) => item.classList.remove("is-open"));
    if (!isOpen) dropdown.classList.add("is-open");
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".nav-dropdown.is-open").forEach((item) => item.classList.remove("is-open"));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".nav-dropdown.is-open").forEach((item) => item.classList.remove("is-open"));
  }
});

function renderPremiumDownloads() {
  const target = document.querySelector("#premium-downloads");
  if (!target) return;
  target.innerHTML = categoryMeta
    .filter(([name]) => name !== "Todos")
    .map(([name]) => {
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
}

function unlockPremium() {
  const gate = document.querySelector("#premium-gate");
  const library = document.querySelector("#premium-library");
  if (!gate || !library) return;
  gate.hidden = true;
  library.hidden = false;
  localStorage.setItem("dailyTipsPremium", "yes");
  renderPremiumDownloads();
}

const premiumForm = document.querySelector("#premium-form");
if (premiumForm) {
  const premiumPasswordInput = document.querySelector("#premium-password");
  const premiumError = document.querySelector("#premium-error");
  const premiumLogout = document.querySelector("#premium-logout");

  premiumForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (premiumPasswordInput.value.trim().toUpperCase() === premiumPassword) {
      premiumError.textContent = "";
      unlockPremium();
    } else {
      premiumError.textContent = "Contraseña incorrecta. Revisa el mensaje que recibiste después de comprar.";
    }
  });

  premiumLogout?.addEventListener("click", () => {
    localStorage.removeItem("dailyTipsPremium");
    document.querySelector("#premium-library").hidden = true;
    document.querySelector("#premium-gate").hidden = false;
    premiumPasswordInput.value = "";
  });

  if (localStorage.getItem("dailyTipsPremium") === "yes") unlockPremium();
}

const deliveryForm = document.querySelector("#delivery-form");
if (deliveryForm) {
  const deliveryPasswordInput = document.querySelector("#delivery-password");
  const deliveryError = document.querySelector("#delivery-error");
  const deliveryGate = document.querySelector("#delivery-gate");
  const deliveryLibrary = document.querySelector("#delivery-library");

  function unlockDelivery() {
    deliveryGate.hidden = true;
    deliveryLibrary.hidden = false;
    localStorage.setItem("dailyTipsDelivery", "yes");
  }

  deliveryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (deliveryPasswordInput.value.trim().toUpperCase() === premiumPassword) {
      deliveryError.textContent = "";
      unlockDelivery();
    } else {
      deliveryError.textContent = "Código incorrecto. Revisa el mensaje que recibiste después de comprar.";
    }
  });

  if (localStorage.getItem("dailyTipsDelivery") === "yes") unlockDelivery();
}

document.querySelectorAll(".newsletter-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.classList.add("is-done");
  });
});

document.querySelectorAll('a[href="#comprar"], a[data-buy]').forEach((link) => {
  link.setAttribute("href", whatsapp);
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener");
});

document.querySelectorAll("[data-education-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const section = button.closest(".section");
    const filter = button.dataset.educationFilter;
    if (!section || !filter) return;

    section.querySelectorAll("[data-education-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    section.querySelectorAll("[data-education-tags]").forEach((card) => {
      const tags = card.dataset.educationTags.split(/\s+/);
      card.hidden = filter !== "todos" && !tags.includes(filter);
    });
  });
});

const recipesBuyButton = document.querySelector("[data-recipes-buy]");
const recipesModal = document.querySelector("#recipes-success-modal");
const recipesModalClose = document.querySelector("[data-recipes-modal-close]");

function startRecipesDownload() {
  const link = document.createElement("a");
  link.href = "./recetas-del-mundo-pack.zip";
  link.download = "recetas-del-mundo-pack.zip";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

recipesBuyButton?.addEventListener("click", () => {
  // Prueba visual de entrega. La entrega automática real con Mercado Pago requiere Checkout Pro + webhook/backend.
  recipesModal.hidden = false;
  window.setTimeout(startRecipesDownload, 900);
});

recipesModalClose?.addEventListener("click", () => {
  recipesModal.hidden = true;
});

recipesModal?.addEventListener("click", (event) => {
  if (event.target === recipesModal) recipesModal.hidden = true;
});

document.querySelectorAll("[data-recipe-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.recipeFilter;
    document.querySelectorAll("[data-recipe-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    document.querySelectorAll("[data-recipe-category]").forEach((card) => {
      card.hidden = filter !== "todos" && card.dataset.recipeCategory !== filter;
    });
  });
});
})();
