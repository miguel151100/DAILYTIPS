(() => {
  const statusBox = document.querySelector("#payment-verification-status");
  const downloadsBox = document.querySelector("#payment-downloads");
  const codeBox = document.querySelector("#payment-access-code");
  if (!statusBox || !downloadsBox || !codeBox) return;

  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get("payment_id") || params.get("collection_id") || params.get("id");
  const config = window.DAILYTIPS_PAYMENT_CONFIG || {};
  const apiBase = (config.apiBaseUrl || "").replace(/\/$/, "");

  function setStatus(message, type = "") {
    statusBox.textContent = message;
    statusBox.dataset.state = type;
  }

  function renderDownloads(downloads) {
    downloadsBox.innerHTML = downloads.map((download) => `
      <a class="delivery-download" href="${download.url}" ${download.url.includes(".zip") ? "download" : ""}>
        <strong>${download.label}</strong>
        <span>${download.description}</span>
      </a>
    `).join("");
  }

  if (!apiBase) {
    setStatus("Pago recibido por Mercado Pago. Para activar verificación automática falta publicar el backend y pegar su URL en payment-config.js.", "pending");
    return;
  }

  if (!paymentId) {
    setStatus("No llegó el número de pago en la URL. Si ya pagaste, entra a entrega digital o pide soporte por WhatsApp.", "pending");
    return;
  }

  async function verifyPayment() {
    setStatus("Verificando pago aprobado con Mercado Pago...", "pending");

    try {
      const response = await fetch(`${apiBase}/api/verify-payment?payment_id=${encodeURIComponent(paymentId)}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "No se pudo verificar el pago");

      if (!data.approved) {
        setStatus("Tu pago todavía no aparece aprobado. Revisa Mercado Pago o espera unos minutos.", "pending");
        return;
      }

      setStatus(`Pago aprobado: ${data.product.title}. Tus descargas están listas.`, "success");
      codeBox.textContent = data.accessCode;
      codeBox.hidden = false;
      renderDownloads(data.downloads || []);
      downloadsBox.hidden = false;
      localStorage.setItem("dailyTipsDelivery", "yes");
    } catch (error) {
      setStatus("No pudimos verificar el pago en automático. Usa soporte por WhatsApp con tu comprobante.", "error");
    }
  }

  verifyPayment();
})();
