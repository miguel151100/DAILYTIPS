const products = [
  {
    name: "Control financiero quincenal MX",
    category: "Finanzas personales",
    desc: "Organiza ingresos, gastos, ahorro y deudas por quincena con categorías mexicanas.",
    benefit: "Saber a dónde se va la quincena.",
    file: "planificador_mensual_mexicano_simple.xlsx",
    tag: "Más vendido",
    type: "premium",
    icon: "wallet"
  },
  {
    name: "Control de gastos hormiga",
    category: "Finanzas personales",
    desc: "Detecta cafés, Oxxo, apps, delivery, comisiones y compras pequeñas.",
    benefit: "Recuperar dinero sin cambiar toda tu vida.",
    file: "daily_tips_tracker_gasto_hormiga.xlsx",
    tag: "Viral",
    type: "premium",
    icon: "spark"
  },
  {
    name: "Planificador de ahorro",
    category: "Finanzas personales",
    desc: "Reto de ahorro por quincenas con avance, faltante y estado automático.",
    benefit: "Convertir el ahorro en una rutina visible.",
    file: "daily_tips_reto_ahorro_quincenal_mexico.xlsx",
    tag: "Destacado",
    type: "premium",
    icon: "target"
  },
  {
    name: "Control de deudas",
    category: "Finanzas personales",
    desc: "Controla TDC, préstamos, pagos mínimos, pago extra y prioridad.",
    benefit: "Atacar primero la deuda que más pesa.",
    file: "daily_tips_control_tdc_deudas.xlsx",
    tag: "Más vendido",
    type: "premium",
    icon: "card"
  },
  {
    name: "Calculadora de metas financieras",
    category: "Finanzas personales",
    desc: "Convierte metas grandes en aportes mensuales y quincenales realistas.",
    benefit: "Saber cuánto apartar para lograr una meta.",
    file: "daily_tips_calculadora_metas_financieras.xlsx",
    tag: "Nuevo",
    type: "premium",
    icon: "chart"
  },
  {
    name: "Presupuesto mensual automático",
    category: "Finanzas personales",
    desc: "Presupuesto editable con comparación real, alertas y semáforos.",
    benefit: "Ver si el mes va bien antes de que termine.",
    file: "daily_tips_presupuesto_mensual_automatico.xlsx",
    tag: "Premium",
    type: "premium",
    icon: "grid"
  },
  {
    name: "Organizador de pagos",
    category: "Finanzas personales",
    desc: "CFE, agua, gas, renta, internet, TDC, colegiatura y suscripciones.",
    benefit: "Evitar recargos y pagos olvidados.",
    file: "daily_tips_calendario_pagos_mexicanos.xlsx",
    tag: "México",
    type: "premium",
    icon: "calendar"
  },
  {
    name: "Dashboard financiero premium",
    category: "Finanzas personales",
    desc: "Vista ejecutiva de ingresos, gastos, ahorro, deuda y fugas de dinero.",
    benefit: "Tomar decisiones con una sola pantalla.",
    file: "daily_tips_dashboard_financiero_premium.xlsx",
    tag: "Premium",
    type: "premium",
    icon: "dashboard"
  },
  {
    name: "Guía para ganar dinero con IA",
    category: "IA para principiantes",
    desc: "Mapa simple de ideas reales para usar IA como apoyo de ingresos.",
    benefit: "Elegir una ruta sin perderse entre herramientas.",
    file: "daily_tips_guia_ganar_dinero_ia.xlsx",
    tag: "Tendencia",
    type: "premium",
    icon: "bot"
  },
  {
    name: "Prompts premium para ChatGPT",
    category: "IA para principiantes",
    desc: "Prompts listos para ventas, estudio, contenido, negocio y productividad.",
    benefit: "Obtener mejores respuestas sin saber prompt engineering.",
    file: "daily_tips_prompts_premium_chatgpt.xlsx",
    tag: "Más vendido",
    type: "premium",
    icon: "prompt"
  },
  {
    name: "Cómo crear páginas web con IA",
    category: "IA para principiantes",
    desc: "Checklist para crear una página con IA, texto, estructura y publicación.",
    benefit: "Pasar de idea a página sin empezar desde cero.",
    file: "daily_tips_crear_paginas_web_con_ia.xlsx",
    tag: "Nuevo",
    type: "premium",
    icon: "web"
  },
  {
    name: "Herramientas IA más útiles",
    category: "IA para principiantes",
    desc: "Directorio curado de herramientas IA por caso de uso.",
    benefit: "Saber qué usar para cada tarea.",
    file: "daily_tips_herramientas_ia_utiles.xlsx",
    tag: "Gratis",
    type: "free",
    icon: "tools"
  },
  {
    name: "Automatizaciones fáciles",
    category: "IA para principiantes",
    desc: "Ideas de automatización para casa, estudio, negocio y contenido.",
    benefit: "Ahorrar tiempo con flujos simples.",
    file: "daily_tips_automatizaciones_faciles.xlsx",
    tag: "Tendencia",
    type: "premium",
    icon: "flow"
  },
  {
    name: "IA para crear contenido",
    category: "IA para principiantes",
    desc: "Sistema para transformar ideas en posts, guiones y calendarios.",
    benefit: "Publicar más sin quedarte sin ideas.",
    file: "daily_tips_ia_para_crear_contenido.xlsx",
    tag: "Viral",
    type: "premium",
    icon: "content"
  },
  {
    name: "IA para negocios pequeños",
    category: "IA para principiantes",
    desc: "Casos prácticos para ventas, atención, inventario, textos y promociones.",
    benefit: "Usar IA en un negocio real, no solo por curiosidad.",
    file: "daily_tips_ia_negocios_pequenos.xlsx",
    tag: "México",
    type: "premium",
    icon: "store"
  },
  {
    name: "IA para estudiantes",
    category: "IA para principiantes",
    desc: "Prompts y métodos para estudiar, resumir, practicar y organizar tareas.",
    benefit: "Estudiar más claro y más rápido.",
    file: "daily_tips_ia_para_estudiantes.xlsx",
    tag: "Estudiantes",
    type: "premium",
    icon: "study"
  },
  {
    name: "Sistema para revendedores",
    category: "Negocios y revendedores",
    desc: "Control de producto, precio, margen, clientes, pedidos y entregas.",
    benefit: "Vender sin perder pedidos ni ganancias.",
    file: "daily_tips_sistema_revendedores.xlsx",
    tag: "Más vendido",
    type: "premium",
    icon: "box"
  },
  {
    name: "Control de inventario",
    category: "Negocios y revendedores",
    desc: "Entradas, salidas, stock mínimo, costo y valor de inventario.",
    benefit: "Saber qué comprar y qué ya no se mueve.",
    file: "daily_tips_control_inventario.xlsx",
    tag: "Negocio",
    type: "premium",
    icon: "inventory"
  },
  {
    name: "Calculadora de ganancias",
    category: "Negocios y revendedores",
    desc: "Precio, costo, comisión, envío, descuento y utilidad neta.",
    benefit: "No vender barato sin darte cuenta.",
    file: "daily_tips_calculadora_ganancias.xlsx",
    tag: "Gratis",
    type: "free",
    icon: "calc"
  },
  {
    name: "Seguimiento de pedidos",
    category: "Negocios y revendedores",
    desc: "Clientes, pagos, entregas, pendientes y estado por pedido.",
    benefit: "Dar seguimiento profesional desde Facebook o WhatsApp.",
    file: "daily_tips_seguimiento_pedidos.xlsx",
    tag: "Negocio",
    type: "premium",
    icon: "truck"
  },
  {
    name: "Dashboard de ventas",
    category: "Negocios y revendedores",
    desc: "Ventas, ticket promedio, producto estrella, canal y utilidad.",
    benefit: "Ver qué producto deja más dinero.",
    file: "daily_tips_dashboard_ventas.xlsx",
    tag: "Premium",
    type: "premium",
    icon: "dashboard"
  },
  {
    name: "Notas de venta automáticas",
    category: "Negocios y revendedores",
    desc: "Plantilla para generar notas simples de venta, pedido y entrega.",
    benefit: "Atender clientes con más orden y confianza.",
    file: "daily_tips_notas_venta_automaticas.xlsx",
    tag: "Nuevo",
    type: "premium",
    icon: "receipt"
  },
  {
    name: "Control de clientes",
    category: "Negocios y revendedores",
    desc: "Historial, contacto, preferencias, compras y seguimiento.",
    benefit: "Volver a vender a clientes que ya confiaron.",
    file: "daily_tips_control_clientes.xlsx",
    tag: "Negocio",
    type: "premium",
    icon: "users"
  },
  {
    name: "Sistema para pequeños negocios",
    category: "Negocios y revendedores",
    desc: "Ventas, costos, clientes, entregas y utilidad para negocios caseros.",
    benefit: "Tener control aunque vendas desde casa.",
    file: "daily_tips_negocito_desde_casa.xlsx",
    tag: "México",
    type: "premium",
    icon: "store"
  },
  {
    name: "Calendario de contenido viral",
    category: "Creadores de contenido",
    desc: "30 días de ideas, ganchos, CTA, producto y métricas.",
    benefit: "Publicar con intención de vender.",
    file: "daily_tips_calendario_facebook_30_dias.xlsx",
    tag: "Más vendido",
    type: "premium",
    icon: "calendar"
  },
  {
    name: "Hooks virales para TikTok",
    category: "Creadores de contenido",
    desc: "Biblioteca de ganchos para videos cortos, reels y posts.",
    benefit: "Captar atención en los primeros segundos.",
    file: "daily_tips_hooks_virales_tiktok.xlsx",
    tag: "Viral",
    type: "premium",
    icon: "spark"
  },
  {
    name: "Sistema de ideas de contenido",
    category: "Creadores de contenido",
    desc: "Banco de temas por problema, promesa, historia, CTA y producto.",
    benefit: "No quedarte sin publicaciones.",
    file: "daily_tips_sistema_ideas_contenido.xlsx",
    tag: "Destacado",
    type: "premium",
    icon: "idea"
  },
  {
    name: "Organización para creadores",
    category: "Creadores de contenido",
    desc: "Planea temas, grabaciones, edición, publicación y reutilización.",
    benefit: "Crear contenido sin vivir improvisando.",
    file: "daily_tips_organizacion_creadores.xlsx",
    tag: "Creator",
    type: "premium",
    icon: "grid"
  },
  {
    name: "Guiones virales",
    category: "Creadores de contenido",
    desc: "Estructuras de guion para educativo, historia, venta y autoridad.",
    benefit: "Grabar con una estructura lista.",
    file: "daily_tips_guiones_virales.xlsx",
    tag: "Viral",
    type: "premium",
    icon: "script"
  },
  {
    name: "Rastreador de métricas",
    category: "Creadores de contenido",
    desc: "Alcance, reacciones, comentarios, mensajes, clics y ventas.",
    benefit: "Saber qué contenido sí vende.",
    file: "daily_tips_rastreador_metricas.xlsx",
    tag: "Analytics",
    type: "premium",
    icon: "chart"
  },
  {
    name: "Planeador de Reels",
    category: "Creadores de contenido",
    desc: "Ideas, hook, escena, texto en pantalla, CTA y reutilización.",
    benefit: "Crear reels más rápido y con objetivo.",
    file: "daily_tips_planeador_reels.xlsx",
    tag: "Nuevo",
    type: "premium",
    icon: "video"
  },
  {
    name: "Ideas virales para Facebook",
    category: "Creadores de contenido",
    desc: "Ideas para posts con comentarios, shares, guardados e inbox.",
    benefit: "Generar tráfico orgánico a tus productos.",
    file: "daily_tips_ideas_virales_facebook.xlsx",
    tag: "Facebook",
    type: "premium",
    icon: "content"
  },
  {
    name: "Planner diario premium",
    category: "Productividad y organización",
    desc: "Prioridades, bloques de tiempo, pendientes, energía y cierre del día.",
    benefit: "Tener claridad diaria sin saturarte.",
    file: "daily_tips_planner_diario_premium.xlsx",
    tag: "Premium",
    type: "premium",
    icon: "calendar"
  },
  {
    name: "Sistema de hábitos",
    category: "Productividad y organización",
    desc: "Tracker de 30 días para hábitos, constancia y progreso visual.",
    benefit: "Hacer visible lo que quieres mejorar.",
    file: "daily_tips_habitos_30_dias.xlsx",
    tag: "Más vendido",
    type: "premium",
    icon: "target"
  },
  {
    name: "Organización semanal",
    category: "Productividad y organización",
    desc: "Plan de semana por áreas: dinero, casa, trabajo, familia y personal.",
    benefit: "Ordenar la semana antes de que te gane.",
    file: "daily_tips_organizacion_semanal.xlsx",
    tag: "Nuevo",
    type: "premium",
    icon: "grid"
  },
  {
    name: "Planner de metas",
    category: "Productividad y organización",
    desc: "Metas trimestrales, acciones, hábitos, avance y revisión.",
    benefit: "Pasar de deseo a plan accionable.",
    file: "daily_tips_planner_metas.xlsx",
    tag: "Destacado",
    type: "premium",
    icon: "target"
  },
  {
    name: "Método anti procrastinación",
    category: "Productividad y organización",
    desc: "Desbloquea tareas con pasos mínimos, fricción y recompensas.",
    benefit: "Empezar aunque no tengas motivación.",
    file: "daily_tips_metodo_anti_procrastinacion.xlsx",
    tag: "Viral",
    type: "premium",
    icon: "focus"
  },
  {
    name: "Sistema de enfoque",
    category: "Productividad y organización",
    desc: "Bloques de enfoque, distracciones, prioridades y revisión diaria.",
    benefit: "Trabajar en lo importante sin dispersarte.",
    file: "daily_tips_sistema_enfoque.xlsx",
    tag: "Premium",
    type: "premium",
    icon: "focus"
  },
  {
    name: "Planeador mensual",
    category: "Productividad y organización",
    desc: "Vista de mes con prioridades, fechas clave, pendientes y revisión.",
    benefit: "Ver el mes completo sin perder detalles.",
    file: "daily_tips_planeador_mensual.xlsx",
    tag: "Nuevo",
    type: "premium",
    icon: "calendar"
  },
  {
    name: "Rutinas y objetivos",
    category: "Productividad y organización",
    desc: "Rutinas de mañana/noche, objetivos y seguimiento semanal.",
    benefit: "Crear orden sin depender de fuerza de voluntad.",
    file: "daily_tips_rutinas_objetivos.xlsx",
    tag: "Popular",
    type: "premium",
    icon: "flow"
  },
  {
    name: "Organizador escolar",
    category: "Estudiantes",
    desc: "Materias, tareas, profesores, fechas y pendientes importantes.",
    benefit: "Tener la escuela bajo control en una sola hoja.",
    file: "daily_tips_organizador_escolar.xlsx",
    tag: "Estudiantes",
    type: "premium",
    icon: "study"
  },
  {
    name: "Planeador de tareas",
    category: "Estudiantes",
    desc: "Tareas por materia, fecha, prioridad, avance y estado.",
    benefit: "No entregar trabajos tarde.",
    file: "daily_tips_planeador_tareas.xlsx",
    tag: "Gratis",
    type: "free",
    icon: "check"
  },
  {
    name: "Sistema de estudio inteligente",
    category: "Estudiantes",
    desc: "Métodos de estudio, sesiones, repaso, dificultad y progreso.",
    benefit: "Estudiar con estrategia, no solo leer.",
    file: "daily_tips_sistema_estudio_inteligente.xlsx",
    tag: "Premium",
    type: "premium",
    icon: "brain"
  },
  {
    name: "Prompts IA para estudiar",
    category: "Estudiantes",
    desc: "Prompts para resumir, practicar, explicar y preparar exámenes.",
    benefit: "Usar IA como tutor personal.",
    file: "daily_tips_prompts_ia_estudiar.xlsx",
    tag: "IA",
    type: "premium",
    icon: "prompt"
  },
  {
    name: "Horario escolar premium",
    category: "Estudiantes",
    desc: "Horario visual con materias, tareas, estudio y actividades.",
    benefit: "Ver la semana escolar sin caos.",
    file: "daily_tips_horario_escolar_premium.xlsx",
    tag: "Nuevo",
    type: "premium",
    icon: "calendar"
  },
  {
    name: "Resúmenes automáticos",
    category: "Estudiantes",
    desc: "Estructura para convertir apuntes en resumen, conceptos y preguntas.",
    benefit: "Repasar más rápido antes del examen.",
    file: "daily_tips_resumenes_automaticos.xlsx",
    tag: "IA",
    type: "premium",
    icon: "script"
  },
  {
    name: "Método Pomodoro",
    category: "Estudiantes",
    desc: "Sesiones Pomodoro, descanso, materia, enfoque y avance.",
    benefit: "Estudiar sin quemarte.",
    file: "daily_tips_metodo_pomodoro.xlsx",
    tag: "Popular",
    type: "premium",
    icon: "timer"
  },
  {
    name: "Planeador de exámenes",
    category: "Estudiantes",
    desc: "Fechas, temas, repaso, dificultad, simulacros y checklist.",
    benefit: "Llegar al examen con plan.",
    file: "daily_tips_planeador_examenes.xlsx",
    tag: "Estudiantes",
    type: "premium",
    icon: "study"
  }
];

const categoryMeta = [
  ["Todos", "Toda la biblioteca", "all"],
  ["Finanzas personales", "Quincena, ahorro, deudas y pagos", "wallet"],
  ["IA para principiantes", "Prompts, herramientas y automatización", "bot"],
  ["Negocios y revendedores", "Ventas, inventario y clientes", "store"],
  ["Creadores de contenido", "Ideas virales, guiones y métricas", "content"],
  ["Productividad y organización", "Hábitos, enfoque y metas", "target"],
  ["Estudiantes", "Tareas, estudio e IA escolar", "study"]
];

const iconMap = {
  wallet: "M5 7h14v10H5z M8 7V5h8v2 M15 12h3",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  card: "M4 6h16v12H4z M4 10h16 M7 15h4",
  chart: "M5 19V5 M5 19h15 M9 16V9 M13 16V6 M17 16v-4",
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  calendar: "M5 5h14v15H5z M8 3v4 M16 3v4 M5 10h14",
  dashboard: "M4 13a8 8 0 1 1 16 0v6H4z M12 13l4-4",
  bot: "M7 8h10v9H7z M9 8V5h6v3 M9 12h.1 M15 12h.1 M10 16h4",
  prompt: "M5 6h14v12H5z M8 10l3 2-3 2 M12 15h4",
  web: "M4 5h16v14H4z M4 9h16 M8 7h.1 M11 7h.1",
  tools: "M14 6l4 4-8 8H6v-4z M6 18l-2 2",
  flow: "M6 6h4v4H6z M14 14h4v4h-4z M10 8h3a3 3 0 0 1 3 3v3",
  content: "M5 5h14v14H5z M8 9h8 M8 12h8 M8 15h5",
  store: "M4 9l2-5h12l2 5 M5 9h14v11H5z M8 20v-6h4v6",
  study: "M4 6l8-3 8 3-8 3z M7 9v5c3 2 7 2 10 0V9",
  box: "M4 8l8-4 8 4-8 4z M4 8v8l8 4 8-4V8",
  inventory: "M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5",
  calc: "M7 3h10v18H7z M9 6h6v3H9z M9 12h.1 M12 12h.1 M15 12h.1 M9 16h.1 M12 16h.1 M15 16h.1",
  truck: "M3 7h11v9H3z M14 11h4l3 3v2h-7z M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  receipt: "M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1z M9 8h6 M9 12h6 M9 16h4",
  users: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20a5 5 0 0 1 10 0 M17 11a2.5 2.5 0 1 0 0-5 M14 20a4 4 0 0 1 7 0",
  idea: "M12 3a6 6 0 0 0-3 11v2h6v-2a6 6 0 0 0-3-11z M9 20h6",
  script: "M6 4h12v16H6z M9 8h6 M9 12h6 M9 16h4",
  video: "M5 6h10v12H5z M15 10l5-3v10l-5-3z",
  focus: "M12 5v3 M12 16v3 M5 12h3 M16 12h3 M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  check: "M5 12l4 4L19 6",
  brain: "M8 7a3 3 0 0 1 5-2 3 3 0 0 1 5 2v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9a2 2 0 0 1 3-2z",
  timer: "M9 2h6 M12 6a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M12 10v4l3 2"
};

function icon(name) {
  const path = iconMap[name] || iconMap.grid;
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
}

function slug(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

globalThis.dailyTipsCatalog = { products, categoryMeta, icon, slug };
