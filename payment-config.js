window.DAILYTIPS_PAYMENT_CONFIG = {
  // Para entrega 100% automática, despliega el backend y pega aquí su URL pública.
  // Ejemplo: "https://dailytips-payments.vercel.app"
  // Si queda vacío, la página usa los links directos de Mercado Pago y no puede verificar pagos.
  apiBaseUrl: "https://dailytips-24kb-5w36v3pf6-miguel151100s-projects.vercel.app",
  // Clave pública de Mercado Pago — override manual opcional.
  // El checkout la obtiene automáticamente desde el backend (variable MP_PUBLIC_KEY en Vercel).
  // Solo pon un valor aquí si quieres forzar una clave distinta a la del servidor.
  mpPublicKey: "",
  fallbackLinks: {
    standard: "https://mpago.la/2J8hVw7",
    education: "https://mpago.la/2J8hVw7",
    total: "https://mpago.la/2NmAh15",
    recipes: "https://mpago.la/2NmAh15"
  }
};
