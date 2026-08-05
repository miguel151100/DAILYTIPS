# Chatbot de WhatsApp — DailyTips

Bot que responde en el WhatsApp de DailyTips (+52 55 6986 2844) usando la
API oficial de WhatsApp (Meta Cloud API) y Claude para generar las
respuestas. Corre como una Serverless Function de Vercel: `api/whatsapp/webhook.js`.

Qué hace hoy:
- Responde preguntas sobre los cursos gratis y de pago con la info de `api/_lib/knowledge.js`.
- Explica el proceso de pago (transferencia / OXXO / Mercado Pago + comprobante por WhatsApp).
- Responde dudas generales como asistente, sin salirse del rol de DailyTips.
- Solo lee mensajes de **texto** por ahora (a imágenes/audio responde pidiendo texto).
- Es sin memoria entre mensajes (cada mensaje se responde por separado). Si más adelante
  quieres que recuerde la conversación, hay que añadir almacenamiento (p. ej. Vercel KV).

## 1. Crear la app de WhatsApp en Meta

1. Ve a [developers.facebook.com](https://developers.facebook.com/) → **Mis apps** → **Crear app** → tipo "Negocios".
2. Dentro de la app, añade el producto **WhatsApp**.
3. En **WhatsApp → API Setup** obtienes:
   - Un número de prueba (o conecta tu número real de negocio, +52 55 6986 2844, verificándolo).
   - El **Phone number ID** → esto es `WHATSAPP_PHONE_NUMBER_ID`.
   - Un token temporal de 24h para probar. Para producción, genera un **token permanente**
     (System User con permiso `whatsapp_business_messaging`) → esto es `WHATSAPP_TOKEN`.
4. En **Configuración básica de la app** copia el **App Secret** → `WHATSAPP_APP_SECRET`.

## 2. Configurar variables de entorno en Vercel

En el proyecto de Vercel → Settings → Environment Variables, agrega (ver `.env.example`):

- `ANTHROPIC_API_KEY`
- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN` (invéntala tú, cualquier cadena secreta)
- `WHATSAPP_APP_SECRET`

Haz un deploy después de agregarlas.

## 3. Configurar el webhook en Meta

1. En **WhatsApp → Configuration**, en "Webhook" pon:
   - **Callback URL**: `https://dailytips.lat/api/whatsapp/webhook`
   - **Verify token**: el mismo valor que pusiste en `WHATSAPP_VERIFY_TOKEN`.
2. Click en **Verify and save** — Meta hace un `GET` a esa URL; si el token
   coincide, la función responde el `hub.challenge` y queda verificado.
3. En **Webhook fields**, suscríbete al campo **messages**.

## 4. Probar

Escribe al número de WhatsApp conectado. Deberías recibir una respuesta
generada por el bot en unos segundos. Revisa los logs de la función en
Vercel (`Deployments → Functions → api/whatsapp/webhook`) si algo falla.

## Notas

- El bot **no confirma pagos**. Solo explica el proceso y avisa que el
  equipo revisa el comprobante — eso lo sigue haciendo una persona.
- Actualiza la info de cursos/precios en `api/_lib/knowledge.js` cuando cambie el catálogo.
- Si quieres agregar memoria de conversación, delegación a un humano, o
  respuestas con imágenes/plantillas, dímelo y lo construimos sobre esta base.
