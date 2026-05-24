# Entrega automática con Mercado Pago

Este sitio ya tiene las páginas necesarias para el regreso del cliente después de pagar:

- Pago aprobado: `https://miguel151100.github.io/DAILYTIPS/pago-exitoso.html`
- Pago pendiente: `https://miguel151100.github.io/DAILYTIPS/pago-pendiente.html`
- Pago rechazado: `https://miguel151100.github.io/DAILYTIPS/pago-rechazado.html`
- Entrega digital: `https://miguel151100.github.io/DAILYTIPS/entrega-digital.html`

## Flujo recomendado

1. El cliente da clic en comprar.
2. Mercado Pago procesa el pago.
3. Mercado Pago regresa al cliente a `pago-exitoso.html` si el pago fue aprobado.
4. El cliente entra a `entrega-digital.html`.
5. Ingresa el código de acceso.
6. Descarga el ZIP del Pack Total o el ZIP de Recetas del Mundo.

## Automatización segura real

Con links simples de Mercado Pago no se puede validar el pago desde GitHub Pages.

Para automatizar de verdad se necesita:

1. Crear una preferencia de Checkout Pro desde un backend.
2. Configurar `back_urls`:
   - `success`: `pago-exitoso.html`
   - `pending`: `pago-pendiente.html`
   - `failure`: `pago-rechazado.html`
3. Configurar `notification_url` para recibir webhooks.
4. Validar en backend que el pago esté aprobado.
5. Enviar correo automático con el link/código de descarga.

## Código actual de entrega

La página `entrega-digital.html` usa el código de acceso configurado en `app.js`.

Archivos entregables actuales:

- `daily_tips_paquete_completo.zip`
- `recetas-del-mundo-pack.zip`
- `recetas-pack/recetas-catalogo-completo.html`
- Biblioteca premium por categorías en `premium.html`

## Siguiente paso recomendado

El backend pequeño ya quedó preparado en la carpeta `api/`.

Archivos agregados:

- `api/create-preference.js`: crea el Checkout Pro de Mercado Pago.
- `api/mercadopago-webhook.js`: recibe notificaciones de Mercado Pago, consulta el pago y envía el correo de entrega si está aprobado.
- `api/_products.js`: define productos, precios y correo de entrega.
- `checkout.html`: página de checkout que usa el backend cuando esté configurado y si no usa los links directos actuales.
- `payment-config.js`: aquí se pega la URL pública del backend cuando esté desplegado.
- `.env.example`: variables necesarias para producción.

## Cómo activarlo

1. Despliega este proyecto en Vercel o despliega solo la carpeta `api`.
2. Configura estas variables de entorno en Vercel:
   - `MP_ACCESS_TOKEN`
   - `SITE_URL`
   - `API_PUBLIC_URL`
   - `MP_WEBHOOK_URL`
   - `DELIVERY_ACCESS_CODE`
   - `RESEND_API_KEY`
   - `MAIL_FROM`
3. Copia la URL pública de Vercel.
4. Abre `payment-config.js`.
5. Cambia:

```js
apiBaseUrl: ""
```

por:

```js
apiBaseUrl: "https://TU-BACKEND.vercel.app"
```

6. Sube el cambio a GitHub.

Desde ese momento:

- el botón de compra entra a `checkout.html`;
- `checkout.html` crea una preferencia real de Mercado Pago;
- Mercado Pago regresa al comprador a `pago-exitoso.html`, `pago-pendiente.html` o `pago-rechazado.html`;
- el webhook valida pagos aprobados;
- el cliente recibe por correo el código de acceso y los links de descarga.

## Lo que hace el backend preparado

- crear preferencias de pago de $35 MXN y $99 MXN;
- recibir webhooks de Mercado Pago;
- consultar el pago con el Access Token;
- enviar email automático al comprador;
- mandar el código de descarga configurado en `DELIVERY_ACCESS_CODE`.
