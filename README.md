# DailyTips — Tienda de productos digitales

Sitio estático + serverless functions desplegado en Vercel.  
Dominio: **dailytips.lat**

## Estructura

- `index.html` y `*.html` — páginas del sitio
- `styles.css` / `app.js` / `catalog.js` — frontend
- `checkout.html` / `checkout.js` — checkout con Payment Brick de Mercado Pago
- `api/*.js` — funciones serverless (pagos, webhook, entrega)
- `assets/` — imágenes y recursos estáticos
- `vercel.json` — configuración de deploy

## Deploy

El sitio se despliega automáticamente en Vercel al hacer push a `main`.

```
git add .
git commit -m "descripción del cambio"
git push origin main
```

Vercel construye y publica en ~30 segundos. El dominio `dailytips.lat`
apunta al deployment de producción.

## Variables de entorno (configurar en Vercel Dashboard)

| Variable | Descripción |
|---|---|
| `MP_ACCESS_TOKEN` | Token de acceso privado de Mercado Pago |
| `MP_PUBLIC_KEY` | Clave pública de Mercado Pago (para Payment Brick) |
| `RESEND_API_KEY` | API key de Resend para emails de entrega |
| `SITE_URL` | URL del sitio (`https://dailytips.lat`) |
| `DELIVERY_ACCESS_CODE` | Código de acceso para descargas |
| `ALLOWED_ORIGIN` | Origen permitido en CORS (por defecto `*`) |
