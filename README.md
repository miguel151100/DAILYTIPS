# DailyTips — Sitio de Productos Digitales

Sitio estático desplegado en **Vercel** con funciones serverless en `api/`. Pagos con **Mercado Pago Payment Brick** (checkout embebido en la página). Base de datos en **Supabase**. Correos con **Resend**.

Dominio: **dailytips.lat**

---

## Configuración inicial

### 1. Variables de entorno en Vercel

En el panel de Vercel → Settings → Environment Variables, agrega:

| Variable | Descripción |
|---|---|
| `MP_PUBLIC_KEY` | Clave pública MP (puede ir en frontend) |
| `MP_ACCESS_TOKEN` | Access Token MP (**NUNCA en frontend**) |
| `MP_WEBHOOK_SECRET` | Secreto para validar firmas de webhook MP |
| `SITE_URL` | URL del sitio: `https://dailytips.lat` |
| `API_PUBLIC_URL` | URL base del backend (mismo sitio en Vercel) |
| `ALLOWED_ORIGIN` | CORS: `https://dailytips.lat` |
| `RESEND_API_KEY` | API key de Resend para correos |
| `MAIL_FROM` | Remitente: `DailyTips <ventas@tudominio.com>` |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | Anon key de Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key de Supabase |

Copia `.env.example` a `.env.local` para desarrollo local.

### 2. Credenciales de Mercado Pago

Las claves están en: **MP Panel → Configuración → Credenciales**

- Usa las credenciales de **prueba** (TEST-...) para desarrollo.
- Cambia a credenciales de **producción** (APP_USR-...) antes de publicar.

### 3. Crear la tabla `orders` en Supabase

En el panel de Supabase → SQL Editor, ejecuta el contenido de `supabase/create_orders.sql`.

Esto crea la tabla que registra todos los pedidos con su token de acceso único por orden.

### 4. Configurar el webhook en Mercado Pago

En MP Panel → Tus integraciones → Webhooks, registra:

- **URL:** `https://dailytips.lat/api/mercadopago-webhook`
- **Eventos:** `payment`

Copia el secreto que genera MP y guárdalo en `MP_WEBHOOK_SECRET` en Vercel.

---

## Cómo cambiar precios

Edita **solo** `payment-config.js`:

```js
INDIVIDUAL_PRICE_MXN: 35,   // paquetes individuales
FULL_PACK_PRICE_MXN: 99,    // pack total y recetas
```

Los precios se propagan automáticamente al checkout y al frontend. El precio definitivo que cobra Mercado Pago está en `api/_products.js` — actualiza ambos al cambiar precios.

---

## Cómo agregar un nuevo producto

1. **`api/_products.js`** — agrega entrada en `products` con `id`, `title`, `description`, `unit_price`, `currency_id`.
2. **`checkout.js`** — agrega entrada en el objeto `products` local con el mismo `id`.
3. **`checkout.html`** — agrega enlace: `checkout.html?pack=nuevo-id`.
4. **`api/order-status.js`** — en `buildDownloadLinks()`, agrega el caso con las URLs de descarga del nuevo producto.

---

## Flujo de pago completo

```
1. Usuario visita checkout.html?pack=total
2. Llena email + nombre → POST /api/create-order
   ├─ Backend crea preferencia en MP
   ├─ Guarda orden en Supabase (status: pending)
   └─ Devuelve { preferenceId, orderId }
3. Frontend abre modal con Payment Brick
   └─ Brick envía formData → POST /api/process-payment
      ├─ Backend crea pago en MP
      ├─ Si approved → actualiza orden (status: approved, access_token único)
      └─ Devuelve { approved, downloads, accessToken, orderId }
4a. approved → modal muestra botones de descarga + código de acceso
4b. pending  → modal muestra mensaje de espera + número de orden
5. Mercado Pago llama /api/mercadopago-webhook al confirmar el pago
   ├─ Valida firma HMAC-SHA256
   ├─ Consulta MP API para datos del pago
   ├─ Actualiza orden en DB (idempotente)
   └─ Envía correo con links y código de acceso
```

### Recuperación de archivos

El comprador recupera sus archivos en `entrega-digital.html`:

- **Opción 1:** correo electrónico + número de orden (del correo de confirmación)
- **Opción 2:** código de acceso único (de la pantalla de confirmación o correo)

---

## Estructura de archivos clave

| Archivo | Rol |
|---|---|
| `payment-config.js` | Precios y config global del frontend |
| `checkout.js` | Lógica de checkout: form → create-order → Payment Brick |
| `checkout.html` | Página de compra con modal de pago embebido |
| `gracias.html` | Confirmación post-pago (verifica estado con API) |
| `entrega-digital.html` | Recuperación de archivos con email+orden o token |
| `pago-exitoso.html` | Back_url de MP → redirige a gracias.html |
| `pago-pendiente.html` | Back_url pendiente de MP → redirige a gracias.html |
| `api/_orders.js` | CRUD de la tabla `orders` en Supabase |
| `api/_products.js` | Catálogo de productos, links de entrega, HTML de email |
| `api/create-order.js` | POST: crea preferencia MP + guarda orden |
| `api/process-payment.js` | POST: procesa pago con Brick formData |
| `api/order-status.js` | GET: estado y links de descarga (requiere verificación) |
| `api/mercadopago-webhook.js` | POST: confirma pagos desde MP + envía correo |
| `api/public-config.js` | GET: expone MP_PUBLIC_KEY al frontend de forma segura |
| `supabase/create_orders.sql` | SQL para crear la tabla `orders` |

---

## Seguridad

- `MP_ACCESS_TOKEN` solo en variables de entorno de Vercel — nunca en código frontend.
- Links de descarga solo se devuelven desde `api/order-status` a compradores verificados (email+orden o token).
- Tokens de acceso: 56 caracteres hexadecimales aleatorios, únicos por orden (`UNIQUE` en DB).
- Webhook: validación de firma HMAC-SHA256 con `MP_WEBHOOK_SECRET`.
- `entrega-digital.html` no contiene ninguna URL de descarga en el HTML fuente.
- HTTPS forzado en `vercel.json` con HSTS.

> **Nota:** Los archivos ZIP estáticos en Vercel son técnicamente accesibles si alguien adivina la URL. Para máxima seguridad, mueve los ZIPs al bucket "cursos" de Supabase Storage y sirve URLs firmadas desde `api/order-status.js` (igual que los cursos individuales).

---

## Pruebas locales

```bash
# Verificar sintaxis de todos los archivos JS
npm run check

# Desarrollo local con Vercel CLI
npx vercel dev
```

Para probar pagos, usa credenciales TEST de Mercado Pago y las [tarjetas de prueba de MP](https://www.mercadopago.com.mx/developers/es/docs/checkout-api/integration-test/test-cards).

---

## Deploy a producción

1. Confirma que todas las variables en Vercel son de producción (APP_USR-..., no TEST-...).
2. Verifica que el webhook en MP Panel apunte a la URL de producción con `MP_WEBHOOK_SECRET`.
3. `git push origin main` — Vercel despliega automáticamente en ~30 segundos.
