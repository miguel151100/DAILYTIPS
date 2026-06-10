(function () {
  "use strict";

  const baseLessons = [
    ["bienvenida", "Bienvenida al curso"],
    ["herramientas", "Herramientas básicas"],
    ["masa", "Masa para pizza"],
    ["salsas", "Salsas para pizza"],
    ["quesos-ingredientes", "Quesos e ingredientes"],
    ["recetas", "Recetas de pizzas"],
    ["pizzas-vender", "Pizzas para vender"],
    ["dark-kitchen", "Cómo hacer una dark kitchen desde casa"],
    ["costos", "Calculadora de costos"],
    ["ganancias", "Calculadora de ganancias"],
    ["menu", "Menú sugerido para vender"],
    ["facebook-whatsapp", "Tips para Facebook y WhatsApp"],
    ["actualizaciones", "Actualizaciones incluidas"],
    ["soporte", "Soporte por WhatsApp"],
    ["instalar", "Instalar app"]
  ];

  const recipes = {
    margherita: {
      title: "Margherita rentable",
      body: "Salsa de tomate, mozzarella, hojas de albahaca y aceite. Es tu pizza de control: si esta sale bien, tu masa, salsa y horno están listos."
    },
    pepperoni: {
      title: "Pepperoni clásica",
      body: "Salsa de tomate, mozzarella y 18 a 24 rebanadas de pepperoni por pizza mediana. Hornea hasta que el queso burbujee y el pepperoni dore."
    },
    hawaiana: {
      title: "Hawaiana de venta rápida",
      body: "Salsa de tomate, mozzarella, jamón y piña bien escurrida. Funciona para combos familiares porque es conocida y fácil de producir."
    },
    mexicana: {
      title: "Mexicana especial",
      body: "Salsa de tomate, mozzarella, chorizo cocido, jalapeño, cebolla morada y elote. Cobra precio premium por sabor local."
    },
    bbq: {
      title: "BBQ chicken",
      body: "Salsa BBQ, mozzarella, pollo deshebrado, cebolla morada y toque de cilantro. Excelente para redes por color y brillo."
    },
    vegetariana: {
      title: "Vegetariana con margen",
      body: "Salsa de tomate, mozzarella, pimiento, champiñón precocido, cebolla y aceituna. Pre-cocina vegetales para evitar exceso de agua."
    }
  };

  const stateKey = "dailyTipsPizzasProgress";
  let deferredInstallPrompt = null;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const money = (value) => `$${Number(value || 0).toFixed(2)} MXN`;

  function storedProgress() {
    try {
      return JSON.parse(localStorage.getItem(stateKey) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveProgress(values) {
    localStorage.setItem(stateKey, JSON.stringify(values));
  }

  function renderLessonList() {
    const list = $("#lessonList");
    if (!list) return;

    const progress = new Set(storedProgress());
    list.innerHTML = baseLessons.map(([id, title], index) => {
      const done = progress.has(id);
      return `<button class="lesson-row${done ? " done" : ""}" type="button" data-go="${id}">
        <span class="num">${index + 1}</span>
        <span>${title}</span>
        <span class="status">${done ? "✓" : "›"}</span>
      </button>`;
    }).join("");
  }

  function activateSection(id) {
    const target = document.getElementById(id);
    if (!target) return;

    if (target.classList.contains("lesson")) {
      $$(".lesson").forEach((section) => section.classList.toggle("active", section.id === id));
    }

    $$(".tab, .lesson-row, .bottom-nav button").forEach((button) => {
      button.classList.toggle("active", button.dataset.go === id);
    });

    if (target.dataset.base === "true") {
      const progress = new Set(storedProgress());
      progress.add(id);
      saveProgress(Array.from(progress));
      updateProgress();
      renderLessonList();
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }

  function updateProgress() {
    const progress = new Set(storedProgress());
    const complete = baseLessons.filter(([id]) => progress.has(id)).length;
    const pct = Math.round((complete / baseLessons.length) * 100);
    $("#progressText").textContent = `${pct}%`;
    $("#progressCount").textContent = String(complete);
    $("#totalLessons").textContent = String(baseLessons.length);
    $("#progressBar").style.width = `${pct}%`;
    $("[data-progress-ring]").style.setProperty("--pct", `${pct}%`);
  }

  function syncChecklist() {
    const progress = new Set(storedProgress());
    $$("[data-checklist] input[type='checkbox']").forEach((input) => {
      input.checked = progress.has(input.value);
      input.addEventListener("change", () => {
        const next = new Set(storedProgress());
        if (input.checked) next.add(input.value);
        else next.delete(input.value);
        saveProgress(Array.from(next));
        updateProgress();
        renderLessonList();
      });
    });
  }

  function renderRecipe(key) {
    const recipe = recipes[key] || recipes.margherita;
    $("#recipeOutput").innerHTML = `<div class="recipe-card"><h3>${recipe.title}</h3><p>${recipe.body}</p><div class="tip">Tip de venta: fotografía una rebanada levantada con queso derretido y publica cupos por horario.</div></div>`;
  }

  function metric(label, value) {
    return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function copyWithFallback(text, button) {
    const done = () => {
      const original = button.textContent;
      button.textContent = "Copiado";
      setTimeout(() => {
        button.textContent = original;
      }, 1800);
    };

    const fallback = () => {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
        done();
      } catch (error) {
        alert("Mantén presionado el texto para copiarlo.");
      }
      document.body.removeChild(area);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  function setupForms() {
    $("#costForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const qty = Number($("#costQty").value) || 0;
      const total = (Number($("#costIngredients").value) || 0) + (Number($("#costPackaging").value) || 0) + (Number($("#costGas").value) || 0);
      $("#costResult").innerHTML = [
        metric("Costo total", money(total)),
        metric("Costo por pizza", qty > 0 ? money(total / qty) : "$0.00 MXN"),
        metric("Lote", `${qty} pizzas`),
        metric("Precio sugerido mínimo", money(qty > 0 ? (total / qty) * 2.35 : 0))
      ].join("");
    });

    $("#profitForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const qty = Number($("#profitQty").value) || 0;
      const price = Number($("#profitPrice").value) || 0;
      const cost = Number($("#profitCost").value) || 0;
      const income = qty * price;
      const profit = income - cost;
      const margin = income > 0 ? `${((profit / income) * 100).toFixed(1)}%` : "0%";
      $("#profitResult").innerHTML = [
        metric("Ingresos", money(income)),
        metric("Costo total", money(cost)),
        metric("Ganancia neta", money(profit)),
        metric("Margen", margin)
      ].join("");
    });

    $("#recipeGenerator").addEventListener("submit", (event) => {
      event.preventDefault();
      const type = $("#recipeType").value;
      const qty = Number($("#recipeQty").value) || 4;
      const output = $("#generatedRecipe");
      output.hidden = false;
      output.innerHTML = `<strong>Lote para ${qty} pizzas ${type}</strong>
Masa: ${qty * 125} g de harina, ${Math.round(qty * 78)} ml de agua, ${qty * 3} g de sal y ${Math.max(2, Math.round(qty * 0.8))} g de levadura.
Salsa: ${qty * 55} g.
Queso: ${qty * 110} g.
Toppings: pesa cada pizza para mantener margen.
Precio sugerido: ${money(qty * 145)} de venta total si cobras $145 MXN por pizza.`;
    });

    $("#postForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const flavors = $("#postFlavors").value || "sabores surtidos";
      const zone = $("#postZone").value || "mi zona";
      const price = Number($("#postPrice").value) || 0;
      const output = $("#postOutput");
      output.hidden = false;
      output.textContent = `Hola! Hoy abrimos pedidos de pizzas caseras: ${flavors}. Precio desde $${price} MXN. Entrego en ${zone} con horario programado. Se aparta con anticipo. ¿Te anoto una?`;
      $('[data-copy-target="postOutput"]').hidden = false;
    });
  }

  function setupInstall() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      $$("[data-install-button]").forEach((button) => {
        button.disabled = false;
        button.textContent = "Instalar app";
      });
    });

    $$("[data-install-button]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!deferredInstallPrompt) {
          activateSection("instalar");
          return;
        }
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
      });
    });
  }

  function setupServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js").catch(() => {
          /* The app remains usable online if registration is blocked locally. */
        });
      });
    }
  }

  function setupEvents() {
    document.addEventListener("click", (event) => {
      const go = event.target.closest("[data-go]");
      if (go) activateSection(go.dataset.go);

      const copy = event.target.closest("[data-copy-target]");
      if (copy) {
        const target = document.getElementById(copy.dataset.copyTarget);
        if (target) copyWithFallback(target.textContent, copy);
      }
    });

    $$(".segment").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".segment").forEach((item) => item.classList.toggle("active", item === button));
        renderRecipe(button.dataset.recipe);
      });
    });
  }

  function init() {
    renderLessonList();
    updateProgress();
    syncChecklist();
    renderRecipe("margherita");
    setupForms();
    setupEvents();
    setupInstall();
    setupServiceWorker();

    const initial = window.location.hash.replace("#", "");
    if (initial && document.getElementById(initial)) {
      setTimeout(() => activateSection(initial), 80);
    }
  }

  init();
})();
