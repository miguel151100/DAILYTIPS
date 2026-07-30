(function () {
  "use strict";

  const STORAGE_BIZ = "dt-cotizaciones-biz";
  const STORAGE_DRAFT = "dt-cotizaciones-draft";
  const STORAGE_SEQ = "dt-cotizaciones-seq";

  const $ = (id) => document.getElementById(id);

  const bizName = $("biz-name");
  const bizPhone = $("biz-phone");
  const bizAddress = $("biz-address");
  const clientName = $("client-name");
  const clientPhone = $("client-phone");
  const quoteNumber = $("quote-number");
  const quoteDate = $("quote-date");
  const quoteValidity = $("quote-validity");
  const discountPct = $("discount-pct");
  const ivaToggle = $("iva-toggle");
  const quoteNotes = $("quote-notes");
  const itemsBody = $("items-body");
  const itemRowTemplate = $("item-row-template");

  const money = (n) =>
    (Number.isFinite(n) ? n : 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN"
    });

  function todayISO(offsetDays) {
    const d = new Date();
    if (offsetDays) d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }

  function formatDateDisplay(iso) {
    if (!iso) return "--";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return "--";
    return new Date(y, m - 1, d).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function nextQuoteNumber() {
    const current = parseInt(localStorage.getItem(STORAGE_SEQ) || "0", 10);
    const next = current + 1;
    localStorage.setItem(STORAGE_SEQ, String(next));
    return "COT-" + String(next).padStart(4, "0");
  }

  function addItemRow(data) {
    const fragment = itemRowTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".item-row");
    const desc = row.querySelector(".item-desc");
    const qty = row.querySelector(".item-qty");
    const price = row.querySelector(".item-price");

    if (data) {
      desc.value = data.desc || "";
      qty.value = data.qty ?? 1;
      price.value = data.price ?? 0;
    }

    row.querySelector(".item-remove").addEventListener("click", () => {
      row.remove();
      if (!itemsBody.querySelector(".item-row")) addItemRow();
      renderPreview();
      saveDraft();
    });

    [desc, qty, price].forEach((el) => {
      el.addEventListener("input", () => {
        renderPreview();
        saveDraft();
      });
    });

    itemsBody.appendChild(row);
  }

  function collectItems() {
    return Array.from(itemsBody.querySelectorAll(".item-row")).map((row) => ({
      desc: row.querySelector(".item-desc").value.trim(),
      qty: parseFloat(row.querySelector(".item-qty").value) || 0,
      price: parseFloat(row.querySelector(".item-price").value) || 0
    }));
  }

  function computeTotals(items) {
    const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
    const discountAmount = subtotal * ((parseFloat(discountPct.value) || 0) / 100);
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const ivaAmount = ivaToggle.checked ? afterDiscount * 0.16 : 0;
    const total = afterDiscount + ivaAmount;
    return { subtotal, discountAmount, ivaAmount, total };
  }

  function renderPreview() {
    const items = collectItems();

    itemsBody.querySelectorAll(".item-row").forEach((row) => {
      const qty = parseFloat(row.querySelector(".item-qty").value) || 0;
      const price = parseFloat(row.querySelector(".item-price").value) || 0;
      row.querySelector(".item-amount").textContent = money(qty * price);
    });

    $("pv-biz").textContent = bizName.value.trim() || "Nombre del negocio";
    const contactParts = [bizPhone.value.trim(), bizAddress.value.trim()].filter(Boolean);
    $("pv-contact").textContent = contactParts.length ? contactParts.join(" · ") : "Teléfono · Dirección";

    $("pv-number").textContent = quoteNumber.value || "COT-0001";
    $("pv-date").textContent = formatDateDisplay(quoteDate.value);
    const validityDays = parseInt(quoteValidity.value, 10) || 0;
    $("pv-valid").textContent = quoteDate.value
      ? formatDateDisplay(addDaysISO(quoteDate.value, validityDays))
      : "--";

    $("pv-client-name").textContent = clientName.value.trim() || "—";
    const clientPhoneRow = $("pv-client-phone-row");
    if (clientPhone.value.trim()) {
      clientPhoneRow.style.display = "";
      $("pv-client-phone").textContent = clientPhone.value.trim();
    } else {
      clientPhoneRow.style.display = "none";
    }

    const pvItems = $("pv-items");
    pvItems.innerHTML = "";
    const validItems = items.filter((it) => it.desc);
    if (!validItems.length) {
      const tr = document.createElement("tr");
      tr.className = "preview-empty";
      tr.innerHTML = '<td colspan="4">Agrega productos o servicios para verlos aquí.</td>';
      pvItems.appendChild(tr);
    } else {
      validItems.forEach((it) => {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + escapeHtml(it.desc || "Sin descripción") + "</td>" +
          "<td>" + it.qty + "</td>" +
          "<td>" + money(it.price) + "</td>" +
          "<td>" + money(it.qty * it.price) + "</td>";
        pvItems.appendChild(tr);
      });
    }

    const totals = computeTotals(items);
    $("pv-subtotal").textContent = money(totals.subtotal);

    const discountRow = $("pv-discount-row");
    if (totals.discountAmount > 0) {
      discountRow.style.display = "";
      $("pv-discount").textContent = "-" + money(totals.discountAmount);
    } else {
      discountRow.style.display = "none";
    }

    const ivaRow = $("pv-iva-row");
    if (ivaToggle.checked) {
      ivaRow.style.display = "";
      $("pv-iva").textContent = money(totals.ivaAmount);
    } else {
      ivaRow.style.display = "none";
    }

    $("pv-total").textContent = money(totals.total);
    $("pv-notes").textContent = quoteNotes.value.trim();
  }

  function addDaysISO(iso, days) {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function saveBiz() {
    localStorage.setItem(
      STORAGE_BIZ,
      JSON.stringify({
        name: bizName.value,
        phone: bizPhone.value,
        address: bizAddress.value
      })
    );
  }

  function loadBiz() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_BIZ) || "null");
      if (saved) {
        bizName.value = saved.name || "";
        bizPhone.value = saved.phone || "";
        bizAddress.value = saved.address || "";
      }
    } catch (e) {
      /* ignore corrupt storage */
    }
  }

  function saveDraft() {
    saveBiz();
    localStorage.setItem(
      STORAGE_DRAFT,
      JSON.stringify({
        clientName: clientName.value,
        clientPhone: clientPhone.value,
        quoteNumber: quoteNumber.value,
        quoteDate: quoteDate.value,
        quoteValidity: quoteValidity.value,
        discountPct: discountPct.value,
        iva: ivaToggle.checked,
        notes: quoteNotes.value,
        items: collectItems()
      })
    );
  }

  function loadDraft() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_DRAFT) || "null");
      if (!saved) return false;
      clientName.value = saved.clientName || "";
      clientPhone.value = saved.clientPhone || "";
      quoteNumber.value = saved.quoteNumber || nextQuoteNumber();
      quoteDate.value = saved.quoteDate || todayISO();
      quoteValidity.value = saved.quoteValidity || 7;
      discountPct.value = saved.discountPct || 0;
      ivaToggle.checked = saved.iva !== false;
      quoteNotes.value = saved.notes || "";
      (saved.items && saved.items.length ? saved.items : [null]).forEach(addItemRow);
      return true;
    } catch (e) {
      return false;
    }
  }

  function startNewQuote() {
    clientName.value = "";
    clientPhone.value = "";
    quoteNumber.value = nextQuoteNumber();
    quoteDate.value = todayISO();
    quoteValidity.value = 7;
    discountPct.value = 0;
    ivaToggle.checked = true;
    quoteNotes.value =
      "50% de anticipo para confirmar el pedido. Precios en pesos mexicanos (MXN).";
    itemsBody.innerHTML = "";
    addItemRow();
    renderPreview();
    saveDraft();
    clientName.focus();
  }

  function buildWhatsAppText() {
    const allItems = collectItems();
    const items = allItems.filter((it) => it.desc);
    const totals = computeTotals(allItems);
    const lines = [];
    lines.push("*Cotización " + (quoteNumber.value || "") + "*");
    if (bizName.value.trim()) lines.push(bizName.value.trim());
    lines.push("Fecha: " + formatDateDisplay(quoteDate.value));
    lines.push("");
    items.forEach((it) => {
      lines.push(
        "• " + (it.desc || "Producto") + " x" + it.qty + " — " + money(it.qty * it.price)
      );
    });
    lines.push("");
    lines.push("Subtotal: " + money(totals.subtotal));
    if (totals.discountAmount > 0) lines.push("Descuento: -" + money(totals.discountAmount));
    if (ivaToggle.checked) lines.push("IVA (16%): " + money(totals.ivaAmount));
    lines.push("*Total: " + money(totals.total) + "*");
    if (quoteNotes.value.trim()) {
      lines.push("");
      lines.push(quoteNotes.value.trim());
    }
    return lines.join("\n");
  }

  function initEvents() {
    document.getElementById("quote-form").addEventListener("input", () => {
      renderPreview();
      saveDraft();
    });

    $("add-item").addEventListener("click", () => {
      addItemRow();
      renderPreview();
      saveDraft();
    });

    $("btn-print").addEventListener("click", () => window.print());

    $("btn-whatsapp").addEventListener("click", () => {
      const text = encodeURIComponent(buildWhatsAppText());
      const phone = clientPhone.value.replace(/\D/g, "");
      const base = phone ? "https://wa.me/52" + phone : "https://wa.me/";
      window.open(base + "?text=" + text, "_blank", "noopener");
    });

    $("btn-reset").addEventListener("click", () => {
      if (confirm("¿Crear una cotización nueva? Se limpiarán los datos del cliente y los productos.")) {
        startNewQuote();
      }
    });
  }

  function init() {
    document.getElementById("year").textContent = new Date().getFullYear();
    loadBiz();
    const hadDraft = loadDraft();
    if (!hadDraft) {
      quoteNumber.value = nextQuoteNumber();
      quoteDate.value = todayISO();
      addItemRow();
    }
    initEvents();
    renderPreview();
  }

  document.addEventListener("DOMContentLoaded", init);

  // PWA install prompt
  let deferredPrompt = null;
  const installBtn = document.querySelector("[data-install-button]");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.hidden = true;
    });
  }

  window.addEventListener("appinstalled", () => {
    if (installBtn) installBtn.hidden = true;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }
})();
