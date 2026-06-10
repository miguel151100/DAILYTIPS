(function () {
  "use strict";

  const baseLessons = [
    ["bienvenida", "Bienvenida al curso"],
    ["ingredientes", "Ingredientes básicos"],
    ["masa", "Preparación de masa"],
    ["rellenos", "Rellenos"],
    ["recetas", "Recetas de tamales"],
    ["coccion", "Cómo cocerlos correctamente"],
    ["costos", "Calculadora de costos"],
    ["ganancias", "Calculadora de ganancias"],
    ["ventas", "Cómo vender tamales desde casa"],
    ["facebook-whatsapp", "Tips para Facebook y WhatsApp"],
    ["actualizaciones", "Actualizaciones incluidas"],
    ["soporte", "Soporte por WhatsApp"],
    ["instalar", "Instalar app"]
  ];

  const extraLessons = [
    ["derivados", "Extra: derivados de masa"],
    ["bebidas", "Extra: bebidas"],
    ["salsas", "Extra: salsas"],
    ["errores", "Extra: errores"],
    ["temporadas", "Extra: temporadas"],
    ["pedidos", "Extra: pedidos"],
    ["timer", "Extra: timer"],
    ["faq", "Extra: FAQ"]
  ];

  const recipes = {
    rojos: {
      title: "Tamales rojos - 24 piezas",
      body: "Licúa 6 chiles guajillo, 3 chiles ancho, jitomate asado, cebolla, ajo, comino y sal. Fríe 10 minutos, integra pollo o cerdo deshebrado y arma con masa base."
    },
    verdes: {
      title: "Tamales verdes - 24 piezas",
      body: "Cuece tomatillo y serrano 8 minutos. Licúa con cebolla y cilantro, sofríe, agrega pollo deshebrado y ajusta sal."
    },
    rajas: {
      title: "Rajas con queso - 24 piezas",
      body: "Asa poblanos, pela y corta en rajas. Sofríe con cebolla, agrega crema y coloca queso Oaxaca en cada tamal."
    },
    dulces: {
      title: "Tamales dulces - 24 piezas",
      body: "Cambia caldo por leche tibia, manteca por mantequilla, agrega azúcar, canela y color. Usa pasas, piña, cajeta o chocolate."
    },
    especiales: {
      title: "Especiales premium",
      body: "Camarón con chipotle, oaxaqueños con mole, uchepos de elote tierno, soya vegana o chocolate con cajeta. Cobra 30% a 60% más por ingredientes y presentación."
    }
  };

  const stateKey = "dailyTipsTamalesProgress";
  let deferredInstallPrompt = null;
  let timerSeconds = 0;
  let timerInitial = 0;
  let timerInterval = null;
  let timerRunning = false;

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
    const rows = baseLessons.concat(extraLessons).map(([id, title], index) => {
      const isBase = index < baseLessons.length;
      const done = isBase && progress.has(id);
      const number = isBase ? String(index + 1) : "+";
      return `<button class="lesson-row${done ? " done" : ""}" type="button" data-go="${id}">
        <span class="num">${number}</span>
        <span>${title}</span>
        <span class="status">${done ? "✓" : "›"}</span>
      </button>`;
    });
    list.innerHTML = rows.join("");
  }

  function activateSection(id) {
    const target = document.getElementById(id);
    if (!target) return;

    if (target.classList.contains("lesson")) {
      $$(".lesson").forEach((section) => section.classList.toggle("active", section.id === id));
    } else if (!$("#bienvenida").classList.contains("active")) {
      $$(".lesson").forEach((section) => section.classList.toggle("active", section.id === "bienvenida"));
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
    const recipe = recipes[key] || recipes.rojos;
    $("#recipeOutput").innerHTML = `<div class="recipe-card"><h3>${recipe.title}</h3><p>${recipe.body}</p><div class="tip">Tip de venta: toma foto con luz natural, muestra el relleno y publica disponibilidad con horario de entrega.</div></div>`;
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

  function formatTimer(seconds) {
    if (seconds <= 0 && timerInitial > 0) return "LISTO";
    const mins = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  function setTimer(seconds, name, button) {
    clearInterval(timerInterval);
    timerRunning = false;
    timerSeconds = seconds;
    timerInitial = seconds;
    $("#timerName").textContent = name;
    $("#timerValue").textContent = formatTimer(timerSeconds);
    $("#timerToggle").textContent = "Iniciar";
    $$(".timer-grid button").forEach((item) => item.classList.toggle("active", item === button));
  }

  function toggleTimer() {
    if (!timerInitial) return;
    const button = $("#timerToggle");
    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
      button.textContent = "Continuar";
      return;
    }

    timerRunning = true;
    button.textContent = "Pausar";
    timerInterval = setInterval(() => {
      timerSeconds -= 1;
      $("#timerValue").textContent = formatTimer(timerSeconds);
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        button.textContent = "Iniciar";
      }
    }, 1000);
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerSeconds = timerInitial;
    $("#timerValue").textContent = formatTimer(timerSeconds);
    $("#timerToggle").textContent = "Iniciar";
  }

  function setupForms() {
    $("#costForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const qty = Number($("#costQty").value) || 0;
      const total = (Number($("#costIngredients").value) || 0) + (Number($("#costPackaging").value) || 0) + (Number($("#costGas").value) || 0);
      $("#costResult").innerHTML = [
        metric("Costo total", money(total)),
        metric("Costo por tamal", qty > 0 ? money(total / qty) : "$0.00 MXN"),
        metric("Lote", `${qty} piezas`),
        metric("Precio sugerido mínimo", money(qty > 0 ? (total / qty) * 2.4 : 0))
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
      const filling = $("#recipeFilling").value;
      const qty = Number($("#recipeQty").value) || 20;
      const output = $("#generatedRecipe");
      output.hidden = false;
      output.innerHTML = `<strong>Receta para ${qty} tamales de ${filling}</strong>
Masa: ${Math.round(qty * 25)} g de harina, ${Math.round(qty * 6.5)} g de manteca y ${Math.round(qty * 20)} ml de caldo o leche.
Relleno: ${Math.round(qty * 20)} g de ${filling}.
Costo estimado: ${money(qty * 4.5)}. Precio de venta sugerido: ${money(qty * 20)} a ${money(qty * 24)}.`;
    });

    $("#postForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const flavors = $("#postFlavors").value || "sabores surtidos";
      const zone = $("#postZone").value || "mi zona";
      const price = Number($("#postPrice").value) || 0;
      const output = $("#postOutput");
      output.hidden = false;
      output.textContent = `Hola! Esta semana tengo tamales caseros de ${flavors}. Precio desde $${price} MXN. Entrego en ${zone} o puedes pasar a recoger. Se aparta con anticipo. ¿Te anoto?`;
      $('[data-copy-target="postOutput"]').hidden = false;
    });

    $("#orderForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const total = Number($("#orderTotal").value) || 0;
      const deposit = Number($("#orderDeposit").value) || 0;
      const output = $("#orderOutput");
      output.hidden = false;
      output.textContent = `CONFIRMACION DE PEDIDO
Cliente: ${$("#orderName").value || "Cliente"}
Pedido: ${$("#orderItems").value || "(por confirmar)"}
Entrega: ${$("#orderDate").value || "(por confirmar)"}
Total: ${money(total)}
Anticipo: ${money(deposit)}
Restante: ${money(total - deposit)}
Gracias por tu pedido.`;
      $('[data-copy-target="orderOutput"]').hidden = false;
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

    $$(".timer-grid button").forEach((button) => {
      button.addEventListener("click", () => {
        setTimer(Number(button.dataset.time), button.dataset.name, button);
      });
    });

    $("#timerToggle").addEventListener("click", toggleTimer);
    $("#timerReset").addEventListener("click", resetTimer);
  }

  function init() {
    renderLessonList();
    updateProgress();
    syncChecklist();
    renderRecipe("rojos");
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
