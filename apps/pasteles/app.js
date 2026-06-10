(function () {
  "use strict";

  const lessons = [
    ["bienvenida", "Bienvenida al curso"],
    ["herramientas", "Herramientas basicas de reposteria"],
    ["ingredientes", "Ingredientes principales"],
    ["bizcocho", "Bases de bizcocho"],
    ["betunes", "Betunes y coberturas"],
    ["rellenos", "Rellenos"],
    ["recetas", "Recetas de pasteles"],
    ["decoracion", "Decoracion basica"],
    ["vender", "Pasteles para vender"],
    ["costos", "Calculadora de costos"],
    ["ganancias", "Calculadora de ganancias"],
    ["pedidos", "Como tomar pedidos"],
    ["redes", "Tips para vender por redes sociales"],
    ["actualizaciones", "Actualizaciones incluidas"],
    ["soporte", "Soporte por WhatsApp"],
    ["instalar", "Instalar app"]
  ];

  const recipes = {
    vainilla: {
      title: "Pastel de vainilla humedo - molde 20 cm",
      body: "Bate 180 g mantequilla con 220 g azucar. Agrega 3 huevos, 250 g harina, 10 g polvo para hornear, 160 ml leche y vainilla. Hornea a 175 C por 35 a 42 minutos."
    },
    chocolate: {
      title: "Pastel de chocolate intenso - molde 20 cm",
      body: "Mezcla 220 g harina, 260 g azucar, 65 g cacao, 10 g polvo para hornear, 2 huevos, 180 ml leche, 120 ml aceite y 160 ml cafe caliente. Hornea a 175 C."
    },
    zanahoria: {
      title: "Pastel de zanahoria rentable",
      body: "Integra 250 g zanahoria rallada, 220 g harina, 180 g azucar, 3 huevos, 180 ml aceite, canela, nuez y polvo para hornear. Vende con betun de queso crema."
    },
    "tres-leches": {
      title: "Tres leches en charola",
      body: "Prepara bizcocho esponja con 5 huevos, 150 g azucar y 150 g harina. Baña con leche evaporada, condensada y media crema. Vende por charola o rebanada."
    },
    "red-velvet": {
      title: "Red velvet para pedidos premium",
      body: "Combina cocoa suave, buttermilk o leche con limon, vainilla y color rojo. Rellena con queso crema y cobra extra por acabado premium."
    }
  };

  const frostings = {
    americano: {
      title: "Betun americano estable",
      body: "Bate 250 g mantequilla con 500 g azucar glass, vainilla y 2 a 4 cucharadas de leche. Es economico, firme y sirve para practicar duya."
    },
    queso: {
      title: "Betun de queso crema",
      body: "Bate 190 g queso crema frio con 90 g mantequilla y 300 g azucar glass. Ideal para zanahoria, red velvet y frutos rojos. Mantener refrigerado."
    },
    ganache: {
      title: "Ganache de chocolate",
      body: "Calienta 200 ml crema para batir y vierte sobre 200 g chocolate picado. Reposa 2 minutos y mezcla. Sirve para drip, relleno o cobertura firme."
    },
    chantilly: {
      title: "Chantilly natural",
      body: "Bate 500 ml crema fria con 60 g azucar glass. Es ligera y barata, pero requiere refrigeracion y entregas cortas."
    }
  };

  const stateKey = "dailyTipsPastelesProgress";
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
    list.innerHTML = lessons.map(([id, title], index) => {
      const done = progress.has(id);
      return `<button class="lesson-row${done ? " done" : ""}" type="button" data-go="${id}">
        <span class="num">${index + 1}</span>
        <span>${title}</span>
        <span class="status">${done ? "OK" : ">"}</span>
      </button>`;
    }).join("");
  }

  function updateProgress() {
    const progress = new Set(storedProgress());
    const complete = lessons.filter(([id]) => progress.has(id)).length;
    const pct = Math.round((complete / lessons.length) * 100);
    $("#progressText").textContent = `${pct}%`;
    $("#progressCount").textContent = String(complete);
    $("#totalLessons").textContent = String(lessons.length);
    $("#progressBar").style.width = `${pct}%`;
    $("[data-progress-ring]").style.setProperty("--pct", `${pct}%`);
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
    const recipe = recipes[key] || recipes.vainilla;
    $("#recipeOutput").innerHTML = `<div class="recipe-card"><h3>${recipe.title}</h3><p>${recipe.body}</p><div class="tip">Tip de venta: toma foto con luz natural, muestra el corte y publica precio desde, tamano y fecha disponible.</div></div>`;
  }

  function renderFrosting(key) {
    const item = frostings[key] || frostings.americano;
    $("#frostingOutput").innerHTML = `<div class="recipe-card"><h3>${item.title}</h3><p>${item.body}</p><div class="warning">Antes de vender, prueba el betun con tu clima y tu tiempo de entrega.</div></div>`;
  }

  function metric(label, value) {
    return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function copyWithFallback(text, button) {
    const original = button.textContent;
    const done = () => {
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
      const qty = Number($("#costQty").value) || 1;
      const total = ["#costIngredients", "#costPackaging", "#costGas", "#costDecor", "#costLabor"]
        .reduce((sum, id) => sum + (Number($(id).value) || 0), 0);
      const unit = total / qty;
      $("#costResult").innerHTML = [
        metric("Costo total", money(total)),
        metric("Costo por pastel", money(unit)),
        metric("Precio sugerido 60% margen", money(unit / 0.4)),
        metric("Precio premium 70% margen", money(unit / 0.3))
      ].join("");
    });

    $("#profitForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const qty = Number($("#profitQty").value) || 1;
      const price = Number($("#profitPrice").value) || 0;
      const cost = Number($("#profitCost").value) || 0;
      const income = qty * price;
      const totalCost = qty * cost;
      const profit = income - totalCost;
      const margin = income > 0 ? `${((profit / income) * 100).toFixed(1)}%` : "0%";
      $("#profitResult").innerHTML = [
        metric("Ingresos", money(income)),
        metric("Costo total", money(totalCost)),
        metric("Ganancia neta", money(profit)),
        metric("Margen", margin)
      ].join("");
    });

    $("#recipeGenerator").addEventListener("submit", (event) => {
      event.preventDefault();
      const size = Number($("#recipeSize").value);
      const factor = Math.pow(size / 20, 2);
      const flour = Math.round(250 * factor);
      const sugar = Math.round(220 * factor);
      const eggs = Math.max(1, Math.round(3 * factor));
      const milk = Math.round(160 * factor);
      $("#generatedRecipe").hidden = false;
      $("#generatedRecipe").innerHTML = `<strong>${$("#recipeFlavor").value} para molde ${size} cm</strong><br>Harina: ${flour} g<br>Azucar: ${sugar} g<br>Huevos: ${eggs}<br>Leche: ${milk} ml<br>Hornea a 175 C y revisa desde los ${size >= 24 ? "42" : "32"} minutos.`;
    });

    $("#orderForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const total = Number($("#orderTotal").value) || 0;
      const advance = Number($("#orderAdvance").value) || 0;
      const pending = Math.max(total - advance, 0);
      const message = `Hola ${$("#orderName").value || "cliente"}, confirmo tu pedido:\n\nPastel: ${$("#orderDesc").value || "Por definir"}\nFecha: ${$("#orderDate").value || "Por confirmar"}\nEntrega: ${$("#orderDelivery").value || "Por confirmar"}\nTotal: ${money(total)}\nAnticipo: ${money(advance)}\nSaldo pendiente: ${money(pending)}\n\nTu fecha queda apartada al recibir el anticipo. Gracias por tu pedido.`;
      $("#orderOutput").hidden = false;
      $("#orderOutput").textContent = message;
      $("[data-copy-target='orderOutput']").hidden = false;
    });

    $("#socialForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const product = $("#socialProduct").value;
      const price = Number($("#socialPrice").value) || 0;
      const zone = $("#socialZone").value || "mi zona";
      const phone = $("#socialPhone").value || "por mensaje";
      const message = `Pasteles caseros por pedido en ${zone}\n\nProducto: ${product}\nPrecio desde: ${money(price)}\nHecho con ingredientes frescos y decoracion personalizada.\nAgenda con anticipo para apartar tu fecha.\nWhatsApp: ${phone}\n\nEntrega limitada segun zona.`;
      $("#socialOutput").hidden = false;
      $("#socialOutput").textContent = message;
      $("[data-copy-target='socialOutput']").hidden = false;
    });
  }

  function setupInstall() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      $$("[data-install-button]").forEach((button) => button.disabled = false);
    });

    $$("[data-install-button]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!deferredInstallPrompt) {
          alert("Si no aparece el instalador, usa el menu del navegador y elige Agregar a pantalla de inicio.");
          return;
        }
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
      });
    });

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js");
    }
  }

  function setupEvents() {
    document.addEventListener("click", (event) => {
      const go = event.target.closest("[data-go]");
      if (go) {
        activateSection(go.dataset.go);
        return;
      }

      const recipe = event.target.closest("[data-recipe]");
      if (recipe) {
        $("[data-recipe].active")?.classList.remove("active");
        recipe.classList.add("active");
        renderRecipe(recipe.dataset.recipe);
        return;
      }

      const frosting = event.target.closest("[data-frosting]");
      if (frosting) {
        $("[data-frosting].active")?.classList.remove("active");
        frosting.classList.add("active");
        renderFrosting(frosting.dataset.frosting);
        return;
      }

      const copy = event.target.closest("[data-copy-target]");
      if (copy) {
        const target = document.getElementById(copy.dataset.copyTarget);
        if (target) copyWithFallback(target.textContent, copy);
      }
    });
  }

  function initFromHash() {
    const id = location.hash.replace("#", "");
    if (id && document.getElementById(id)) {
      activateSection(id);
    }
  }

  renderLessonList();
  updateProgress();
  syncChecklist();
  renderRecipe("vainilla");
  renderFrosting("americano");
  setupForms();
  setupInstall();
  setupEvents();
  initFromHash();
})();
