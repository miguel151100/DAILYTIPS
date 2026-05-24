import fs from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "recetas-pack");

const imagePool = [
  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/4551971/pexels-photo-4551971.jpeg?auto=compress&cs=tinysrgb&w=1200"
];

const baseIngredients = {
  mexico: ["tortillas", "jitomate", "cebolla", "ajo", "limón", "cilantro", "chile serrano", "queso fresco", "frijoles", "pollo o cerdo"],
  world: ["arroz", "pasta", "pollo", "huevo", "cebolla", "ajo", "verduras", "aceite de oliva", "caldo", "limón"],
  dessert: ["harina", "huevo", "leche", "mantequilla", "azúcar", "vainilla", "canela", "fruta de temporada"]
};

const mexicoStates = [
  ["Aguascalientes", ["Pollo estilo San Marcos", "Enchiladas rojas hidrocálidas"]],
  ["Baja California", ["Tacos de pescado estilo Ensenada", "Tostadas de ceviche fácil"]],
  ["Baja California Sur", ["Almejas chocolatas gratinadas", "Machaca con huevo norteña"]],
  ["Campeche", ["Panuchos campechanos", "Pescado en escabeche sencillo"]],
  ["Chiapas", ["Tamales de chipilín fáciles", "Sopa de pan estilo Chiapas"]],
  ["Chihuahua", ["Burritos de carne deshebrada", "Caldo de queso norteño"]],
  ["CDMX", ["Tacos al pastor caseros", "Tortas de chilaquiles"]],
  ["Coahuila", ["Discada norteña sencilla", "Carne asada con papas"]],
  ["Colima", ["Sopitos colimenses", "Tostadas de lomo"]],
  ["Durango", ["Caldillo durangueño fácil", "Gorditas de guisado"]],
  ["Estado de México", ["Tacos de cecina con nopales", "Obispo estilo casero"]],
  ["Guanajuato", ["Enchiladas mineras", "Guacamayas leonesas"]],
  ["Guerrero", ["Pozole verde guerrerense", "Pescado a la talla casero"]],
  ["Hidalgo", ["Pastes de papa con carne", "Barbacoa casera en olla"]],
  ["Jalisco", ["Birria rápida de res", "Tortas ahogadas caseras"]],
  ["Michoacán", ["Carnitas en olla", "Corundas con salsa y crema"]],
  ["Morelos", ["Cecina con crema y queso", "Tacos acorazados sencillos"]],
  ["Nayarit", ["Pescado zarandeado casero", "Tostadas de camarón seco"]],
  ["Nuevo León", ["Carne asada con frijoles", "Machacado con huevo"]],
  ["Oaxaca", ["Tlayuda con quesillo", "Mole negro simplificado"]],
  ["Puebla", ["Chile en nogada casero", "Mole poblano práctico"]],
  ["Querétaro", ["Enchiladas queretanas", "Gorditas de migaja fáciles"]],
  ["Quintana Roo", ["Tikin xic casero", "Tacos de pescado con col morada"]],
  ["San Luis Potosí", ["Enchiladas potosinas", "Zacahuil versión familiar"]],
  ["Sinaloa", ["Aguachile suave", "Chilorio casero"]],
  ["Sonora", ["Coyotas de piloncillo", "Carne con chile colorado"]],
  ["Tabasco", ["Pejelagarto estilo casero", "Plátanos rellenos de queso"]],
  ["Tamaulipas", ["Tampiqueña casera", "Tacos piratas norteños"]],
  ["Tlaxcala", ["Tacos de canasta", "Sopa tlaxcalteca"]],
  ["Veracruz", ["Pescado a la veracruzana", "Picadas veracruzanas"]],
  ["Yucatán", ["Cochinita pibil", "Sopa de lima sencilla"]],
  ["Zacatecas", ["Asado de boda fácil", "Gorditas zacatecanas"]]
];

const countries = [
  ["Italia", ["Risotto de hongos", "Pasta pomodoro cremosa"]],
  ["Japón", ["Ramen casero", "Yakimeshi con verduras"]],
  ["España", ["Tortilla española", "Paella casera de pollo"]],
  ["Francia", ["Crepas dulces", "Pollo a la mostaza"]],
  ["Estados Unidos", ["Mac and cheese", "Hot cakes esponjosos"]],
  ["Perú", ["Lomo saltado", "Arroz chaufa"]],
  ["Argentina", ["Milanesa napolitana", "Choripán con chimichurri"]],
  ["Colombia", ["Arepas rellenas", "Arroz con pollo colombiano"]],
  ["Brasil", ["Feijoada sencilla", "Brigadeiros de chocolate"]],
  ["India", ["Pollo al curry suave", "Arroz especiado"]],
  ["China", ["Pollo agridulce", "Fideos salteados"]],
  ["Corea", ["Bibimbap sencillo", "Pollo coreano dulce-picante"]],
  ["Tailandia", ["Pad thai fácil", "Arroz con mango"]],
  ["Marruecos", ["Pollo con especias y limón", "Cuscús con verduras"]],
  ["Grecia", ["Gyros de pollo", "Ensalada griega completa"]],
  ["Turquía", ["Kebab casero", "Arroz con fideos"]],
  ["Alemania", ["Schnitzel de pollo", "Ensalada de papa"]],
  ["Reino Unido", ["Fish and chips casero", "Scones rápidos"]],
  ["Canadá", ["Papas con gravy y queso", "Hot cakes con frutos rojos"]],
  ["Chile", ["Pastel de choclo", "Completo chileno"]],
  ["Cuba", ["Ropa vieja sencilla", "Arroz congrí"]],
  ["Vietnam", ["Pho casero de pollo", "Rollitos frescos"]],
  ["Líbano", ["Hummus cremoso", "Shawarma de pollo"]],
  ["Portugal", ["Bacalhau fácil", "Pastelitos de nata versión rápida"]]
];

function recipe({ title, region, group, index }) {
  const isDessert = /hot cakes|crepas|brigadeiros|scones|coyotas|pastelitos/i.test(title);
  const ingredients = isDessert ? baseIngredients.dessert : group === "México" ? baseIngredients.mexico : baseIngredients.world;
  return {
    id: `R${String(index + 1).padStart(3, "0")}`,
    title,
    group,
    region,
    servings: "4 porciones",
    time: isDessert ? "35 min" : "45 min",
    difficulty: /nogada|mole|paella|barbacoa|zacahuil/i.test(title) ? "Intermedia" : "Fácil",
    image: imagePool[index % imagePool.length],
    ingredients,
    steps: [
      "Prepara y lava todos los ingredientes antes de empezar.",
      "Pica cebolla, ajo y verduras en tamaños parecidos para que se cocinen parejo.",
      "Sazona la proteína o base principal con sal, pimienta y un toque de limón si aplica.",
      "Cocina a fuego medio, moviendo con calma para concentrar sabor sin quemar.",
      "Prueba, ajusta sal y sirve caliente con tortillas, arroz, pan o ensalada según el platillo."
    ],
    note: "Receta adaptada para cocina casera en México con ingredientes fáciles de encontrar en supermercado, mercado o tienda de autoservicio."
  };
}

const recipes = [
  ...mexicoStates.flatMap(([state, dishes]) => dishes.map((title) => ({ title, region: state, group: "México" }))),
  ...countries.flatMap(([country, dishes]) => dishes.map((title) => ({ title, region: country, group: "Internacional" })))
].map((item, index) => recipe({ ...item, index }));

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function card(item) {
  return `<article class="recipe-file-card">
    <img src="${item.image}" alt="${escapeHtml(item.title)} de ${escapeHtml(item.region)}" loading="lazy">
    <div>
      <span>${escapeHtml(item.group)} · ${escapeHtml(item.region)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${item.time} · ${item.servings} · ${item.difficulty}</p>
      <h4>Ingredientes fáciles</h4>
      <p>${item.ingredients.map(escapeHtml).join(", ")}.</p>
      <h4>Pasos</h4>
      <ol>${item.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
      <p class="note">${escapeHtml(item.note)}</p>
    </div>
  </article>`;
}

function htmlPage({ title, subtitle, items }) {
  return `<!doctype html>
<html lang="es-MX">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body{margin:0;background:#fffdf9;color:#1a0f0a;font-family:Inter,Arial,sans-serif;line-height:1.55}
    header{padding:48px 6vw 28px;background:#1a0f0a;color:#fffdf9}
    h1{font-family:Georgia,serif;font-size:clamp(2rem,5vw,4.8rem);line-height:1;margin:0 0 12px}
    h2{font-family:Georgia,serif;font-size:2rem;margin:42px 0 18px}
    main{padding:32px 6vw 72px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:22px}
    .recipe-file-card{background:#fff;border:1px solid #eadfd2;border-radius:24px;overflow:hidden;box-shadow:0 18px 55px rgba(64,36,18,.08)}
    .recipe-file-card img{width:100%;height:230px;object-fit:cover;display:block}
    .recipe-file-card div{padding:20px}
    .recipe-file-card span{color:#ff5a36;font-weight:800;font-size:.8rem;text-transform:uppercase;letter-spacing:.08em}
    .recipe-file-card h3{font-family:Georgia,serif;font-size:1.55rem;margin:8px 0;color:#1a0f0a}
    .recipe-file-card h4{margin:16px 0 6px;color:#1a0f0a}
    .note{background:#fff7ef;border-left:4px solid #ff5a36;padding:10px 12px;border-radius:12px;color:#684536}
    .toc{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
    .toc a{color:#1a0f0a;background:#ffd8ca;text-decoration:none;padding:10px 14px;border-radius:999px;font-weight:800}
    @media print{header{background:#fff;color:#1a0f0a}.recipe-file-card{break-inside:avoid;box-shadow:none}.recipe-file-card img{height:160px}}
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(subtitle)}</p>
    <div class="toc"><a href="recetas-catalogo.csv">Abrir CSV</a><a href="recetas-mexico-por-estados.html">México por estados</a><a href="recetas-internacionales-por-pais.html">Internacionales por país</a></div>
  </header>
  <main><section class="grid">${items.map(card).join("")}</section></main>
</body>
</html>`;
}

const csv = [
  ["ID", "Grupo", "Estado o país", "Receta", "Tiempo", "Porciones", "Dificultad", "Ingredientes principales", "Foto"].join(","),
  ...recipes.map((item) => [
    item.id,
    item.group,
    item.region,
    item.title,
    item.time,
    item.servings,
    item.difficulty,
    item.ingredients.join(" | "),
    item.image
  ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
].join("\n");

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "recetas-catalogo-completo.html"), htmlPage({
  title: "Mega Paquete DailyTips: +100 Recetas del Mundo",
  subtitle: "Catálogo visual con recetas divididas por México, estados y países. Las fotos usan enlaces de bancos gratuitos permitidos para uso web.",
  items: recipes
}));
await fs.writeFile(path.join(outDir, "recetas-mexico-por-estados.html"), htmlPage({
  title: "Recetas de México por estados",
  subtitle: "64 recetas mexicanas organizadas por estado, con ingredientes fáciles de conseguir.",
  items: recipes.filter((item) => item.group === "México")
}));
await fs.writeFile(path.join(outDir, "recetas-internacionales-por-pais.html"), htmlPage({
  title: "Recetas internacionales por país",
  subtitle: "48 recetas internacionales adaptadas para cocinar en México.",
  items: recipes.filter((item) => item.group === "Internacional")
}));
await fs.writeFile(path.join(outDir, "recetas-catalogo.csv"), csv);
await fs.writeFile(path.join(outDir, "LEEME.txt"), `DailyTips Recetas del Mundo\n\nIncluye ${recipes.length} recetas:\n- 64 recetas de México divididas por estado\n- 48 recetas internacionales divididas por país\n\nAbre recetas-catalogo-completo.html para ver el catálogo con fotos.\nAbre recetas-catalogo.csv para editar o filtrar en Excel/Google Sheets.\n\nNota sobre fotos: las páginas usan enlaces externos de bancos gratuitos como Pexels. Revisa licencias si vas a redistribuir el material impreso o editarlo como producto final.\n`);

console.log(`Generated ${recipes.length} recipes in ${outDir}`);
