(function () {
  "use strict";

  const lessons = [
    ["bienvenida", "Bienvenida al curso"],
    ["ingredientes", "Ingredientes base"],
    ["chiles", "Chiles y especias"],
    ["salsas-basicas", "Salsas basicas"],
    ["salsas-vender", "Salsas para vender"],
    ["moles", "Moles tradicionales"],
    ["recetas", "Recetas paso a paso"],
    ["conservacion", "Conservacion y envasado"],
    ["presentacion", "Presentacion del producto"],
    ["costos", "Calculadora de costos"],
    ["ganancias", "Calculadora de ganancias"],
    ["encargo", "Como vender por encargo"],
    ["redes", "Tips para redes sociales"],
    ["actualizaciones", "Actualizaciones incluidas"],
    ["soporte", "Soporte por WhatsApp"],
    ["instalar", "Instalar app"]
  ];

  const recipes = {
    "mole-rojo": {
      title: "Mole rojo para iniciar",
      body: "Tuesta 5 chiles ancho, 3 guajillo y 2 mulato sin quemar. Remoja 20 minutos. Muele con jitomate asado, cebolla, ajo, ajonjoli, canela, clavo y caldo. Frie la pasta 8 minutos, agrega chocolate al final y cocina 30 minutos a fuego bajo."
    },
    "mole-poblano": {
      title: "Mole poblano vendible",
      body: "Combina chile mulato, ancho, pasilla, almendra, pasas, ajonjoli, pan tostado, especias y chocolate mexicano. Frie cada familia de ingredientes para sacar aroma y muele muy fino antes de cocinar."
    },
    "salsa-macha": {
      title: "Salsa macha de alta recompra",
      body: "Dora ajo en aceite, retira y apaga el fuego. Agrega chile de arbol, ajonjoli y cacahuate para que se tuesten con calor residual. Muele grueso, ajusta sal y envasa cuando este tibia."
    },
    "salsa-verde": {
      title: "Salsa verde tatemada",
      body: "Asa tomatillo, chile serrano, cebolla y ajo. Muele con cilantro, sal y limon. Hierve 10 minutos si la venderas en frasco. Ofrece nivel suave, medio y picoso."
    },
    chamoy: {
      title: "Chamoy artesanal",
      body: "Cuece fruta deshidratada o pulpa con chile, azucar, sal y limon. Muele, cuela si deseas textura fina y ajusta acidez. Vende para fruta, gomitas, micheladas y snacks."
    }
  };

  const sauces = {
    verde: {
      title: "Salsa verde tatemada",
      body: "Tomatillo, serrano, cebolla, ajo y cilantro. Asa, muele, hierve y envasa. Es la opcion mas facil para empezar por su bajo costo y alta demanda."
    },
    roja: {
      title: "Salsa roja de comal",
      body: "Jitomate, chile guajillo o de arbol, cebolla y ajo. Tatemada tiene mejor foto y mejor aroma que una salsa hervida simple."
    },
    molcajete: {
      title: "Salsa de molcajete",
      body: "Textura rustica, sabor ahumado y aspecto casero. Ideal para vender como salsa premium de fin de semana."
    },
    adobo: {
      title: "Adobo base",
      body: "Chile ancho y guajillo con ajo, especias, vinagre y sal. Sirve para carne, pollo, tacos, costillas y paquetes familiares."
    }
  };

  const stateKey = "dailyTipsMoleSalsasProgress";
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
    const activeLesson = $(".lesson.active")?.id || location.hash.replace("#", "") || "bienvenida";
    list.innerHTML = lessons.map(([id, title], index) => {
      const done = progress.has(id);
      return `<button class="lesson-row${done ? " done" : ""}${id === activeLesson ? " active" : ""}" type="button" data-go="${id}">
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
    $$("[data-checklist] input[type='checkbox']").forEach((input) => {
      const progress = new Set(storedProgress());
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
    const recipe = recipes[key] || recipes["mole-rojo"];
    $("#recipeOutput").innerHTML = `<div class="recipe-card"><h3>${recipe.title}</h3><p>${recipe.body}</p><div class="tip">Tip de venta: publica foto del frasco abierto, una cucharada con textura y una idea clara de uso.</div></div>`;
  }

  function renderSauce(key) {
    const sauce = sauces[key] || sauces.verde;
    $("#sauceOutput").innerHTML = `<div class="recipe-card"><h3>${sauce.title}</h3><p>${sauce.body}</p><div class="warning">Prueba sal, acidez y picor antes de envasar. El sabor se concentra al reposar.</div></div>`;
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
        alert("Manten presionado el texto para copiarlo.");
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
      const labor = (Number($("#costHours").value) || 0) * (Number($("#costHourly").value) || 0);
      const total = ["#costIngredients", "#costPackaging", "#costUtilities", "#costLabels"]
        .reduce((sum, id) => sum + (Number($(id).value) || 0), labor);
      const unit = total / qty;
      $("#costResult").innerHTML = [
        metric("Costo total", money(total)),
        metric("Costo por frasco", money(unit)),
        metric("Precio minimo 2x", money(unit * 2)),
        metric("Precio ideal 3x", money(unit * 3))
      ].join("");
    });

    $("#profitForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const qty = Number($("#profitQty").value) || 1;
      const price = Number($("#profitPrice").value) || 0;
      const cost = Number($("#profitCost").value) || 0;
      const batches = Number($("#profitBatches").value) || 1;
      const income = qty * price;
      const totalCost = qty * cost;
      const profit = income - totalCost;
      const margin = income > 0 ? `${((profit / income) * 100).toFixed(1)}%` : "0%";
      $("#profitResult").innerHTML = [
        metric("Ingreso por tanda", money(income)),
        metric("Ganancia tanda", money(profit)),
        metric("Ganancia mensual", money(profit * batches)),
        metric("Margen", margin)
      ].join("");
    });

    $("#batchPlanner").addEventListener("submit", (event) => {
      event.preventDefault();
      const product = $("#batchProduct").value;
      const jars = Number($("#batchJars").value) || 1;
      const labels = Math.ceil(jars * 1.1);
      $("#batchOutput").hidden = false;
      $("#batchOutput").innerHTML = `<strong>Plan para ${jars} frascos de ${product}</strong><br>Compra ${labels} frascos/tapas para tener respaldo.<br>Produce un dia antes de entregar, etiqueta por lote y aparta 1 frasco para foto y prueba de sabor.`;
    });

    $("#orderForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const total = Number($("#orderTotal").value) || 0;
      const advance = Number($("#orderAdvance").value) || 0;
      const pending = Math.max(total - advance, 0);
      const message = `Hola ${$("#orderName").value || "cliente"}, confirmo tu pedido:\n\nProducto: ${$("#orderDesc").value || "Por definir"}\nFecha: ${$("#orderDate").value || "Por confirmar"}\nEntrega: ${$("#orderDelivery").value || "Por confirmar"}\nTotal: ${money(total)}\nAnticipo: ${money(advance)}\nSaldo pendiente: ${money(pending)}\n\nTu pedido queda apartado al recibir el anticipo. Gracias por apoyar un producto artesanal.`;
      $("#orderOutput").hidden = false;
      $("#orderOutput").textContent = message;
      $("[data-copy-target='orderOutput']").hidden = false;
    });

    $("#socialForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const product = $("#socialProduct").value || "Mole artesanal";
      const price = Number($("#socialPrice").value) || 0;
      const zone = $("#socialZone").value || "mi zona";
      const phone = $("#socialPhone").value || "por mensaje";
      const message = `${product} por pedido en ${zone}\n\nHecho en casa con chiles seleccionados, proceso artesanal y sabor de comal.\nPrecio desde: ${money(price)}\nIdeal para tacos, quesadillas, pollo, botanitas o comida familiar.\nAgenda con anticipo para apartar tu frasco.\nWhatsApp: ${phone}\n\n#MoleArtesanal #SalsasCaseras #HechoEnCasa #DailyTipsMX`;
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

      const sauce = event.target.closest("[data-sauce]");
      if (sauce) {
        $("[data-sauce].active")?.classList.remove("active");
        sauce.classList.add("active");
        renderSauce(sauce.dataset.sauce);
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
  renderRecipe("mole-rojo");
  renderSauce("verde");
  setupForms();
  setupInstall();
  setupEvents();
  initFromHash();
})();
