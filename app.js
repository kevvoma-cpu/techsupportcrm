(function () {
  "use strict";
  const products = window.TECHSUPPORT_PRODUCTS || [];
  const site = window.TECHSUPPORT_SITE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const naira = (n) => (typeof n === "number" ? "\u20A6" + n.toLocaleString("en-NG") : "Contact us for price");

  // ---------- Components ----------
  function laptopArt(accent, i) {
    return `<svg viewBox="0 0 320 200" role="img" aria-label="Laptop illustration">
      <defs><linearGradient id="g${i}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="#0b1b3a"/></linearGradient></defs>
      <rect x="62" y="22" width="196" height="124" rx="10" fill="#0b1b3a"/>
      <rect x="70" y="30" width="180" height="108" rx="5" fill="url(#g${i})"/>
      <path d="M90 118l30-34 22 22 18-18 40 30z" fill="#fff" opacity=".18"/>
      <path d="M30 156h260l-14 18a10 10 0 0 1-8 4H52a10 10 0 0 1-8-4z" fill="#cbd5e1"/>
      <rect x="132" y="156" width="56" height="6" rx="3" fill="#94a3b8"/></svg>`;
  }

  function productCard(p, i) {
    const media = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`
      : laptopArt(p.accent || "#1d4ed8", i);
    const specs = [["Processor", p.processor], ["RAM", p.ram], ["Storage", p.storage], ["Screen", p.screen]]
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
    return `<article class="card">
      <div class="card-media">${media}</div>
      <div class="card-body">
        <span class="tag">${esc(p.category)}</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.description)}</p>
        <dl class="specs">${specs}</dl>
        <div class="price"><strong>${naira(p.price)}</strong><small>Indicative price. Confirm with our team.</small></div>
        <button class="btn btn-primary" type="button" data-enquire="${esc(p.id)}">Enquire About This Laptop</button>
      </div></article>`;
  }

  // ---------- Render ----------
  $("#product-grid").innerHTML = products.map(productCard).join("");
  const sel = $("#product");
  sel.innerHTML = '<option value="">Select a product\u2026</option>' +
    products.map((p) => `<option>${esc(p.name)}</option>`).join("") +
    "<option>Not sure yet / Other</option>";
  document.querySelectorAll("[data-site]").forEach((el) => (el.textContent = site[el.dataset.site] || ""));
  $("#year").textContent = new Date().getFullYear();

  // ---------- Mobile nav ----------
  const toggle = $("#nav-toggle"), nav = $("#nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", false); }
  });

  // ---------- Form ----------
  const form = $("#enquiry-form"), btn = $("#submit-btn"), status = $("#form-status");
  let sending = false, sent = false;

  function resetSent() { sent = false; btn.disabled = false; btn.textContent = "Send Enquiry"; }
  form.addEventListener("input", () => { if (sent) resetSent(); });

  function setStatus(type, msg) { status.className = "status " + type; status.textContent = msg; status.hidden = !msg; }
  function showErrors(errs) {
    form.querySelectorAll("[data-err]").forEach((el) => (el.textContent = errs[el.dataset.err] || ""));
  }
  function validate() {
    const d = Object.fromEntries(new FormData(form));
    const e = {};
    if (!d.name.trim()) e.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.email = "Please enter a valid email address.";
    if (!/^[+\d][\d\s()-]{6,}$/.test(d.phone.trim())) e.phone = "Please enter a valid phone number.";
    if (!d.product) e.product = "Please choose a product.";
    showErrors(e);
    return { d, ok: !Object.keys(e).length };
  }

  // Enquiry buttons: prefill product and scroll to form
  $("#product-grid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-enquire]");
    if (!b) return;
    const p = products.find((x) => x.id === b.dataset.enquire);
    if (p) sel.value = p.name;
    setStatus("", "");
    showErrors({});
    if (sent) resetSent();
    $("#contact").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $("#name").focus({ preventScroll: true }), 500);
  });

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (sending || sent) return; // duplicate-submission protection
    setStatus("", "");
    const { d, ok } = validate();
    if (!ok) return;
    sending = true; btn.disabled = true; btn.textContent = "Sending\u2026";
    try {
      const r = await fetch("/api/product-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.ok) {
        sent = true;
        setStatus("success", "Thank you! Your enquiry has been received. Our sales team will be in touch soon.");
        form.reset();
        btn.textContent = "Enquiry Sent \u2713";
      } else {
        if (data.errors) showErrors(data.errors);
        setStatus("error", data.error || "Something went wrong. Please check the form and try again.");
        btn.disabled = false; btn.textContent = "Send Enquiry";
      }
    } catch {
      setStatus("error", "Network error. Please check your connection and try again.");
      btn.disabled = false; btn.textContent = "Send Enquiry";
    } finally { sending = false; }
  });
})();
