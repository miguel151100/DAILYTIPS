const Anthropic = require("@anthropic-ai/sdk");
const { sendWhatsAppText, isValidSignature } = require("../_lib/whatsapp");
const { buildSystemPrompt } = require("../_lib/knowledge");

// Necesitamos el body crudo para verificar la firma de Meta.
module.exports.config = { api: { bodyParser: false } };

const anthropic = new Anthropic();

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function handleVerification(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return;
  }
  res.status(403).send("Forbidden");
}

async function askClaude(userText) {
  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 500,
    output_config: { effort: "medium" },
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: userText }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock ? textBlock.text : "Perdona, no pude generar una respuesta. ¿Puedes reformular tu pregunta?";
}

async function handleIncomingMessage(req, res) {
  const rawBody = await readRawBody(req);

  if (process.env.WHATSAPP_APP_SECRET) {
    const signature = req.headers["x-hub-signature-256"];
    if (!isValidSignature(rawBody, signature)) {
      res.status(401).send("Invalid signature");
      return;
    }
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).send("Invalid JSON");
    return;
  }

  // Respondemos 200 de inmediato en el caso general; solo procesamos
  // mensajes de texto entrantes (ignoramos "statuses" de entrega/lectura).
  try {
    const value = payload?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message) {
      res.status(200).send("ok");
      return;
    }

    const from = message.from;

    if (message.type !== "text") {
      await sendWhatsAppText(
        from,
        "Por ahora solo puedo leer mensajes de texto. Cuéntame en palabras qué curso te interesa 🙂"
      );
      res.status(200).send("ok");
      return;
    }

    const userText = message.text.body;
    const reply = await askClaude(userText);
    await sendWhatsAppText(from, reply);

    res.status(200).send("ok");
  } catch (err) {
    console.error("Error procesando webhook de WhatsApp:", err);
    // Siempre 200 para que Meta no reintente indefinidamente un mensaje que ya falló.
    res.status(200).send("error-handled");
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    return handleVerification(req, res);
  }
  if (req.method === "POST") {
    return handleIncomingMessage(req, res);
  }
  res.status(405).send("Method Not Allowed");
};
