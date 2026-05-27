window.DAILYTIPS_PAYMENT_CONFIG = {

  // =====================================================================
  // PRECIOS GLOBALES — Editar aquí para cambiar precios en todo el sitio
  // =====================================================================
  INDIVIDUAL_PRICE_MXN: 35,   // Precio estándar de productos individuales
  FULL_PACK_PRICE_MXN: 99,    // Precio del Pack Completo DailyTips
  // =====================================================================

  // URL del backend en Vercel (vacío = checkout usa links directos de MP)
  apiBaseUrl: "https://dailytips-24kb-5w36v3pf6-miguel151100s-projects.vercel.app",

  // Clave pública de Mercado Pago — se obtiene automáticamente del backend.
  // Solo llenar si quieres forzar una clave diferente a la del servidor.
  mpPublicKey: "",

  fallbackLinks: {
    standard: "https://mpago.la/2J8hVw7",
    education: "https://mpago.la/2J8hVw7",
    total: "https://mpago.la/2NmAh15",
    recipes: "https://mpago.la/2NmAh15"
  }
};
