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

Crear un backend pequeño en Vercel o Render para:

- crear preferencias de pago de $35 MXN y $99 MXN;
- recibir webhooks de Mercado Pago;
- enviar email automático al comprador;
- generar un código de descarga único por compra.
