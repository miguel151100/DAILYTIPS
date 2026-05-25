const COURSES = {
  "Curso_Completo_de_Barismo_Profesional.pdf": {
    filename: "Curso_Completo_de_Barismo_Profesional.pdf",
    title: "Curso Completo de Barismo Profesional",
    description: "Técnicas de extracción, latte art y montaje de cafetería desde cero.",
    unit_price: 299,
    currency_id: "MXN"
  },
  "Curso_Completo_Negocio_Tamales_2026.pdf": {
    filename: "Curso_Completo_Negocio_Tamales_2026.pdf",
    title: "Negocio de Tamales 2026",
    description: "Recetas, costos, canales de venta y escalado para un negocio de tamales.",
    unit_price: 199,
    currency_id: "MXN"
  },
  "curso-bubble-tea-premium.pdf": {
    filename: "curso-bubble-tea-premium.pdf",
    title: "Bubble Tea Premium",
    description: "Recetas, preparación, equipos y modelo de negocio para vender bubble tea.",
    unit_price: 199,
    currency_id: "MXN"
  },
  "Curso-Completo-IA-para-Negocios-2026.pdf": {
    filename: "Curso-Completo-IA-para-Negocios-2026.pdf",
    title: "IA para Negocios 2026",
    description: "Automatiza, vende y crece tu negocio con herramientas de inteligencia artificial.",
    unit_price: 349,
    currency_id: "MXN"
  },
  "curso-completo-muebles-con-pallets-premium.pdf": {
    filename: "curso-completo-muebles-con-pallets-premium.pdf",
    title: "Muebles con Pallets",
    description: "Diseños, materiales, técnicas y estrategia de venta para muebles con pallets.",
    unit_price: 149,
    currency_id: "MXN"
  },
  "curso-completo-postres-negocio-premium.pdf": {
    filename: "curso-completo-postres-negocio-premium.pdf",
    title: "Negocio de Postres",
    description: "Recetas premium y estrategia completa para vender postres desde casa.",
    unit_price: 179,
    currency_id: "MXN"
  },
  "Curso-Completo-YouTube-Faceless-IA-2026.pdf": {
    filename: "Curso-Completo-YouTube-Faceless-IA-2026.pdf",
    title: "YouTube Faceless con IA 2026",
    description: "Crea y monetiza un canal de YouTube sin aparecer en cámara usando IA.",
    unit_price: 299,
    currency_id: "MXN"
  },
  "Curso-Premium-Ventas-Redes-TikTok-Shop-IA-2026.pdf": {
    filename: "Curso-Premium-Ventas-Redes-TikTok-Shop-IA-2026.pdf",
    title: "Ventas en TikTok Shop con IA 2026",
    description: "Estrategia completa para vender en TikTok Shop con apoyo de inteligencia artificial.",
    unit_price: 349,
    currency_id: "MXN"
  },
  "guia-completa-plantas-medicinales-decorativas-2026.pdf": {
    filename: "guia-completa-plantas-medicinales-decorativas-2026.pdf",
    title: "Plantas Medicinales y Decorativas 2026",
    description: "Cultivo, usos, cuidado y ventas de plantas medicinales y decorativas.",
    unit_price: 99,
    currency_id: "MXN"
  }
};

function getCourse(filename) {
  return COURSES[filename] || null;
}

module.exports = { COURSES, getCourse };
