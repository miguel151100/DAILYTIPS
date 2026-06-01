(() => {
  // Config cargada desde payment-config.js (defer, corre antes que checkout.js)
  const config = window.DAILYTIPS_PAYMENT_CONFIG || {};

  // Precios desde payment-config.js — editar allí para cambiar en todo el sitio
  const INDIVIDUAL_PRICE = config.INDIVIDUAL_PRICE_MXN || 35;
  const FULL_PACK_PRICE  = config.FULL_PACK_PRICE_MXN  || 99;

  const products = {
    standard: {
      id: "standard",
      title: "Paquete DailyTips individual",
      description: "Un paquete digital por categoría para resolver un problema específico.",
      price: INDIVIDUAL_PRICE,
      summary: "Paquete individual"
    },
    education: {
      id: "education",
      title: "Pack Educación",
      description: "Ejercicios escolares por materia, nivel y tema.",
      price: INDIVIDUAL_PRICE,
      summary: "Ejercicios educativos"
    },
    total: {
      id: "total",
      title: "Pack Completo DailyTips",
      description: "Toda la biblioteca DailyTips en un solo paquete.",
      price: FULL_PACK_PRICE,
      summary: "Todos los recursos incluidos"
    },
    recipes: {
      id: "recipes",
      title: "Recetas del Mundo",
      description: "Mega paquete digital con 112 recetas por estados de México y países.",
      price: FULL_PACK_PRICE,
      summary: "ZIP de recetas"
    },
    curso: {
      id: "curso",
      title: "Curso Digital PDF",
      description: "Curso digital en PDF con descarga inmediata tras el pago.",
      price: 0,
      summary: "PDF Descargable"
    }
  };

  const standardCategories = {
    dinero:       { title: "Pack Finanzas en Orden MX",    description: "Organiza tu quincena, gastos, deudas y metas financieras.",                 summary: "Finanzas" },
    ia:           { title: "Pack IA Fácil",                description: "Guías, prompts y recursos para usar inteligencia artificial desde cero.",    summary: "IA para principiantes" },
    negocio:      { title: "Pack Negocio Inteligente",     description: "Controla inventario, pedidos, clientes, ventas y ganancias.",                summary: "Ventas y negocio" },
    contenido:    { title: "Pack Contenido Viral",         description: "Calendarios, hooks, guiones e ideas para publicar con estrategia.",          summary: "Contenido digital" },
    reset:        { title: "Pack Reset Productivo",        description: "Herramientas para ordenar tu día, metas, hábitos y enfoque.",                summary: "Productividad" },
    vida:         { title: "Pack Organiza tu Vida",        description: "Planners, hábitos, rutinas y objetivos para avanzar con más claridad.",      summary: "Organización personal" },
    estudiante:   { title: "Pack Estudiante Pro",          description: "Organizadores, horarios, prompts de estudio y planeadores de examen.",       summary: "Estudiantes" },
    emprendedor:  { title: "Pack Emprendedor Digital",     description: "Recursos de IA, negocio y contenido para crear, vender y crecer online.",    summary: "Emprendimiento" }
  };

  const params       = new URLSearchParams(window.location.search);
  const packId       = products[params.get("pack")] ? params.get("pack") : "standard";
  const categoryId   = params.get("category") || "";
  const courseFilename = packId === "curso" ? (params.get("filename") || "") : "";

  let product;
  if (packId === "curso") {
    const urlTitle = params.get("title") || "Curso Digital PDF";
    const urlPrice = parseInt(params.get("price") || "0", 10);
    product = { ...products.curso, title: urlTitle, price: urlPrice || INDIVIDUAL_PRICE, summary: "PDF Descargable" };
  } else {
    product = packId === "standard" && standardCategories[categoryId]
      ? { ...products.standard, ...standardCategories[categoryId] }
      : products[packId];
  }

  const fallback = config.fallbackLinks?.[packId] || config.fallbackLinks?.standard || "#";
  const apiBase  = (config.apiBaseUrl || "").replace(/\/$/, "");

  // Carga la clave pública desde el backend en cuanto carga la página.
  let cachedMpPublicKey = config.mpPublicKey || null;
  if (!cachedMpPublicKey && apiBase) {
    fetch(`${apiBase}/api/public-config`)
      .then(r => r.json())
      .then(data => { if (data.mpPublicKey) cachedMpPublicKey = data.mpPublicKey; })
      .catch(() => {});
  }

  // ── DOM refs ─────────────────────────────────────────────────────────────────
  const titleEl     = document.querySelector("#checkout-title");
  const descEl      = document.querySelector("#checkout-description");
  const badgeEl     = document.querySelector("#checkout-badge");
  const priceEl     = document.querySelector("#checkout-price");
  const summaryEl   = document.querySelector("#checkout-summary");
  const fallbackLink = document.querySelector("#checkout-fallback");
  const form        = document.querySelector("#checkout-form");
  const messageEl   = document.querySelector("#checkout-message");
  const submitBtn   = document.querySelector("#checkout-submit");

  const modal          = document.querySelector("#payment-modal");
  const modalClose     = document.querySelector("#modal-close");
  const modalBackdrop  = document.querySelector("#modal-backdrop");
  const brickLoading   = document.querySelector("#brick-loading");
  const brickContainer = document.querySelector("#paymentBrick_container");
  const successPanel   = document.querySelector("#payment-success");
  const pendingPanel   = document.querySelector("#payment-pending");

  titleEl.textContent   = product.title;
  badgeEl.textContent   = product.summary;
  priceEl.textContent   = `$${product.price} MXN`;
  summaryEl.textContent = "Pago único";
  if (fallbackLink) fallbackLink.href = fallback;

  document.querySelector("#modal-product-title").textContent = product.title;
  document.querySelector("#modal-product-price").textContent = `$${product.price} MXN`;

  // ── Step 1: form → create order ──────────────────────────────────────────────

  let currentOrderId = null;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageEl.textContent = "";

    const email = document.querySelector("#buyer-email").value.trim();
    const name  = document.querySelector("#buyer-name").value.trim();

    if (!email) {
      messageEl.textContent = "Ingresa tu correo para continuar.";
      document.querySelector("#buyer-email").focus();
      return;
    }

    if (!apiBase) {
      messageEl.textContent = "Backend no configurado. Te llevamos al link directo de Mercado Pago.";
      window.location.href = fallback;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Preparando pago...";

    try {
      // Use create-order (preferred) → fallback to create-preference
      let preferenceId = null;
      let orderId = null;

      try {
        const r = await fetch(`${apiBase}/api/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pack: product.id, category: categoryId, email, name, filename: courseFilename })
        });
        const d = await r.json();
        if (!r.ok || !d.preferenceId) throw new Error(d.error || "Sin preferenceId");
        preferenceId = d.preferenceId;
        orderId = d.orderId || null;
      } catch {
        // Fallback: create-preference (no order tracking)
        const r = await fetch(`${apiBase}/api/create-preference`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pack: product.id, category: categoryId, email, name, filename: courseFilename })
        });
        const d = await r.json();
        if (!r.ok || !d.id) throw new Error("Sin preferenceId del fallback");
        preferenceId = d.id;
      }

      currentOrderId = orderId;
      openPaymentModal({ preferenceId, orderId, email, name });
    } catch {
      messageEl.textContent = "No se pudo iniciar el checkout. Intenta con el link directo de Mercado Pago.";
      if (fallbackLink) fallbackLink.focus();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Continuar al pago";
    }
  });

  // ── Step 2: open Payment Brick ───────────────────────────────────────────────

  let brickController = null;

  function openPaymentModal({ preferenceId, orderId, email, name }) {
    brickContainer.hidden = false;
    brickContainer.innerHTML = "";
    successPanel.hidden = true;
    pendingPanel.hidden = true;
    brickLoading.hidden = false;
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    const mpKey = cachedMpPublicKey;
    if (!mpKey || !window.MercadoPago) {
      brickLoading.hidden = true;
      brickContainer.innerHTML = `<p class="brick-error">SDK de Mercado Pago no disponible. <a href="${fallback}" target="_blank" rel="noopener">Pagar con link directo</a>.</p>`;
      return;
    }

    const mp = new window.MercadoPago(mpKey, { locale: "es-MX" });

    mp.bricks().create("payment", "paymentBrick_container", {
      initialization: {
        amount: product.price,
        preferenceId
      },
      customization: {
        paymentMethods: {
          creditCard: "all",
          debitCard: "all",
          mercadoPago: "all",
          ticket: "all"
        }
      },
      callbacks: {
        onReady: () => { brickLoading.hidden = true; },

        onSubmit: ({ formData: brickFormData }) => {
          return new Promise((resolve, reject) => {
            fetch(`${apiBase}/api/process-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                formData: brickFormData,
                pack: product.id,
                category: categoryId,
                buyerName: name,
                filename: courseFilename,
                orderId
              })
            })
              .then(r => r.json())
              .then(data => {
                if (data.approved) {
                  resolve();
                  setTimeout(() => showSuccess(data), 600);
                } else if (data.pending) {
                  resolve();
                  setTimeout(() => showPending(data), 600);
                } else {
                  reject();
                }
              })
              .catch(() => reject());
          });
        },

        onError: (error) => {
          console.error("Payment Brick error:", error);
        }
      }
    }).then(controller => { brickController = controller; });
  }

  // ── Success panel ─────────────────────────────────────────────────────────────

  function showSuccess(data) {
    brickContainer.hidden = true;

    const linksEl = successPanel.querySelector(".success-links");
    linksEl.innerHTML = "";

    // Download links returned by API
    if (data.downloads?.length) {
      data.downloads.forEach(link => {
        const a = document.createElement("a");
        a.className = "button button--yellow";
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener";
        if (link.type === "zip" || (link.url && link.url.endsWith(".zip"))) {
          a.setAttribute("download", "");
        }
        a.textContent = link.label;
        linksEl.appendChild(a);
      });
    }

    // Access token (unique per order)
    const codeEl = successPanel.querySelector(".success-code");
    if (data.accessToken) {
      codeEl.textContent = `Tu código de acceso: ${data.accessToken}`;
      codeEl.hidden = false;
    }

    // "Ver mis archivos" link (if orderId available)
    if (data.orderId) {
      const a = document.createElement("a");
      a.className = "button";
      a.href = `gracias.html?order=${encodeURIComponent(data.orderId)}`;
      a.textContent = "Ver mis archivos";
      linksEl.appendChild(a);
    }

    // WhatsApp support
    const wa = document.createElement("a");
    wa.className = "button button--ghost";
    wa.href = "https://wa.me/525569862844?text=Hola%2C%20ya%20pagu%C3%A9%20y%20necesito%20mis%20archivos%20DailyTips";
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.textContent = "Soporte por WhatsApp";
    linksEl.appendChild(wa);

    successPanel.hidden = false;
  }

  // ── Pending panel ─────────────────────────────────────────────────────────────

  function showPending(data) {
    brickContainer.hidden = true;

    if (data.ticketUrl) {
      const link = pendingPanel.querySelector(".pending-ticket-link");
      if (link) { link.href = data.ticketUrl; link.hidden = false; }
    }

    if (data.orderId) {
      const noteEl = pendingPanel.querySelector(".pending-order-note");
      if (noteEl) noteEl.textContent = `Número de orden: ${data.orderId}`;
    }

    pendingPanel.hidden = false;
  }

  // ── Close modal ───────────────────────────────────────────────────────────────

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (brickController) {
      brickController.unmount();
      brickController = null;
    }
    brickContainer.innerHTML = "";
  }

  if (modalClose)   modalClose.addEventListener("click", closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
})();
