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

  const doughProfiles = {
    napolitana: { label: "Napolitana 24 h", flour: 125, water: 79, salt: 3, yeast: 0.3, oil: 0, rest: "18 a 24 h en frío" },
    newyork: { label: "New York", flour: 130, water: 81, salt: 3, yeast: 1, oil: 4, rest: "2 h + 12 h opcional" },
    pan: { label: "Pan pizza", flour: 135, water: 95, salt: 3, yeast: 1.5, oil: 8, rest: "90 min + 30 min en molde" },
    detroit: { label: "Detroit", flour: 140, water: 98, salt: 3, yeast: 1.4, oil: 6, rest: "2 h + 40 min en charola" },
    integral: { label: "Integral", flour: 130, water: 88, salt: 3, yeast: 1, oil: 5, rest: "2 h o 12 h en frío" }
  };

  const doughRecipes = [
    {
      title: "01 · Masa napolitana 24 h",
      meta: "Para 4 pizzas de 28 a 30 cm · borde aireado · línea premium",
      ingredients: ["500 g harina de fuerza o panadera", "315 ml agua fría", "12 g sal fina", "1 g levadura seca", "Semolina o harina extra para formar"],
      sauce: "Salsa cruda: 300 g jitomate triturado, 1 diente de ajo rallado, 6 g sal, 8 ml aceite de oliva y hojas de albahaca. No la cocines; solo mezcla y deja reposar.",
      toppings: "90 g mozzarella por pizza, 8 hojas de albahaca, 10 ml aceite de oliva. Para vender: agrega pepperoni o burrata como versión premium.",
      procedure: ["Mezcla agua y levadura, agrega harina y reposa 20 min para hidratar.", "Integra sal y amasa 8 min hasta que la masa se vea lisa.", "Divide en 4 bolas de 205 g, engrasa ligeramente y refrigera 18 a 24 h.", "Saca 60 min antes, estira con manos sin aplastar el borde, salsea poco y hornea en piedra o charola muy caliente."],
      times: "Amasado 8 min · fermentación 18 a 24 h · horneado 6 a 9 min en horno casero al máximo.",
      sell: "Véndela como pizza artesanal. Usa pocos toppings y cobra más por fermentación larga."
    },
    {
      title: "02 · Masa New York",
      meta: "Para 4 pizzas medianas · rebanada flexible · ideal para combos",
      ingredients: ["520 g harina", "325 ml agua", "12 g sal", "6 g azúcar", "4 g levadura seca", "18 ml aceite vegetal"],
      sauce: "Salsa cocida: 350 g tomate triturado, 15 g pasta de tomate, ajo, orégano, sal y pizca de azúcar. Cocina 12 min para concentrar.",
      toppings: "110 g mozzarella por pizza, 20 a 24 rebanadas de pepperoni o 80 g jamón con piña escurrida.",
      procedure: ["Mezcla harina, azúcar y levadura; agrega agua y amasa 5 min.", "Añade sal y aceite, amasa 6 min más.", "Fermenta 2 h, divide en 4 bolas de 220 g y reposa 40 min.", "Estira grande, deja borde moderado, hornea en charola caliente hasta dorar la base."],
      times: "Amasado 11 min · fermentación 2 h · horneado 8 a 11 min.",
      sell: "Perfecta para vender rebanadas grandes, combos de oficina y promociones 2x."
    },
    {
      title: "03 · Masa romana delgada",
      meta: "Para 5 pizzas delgadas · crujiente · viaja bien en delivery",
      ingredients: ["500 g harina", "300 ml agua", "12 g sal", "5 g levadura seca", "20 ml aceite de oliva"],
      sauce: "Salsa rápida: 300 g tomate, 5 g sal, ajo en polvo, orégano y 10 ml aceite. Úsala ligera para que la base no se ablande.",
      toppings: "70 a 90 g queso por pizza, pepperoni, champiñón precocido, aceituna o anchoa. No excedas toppings húmedos.",
      procedure: ["Amasa todos los ingredientes 10 min.", "Fermenta 60 a 90 min hasta que crezca.", "Divide en 5 bolas de 165 g y reposa 20 min.", "Estira muy fina, salsea poco y hornea fuerte hasta que las orillas crujan."],
      times: "Amasado 10 min · fermentación 90 min · horneado 6 a 8 min.",
      sell: "Buena para entregas porque mantiene textura y no se cae al tomarla."
    },
    {
      title: "04 · Pan pizza en sartén",
      meta: "Para 4 pizzas personales gruesas · sin horno profesional",
      ingredients: ["500 g harina", "350 ml agua", "12 g sal", "6 g levadura seca", "25 ml aceite para masa", "30 ml aceite para sartén"],
      sauce: "Salsa espesa: 300 g tomate, 20 g pasta de tomate, ajo, sal, orégano y chile quebrado. Debe quedar densa.",
      toppings: "120 g queso por pizza, pepperoni, tocino, jalapeño o pollo. Va bien con orilla dorada y queso extra.",
      procedure: ["Mezcla hasta obtener masa pegajosa y deja reposar 15 min.", "Haz pliegues con manos aceitadas cada 20 min durante 1 h.", "Coloca en sartén aceitado, reposa 30 min y extiende con dedos.", "Cocina tapada a fuego bajo 8 min, agrega salsa y toppings, tapa 8 a 10 min más."],
      times: "Preparación 20 min · reposos 90 min · cocción 16 a 20 min.",
      sell: "Ideal para iniciar desde casa: se ve abundante, llena más y no exige horno caro."
    },
    {
      title: "05 · Masa siciliana rectangular",
      meta: "Para 1 charola grande · venta por cuadro o familiar",
      ingredients: ["600 g harina", "430 ml agua", "14 g sal", "6 g levadura seca", "35 ml aceite de oliva"],
      sauce: "Salsa superior: tomate triturado, ajo, orégano, sal y aceite. Puedes poner parte de la salsa arriba del queso para estilo siciliano.",
      toppings: "250 g mozzarella, pepperoni, cebolla, pimiento, aceituna o carnes frías. Corta en 8 a 12 cuadros.",
      procedure: ["Mezcla masa hidratada y reposa 30 min.", "Haz 3 tandas de pliegues cada 20 min.", "Pasa a charola aceitada y estira por etapas sin romper.", "Fermenta 45 min en charola, agrega toppings y hornea hasta base dorada."],
      times: "Pliegues 60 min · charola 45 min · horneado 18 a 24 min.",
      sell: "Excelente para reuniones y paquetes familiares porque se porciona fácil."
    },
    {
      title: "06 · Detroit con orilla de queso",
      meta: "Para 1 charola Detroit · producto fotogénico",
      ingredients: ["560 g harina", "392 ml agua", "12 g sal", "6 g levadura seca", "25 ml aceite"],
      sauce: "Salsa al final: tomate cocido con ajo, sal, orégano y mantequilla. Se coloca en líneas después de hornear parcialmente.",
      toppings: "220 g queso que dore en orilla, pepperoni tipo copa o pepperoni normal, parmesano y salsa en franjas.",
      procedure: ["Amasa 8 min y deja fermentar 2 h.", "Aceita charola profunda, coloca masa y estira por etapas.", "Pon queso hasta tocar las paredes para crear costra.", "Hornea 12 min, agrega salsa en franjas y termina 5 a 8 min."],
      times: "Fermentación 2 h · charola 40 min · horneado 17 a 20 min.",
      sell: "Úsala como pizza estrella para redes: la orilla crujiente justifica precio premium."
    },
    {
      title: "07 · Focaccia pizza",
      meta: "Para charola mediana · masa alta y aromática",
      ingredients: ["500 g harina", "380 ml agua", "11 g sal", "4 g levadura seca", "35 ml aceite de oliva", "Romero opcional"],
      sauce: "Pesto económico o salsa de tomate ligera. No satures porque la masa ya tiene aceite y mucha miga.",
      toppings: "Queso, tomate cherry, vegetales rostizados, pollo, champiñón o burrata al final.",
      procedure: ["Mezcla sin amasar demasiado y reposa 30 min.", "Haz 4 pliegues con manos mojadas cada 20 min.", "Pasa a charola con aceite y fermenta hasta que tiemble al mover.", "Marca hoyuelos con dedos, agrega toppings y hornea fuerte."],
      times: "Pliegues 80 min · charola 60 min · horneado 18 a 22 min.",
      sell: "Buena para vender como artesanal por rebanada gruesa o brunch de fin de semana."
    },
    {
      title: "08 · Masa integral suave",
      meta: "Para 4 pizzas medianas · opción saludable sin quedar seca",
      ingredients: ["350 g harina blanca", "150 g harina integral", "335 ml agua", "12 g sal", "5 g levadura seca", "20 ml aceite"],
      sauce: "Marinara ligera con tomate, ajo, albahaca y aceite. Combina con vegetales y pollo.",
      toppings: "Mozzarella moderada, champiñón, pimiento, espinaca, pollo, jitomate cherry o queso panela.",
      procedure: ["Mezcla harinas con agua y reposa 25 min para suavizar salvado.", "Agrega sal, levadura y aceite; amasa 8 min.", "Fermenta 2 h y divide en bolas de 210 g.", "Estira con cuidado; si se rompe, reposa 10 min y continúa."],
      times: "Reposo inicial 25 min · fermentación 2 h · horneado 8 a 10 min.",
      sell: "Úsala para clientes que piden algo más ligero; no la vendas como dietética, véndela como integral artesanal."
    },
    {
      title: "09 · Masa madre comercial",
      meta: "Para 4 pizzas · sabor profundo · nivel avanzado",
      ingredients: ["450 g harina", "50 g masa madre activa", "300 ml agua", "12 g sal", "10 ml aceite opcional"],
      sauce: "Tomate clásico o salsa blanca. Con masa madre convienen toppings simples para que se note el sabor.",
      toppings: "Mozzarella, hongos salteados, prosciutto, albahaca, parmesano o aceite de ajo.",
      procedure: ["Mezcla harina, agua y masa madre; reposa 30 min.", "Agrega sal y haz pliegues cada 30 min por 2 h.", "Fermenta a temperatura ambiente 3 a 4 h y refrigera 12 h.", "Divide, atempera 90 min, estira y hornea fuerte."],
      times: "Proceso total 16 a 20 h · horneado 7 a 10 min.",
      sell: "Producto premium para clientes que valoran fermentación natural. Cobra más y explica el proceso."
    },
    {
      title: "10 · Masa sin gluten operativa",
      meta: "Para 3 pizzas medianas · solo si puedes separar utensilios",
      ingredients: ["420 g mezcla sin gluten certificada", "360 ml agua", "10 g sal", "6 g levadura seca", "20 ml aceite", "5 g goma xantana si la mezcla no trae"],
      sauce: "Salsa de tomate espesa sin harina ni espesantes dudosos. Revisa etiquetas de todos los ingredientes.",
      toppings: "Queso, vegetales, pollo o pepperoni certificado sin gluten. Evita contaminación cruzada.",
      procedure: ["Mezcla con pala; no busques elasticidad como trigo.", "Reposa 35 min hasta que espese.", "Extiende con manos aceitadas sobre papel para hornear.", "Prehornea 6 min, agrega salsa y toppings, termina 8 a 10 min."],
      times: "Reposo 35 min · prehorneado 6 min · horneado final 8 a 10 min.",
      sell: "Solo ofrécela si puedes trabajar separado. Es nicho premium, pero requiere mucha responsabilidad."
    }
  ];

  const ingredientOptions = [
    { id: "pepperoni", icon: "●", name: "Pepperoni", grams: 35 },
    { id: "jamon", icon: "▣", name: "Jamón", grams: 45 },
    { id: "pina", icon: "◆", name: "Piña", grams: 45 },
    { id: "chorizo", icon: "●", name: "Chorizo cocido", grams: 40 },
    { id: "pollo", icon: "▰", name: "Pollo", grams: 55 },
    { id: "tocino", icon: "▤", name: "Tocino", grams: 30 },
    { id: "carne", icon: "◼", name: "Carne molida", grams: 55 },
    { id: "champinon", icon: "◒", name: "Champiñón", grams: 45 },
    { id: "pimiento", icon: "▵", name: "Pimiento", grams: 35 },
    { id: "cebolla", icon: "◎", name: "Cebolla morada", grams: 25 },
    { id: "jalapeno", icon: "▴", name: "Jalapeño", grams: 18 },
    { id: "elote", icon: "◇", name: "Elote", grams: 35 },
    { id: "aceituna", icon: "○", name: "Aceituna", grams: 20 },
    { id: "espinaca", icon: "⌁", name: "Espinaca", grams: 20 },
    { id: "jitomate", icon: "◉", name: "Jitomate cherry", grams: 40 },
    { id: "burrata", icon: "◌", name: "Burrata", grams: 60 },
    { id: "parmesano", icon: "✦", name: "Parmesano", grams: 12 },
    { id: "albahaca", icon: "✧", name: "Albahaca", grams: 4 }
  ];

  const recipes = {
    margherita: {
      title: "Margherita rentable",
      body: "Masa napolitana o New York, salsa de tomate clásica, 100 g mozzarella, albahaca y aceite. Hornea hasta que el borde infle y el queso burbujee. Es tu receta de control: si esta sale bien, tu masa, salsa y horno están listos.",
      amounts: "Para 4 medianas: 820 g masa total, 220 g salsa, 400 g mozzarella, 20 ml aceite y 20 hojas de albahaca."
    },
    pepperoni: {
      title: "Pepperoni clásica",
      body: "Salsa de tomate, mozzarella y pepperoni medido por pieza. No tapes toda la pizza: deja espacios para que el queso dore y el pepperoni suelte grasa sin aguadar.",
      amounts: "Para 4 medianas: 880 g masa, 240 g salsa, 440 g queso, 160 g pepperoni."
    },
    hawaiana: {
      title: "Hawaiana de venta rápida",
      body: "Salsa de tomate, mozzarella, jamón y piña bien escurrida. La clave es secar la piña con papel antes de ponerla para que no suelte líquido.",
      amounts: "Para 4 medianas: 880 g masa, 220 g salsa, 420 g queso, 180 g jamón, 180 g piña."
    },
    mexicana: {
      title: "Mexicana especial",
      body: "Salsa de tomate, mozzarella, chorizo cocido, jalapeño, cebolla morada y elote. Cocina el chorizo antes y escurre grasa.",
      amounts: "Para 4 medianas: 880 g masa, 240 g salsa, 440 g queso, 160 g chorizo, 70 g jalapeño, 100 g cebolla, 120 g elote."
    },
    bbq: {
      title: "BBQ chicken",
      body: "Salsa BBQ casera, mozzarella, pollo deshebrado, cebolla morada y cilantro. Es una pizza de alto impacto para redes porque brilla y se reconoce rápido.",
      amounts: "Para 4 medianas: 880 g masa, 220 g salsa BBQ, 420 g queso, 220 g pollo, 90 g cebolla."
    },
    vegetariana: {
      title: "Vegetariana con margen",
      body: "Salsa de tomate, mozzarella, pimiento, champiñón precocido, cebolla y aceituna. Precocina vegetales para evitar agua y mejorar sabor.",
      amounts: "Para 4 medianas: 880 g masa, 220 g salsa, 380 g queso, 160 g champiñón, 120 g pimiento, 80 g cebolla, 70 g aceituna."
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

  function renderDoughRecipes() {
    const list = $("#doughRecipeList");
    if (!list) return;

    list.innerHTML = doughRecipes.map((recipe, index) => `<details class="dough-card"${index === 0 ? " open" : ""}>
      <summary><span>${recipe.title}</span><b>${recipe.meta}</b></summary>
      <div class="dough-body">
        <div><h4>Ingredientes de masa</h4><ul>${recipe.ingredients.map((item) => `<li>${item}</li>`).join("")}</ul></div>
        <div><h4>Salsa recomendada</h4><p>${recipe.sauce}</p></div>
        <div><h4>Queso e ingredientes</h4><p>${recipe.toppings}</p></div>
        <div><h4>Procedimiento</h4><ol>${recipe.procedure.map((item) => `<li>${item}</li>`).join("")}</ol></div>
        <div class="recipe-meta"><strong>Tiempos:</strong> ${recipe.times}</div>
        <div class="recipe-meta sell"><strong>Venta:</strong> ${recipe.sell}</div>
      </div>
    </details>`).join("");
  }

  function renderIngredientPicker() {
    const grid = $("#ingredientGrid");
    if (!grid) return;

    grid.innerHTML = ingredientOptions.map((item, index) => `<label class="ingredient-chip">
      <input type="checkbox" value="${item.id}" ${index < 4 ? "checked" : ""}>
      <span class="ingredient-icon">${item.icon}</span>
      <span>${item.name}</span>
    </label>`).join("");
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
    $("#recipeOutput").innerHTML = `<div class="recipe-card">
      <h3>${recipe.title}</h3>
      <p>${recipe.body}</p>
      <div class="tip"><b>Cantidades:</b> ${recipe.amounts}</div>
      <div class="tip">Tip de venta: fotografía una rebanada levantada con queso derretido y publica cupos por horario.</div>
    </div>`;
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

  function selectedIngredients() {
    return $$("#ingredientGrid input:checked")
      .map((input) => ingredientOptions.find((item) => item.id === input.value))
      .filter(Boolean);
  }

  function setupForms() {
    $("#costForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const qty = Number($("#costQty").value) || 0;
      const total = (Number($("#costIngredients").value) || 0) + (Number($("#costPackaging").value) || 0) + (Number($("#costGas").value) || 0);
      const commission = (Number($("#costCommission").value) || 0) / 100;
      const margin = (Number($("#costMargin").value) || 0) / 100;
      const delivery = Number($("#costDelivery").value) || 0;
      const costPerPizza = qty > 0 ? total / qty : 0;
      const priceBeforeCommission = margin < 0.95 ? costPerPizza / (1 - margin) : costPerPizza;
      const suggested = commission < 0.95 ? priceBeforeCommission / (1 - commission) : priceBeforeCommission;
      const customerPrice = Math.max(0, suggested - delivery);

      $("#costResult").innerHTML = [
        metric("Costo total", money(total)),
        metric("Costo por pizza", qty > 0 ? money(costPerPizza) : "$0.00 MXN"),
        metric("Precio con margen", money(priceBeforeCommission)),
        metric("Precio sugerido", money(customerPrice)),
        metric("Comisión considerada", `${(commission * 100).toFixed(1)}%`),
        metric("Tamaño", `${$("#costSize").value} cm`),
        metric("Margen objetivo", `${(margin * 100).toFixed(0)}%`),
        metric("Lote", `${qty} pizzas`)
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
      const name = $("#customPizzaName").value || "Pizza especial de la casa";
      const qty = Number($("#recipeQty").value) || 1;
      const size = Number($("#recipeSize").value) || 30;
      const dough = doughProfiles[$("#recipeDough").value] || doughProfiles.napolitana;
      const sauce = $("#recipeSauce").value;
      const price = Number($("#recipePrice").value) || 0;
      const channel = $("#recipeChannel").value;
      const scale = size === 22 ? 0.68 : size === 35 ? 1.25 : size === 40 ? 1.55 : 1;
      const chosen = selectedIngredients();
      const ingredients = chosen.length ? chosen : ingredientOptions.slice(0, 3);
      const toppingLines = ingredients.map((item) => `- ${item.name}: ${Math.round(item.grams * scale * qty)} g`).join("\n");
      const cheese = Math.round(110 * scale * qty);
      const sauceQty = Math.round(55 * scale * qty);
      const flour = Math.round(dough.flour * scale * qty);
      const water = Math.round(dough.water * scale * qty);
      const salt = Math.round(dough.salt * scale * qty);
      const yeast = Math.max(1, Math.round(dough.yeast * scale * qty));
      const oil = Math.round(dough.oil * scale * qty);
      const output = $("#generatedRecipe");

      output.hidden = false;
      output.textContent = `${name.toUpperCase()}
Canal recomendado: ${channel}
Cantidad: ${qty} pizza(s) de ${size} cm
Masa: ${dough.label}

INGREDIENTES DE MASA
- Harina: ${flour} g
- Agua: ${water} ml
- Sal: ${salt} g
- Levadura seca: ${yeast} g
${oil > 0 ? `- Aceite: ${oil} ml` : "- Aceite: no lleva en esta masa"}
- Reposo recomendado: ${dough.rest}

SALSA Y QUESO
- Salsa: ${sauceQty} g de ${sauce}
- Queso mozzarella/Oaxaca: ${cheese} g

INGREDIENTES SELECCIONADOS
${toppingLines}

PROCEDIMIENTO
1. Prepara la masa y respeta el reposo indicado.
2. Precalienta horno, piedra o charola al máximo por 30 minutos.
3. Estira la masa sin aplastar todo el borde.
4. Agrega salsa medida, queso y toppings pesados.
5. Hornea hasta que la base dore y el queso burbujee.
6. Deja reposar 2 minutos, corta y empaca con ligera ventilación.

TIEMPOS
Preparación activa: 20 a 35 min.
Reposo: ${dough.rest}.
Horneado: 7 a 12 min según horno y tamaño.

PRECIO Y VENTA
Precio objetivo por pizza: ${money(price)}.
Venta total estimada: ${money(price * qty)}.
Texto corto: Hoy tengo ${name} de ${size} cm con ${ingredients.map((item) => item.name).join(", ")}. Se entrega por horario y se aparta con anticipo.`;
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
    renderDoughRecipes();
    renderIngredientPicker();
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
