# Cómo conectar el pago automático con Mercado Pago

El backend ya está escrito. Solo necesitas completar estos pasos:

---

## Paso 1 — Subir el proyecto a GitHub

1. Ve a https://github.com/new y crea un repositorio nuevo (ej. `dailytips-site`)
2. Sube todos los archivos de esta carpeta al repositorio

---

## Paso 2 — Desplegar en Vercel

1. Ve a https://vercel.com y entra con tu cuenta (o crea una gratis)
2. Haz clic en **"Add New Project"**
3. Conecta tu repositorio de GitHub `dailytips-site`
4. Vercel detectará el `vercel.json` automáticamente
5. Antes de hacer clic en **Deploy**, añade estas variables de entorno:

| Variable             | Valor                                    | Requerido |
|----------------------|------------------------------------------|-----------|
| `MP_ACCESS_TOKEN`    | Tu token de Mercado Pago (ver Paso 3)   | ✅ Sí     |
| `SITE_URL`           | `https://dailytips.lat`                 | ✅ Sí     |
| `RESEND_API_KEY`     | Tu API key de Resend.com                | Opcional  |
| `MAIL_FROM`          | `DailyTips <noreply@dailytips.lat>`     | Opcional  |
| `DELIVERY_ACCESS_CODE` | Un código secreto para descargas (ej. `DTIPS2026`) | Opcional |

6. Haz clic en **Deploy**
7. Copia la URL que te da Vercel (ej. `https://dailytips-site.vercel.app`)

---

## Paso 3 — Obtener el token de Mercado Pago

1. Ve a https://www.mercadopago.com.mx/developers/panel
2. Entra a tu aplicación (o crea una nueva)
3. Ve a **Credenciales** → **Producción**
4. Copia el **Access Token** (empieza con `APP_USR-...`)

> ⚠️ Usa las credenciales de PRODUCCIÓN, no las de prueba, para recibir pagos reales.

---

## Paso 4 — Actualizar payment-config.js

Abre el archivo `payment-config.js` y cambia `apiBaseUrl`:

```js
window.DAILYTIPS_PAYMENT_CONFIG = {
  apiBaseUrl: "https://dailytips-site.vercel.app",  // ← Pega aquí tu URL de Vercel
  fallbackLinks: {
    standard: "https://mpago.la/2J8hVw7",
    education: "https://mpago.la/2J8hVw7",
    total: "https://mpago.la/2NmAh15",
    recipes: "https://mpago.la/2NmAh15"
  }
};
```

---

## Paso 5 — Actualizar el código de acceso (recomendado)

El código que los compradores usarán para acceder a sus descargas está en la variable de entorno `DELIVERY_ACCESS_CODE` en Vercel.

Si no la defines, el código por defecto es `DAILYTIPS2026`.

También actualiza este mismo código en `app.js` para que el formulario de entrega-digital.html lo acepte:

```js
// En app.js, cambia esta línea:
const premiumPassword = atob("REFJTFRJUFMYMDI2");
// Por el atob() de tu nuevo código. Usa la consola del navegador:
// btoa("TUNUEVOCODIGO")  →  copia el resultado y ponlo en atob("...")
```

---

## Paso 6 — Probar que funciona

1. Ve a tu sitio: https://dailytips.lat/checkout.html?pack=standard&category=dinero
2. Llena el formulario con un correo real
3. Si el botón **"Pagar con Mercado Pago"** abre Mercado Pago (no el link directo), el backend está conectado
4. Completa un pago de prueba y verifica que llegue el correo de entrega (si configuraste Resend)

---

## Email automático (opcional pero recomendado)

Para que el sistema envíe un correo automático al comprador después del pago:

1. Crea una cuenta gratis en https://resend.com
2. Verifica tu dominio `dailytips.lat` en Resend
3. Obtén tu API key y ponla en la variable `RESEND_API_KEY` en Vercel

---

## Estado actual sin backend

Mientras no conectes el backend, el checkout funciona con los links directos de Mercado Pago configurados en `fallbackLinks`. El comprador paga, pero **la entrega es manual** — tienes que enviarle el acceso por WhatsApp.
