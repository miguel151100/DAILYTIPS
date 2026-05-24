(() => {
  const products = {
    standard: {
      id: "standard",
      title: "Paquete DailyTips individual",
      description: "Un paquete digital por categoría para resolver un problema específico.",
      price: 35,
      summary: "Paquete individual"
    },
    education: {
      id: "education",
      title: "Pack Educación",
      description: "Ejercicios escolares por materia, nivel y tema.",
      price: 35,
      summary: "Ejercicios educativos"
    },
    total: {
      id: "total",
      title: "DAILYTIPS Pack Total",
      description: "Toda la biblioteca DailyTips en un solo paquete.",
      price: 99,
      summary: "Biblioteca completa"
    },
    recipes: {
      id: "recipes",
      title: "Recetas del Mundo",
      description: "Mega paquete digital con 112 recetas por estados de México y países.",
      price: 99,
      summary: "ZIP de recetas"
    }
  };

  const standardCategories = {
    dinero: {
      title: "Pack Finanzas en Orden MX",
      description: "Organiza tu quincena, gastos, deudas y metas financieras.",
      summary: "Finanzas"
    },
    ia: {
      title: "Pack IA Fácil",
      description: "Guías, prompts y recursos para usar inteligencia artificial desde cero.",
      summary: "IA para principiantes"
    },
    negocio: {
      title: "Pack Negocio Inteligente",
      description: "Controla inventario, pedidos, clientes, ventas y ganancias.",
      summary: "Ventas y negocio"
    },
    contenido: {
      title: "Pack Contenido Viral",
      description: "Calendarios, hooks, guiones e ideas para publicar con estrategia.",
      summary: "Contenido digital"
    },
    reset: {
      title: "Pack Reset Productivo",
      description: "Herramientas para ordenar tu día, metas, hábitos y enfoque.",
      summary: "Productividad"
    },
    vida: {
      title: "Pack Organiza tu Vida",
      description: "Planners, hábitos, rutinas y objetivos para avanzar con más claridad.",
      summary: "Organización personal"
    },
    estudiante: {
      title: "Pack Estudiante Pro",
      description: "Organizadores, horarios, prompts de estudio y planeadores de examen.",
      summary: "Estudiantes"
    },
    emprendedor: {
      title: "Pack Emprendedor Digital",
      description: "Recursos de IA, negocio y contenido para crear, vender y crecer online.",
      summary: "Emprendimiento"
    }
  };

  const params = new URLSearchParams(window.location.search);
  const packId = products[params.get("pack")] ? params.get("pack") : "standard";
  const categoryId = params.get("category") || "";
  const product = packId === "standard" && standardCategories[categoryId]
    ? { ...products.standard, ...standardCategories[categoryId] }
    : products[packId];
  const config = window.DAILYTIPS_PAYMENT_CONFIG || {};
  const fallback = config.fallbackLinks?.[packId] || config.fallbackLinks?.standard || "#";
  const apiBase = (config.apiBaseUrl || "").replace(/\/$/, "");

  const title = document.querySelector("#checkout-title");
  const description = document.querySelector("#checkout-description");
  const badge = document.querySelector("#checkout-badge");
  const price = document.querySelector("#checkout-price");
  const summary = document.querySelector("#checkout-summary");
  const fallbackLink = document.querySelector("#checkout-fallback");
  const form = document.querySelector("#checkout-form");
  const message = document.querySelector("#checkout-message");
  const submit = document.querySelector("#checkout-submit");

  title.textContent = product.title;
  description.textContent = product.description;
  badge.textContent = product.summary;
  price.textContent = `$${product.price} MXN`;
  summary.textContent = "Pago único";
  fallbackLink.href = fallback;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";

    const email = document.querySelector("#buyer-email").value.trim();
    const name = document.querySelector("#buyer-name").value.trim();

    if (!apiBase) {
      message.textContent = "Backend no configurado todavía. Te llevamos al link directo de Mercado Pago.";
      window.location.href = fallback;
      return;
    }

    submit.disabled = true;
    submit.textContent = "Creando checkout...";

    try {
      const response = await fetch(`${apiBase}/api/create-preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: product.id, category: categoryId, email, name })
      });

      const data = await response.json();
      if (!response.ok || !data.init_point) throw new Error(data.error || "No se pudo crear el checkout");
      window.location.href = data.init_point;
    } catch (error) {
      message.textContent = "No se pudo crear el checkout automático. Puedes usar el link directo de Mercado Pago.";
      fallbackLink.focus();
    } finally {
      submit.disabled = false;
      submit.textContent = "Pagar con Mercado Pago";
    }
  });
})();
