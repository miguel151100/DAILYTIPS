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
    ["fotos", "Extra: fotos e ideas visuales"],
    ["derivados", "Extra: derivados de masa"],
    ["bebidas", "Extra: bebidas"],
    ["salsas", "Extra: salsas"],
    ["errores", "Extra: errores"],
    ["temporadas", "Extra: temporadas"],
    ["precios-ciudad", "Extra: precios por ciudad"],
    ["combos", "Extra: paquetes y combos"],
    ["plan-7-dias", "Extra: plan 7 días"],
    ["descargables", "Extra: descargables"],
    ["higiene", "Extra: higiene"],
    ["pedidos", "Extra: pedidos"],
    ["timer", "Extra: timer"],
    ["certificado", "Extra: certificado"],
    ["faq", "Extra: FAQ"]
  ];

  const lessonBadges = {
    bienvenida: "Comenzar",
    ingredientes: "Técnica Base",
    masa: "Técnica Base",
    rellenos: "Sabores",
    recetas: "5 Estilos",
    coccion: "Vapor",
    costos: "Costeo",
    ganancias: "Margen",
    ventas: "Venta Casa",
    "facebook-whatsapp": "Facebook/WA",
    actualizaciones: "Incluido",
    soporte: "WhatsApp",
    instalar: "PWA",
    fotos: "Catálogo",
    derivados: "Menú Extra",
    bebidas: "Combos",
    salsas: "Complementos",
    errores: "Solución",
    temporadas: "Calendario",
    "precios-ciudad": "Precio Local",
    combos: "Paquetes",
    "plan-7-dias": "Lanzamiento",
    descargables: "Plantillas",
    higiene: "Seguridad",
    pedidos: "Confirmación",
    timer: "Cocina",
    certificado: "Logro",
    faq: "Dudas"
  };

  const recipes = {
    rojos: {
      title: "Tamales rojos - 24 piezas",
      ingredients: ["500 g de masa base salada", "500 g de pollo o cerdo cocido y deshebrado", "6 chiles guajillo limpios", "3 chiles ancho limpios", "4 jitomates asados", "1/2 cebolla", "3 dientes de ajo", "1 pizca de comino", "Sal al gusto", "24 hojas de maíz remojadas"],
      steps: ["Remoja las hojas de maíz en agua caliente durante 35 minutos.", "Cuece la carne con sal, ajo y cebolla durante 35 a 45 minutos.", "Reserva 500 ml del caldo para la masa.", "Tuesta ligeramente los chiles 10 segundos por lado, sin quemarlos.", "Hidrata los chiles en agua caliente durante 12 minutos.", "Licúa chiles, jitomate, cebolla, ajo, comino y una taza de caldo.", "Cuela la salsa si quieres textura más fina para venta.", "Fríe la salsa 10 minutos hasta que cambie a rojo profundo.", "Integra la carne y cocina 8 minutos más para que absorba sabor.", "Unta masa en la hoja, agrega relleno al centro, dobla y acomoda parado en vaporera."],
      time: "Preparación 1 h 20 min + cocción 1 h 20 min.",
      leaves: "Hoja de maíz grande y flexible; usa dos hojas si el relleno queda muy jugoso.",
      cooking: "Vapor fuerte los primeros 10 minutos, luego medio. Revisa agua cada 30 minutos. Reposa 10 minutos antes de abrir.",
      flavor: "La salsa debe quedar un poco más salada de lo normal porque la masa suaviza el sabor."
    },
    verdes: {
      title: "Tamales verdes - 24 piezas",
      ingredients: ["500 g de masa base salada", "500 g de pollo deshebrado", "600 g de tomatillo", "4 a 6 chiles serranos", "1/2 cebolla", "2 dientes de ajo", "1 manojo pequeño de cilantro", "1 taza de caldo", "Sal", "24 hojas de maíz"],
      steps: ["Lava tomatillos y retira la cáscara pegajosa.", "Hierve tomatillos y serranos 8 minutos hasta que cambien de tono.", "Escurre para que la salsa no quede aguada.", "Licúa con cebolla, ajo, cilantro y caldo.", "Sofríe la salsa 8 a 10 minutos.", "Agrega pollo deshebrado y mezcla hasta cubrirlo.", "Prueba sal; debe sentirse sabrosa pero no amarga.", "Extiende masa delgada en la hoja para que el relleno luzca.", "Agrega una cucharada abundante de pollo verde.", "Dobla, acomoda y cocina al vapor 1 h 15 min a 1 h 25 min."],
      time: "Preparación 55 min + cocción 1 h 20 min.",
      leaves: "Hoja de maíz mediana; si está rota, úsala como refuerzo por fuera.",
      cooking: "No llenes demasiado la vaporera; deja espacio para que circule el vapor.",
      flavor: "Un poco de cilantro fresco al final levanta el aroma; evita hervirlo demasiado."
    },
    rajas: {
      title: "Rajas con queso - 24 piezas",
      ingredients: ["500 g de masa base", "6 chiles poblanos", "300 g de queso Oaxaca", "200 ml de crema", "1/2 cebolla fileteada", "1 cucharada de mantequilla", "Sal", "Pimienta", "24 hojas de maíz", "Opcional: elote amarillo"],
      steps: ["Asa los poblanos directo al fuego hasta que la piel se queme parejo.", "Mételos en bolsa 10 minutos para sudarlos.", "Pela, abre, retira semillas y corta en rajas.", "Sofríe cebolla con mantequilla durante 5 minutos.", "Agrega rajas y cocina 4 minutos más.", "Añade crema, sal y pimienta; cocina solo 2 minutos.", "Deshebra el queso en tiras para que funda mejor.", "Unta masa en hoja de maíz sin llegar a los bordes.", "Coloca rajas, crema y queso en el centro.", "Dobla y cocina al vapor 1 h 15 min; reposa 10 minutos."],
      time: "Preparación 45 min + cocción 1 h 15 min.",
      leaves: "Hoja de maíz ancha; este relleno queda cremoso y necesita buen cierre.",
      cooking: "Evita exceso de crema para que no se abra el tamal.",
      flavor: "El poblano debe saber ahumado, no quemado; limpia bien la piel negra."
    },
    dulces: {
      title: "Tamales dulces - 24 piezas",
      ingredients: ["500 g de harina de maíz", "220 g de mantequilla o manteca vegetal", "450 ml de leche tibia", "120 g de azúcar", "1 cdita de polvo para hornear", "1 cdita de vainilla", "1/2 cdita de canela", "Color vegetal rosa o amarillo", "150 g de piña, pasas o cajeta", "24 hojas de maíz"],
      steps: ["Remoja hojas 35 minutos y seca antes de usar.", "Bate mantequilla 6 minutos hasta que se aclare.", "Mezcla harina, azúcar, canela y polvo para hornear.", "Agrega leche tibia poco a poco.", "Integra vainilla y color vegetal.", "Bate hasta que la masa se vea ligera y uniforme.", "Escurre muy bien fruta en almíbar si usas piña.", "Agrega pasas o fruta sin excederte para no humedecer.", "Unta masa, dobla y acomoda con el doblez hacia dentro.", "Cocina 1 h 10 min a 1 h 20 min y reposa 15 minutos."],
      time: "Preparación 45 min + cocción 1 h 15 min.",
      leaves: "Hoja de maíz limpia; para dulces evita hojas con olor ahumado fuerte.",
      cooking: "Reposa más que los salados para que la miga dulce termine de fijar.",
      flavor: "La vainilla y canela deben sentirse suaves; si sabe plano, falta una pizca de sal."
    },
    especiales: {
      title: "Especiales premium",
      ingredients: ["Masa base según receta", "Relleno premium: camarón, mole, elote, soya o chocolate", "Salsa concentrada", "Hojas de maíz o plátano", "Empaque individual", "Etiqueta de sabor", "Salsa aparte", "Guarnición opcional", "Costo calculado por pieza", "Precio premium"],
      steps: ["Define un solo especial por semana para controlar inventario.", "Calcula costo real del ingrediente premium.", "Prepara la salsa más espesa que para tamal clásico.", "Prueba el relleno solo antes de armar.", "Usa menos masa y más relleno visible para justificar precio.", "Elige hoja de plátano para mole u oaxaqueños.", "Cierra con doble envoltura si el relleno tiene grasa.", "Cocina 1 h 30 min si es hoja de plátano o pieza grande.", "Etiqueta el sabor y fecha de elaboración.", "Vende en paquete de 6 o 12 con precio mayor."],
      time: "Preparación 1 h a 2 h + cocción 1 h 20 min a 1 h 40 min.",
      leaves: "Hoja de plátano para oaxaqueños y mole; hoja de maíz para dulces, camarón y soya.",
      cooking: "Los especiales con salsa pesada necesitan más reposo para no romperse.",
      flavor: "Un especial debe tener aroma fuerte y relleno claro; si no se distingue, no puedes cobrar premium."
    }
  };

  const stateKey = "dailyTipsTamalesProgress";
  const templates = {
    compras: `LISTA DE COMPRAS - CURSO DE TAMALES

Base:
- Harina de maiz nixtamalizado
- Manteca o aceite vegetal
- Caldo sazonado
- Polvo para hornear
- Sal
- Hojas de maiz o platano

Rellenos:
- Pollo, cerdo, queso, rajas o ingredientes dulces
- Jitomate, tomatillo, chiles, cebolla, ajo
- Crema, queso Oaxaca, mole, cajeta, piña o pasas

Venta:
- Bolsas kraft, etiquetas, servilletas, salsas y vasos para bebidas`,
    costos: `TABLA DE COSTOS - TAMALES

Cantidad:
Ingredientes:
Hojas/empaque:
Gas/electricidad:
Mano de obra:
Costo total:
Costo por tamal:
Precio de venta:
Ganancia neta:
Margen:`,
    pedidos: `CONTROL DE PEDIDOS

Cliente:
Telefono:
Pedido:
Fecha de entrega:
Modalidad:
Total:
Anticipo:
Restante:
Notas:
Entregado: Si / No`,
    checklist: `CHECKLIST DE LANZAMIENTO

[ ] Elegi 3 sabores
[ ] Calcule costo por pieza
[ ] Defini precio bajo, recomendado y premium
[ ] Tome fotos con luz natural
[ ] Publique en WhatsApp y Facebook
[ ] Pedi anticipo para apartar
[ ] Prepare etiquetas y empaque
[ ] Pedi resenas despues de entregar`
  };

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
    const activeId = $(".lesson.active")?.id || "bienvenida";
    const rows = baseLessons.concat(extraLessons).map(([id, title], index) => {
      const isBase = index < baseLessons.length;
      const completed = isBase && progress.has(id);
      const number = isBase ? String(index + 1) : "+";
      const badge = completed ? "¡Listo!" : lessonBadges[id] || "Guía";
      return `<button class="lesson-row${id === activeId ? " active" : ""}${completed ? " completed" : ""}" type="button" data-go="${id}">
        <span class="num">${number}</span>
        <span class="lesson-title">${title}</span>
        <span class="lesson-badge">${badge}</span>
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
    $("#recipeOutput").innerHTML = `<div class="recipe-detail">
      <h3>${recipe.title}</h3>
      <div class="recipe-meta">
        <span>${recipe.time}</span>
        <span>${recipe.leaves}</span>
      </div>
      <h4>Ingredientes y cantidades</h4>
      <ul>${recipe.ingredients.map((item) => `<li>${item}</li>`).join("")}</ul>
      <h4>Preparación paso a paso</h4>
      <ol>${recipe.steps.map((item) => `<li>${item}</li>`).join("")}</ol>
      <div class="tip"><strong>Tips de cocimiento:</strong> ${recipe.cooking}</div>
      <div class="tip"><strong>Tips de sabor:</strong> ${recipe.flavor}</div>
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
      const total = (Number($("#costIngredients").value) || 0) + (Number($("#costPackaging").value) || 0) + (Number($("#costGas").value) || 0) + (Number($("#costLabor").value) || 0);
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
      const sauce = $("#recipeSauce").value;
      const color = $("#recipeColor").value;
      const qty = Number($("#recipeQty").value) || 20;
      const masa = Math.round(qty * 25);
      const fat = Math.round(qty * 6.5);
      const liquid = Math.round(qty * 20);
      const fillingAmount = Math.round(qty * 20);
      const output = $("#generatedRecipe");
      output.hidden = false;
      output.innerHTML = `<div class="recipe-detail compact">
        <h3>Receta generada: ${qty} tamales de ${filling}</h3>
        <div class="recipe-meta"><span>Preparación 50 a 90 min</span><span>Cocción 1 h 15 min a 1 h 30 min</span><span>Hoja sugerida: maíz; plátano si usas mole</span></div>
        <h4>Ingredientes y cantidades</h4>
        <ul>
          <li>${masa} g de harina de maíz nixtamalizado</li>
          <li>${fat} g de manteca, mantequilla o aceite según estilo</li>
          <li>${liquid} ml de caldo sazonado o leche tibia</li>
          <li>${Math.max(1, Math.round(qty / 24))} cdita de sal y ${Math.max(1, Math.round(qty / 24))} cdita de polvo para hornear</li>
          <li>${fillingAmount} g de ${filling}</li>
          <li>Salsa o estilo: ${sauce}</li>
          <li>Color de masa: ${color}</li>
          <li>${qty + 6} hojas de maíz remojadas para tener repuesto</li>
        </ul>
        <h4>Preparación súper explicada</h4>
        <ol>
          <li>Remoja las hojas en agua caliente durante 35 minutos; separa las rotas para usarlas como refuerzo.</li>
          <li>Prepara el relleno hasta que quede sabroso y con poca humedad; si es guisado, sofríe 8 a 12 minutos.</li>
          <li>Calienta el caldo o leche solo tibio; no debe hervir porque endurece la masa.</li>
          <li>Bate la grasa 5 a 7 minutos hasta que se vea más clara y ligera.</li>
          <li>Mezcla harina, sal y polvo para hornear antes de agregar líquidos.</li>
          <li>Agrega líquido poco a poco y bate hasta que la masa no se pegue de forma pesada.</li>
          <li>Haz la prueba del agua: una bolita debe flotar; si se hunde, bate 3 minutos más.</li>
          <li>Unta una capa pareja en cada hoja, dejando 2 cm libres en los bordes.</li>
          <li>Coloca relleno al centro; evita exceso para que no se abra durante vapor.</li>
          <li>Dobla laterales, cierra punta y acomoda parado en vaporera con el doblez hacia dentro.</li>
          <li>Cocina con vapor constante: 10 minutos fuerte y luego 65 a 80 minutos a fuego medio.</li>
          <li>Reposa 10 a 15 minutos antes de vender o empacar para que la masa termine de asentarse.</li>
        </ol>
        <div class="tip"><strong>Cocimiento:</strong> revisa agua cada 30 minutos y agrega agua caliente, nunca fría.</div>
        <div class="tip"><strong>Sabor:</strong> el relleno debe saber 15% más intenso porque la masa suaviza sal, chile y especias.</div>
        <div class="tip"><strong>Venta:</strong> costo estimado ${money(qty * 4.5)}; precio sugerido ${money(qty * 20)} a ${money(qty * 24)}.</div>
      </div>`;
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

    $("#cityPriceForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const unit = Number($("#cityUnitCost").value) || 0;
      const zone = $("#cityZone").value;
      const type = $("#cityType").value;
      const zoneFactor = { popular: 2.05, media: 2.45, premium: 2.95 }[zone] || 2.3;
      const typeAdd = { clasico: 0, queso: 2, especial: 6, dulce: 1.5 }[type] || 0;
      const low = Math.ceil(unit * (zoneFactor - 0.35) + typeAdd);
      const recommended = Math.ceil(unit * zoneFactor + typeAdd);
      const premium = Math.ceil(unit * (zoneFactor + 0.55) + typeAdd + 2);
      $("#cityPriceResult").innerHTML = [
        metric("Precio bajo", `$${low} MXN`),
        metric("Recomendado", `$${recommended} MXN`),
        metric("Premium", `$${premium} MXN`),
        metric("Regla", "sube por zona, empaque y especialidad")
      ].join("");
    });

    $("#comboForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const price = Number($("#comboPrice").value) || 0;
      const extraCost = Number($("#comboExtraCost").value) || 0;
      const count = Number($("#comboType").value) || 6;
      const hasExtra = count >= 12;
      const discount = count >= 24 ? 0.92 : count >= 12 ? 0.96 : 1;
      const total = Math.ceil((price * count * discount) + (hasExtra ? extraCost * 1.65 : 0));
      const label = count === 50 ? "Paquete evento" : `Paquete ${count} tamales`;
      const output = $("#comboOutput");
      output.hidden = false;
      output.textContent = `${label}
Incluye: ${count} tamales surtidos${hasExtra ? " + salsa/bebida" : ""}.
Precio especial: ${money(total)}
Mensaje: Hola! Tengo ${label.toLowerCase()} para esta semana. Se aparta con anticipo y entrego por pedido. ¿Te reservo uno?`;
      $('[data-copy-target="comboOutput"]').hidden = false;
    });

    $("#certificateForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#certificateName").value || "Emprendedora Daily Tips";
      const complete = $("#progressText").textContent;
      const box = $("#certificateOutput");
      box.hidden = false;
      box.innerHTML = `<span>Daily Tips MX</span><strong>${name}</strong><p>Curso completado: Lista para vender tamales desde casa.</p><small>Progreso actual: ${complete}</small>`;
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

      const download = event.target.closest("[data-download-template]");
      if (download) {
        const key = download.dataset.downloadTemplate;
        const text = templates[key] || "";
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tamales-${key}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
